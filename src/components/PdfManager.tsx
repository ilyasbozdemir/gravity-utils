import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Scissors, Download, Layers, Minimize2, Stamp, RefreshCw, Plus, X } from 'lucide-react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PdfManagerProps {
    file: File;
    onBack: () => void;
}

type TabType = 'split' | 'merge' | 'compress' | 'watermark';

export const PdfManager: React.FC<PdfManagerProps> = ({ file, onBack }) => {
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('split');
    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    // Split State
    const [splitPage, setSplitPage] = useState<number>(1);

    // Merge State
    const [mergeFiles, setMergeFiles] = useState<File[]>([]);
    const mergeInputRef = useRef<HTMLInputElement>(null);

    // Watermark State
    const [watermarkText, setWatermarkText] = useState('GİZLİ');
    const [watermarkColor, setWatermarkColor] = useState('#ff0000');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);

    // Compress State
    const [compressionQuality, setCompressionQuality] = useState(0.7);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                setPageCount(pdfDoc.getPageCount());
                setMergeFiles([file]); // Initialize merge list with current file
            } catch (err) {
                console.error(err);
                alert('PDF yüklenemedi. Dosya bozuk veya şifreli olabilir.');
            }
        };
        loadPdf();
    }, [file]);

    const handleSplit = async () => {
        if (!pageCount) return;
        setProcessing(true);
        setStatusText('Sayfa ayrıştırılıyor...');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const [copiedPage] = await newDoc.copyPages(srcDoc, [splitPage - 1]);
            newDoc.addPage(copiedPage);

            const pdfBytes = await newDoc.save();
            downloadPdf(pdfBytes, `sayfa-${splitPage}-${file.name}`);
        } catch (err) {
            console.error(err);
            alert('PDF işleminde hata oluştu.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleMerge = async () => {
        if (mergeFiles.length < 2) return;
        setProcessing(true);
        setStatusText('Dosyalar birleştiriliyor...');
        try {
            const mergedDoc = await PDFDocument.create();

            for (const f of mergeFiles) {
                const arrayBuffer = await f.arrayBuffer();
                const doc = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
                copiedPages.forEach((page) => mergedDoc.addPage(page));
            }

            const pdfBytes = await mergedDoc.save();
            downloadPdf(pdfBytes, `birlestirilmis-${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Birleştirme hatası. Dosyaların geçerli PDF olduğundan emin olun.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleWatermark = async () => {
        setProcessing(true);
        setStatusText('Filigran ekleniyor...');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Convert hex color to RGB (0-1 range)
            const r = parseInt(watermarkColor.slice(1, 3), 16) / 255;
            const g = parseInt(watermarkColor.slice(3, 5), 16) / 255;
            const b = parseInt(watermarkColor.slice(5, 7), 16) / 255;

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                const fontSize = 50;
                const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
                const textHeight = font.heightAtSize(fontSize);

                page.drawText(watermarkText, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2 - textHeight / 2,
                    size: fontSize,
                    font: font,
                    color: rgb(r, g, b),
                    opacity: watermarkOpacity,
                    rotate: degrees(45),
                });
            });

            const pdfBytes = await pdfDoc.save();
            downloadPdf(pdfBytes, `filigran-${file.name}`);
        } catch (err) {
            console.error(err);
            alert('Filigran eklenemedi.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleCompress = async () => {
        setProcessing(true);
        setStatusText('PDF işleniyor ve yeniden oluşturuluyor (Bu işlem biraz sürebilir)...');
        try {
            // 1. Load PDF with PDF.js to render pages as images
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            // 2. Create new PDF with pdf-lib
            const newPdfDoc = await PDFDocument.create();

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatusText(`Sayfa işleniyor: ${i} / ${pdf.numPages}`);
                const page = await pdf.getPage(i);

                // Render to canvas
                const viewport = page.getViewport({ scale: 1.5 }); // Good balance of quality/size
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport: viewport } as any).promise;

                // Convert canvas to JPEG (lossy compression)
                const imgDataUrl = canvas.toDataURL('image/jpeg', compressionQuality);

                // Embed image into new PDF
                const imgImage = await newPdfDoc.embedJpg(imgDataUrl);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(imgImage, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
            }

            const pdfBytes = await newPdfDoc.save();
            downloadPdf(pdfBytes, `sikistirilmis-${file.name}`);
        } catch (err: any) {
            console.error(err);
            alert(`Sıkıştırma hatası: ${err.message || err}`);
        }
        setProcessing(false);
        setStatusText('');
    };

    const downloadPdf = (data: Uint8Array, filename: string) => {
        const blob = new Blob([data as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const addMergeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setMergeFiles([...mergeFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeMergeFile = (index: number) => {
        const newFiles = [...mergeFiles];
        newFiles.splice(index, 1);
        setMergeFiles(newFiles);
    };

    return (
        <div className="glass-panel w-full max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <FileText className="text-red-400" />
                    PDF Yönetici
                </h2>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('split')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'split' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Scissors size={18} /> Böl
                </button>
                <button
                    onClick={() => setActiveTab('merge')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'merge' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Layers size={18} /> Birleştir
                </button>
                <button
                    onClick={() => setActiveTab('compress')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'compress' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Minimize2 size={18} /> Sıkıştır
                </button>
                <button
                    onClick={() => setActiveTab('watermark')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'watermark' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Stamp size={18} /> Filigran
                </button>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 min-h-[300px]">
                {/* SPLIT */}
                {activeTab === 'split' && (
                    <div className="text-center">
                        <h3 className="mb-6 font-semibold">Sayfa Çıkar</h3>
                        <p className="mb-4 text-slate-300">"{file.name}" ({pageCount} Sayfa)</p>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span>Sayfa:</span>
                            <input
                                type="number"
                                min="1"
                                max={pageCount || 1}
                                value={splitPage}
                                onChange={(e) => setSplitPage(Math.min(parseInt(e.target.value) || 1, pageCount || 1))}
                                className="bg-black/20 border border-white/10 rounded p-2 w-20 text-center"
                            />
                            <span className="opacity-50">/ {pageCount}</span>
                        </div>

                        <button
                            onClick={handleSplit}
                            disabled={processing}
                            className="primary-button-lg bg-red-500/80 hover:bg-red-500 mx-auto"
                        >
                            {processing ? <RefreshCw className="animate-spin" /> : <Download />}
                            {processing ? 'İşleniyor...' : 'Sayfayı İndir'}
                        </button>
                    </div>
                )}

                {/* MERGE */}
                {activeTab === 'merge' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">PDF Birleştir</h3>
                            <button
                                onClick={() => mergeInputRef.current?.click()}
                                className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Dosya Ekle
                            </button>
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                ref={mergeInputRef}
                                className="hidden"
                                onChange={addMergeFile}
                            />
                        </div>

                        <div className="space-y-2 mb-8 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {mergeFiles.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded border border-white/5 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-red-500/20 p-1.5 rounded text-red-400">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-sm truncate max-w-[300px]">{f.name}</span>
                                        <span className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <button
                                        onClick={() => removeMergeFile(i)}
                                        className="text-slate-500 hover:text-red-400 p-1 bg-transparent border-none cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleMerge}
                            disabled={processing || mergeFiles.length < 2}
                            className={`primary-button-lg w-full justify-center ${mergeFiles.length < 2 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500/80 hover:bg-blue-500'}`}
                        >
                            {processing ? <RefreshCw className="animate-spin" /> : <Layers />}
                            {processing ? 'Birleştiriliyor...' : 'PDFleri Birleştir'}
                        </button>
                    </div>
                )}

                {/* COMPRESS */}
                {activeTab === 'compress' && (
                    <div className="text-center">
                        <h3 className="mb-4 font-semibold">PDF Sıkıştır & Düzleştir</h3>
                        <p className="text-sm text-yellow-300/80 mb-6 bg-yellow-500/10 p-3 rounded border border-yellow-500/20 max-w-md mx-auto">
                            Bu işlem sayfaları resme dönüştürerek sıkıştırır. Metinler seçilemez hale gelir ancak dosya boyutu küçülür ve içerik "düzleşir".
                        </p>

                        <div className="max-w-xs mx-auto mb-8">
                            <label className="block text-sm text-slate-400 mb-2">Kalite: {Math.round(compressionQuality * 100)}%</label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.1"
                                value={compressionQuality}
                                onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 result-slider rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <button
                            onClick={handleCompress}
                            disabled={processing}
                            className="primary-button-lg bg-orange-500/80 hover:bg-orange-500 mx-auto"
                        >
                            {processing ? <RefreshCw className="animate-spin" /> : <Minimize2 />}
                            {processing ? statusText : 'Sıkıştır ve İndir'}
                        </button>
                    </div>
                )}

                {/* WATERMARK */}
                {activeTab === 'watermark' && (
                    <div className="text-center">
                        <h3 className="mb-6 font-semibold">Filigran Ekle</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto text-left">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Metin</label>
                                <input
                                    type="text"
                                    value={watermarkText}
                                    onChange={(e) => setWatermarkText(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Renk</label>
                                <input
                                    type="color"
                                    value={watermarkColor}
                                    onChange={(e) => setWatermarkColor(e.target.value)}
                                    className="w-full bg-transparent border-none h-[38px] cursor-pointer"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Opaklık: {watermarkOpacity}</label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={watermarkOpacity}
                                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleWatermark}
                            disabled={processing}
                            className="primary-button-lg bg-purple-500/80 hover:bg-purple-500 mx-auto"
                        >
                            {processing ? <RefreshCw className="animate-spin" /> : <Stamp />}
                            {processing ? 'Ekleniyor...' : 'Filigran Ekle'}
                        </button>
                    </div>
                )}
            </div>

            {processing && statusText && (
                <div className="mt-4 text-center text-sm text-slate-400 animate-pulse">
                    {statusText}
                </div>
            )}
        </div>
    );
};

