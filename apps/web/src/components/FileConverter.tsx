import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Settings2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { getAvailableFormats, type Format } from '../utils/formats';
import { unifiedSave } from '../utils/helpers/fileSystem';
import { isElectron } from '@/utils/electron';
import { SHARED_ENGINE, platform } from '@shared/index';
import { Document, Packer, Paragraph, TextRun, ImageRun, type ISectionOptions } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { loadTurkishFont } from '../utils/fontLoader';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface FileConverterProps {
    file: File | null;
    onBack?: () => void;
    initialFormat?: Format | null;
}

export const FileConverter: React.FC<FileConverterProps> = ({ file: initialFile, onBack, initialFormat = null }) => {
    const handleBack = onBack || (() => { window.history.back(); });
    const [file, setFile] = useState<File | null>(initialFile);
    const [formats, setFormats] = useState<Format[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<Format | null>(initialFormat);
    const [customExt, setCustomExt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<string>('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const renderContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (file) {
            const available = getAvailableFormats(file);
            setFormats(available);
        }
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress('Başlatılıyor...');
        try {
            let targetExt = customExt.toLowerCase();
            let isRenameOnly = false;

            if (selectedFormat) {
                targetExt = selectedFormat.ext.toLowerCase();
                isRenameOnly = selectedFormat.isRenameOnly === true;
            } else if (customExt) {
                isRenameOnly = true;
            }

            if (!targetExt) {
                alert("Lütfen bir hedef format seçin veya yazın.");
                setIsProcessing(false);
                return;
            }

            const originalName = file.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const finalName = SHARED_ENGINE.getOutputName(file.name, 'converted', targetExt);

            // 1. PDF Conversion Logic
            if (targetExt === 'pdf' && !isRenameOnly) {
                if (file.type.startsWith('image/')) {
                    setProgress('PDF oluşturuluyor...');

                    if (isElectron()) {
                        // 🚀 BOZDEMIR ENGINE NATIVE PROCESSING
                        const arrayBuffer = await file.arrayBuffer();
                        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                        const result = await (window as any).electron.nativeProcess('IMAGE_TO_PDF', {
                            buffer: arrayBuffer,
                            ext
                        });

                        if (result.success) {
                            await unifiedSave(new Blob([result.buffer]), finalName);
                        } else {
                            throw new Error(result.error);
                        }
                    } else {
                        // Standard Web Processing
                        const doc = new jsPDF();
                        const imgData = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });

                        const imgProps = doc.getImageProperties(imgData);
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        const margin = 10;
                        const maxWidth = pageWidth - (margin * 2);
                        const maxHeight = pageHeight - (margin * 2);
                        const pxToMm = 0.264583;
                        const imgWidthMM = imgProps.width * pxToMm;
                        const imgHeightMM = imgProps.height * pxToMm;
                        const scale = Math.min(1, maxWidth / imgWidthMM, maxHeight / imgHeightMM);
                        const finalWidth = imgWidthMM * scale;
                        const finalHeight = imgHeightMM * scale;
                        const x = (pageWidth - finalWidth) / 2;
                        const y = (pageHeight - finalHeight) / 2;

                        doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
                        await unifiedSave(doc.output('blob'), finalName);
                    }
                } else if (file.name.toLowerCase().endsWith('.docx')) {
                    setProgress('Word belgesi birer bir görselleştiriliyor (Bu işlem biraz vakit alabilir)...');

                    if (renderContainerRef.current) {
                        const container = renderContainerRef.current;
                        container.innerHTML = '';
                        const arrayBuffer = await file.arrayBuffer();

                        await renderAsync(arrayBuffer, container, undefined, {
                            className: "docx",
                            inWrapper: true,
                            ignoreLastRenderedPageBreak: false,
                        });

                        // Wait for images to load if any
                        await new Promise(r => setTimeout(r, 1200));

                        setProgress('Döküman tarayıcıda render ediliyor...');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const width = pdf.internal.pageSize.getWidth();

                        await pdf.html(container, {
                            callback: (doc) => {
                                doc.save(finalName);
                                setIsProcessing(false);
                            },
                            x: 0,
                            y: 0,
                            width: width,
                            windowWidth: 800,
                            autoPaging: 'text'
                        });

                        container.innerHTML = '';
                        return; // Callback handles the state update
                    }
                }
                else if (file.type.startsWith('text/') || /\.(txt|md|js|ts|json|xml)$/i.test(file.name)) {
                    setProgress('Metin işleniyor ve Türkçe font yükleniyor...');
                    const text = await file.text();

                    const pdfDoc = await PDFDocument.create();
                    pdfDoc.registerFontkit(fontkit);
                    const fontBytes = await loadTurkishFont();
                    const customFont = await pdfDoc.embedFont(fontBytes);

                    const page = pdfDoc.addPage();
                    const { width, height } = page.getSize();
                    const fontSize = 10;

                    // Simple word wrapping for pdf-lib
                    const words = text.split(/\s+/);
                    let line = '';
                    let y = height - 50;
                    const margin = 50;

                    for (const word of words) {
                        const testLine = line + word + ' ';
                        const testWidth = customFont.widthOfTextAtSize(testLine, fontSize);
                        if (testWidth > width - (margin * 2)) {
                            page.drawText(line, { x: margin, y, size: fontSize, font: customFont });
                            line = word + ' ';
                            y -= 15;
                            if (y < 50) break;
                        } else {
                            line = testLine;
                        }
                    }
                    page.drawText(line, { x: margin, y, size: fontSize, font: customFont });

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
                    unifiedSave(blob, finalName);
                } else {
                    unifiedSave(file, finalName);
                }
                setIsProcessing(false);
                return;
            }

            // 2. Word (.docx) Conversion Logic (PDF to Word)
            if (targetExt === 'docx' && !isRenameOnly) {
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    setProgress('PDF analizi yapılıyor...');
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    let fullText = '';
                    const pageImages: string[] = [];

                    setProgress('Word belgesi oluşturuluyor...');
                    const sections: ISectionOptions[] = [];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        setProgress(`Sayfa işleniyor: ${i}/${pdf.numPages}`);
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const items = textContent.items as any[];

                        if (items.length === 0) {
                            toast.info(`Sayfa ${i} metin içermiyor (taranmış belge olabilir).`);
                            sections.push({ children: [new Paragraph({ text: "[Taranmış Sayfa İçeriği Ayrıştırılamadı]" })] });
                            continue;
                        }

                        // Satırları grupla (Y koordinatına göre)
                        const lines: any[][] = [];
                        let currentLine: any[] = [];
                        let lastY = -1;

                        const sortedItems = [...items].sort((a, b) => {
                            const yA = a.transform[5];
                            const yB = b.transform[5];
                            if (Math.abs(yA - yB) < 3) {
                                return a.transform[4] - b.transform[4];
                            }
                            return yB - yA;
                        });

                        for (const textItem of sortedItems) {
                            const y = textItem.transform[5];
                            if (lastY !== -1 && Math.abs(y - lastY) > 3) {
                                lines.push(currentLine);
                                currentLine = [];
                            }
                            currentLine.push(textItem);
                            lastY = y;
                        }
                        if (currentLine.length > 0) lines.push(currentLine);

                        const pageChildren: Paragraph[] = [];
                        for (const line of lines) {
                            const runs: any[] = [];
                            let lastX = -1;

                            for (const textItem of line) {
                                const x = textItem.transform[4];
                                if (lastX !== -1 && x - lastX > 10) {
                                    runs.push(new TextRun({ text: " ", size: Math.round(textItem.transform[0] * 2) || 22 }));
                                }

                                const fontSize = Math.abs(Math.round(textItem.transform[0] * 2)) || 22;
                                runs.push(new TextRun({
                                    text: textItem.str,
                                    size: fontSize,
                                    font: "Arial",
                                }));
                                lastX = x + textItem.width;
                            }

                            pageChildren.push(new Paragraph({
                                children: runs,
                                spacing: { before: 100, after: 100 }
                            }));
                        }

                        sections.push({ children: pageChildren });
                    }

                    const wordDoc = new Document({
                        sections,
                        creator: "Antigravity Converter",
                        title: file.name
                    });
                    const buffer = await Packer.toBlob(wordDoc);
                    unifiedSave(buffer, finalName);
                } else {
                    unifiedSave(file, finalName);
                }
                setIsProcessing(false);
                return;
            }

            // 3. Image Conversion Logic
            if (['jpg', 'jpeg', 'png', 'webp'].includes(targetExt) && !isRenameOnly) {
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    setProgress('PDF resme dönüştürülüyor...');
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;

                    if (pdf.numPages === 1) {
                        const page = await pdf.getPage(1);
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (context) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            await page.render({
                                canvasContext: (context as unknown as CanvasRenderingContext2D),
                                viewport: viewport,
                                canvas: canvas
                            } as unknown as Parameters<typeof page.render>[0]).promise;
                            unifiedSave(canvas.toDataURL(targetExt === 'png' ? 'image/png' : 'image/jpeg', 0.9), finalName);
                        }
                    } else {
                        const JSZip = (await import('jszip')).default;
                        const zip = new JSZip();
                        const mime = targetExt === 'png' ? 'image/png' : 'image/jpeg';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            setProgress(`Sayfa işleniyor: ${i}/${pdf.numPages}`);
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({ scale: 2.0 });
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            if (context) {
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;
                                await page.render({
                                    canvasContext: context as unknown as CanvasRenderingContext2D,
                                    viewport: viewport,
                                    canvas: canvas
                                } as unknown as Parameters<typeof page.render>[0]).promise;
                                zip.file(`sayfa-${i}.${targetExt}`, canvas.toDataURL(mime, 0.9).split(',')[1], { base64: true });
                            }
                        }
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        unifiedSave(zipBlob, `${baseName}-sayfalar.zip`);
                    }
                    setIsProcessing(false);
                    return;
                }

                if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
                    setProgress('SVG dönüştürülüyor...');
                    const text = await file.text();
                    const img = new Image();
                    const svgBlob = new Blob([text], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(svgBlob);
                    img.src = url;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("SVG yüklenemedi."));
                    });

                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(text, 'image/svg+xml');
                    const svgEl = svgDoc.documentElement;
                    let width = parseInt(svgEl.getAttribute('width') || '0');
                    let height = parseInt(svgEl.getAttribute('height') || '0');

                    if (!width || !height) {
                        const viewBox = svgEl.getAttribute('viewBox');
                        if (viewBox) {
                            const params = viewBox.split(/[ ,]/).filter(s => s.length > 0);
                            if (params.length === 4) {
                                width = width || parseInt(params[2]);
                                height = height || parseInt(params[3]);
                            }
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width || img.width || 800;
                    canvas.height = height || img.height || 600;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob((b) => {
                            if (b) unifiedSave(b, finalName);
                            URL.revokeObjectURL(url);
                        }, targetExt === 'png' ? 'image/png' : 'image/jpeg', 0.9);
                    }
                    setIsProcessing(false);
                    return;
                }
            }

            // Excel / PPT to PDF via API
            if (targetExt === 'pdf' && (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.pptx'))) {
                setProgress('Bulut sunucusunda işleniyor...');
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', file.name.toLowerCase().endsWith('.xlsx') ? 'excel-pdf' : 'ppt-pdf');

                const response = await fetch('/api/convert', { method: 'POST', body: formData });
                if (!response.ok) throw new Error('Sunucu hatası');
                const resultBlob = await response.blob();
                unifiedSave(resultBlob, finalName);
                setIsProcessing(false);
                return;
            }

            // 4. Fallback / Rename Logic
            unifiedSave(file, finalName);
            toast.success("Dosya başarıyla hazırlandı.");

        } catch (error: any) {
            console.error(error);
            let msg = error.message || 'Bilinmeyen hata';
            if (msg.includes("end of central directory")) {
                msg = "Dosya yapısı çözümlenemedi. Dosyanın modern bir Office formatı (.docx, .xlsx, .pptx) veya geçerli bir ZIP arşivi olduğundan emin olun. Eski formatlar (örneğin .doc) desteklenmez.";
            } else if (msg.includes("Corrupted zip") || msg.includes("invalid signature")) {
                msg = "Arşiv dosyası bozuk veya geçersiz. Lütfen geçerli bir ZIP tabanlı dosya (örneğin .docx, .xlsx, .pptx) yükleyin.";
            } else if (msg.includes("PDF.js")) {
                msg = "PDF dosyası işlenirken bir hata oluştu. Dosya bozuk olabilir veya desteklenmeyen bir formatta olabilir.";
            }
            toast.error("İşlem sırasında bir hata oluştu: " + msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl transition-colors duration-300">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={handleBack}
                    className="p-2 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-white dark:hover:bg-blue-500/40 rounded-lg transition-all shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Dosya Dönüştürücü</h2>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium tracking-wide">Format Değiştir ve Yeniden Adlandır</p>
                </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 text-left mb-8 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</span> dosyası için hedef format seçin. Akıllı sistemimiz dosya tipine göre en uygun seçenekleri sunar.
                    </>
                ) : (
                    'Herhangi bir dosya formatını bir başkasına dönüştürün veya sadece uzantısını değiştirin. Tamamen yerel ve güvenli.'
                )}
            </p>

            <div className="space-y-8">
                {!file ? (
                    <div className="relative group">
                        <div
                            onClick={async () => {
                                const selected = await platform.openFile();
                                if (selected && !Array.isArray(selected)) {
                                    setFile(selected);
                                }
                            }}
                            className="w-full py-24 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                        >
                            <div className="p-5 bg-blue-100 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                <RefreshCw size={36} />
                            </div>
                            <div className="text-center px-4">
                                <p className="font-bold text-xl mb-1 text-slate-700 dark:text-slate-200">Dosya Seçin</p>
                                <p className="text-sm text-slate-500">Dönüştürmek istediğiniz dosyayı sürükleyin veya seçin</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                title="Dosya Seç"
                            />
                        </div>

                        {/* Sample File Button */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const dummy = new File(["Örnek Word İçeriği"], "ornek-belge.docx", { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                                    setFile(dummy);
                                }}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Örnek .DOCX
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const { utils, write } = await import('xlsx');
                                    const ws = utils.aoa_to_sheet([["Aylık Gelir", "Miktar"], ["Ocak", 5000], ["Şubat", 6500]]);
                                    const wb = utils.book_new();
                                    utils.book_append_sheet(wb, ws, "Rapor");
                                    const buf = write(wb, { type: 'array', bookType: 'xlsx' });
                                    const dummy = new File([buf], "ornek-tablo.xlsx", { type: 'application/octet-stream' });
                                    setFile(dummy);
                                }}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Örnek .XLSX
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const JSZip = (await import('jszip')).default;
                                    const zip = new JSZip();
                                    zip.file("ppt/slides/slide1.xml", `<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Gravity Utils Örnek Sunum</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`);
                                    const blob = await zip.generateAsync({ type: 'blob' });
                                    const dummy = new File([blob], "ornek-sunum.pptx", { type: 'application/octet-stream' });
                                    setFile(dummy);
                                }}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-orange-600 dark:text-orange-400 shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Örnek .PPTX
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* File Info Card */}
                        <div className="p-6 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                    <RefreshCw size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-100 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
                                        {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`} • {file.type || 'Bilinmeyen Tip'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setFormats([]); setSelectedFormat(null); }}
                                className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Değiştir
                            </button>
                        </div>

                        {/* Processing Status */}
                        {isProcessing && (
                            <div className="p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex flex-col items-center gap-4 animate-pulse">
                                <RefreshCw size={32} className="animate-spin text-blue-500 dark:text-blue-400" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-100 tracking-wide uppercase">{progress}</p>
                                    <p className="text-[10px] text-blue-400 dark:text-blue-300/60 mt-1 uppercase tracking-widest">Lütfen bekleyin...</p>
                                </div>
                            </div>
                        )}

                        {/* Format Selection Sections */}
                        <div className="space-y-6">
                            {/* Recommended Formats */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1 block text-left">Önerilen Dönüşümler</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {formats.map((fmt) => (
                                        <button
                                            key={fmt.ext}
                                            onClick={() => { setSelectedFormat(fmt); setCustomExt(''); }}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 group ${selectedFormat?.ext === fmt.ext
                                                ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-100 dark:shadow-blue-500/10'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedFormat?.ext === fmt.ext ? 'bg-blue-500 dark:bg-blue-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                            {fmt.label}
                                            <span className="text-[10px] opacity-60 font-mono tracking-tighter">.{fmt.ext}</span>
                                        </button>
                                    ))}
                                    {formats.length === 0 && (
                                        <div className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-[11px] text-slate-500 italic text-left">
                                            Bu dosya tipi için otomatik öneri bulunamadı. Lütfen manuel uzantı girin.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Custom Extension Input */}
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Veya Manuel Uzantı</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={customExt}
                                        onChange={(e) => {
                                            setCustomExt(e.target.value.replace('.', ''));
                                            setSelectedFormat(null);
                                        }}
                                        placeholder="ör: rar, zip, txt, apk..."
                                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-5 text-sm font-mono text-slate-800 dark:text-blue-200 placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 dark:focus:border-blue-500/30 transition-all leading-none shadow-sm"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                        CUSTOM EXT
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Information */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded-2xl flex gap-4 text-left group">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-200/80 uppercase tracking-wider">Biliyor musunuz?</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-500 leading-relaxed font-medium">
                                    "Yeniden Adlandırma" modu dosya içeriğini bozmadan sadece ismini değiştirir.
                                    Karmaşık dönüşümler (PDF &rarr; Word gibi) bulut yerine doğrudan tarayıcınızda yapılır.
                                </p>
                            </div>
                        </div>

                        {/* Final Action Button */}
                        <button
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border shadow-xl ${(selectedFormat || (customExt && customExt.length > 0)) && !isProcessing
                                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-100 dark:hover:bg-emerald-500/30 hover:-translate-y-0.5 shadow-emerald-500/20 dark:shadow-emerald-500/10'
                                : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-white/5 dark:border-white/5 dark:text-slate-500 cursor-not-allowed'
                                }`}
                            disabled={(!selectedFormat && !customExt) || isProcessing}
                            onClick={handleConvert}
                            title="Dönüştür ve İndir"
                        >
                            <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
                            <span>{isProcessing ? 'İşlem Yapılıyor...' : 'Dönüştür ve İndir'}</span>
                        </button>
                    </div>
                )}

                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-3">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">Dosya-Dosya Akıllı Sistem v2.0</p>
                </div>
            </div>

            {/* Contextual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10 border-t border-slate-100 dark:border-white/5 pt-10">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-600 dark:text-blue-400" /> Dönüştürme Rehberi
                    </h3>
                    <div className="space-y-4 text-left">
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                "Rename Only" modu nedir?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Bu mod, dosyanın iç yapısını değiştirmeden sadece sistemdeki uzantısını değiştirir. Özellikle yanlış kaydedilmiş dosyaların uzantısını düzeltmek için kullanılır.
                            </p>
                        </details>
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                Verilerim güvende mi?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Kesinlikle! Gravity Utils "Local-First" mimarisiyle çalışır. Dosyalarınız sunucuya yüklenmez, tüm dönüşüm doğrudan tarayıcınızın belleğinde gerçekleşir.
                            </p>
                        </details>
                    </div>
                </div>

                <div className="p-8 bg-blue-600 dark:bg-blue-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <RefreshCw size={24} />
                    </div>
                    <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                        <AlertCircle size={20} /> Pro İpucu
                    </h3>
                    <p className="text-blue-50 text-sm leading-relaxed relative z-10">
                        PDF dosyasını Word'e dönüştürürken, döküman çok karmaşıksa "Visual Fidelity" modu otomatik devreye girer. Bu, döküman düzenini %100 korumak için sayfaları resim olarak Word'e gömer.
                    </p>
                    <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-white/20 rounded-lg"><AlertCircle size={16} /></div>
                        <p className="text-[11px] font-bold">Gizlilik odaklı: İşlem bittiğinde veriler tarayıcıdan silinir.</p>
                    </div>
                </div>
            </div>

            {/* Hidden container for DOCX rendering */}
            <div
                ref={renderContainerRef}
                className="fixed -left-[9999px] top-0 w-[800px] bg-white text-black pointer-events-none overflow-hidden font-sans"
            ></div>
        </div>
    );
};
