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
                    doc.save(finalName);
                } else if (file.name.toLowerCase().endsWith('.docx')) {
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
                    saveAs(file, finalName);
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
                        fullText += textContent.items.map((item: any) => {
                            if ('str' in item) return item.str;
                            return '';
                        }).join(' ') + '\n\n';
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
                    saveAs(file, finalName);
                }
                setIsProcessing(false);
                return;
            }

            // 3. Image Conversion Logic
            if (['jpg', 'jpeg', 'png', 'webp'].includes(targetExt.toLowerCase()) && !isRenameOnly) {
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
                                canvasContext: context,
                                viewport: viewport,
                                canvas: canvas
                            } as any).promise;
                            saveAs(canvas.toDataURL(targetExt === 'png' ? 'image/png' : 'image/jpeg', 0.9), finalName);
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
                                    canvasContext: context,
                                    viewport: viewport,
                                    canvas: canvas
                                } as any).promise;
                                zip.file(`sayfa-${i}.${targetExt}`, canvas.toDataURL(mime, 0.9).split(',')[1], { base64: true });
                            }
                        }
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        saveAs(zipBlob, `${baseName}-sayfalar.zip`);
                    }
                    setIsProcessing(false);
                    return;
                }

                if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
                    setProgress('SVG dönüştürülüyor...');
                    const text = await file.text();
                    const img = new Image();
                    const blob = new Blob([text], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    img.src = url;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("SVG yüklenemedi."));
                    });

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

                    const canvas = document.createElement('canvas');
                    canvas.width = width || img.width || 800;
                    canvas.height = height || img.height || 600;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob((b) => {
                            if (b) saveAs(b, finalName);
                            URL.revokeObjectURL(url); // Clean up URL object
                        }, targetExt === 'png' ? 'image/png' : 'image/jpeg', 0.9);
                    }
                    setIsProcessing(false);
                    return;
                }
            }

            // 4. Fallback / Rename Logic
            saveAs(file, finalName);

        } catch (error) {
            console.error(error);
            alert("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg hover:bg-blue-500/40 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">Dosya Dönüştürücü</h2>
                    <p className="text-sm text-blue-400 font-medium tracking-wide">Format Değiştir ve Yeniden Adlandır</p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-8 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyası için hedef format seçin. Akıllı sistemimiz dosya tipine göre en uygun seçenekleri sunar.
                    </>
                ) : (
                    'Herhangi bir dosya formatını bir başkasına dönüştürün veya sadece uzantısını değiştirin. Tamamen yerel ve güvenli.'
                )}
            </p>

            <div className="space-y-8">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                    >
                        <div className="p-5 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <RefreshCw size={36} />
                        </div>
                        <div className="text-center px-4">
                            <p className="font-bold text-xl mb-1 text-slate-200">Dosya Seçin</p>
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
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* File Info Card */}
                        <div className="p-6 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <RefreshCw size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-100 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
                                        {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`} • {file.type || 'Bilinmeyen Tip'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setFormats([]); setSelectedFormat(null); }}
                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                            >
                                Değiştir
                            </button>
                        </div>

                        {/* Processing Status */}
                        {isProcessing && (
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center gap-4 animate-pulse">
                                <RefreshCw size={32} className="animate-spin text-blue-400" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-blue-100 tracking-wide uppercase">{progress}</p>
                                    <p className="text-[10px] text-blue-300/60 mt-1 uppercase tracking-widest">Lütfen bekleyin...</p>
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
                                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-100 shadow-lg shadow-blue-500/10'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedFormat?.ext === fmt.ext ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                                            {fmt.label}
                                            <span className="text-[10px] opacity-40 font-mono tracking-tighter">.{fmt.ext}</span>
                                        </button>
                                    ))}
                                    {formats.length === 0 && (
                                        <div className="w-full p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-500 italic text-left">
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
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-sm font-mono text-blue-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/30 transition-all leading-none"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 tracking-widest uppercase pointer-events-none group-focus-within:text-blue-500/50 transition-colors">
                                        CUSTOM EXT
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Information */}
                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 text-left group">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-amber-200/80 uppercase tracking-wider">Biliyor musunuz?</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                    "Yeniden Adlandırma" modu dosya içeriğini bozmadan sadece ismini değiştirir.
                                    Karmaşık dönüşümler (PDF &rarr; Word gibi) bulut yerine doğrudan tarayıcınızda yapılır.
                                </p>
                            </div>
                        </div>

                        {/* Final Action Button */}
                        <button
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border shadow-xl ${(selectedFormat || (customExt && customExt.length > 0)) && !isProcessing
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 hover:bg-emerald-500/30 hover:-translate-y-0.5 shadow-emerald-500/10'
                                : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed opacity-50'
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

                <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-3">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Dosya-Dosya Akıllı Sistem v2.0</p>
                </div>
            </div>
        </div>
    );
};
