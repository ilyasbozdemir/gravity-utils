import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { getAvailableFormats, type Format } from '../utils/formats';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface FileConverterProps {
    file: File | null;
    onBack: () => void;
}

export const FileConverter: React.FC<FileConverterProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [formats, setFormats] = useState<Format[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
    const [customExt, setCustomExt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<string>('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
            let targetExt = customExt;
            let isRenameOnly = false;

            if (selectedFormat) {
                targetExt = selectedFormat.ext;
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
            const finalName = `${baseName}.${targetExt}`;

            // 1. PDF Conversion Logic
            if (targetExt.toLowerCase() === 'pdf' && !isRenameOnly) {
                setProgress('PDF oluşturuluyor...');
                const doc = new jsPDF();

                if (file.type.startsWith('image/')) {
                    const imgData = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    const imgProps = doc.getImageProperties(imgData);

                    // PDF Page Dimensions (default A4: 210 x 297 mm)
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 10; // 10mm margin
                    const maxWidth = pageWidth - (margin * 2);
                    const maxHeight = pageHeight - (margin * 2);

                    // Convert pixels to mm (Standard 96 DPI: 1px = 0.264583 mm)
                    const pxToMm = 0.264583;
                    let imgWidthMM = imgProps.width * pxToMm;
                    let imgHeightMM = imgProps.height * pxToMm;

                    // Calculate scale to fit within margins, but ONLY downscale (don't upscale small images)
                    const scale = Math.min(1, maxWidth / imgWidthMM, maxHeight / imgHeightMM);

                    const finalWidth = imgWidthMM * scale;
                    const finalHeight = imgHeightMM * scale;

                    // Center on page
                    const x = (pageWidth - finalWidth) / 2;
                    const y = (pageHeight - finalHeight) / 2;

                    doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
                    doc.save(finalName);

                } else if (file.name.toLowerCase().endsWith('.docx')) {
                    // Word to PDF
                    setProgress('Word belgesi çözümleniyor...');
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const text = result.value;

                    setProgress('Metin PDFye aktarılıyor...');
                    const splitText = doc.splitTextToSize(text, 180);
                    let y = 10;
                    for (let i = 0; i < splitText.length; i++) {
                        if (y > 280) {
                            doc.addPage();
                            y = 10;
                        }
                        doc.text(splitText[i], 10, y);
                        y += 7;
                    }
                    doc.save(finalName);

                } else if (file.type.startsWith('text/') || /\.(txt|md|js|ts|json|xml)$/i.test(file.name)) {
                    const text = await file.text();
                    const splitText = doc.splitTextToSize(text, 180);
                    let y = 10;
                    for (let i = 0; i < splitText.length; i++) {
                        if (y > 280) {
                            doc.addPage();
                            y = 10;
                        }
                        doc.text(splitText[i], 10, y);
                        y += 7;
                    }
                    doc.save(finalName);
                } else {
                    const newBlob = new Blob([file], { type: 'application/pdf' });
                    saveAs(newBlob, finalName);
                }

                setIsProcessing(false);
                return;
            }

            // 2. Word (.docx) Conversion Logic
            if (targetExt.toLowerCase() === 'docx' && !isRenameOnly) {
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    setProgress('PDF metni çıkarılıyor...');
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;

                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        setProgress(`Sayfa işleniyor: ${i}/${pdf.numPages}`);
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item) => ('str' in item ? item.str : ''))
                            .join(' ');
                        fullText += pageText + '\n\n';
                    }

                    setProgress('Word belgesi hazırlanıyor...');
                    const wordDoc = new Document({
                        sections: [{
                            properties: {},
                            children: fullText.split('\n').map(line => new Paragraph({
                                children: [line.trim() ? new TextRun(line) : new TextRun("")],
                            })),
                        }],
                    });

                    const buffer = await Packer.toBlob(wordDoc);
                    saveAs(buffer, finalName);
                } else {
                    // Fallback rename
                    const newBlob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                    saveAs(newBlob, finalName);
                }

                setIsProcessing(false);
                return;
            }

            // 3. Image Conversion Logic (PDF to Image / SVG to Image)
            if (['jpg', 'jpeg', 'png', 'webp'].includes(targetExt.toLowerCase()) && !isRenameOnly) {
                // a) PDF to Image
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    setProgress('PDF sayfaları resme dönüştürülüyor...');
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
                            const renderTask = page.render({
                                canvasContext: context,
                                viewport: viewport,
                                canvas: canvas as any
                            });
                            await renderTask.promise;

                            const mime = targetExt === 'png' ? 'image/png' : 'image/jpeg';
                            const dataUrl = canvas.toDataURL(mime, 0.9);
                            saveAs(dataUrl, finalName);
                            setIsProcessing(false);
                            return;
                        }
                    } else {
                        // Multi-page: Use ZIP
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
                                await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;
                                const dataUrl = canvas.toDataURL(mime, 0.9);
                                const base64 = dataUrl.split(',')[1];
                                zip.file(`sayfa-${i}.${targetExt}`, base64, { base64: true });
                            }
                        }

                        setProgress('ZIP dosyası hazırlanıyor...');
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        saveAs(zipBlob, `${baseName}-sayfalar.zip`);
                        setIsProcessing(false);
                        return;
                    }
                }

                // b) SVG to Image
                if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
                    setProgress('Vektörel çizim çözümleniyor...');
                    const text = await file.text();

                    // Try to get dimensions from viewBox or width/height
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

                    const blob = new Blob([text], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);

                    const img = new Image();
                    img.src = url;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("SVG yüklenemedi."));
                    });

                    const canvas = document.createElement('canvas');
                    canvas.width = width || img.width || 800;
                    canvas.height = height || img.height || 600;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const mime = targetExt === 'png' ? 'image/png' : 'image/jpeg';
                        canvas.toBlob((b) => {
                            if (b) saveAs(b, finalName);
                            URL.revokeObjectURL(url);
                        }, mime, 0.9);
                        setIsProcessing(false);
                        return;
                    }
                }
            }

            // 4. Fallback / Rename Logic
            let targetMime = 'application/octet-stream';
            if (targetExt === 'zip') targetMime = 'application/zip';
            else if (targetExt === 'txt') targetMime = 'text/plain';
            else if (selectedFormat) targetMime = selectedFormat.mime;

            const newBlob = new Blob([file], { type: targetMime });
            saveAs(newBlob, finalName);


        } catch (error) {
            console.error(error);
            alert("Dönüştürme sırasında hata oluştu. Dosya bozuk olabilir.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg hover:bg-blue-500/40 transition-all"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <h2 className="m-0 text-2xl font-semibold">Dönüştür / Yeniden Adlandır</h2>
            </div>

            <div className="flex flex-col gap-6 items-start">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                            <RefreshCw size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">Dönüştürmek için Dosya Seçin</p>
                            <p className="text-sm text-slate-500 mt-1">Veya dosyayı buraya sürükleyip bırakın</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            title="Dosya Seç"
                        />
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-white/5 w-full rounded-xl text-left border border-white/5 flex items-center justify-between">
                            <div>
                                <span className="text-sm block mb-1 opacity-70">Seçilen Dosya:</span>
                                <strong className="text-lg">{file.name}</strong>
                            </div>
                            <button
                                onClick={() => { setFile(null); setFormats([]); setSelectedFormat(null); }}
                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                            >
                                Dosyayı Değiştir
                            </button>
                        </div>

                        {/* Processing Overlay */}
                        {isProcessing && (
                            <div className="w-full p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center gap-4 animate-pulse">
                                <RefreshCw size={32} className="animate-spin text-blue-400" />
                                <div className="text-center">
                                    <p className="font-semibold text-blue-100">{progress}</p>
                                    <p className="text-xs text-blue-300/60 mt-1">Lütfen tarayıcıyı kapatmayın...</p>
                                </div>
                            </div>
                        )}

                        {/* Suggested Formats */}
                        <div className="w-full text-left">
                            <label className="text-sm opacity-70 block mb-2">Önerilen Dönüşümler:</label>
                            <div className="flex gap-3 flex-wrap">
                                {formats.map((fmt) => (
                                    <button
                                        key={fmt.ext}
                                        onClick={() => { setSelectedFormat(fmt); setCustomExt(''); }}
                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedFormat === fmt
                                            ? 'bg-blue-500/60 border-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.3)] transform -translate-y-0.5'
                                            : 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/40'
                                            }`}
                                    >
                                        {fmt.label} (.{fmt.ext})
                                    </button>
                                ))}
                                {formats.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">Bu dosya tipi için otomatik öneri bulunamadı.</p>
                                )}
                            </div>
                        </div>

                        {/* Manual Override */}
                        <div className="w-full text-left">
                            <label className="text-sm opacity-70 block mb-2">Veya Manuel Uzantı Yazın:</label>
                            <input
                                type="text"
                                value={customExt}
                                onChange={(e) => { setCustomExt(e.target.value); setSelectedFormat(null); }}
                                placeholder="zip, rar, txt..."
                                className="bg-black/30 border border-white/10 text-white p-3 rounded-lg w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                            />
                        </div>
                    </>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-left">
                    <AlertCircle size={24} className="text-yellow-500 shrink-0" />
                    <span className="opacity-90 leading-relaxed">
                        Not: "Yeniden Adlandırma" modu (özellikle .docx &rarr; .zip) dosya içeriğini değiştirmeden sadece uzantıyı değiştirir. Bu, dosyanın iç yapısını incelemek için güvenlidir.
                    </span>
                </div>

                <button
                    className={`w-full mt-4 flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all ${(selectedFormat || customExt) && !isProcessing
                        ? 'bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 text-emerald-100'
                        : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                    disabled={(!selectedFormat && !customExt) || isProcessing}
                    onClick={handleConvert}
                >
                    <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
                    <span>{isProcessing ? 'İşleniyor...' : 'Çevir ve İndir'}</span>
                </button>
            </div>
        </div>
    );
};
