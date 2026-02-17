import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Scissors, Download, Layers, Minimize2, Stamp, RefreshCw, Plus, X, GripVertical, Trash2, ArrowUp, ArrowDown, MoveLeft, MoveRight, LayoutGrid, List } from 'lucide-react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PdfManagerProps {
    file: File | null;
    onBack: () => void;
}

type TabType = 'split' | 'merge' | 'compress' | 'watermark';

interface OrganizedPage {
    id: string;
    fileId: string;
    pageIndex: number;
    thumbnail: string | null;
    fileName: string;
}

interface PdfFileInfo {
    id: string;
    file: File;
    name: string;
    pageCount: number;
}

export const PdfManager: React.FC<PdfManagerProps> = ({ file, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('merge'); // Default to merge as requested
    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    // Shared State for PDF Files
    const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
    const [organizedPages, setOrganizedPages] = useState<OrganizedPage[]>([]);
    const [loadingThumbnails, setLoadingThumbnails] = useState(false);

    // Split State
    const [splitPage, setSplitPage] = useState<number>(1);
    const [mainPdfPageCount, setMainPdfPageCount] = useState<number>(0);

    // Watermark State
    const [watermarkText, setWatermarkText] = useState('GİZLİ');
    const [watermarkColor, setWatermarkColor] = useState('#ff0000');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);

    // Compress State
    const [compressionQuality, setCompressionQuality] = useState(0.7);

    const mergeInputRef = useRef<HTMLInputElement>(null);

    // Initial load
    useEffect(() => {
        if (file) {
            handleFileAdd(file);
        }
    }, [file]);

    const generateThumbnails = async (newFileId: string, f: File) => {
        setLoadingThumbnails(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            const newPages: OrganizedPage[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport: viewport } as any).promise;
                const thumbnail = canvas.toDataURL();

                newPages.push({
                    id: `${newFileId}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    fileId: newFileId,
                    pageIndex: i - 1,
                    thumbnail,
                    fileName: f.name
                });
            }

            setOrganizedPages(prev => [...prev, ...newPages]);
        } catch (err) {
            console.error('Thumbnail generation failed', err);
        }
        setLoadingThumbnails(false);
    };

    const handleFileAdd = async (f: File) => {
        const id = Math.random().toString(36).substr(2, 9);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();

            const newFileInfo: PdfFileInfo = {
                id,
                file: f,
                name: f.name,
                pageCount
            };

            setPdfFiles(prev => [...prev, newFileInfo]);

            // If it's the first file, set page count for split tab
            if (pdfFiles.length === 0) {
                setMainPdfPageCount(pageCount);
            }

            generateThumbnails(id, f);
        } catch (err) {
            console.error(err);
            alert(`${f.name} yüklenemedi. Dosya bozuk veya şifreli olabilir.`);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(f => handleFileAdd(f));
        }
    };

    const removePage = (id: string) => {
        setOrganizedPages(prev => prev.filter(p => p.id !== id));
    };

    const movePage = (index: number, direction: 'up' | 'down') => {
        const newPages = [...organizedPages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newPages.length) return;

        [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
        setOrganizedPages(newPages);
    };

    const handleSplit = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('Sayfa ayrıştırılıyor...');
        try {
            const mainFile = pdfFiles[0].file;
            const arrayBuffer = await mainFile.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const [copiedPage] = await newDoc.copyPages(srcDoc, [splitPage - 1]);
            newDoc.addPage(copiedPage);

            const pdfBytes = await newDoc.save();
            downloadPdf(pdfBytes, `sayfa-${splitPage}-${mainFile.name}`);
        } catch (err) {
            console.error(err);
            alert('PDF işleminde hata oluştu.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleMerge = async () => {
        if (organizedPages.length === 0) return;
        setProcessing(true);
        setStatusText('Seçili sayfalar birleştiriliyor...');
        try {
            const mergedDoc = await PDFDocument.create();

            // Cache loaded documents to avoid re-loading same file multiple times
            const docCache: Record<string, PDFDocument> = {};

            for (const organizedPage of organizedPages) {
                if (!docCache[organizedPage.fileId]) {
                    const fileInfo = pdfFiles.find(f => f.id === organizedPage.fileId);
                    if (fileInfo) {
                        const arrayBuffer = await fileInfo.file.arrayBuffer();
                        docCache[organizedPage.fileId] = await PDFDocument.load(arrayBuffer);
                    }
                }

                const srcDoc = docCache[organizedPage.fileId];
                if (srcDoc) {
                    const [copiedPage] = await mergedDoc.copyPages(srcDoc, [organizedPage.pageIndex]);
                    mergedDoc.addPage(copiedPage);
                }
            }

            const pdfBytes = await mergedDoc.save();
            downloadPdf(pdfBytes, `birlestirilmis-${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Birleştirme hatası.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleWatermark = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('Filigran ekleniyor...');
        try {
            const mainFile = pdfFiles[0].file;
            const arrayBuffer = await mainFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

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
            downloadPdf(pdfBytes, `filigran-${mainFile.name}`);
        } catch (err) {
            console.error(err);
            alert('Filigran eklenemedi.');
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleCompress = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('PDF işleniyor ve sıkıştırılıyor...');
        try {
            const mainFile = pdfFiles[0].file;
            const arrayBuffer = await mainFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const newPdfDoc = await PDFDocument.create();

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatusText(`Sayfa işleniyor: ${i} / ${pdf.numPages}`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport: viewport } as any).promise;
                const imgDataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
                const imgImage = await newPdfDoc.embedJpg(imgDataUrl);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(imgImage, {
                    x: 0, y: 0, width: viewport.width, height: viewport.height,
                });
            }

            const pdfBytes = await newPdfDoc.save();
            downloadPdf(pdfBytes, `sikistirilmis-${mainFile.name}`);
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

    return (
        <div className="glass-panel w-full max-w-[1000px] mx-auto p-4 md:p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="glass-button p-2 bg-white/5 border-white/10 hover:bg-white/10" title="Geri Dön" aria-label="Geri Dön"><ArrowLeft size={18} /></button>
                    <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                        <FileText className="text-red-400" />
                        PDF Araçları
                    </h2>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    {(['merge', 'split', 'compress', 'watermark'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab === 'merge' && <Layers size={16} className="inline mr-2" />}
                            {tab === 'split' && <Scissors size={16} className="inline mr-2" />}
                            {tab === 'compress' && <Minimize2 size={16} className="inline mr-2" />}
                            {tab === 'watermark' && <Stamp size={16} className="inline mr-2" />}
                            {tab === 'merge' ? 'Birleştir & Düzenle' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                {/* MERGE & ORGANIZE */}
                {activeTab === 'merge' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <LayoutGrid size={20} className="text-blue-400" />
                                    Sayfa Düzenleyici
                                </h3>
                                <p className="text-sm text-slate-400">Sayfaları sürükleyip bırakarak veya okları kullanarak sırasını değiştirin.</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => mergeInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm flex items-center gap-2 border border-blue-500/30 transition-all font-medium"
                                >
                                    <Plus size={16} /> PDF Ekle
                                </button>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    multiple
                                    ref={mergeInputRef}
                                    className="hidden"
                                    onChange={handleFileInput}
                                    title="PDF Dosyası Seç"
                                />
                            </div>
                        </div>

                        {/* ORGANIZER GRID */}
                        <div className="bg-black/20 rounded-2xl border border-white/5 p-4 md:p-6">
                            {loadingThumbnails && organizedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                                    <RefreshCw className="animate-spin text-blue-400" size={32} />
                                    <p>Sayfalar yükleniyor...</p>
                                </div>
                            ) : organizedPages.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
                                    <p className="text-slate-500 mb-4">Düzenlemek için PDF dosyaları ekleyin.</p>
                                    <button onClick={() => mergeInputRef.current?.click()} className="text-blue-400 hover:underline text-sm font-medium">Dosyaları Seçin</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                    {organizedPages.map((page, index) => (
                                        <div key={page.id} className="group relative bg-white/5 rounded-xl border border-white/10 p-2 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
                                            {/* Page Thumbnail */}
                                            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 mb-3 border border-white/5 relative">
                                                {page.thumbnail ? (
                                                    <img src={page.thumbnail} alt={`Page ${page.pageIndex + 1}`} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <FileText size={40} />
                                                    </div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-[10px] px-1.5 py-0.5 rounded text-white font-mono border border-white/10 z-10">
                                                    P{page.pageIndex + 1}
                                                </div>
                                            </div>

                                            {/* Info & Controls */}
                                            <div className="flex flex-col gap-1 px-1">
                                                <span className="text-[10px] text-slate-500 truncate block font-medium" title={page.fileName}>
                                                    {page.fileName}
                                                </span>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => movePage(index, 'up')} disabled={index === 0} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white disabled:opacity-20" title="Yukarı Taşı" aria-label="Yukarı Taşı">
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button onClick={() => movePage(index, 'down')} disabled={index === organizedPages.length - 1} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white disabled:opacity-20" title="Aşağı Taşı" aria-label="Aşağı Taşı">
                                                            <ArrowDown size={14} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removePage(page.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors ml-auto" title="Sayfayı Kaldır" aria-label="Sayfayı Kaldır">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Hover Grip (Visual Only for now) */}
                                            <div className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white/50">
                                                <GripVertical size={14} />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add More Placeholder */}
                                    <button
                                        onClick={() => mergeInputRef.current?.click()}
                                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-all bg-white/[0.02]"
                                    >
                                        <Plus size={24} />
                                        <span className="text-xs font-medium">Sayfa Ekle</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* FOOTER ACTION */}
                        <div className="flex justify-between items-center bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-white">{organizedPages.length} Sayfa Hazır</p>
                                <p className="text-[11px] text-slate-400">Tüm sayfalar tek bir PDF olarak birleştirilecek.</p>
                            </div>
                            <button
                                onClick={handleMerge}
                                disabled={processing || organizedPages.length === 0}
                                className={`primary-button-lg px-8 py-3 bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-500/20 w-full sm:w-auto flex justify-center ${organizedPages.length === 0 || processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? <RefreshCw className="animate-spin mr-2" /> : <Layers className="mr-2" />}
                                {processing ? 'Birleştiriliyor...' : 'Yeni PDF Oluştur'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SPLIT */}
                {activeTab === 'split' && (
                    <div className="max-w-md mx-auto py-10 text-center">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
                                <Scissors size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Sayfa Çıkar</h3>
                                <p className="text-sm text-slate-400">"{pdfFiles[0]?.name || file.name}"</p>
                            </div>

                            <div className="flex items-center justify-center gap-6 py-4">
                                <div className="text-left">
                                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Sayfa No</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={mainPdfPageCount || 1}
                                        value={splitPage}
                                        onChange={(e) => setSplitPage(Math.min(parseInt(e.target.value) || 1, mainPdfPageCount || 1))}
                                        className="bg-black/40 border border-white/10 rounded-xl p-3 w-24 text-center text-xl font-bold focus:border-red-400/50 focus:outline-none transition-all"
                                        title="Çıkarılacak Sayfa Numarası"
                                        aria-label="Çıkarılacak Sayfa Numarası"
                                    />
                                </div>
                                <div className="text-4xl text-slate-700 font-light mt-4">/</div>
                                <div className="text-left mt-4">
                                    <span className="text-2xl font-bold text-slate-500">{mainPdfPageCount}</span>
                                    <p className="text-[10px] text-slate-600 uppercase font-bold">Toplam</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSplit}
                                disabled={processing}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
                                {processing ? 'İşleniyor...' : 'Seçili Sayfayı İndir'}
                            </button>
                        </div>
                    </div>
                )}

                {/* COMPRESS */}
                {activeTab === 'compress' && (
                    <div className="max-w-md mx-auto py-10">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 text-center">
                            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto text-orange-400 border border-orange-500/20">
                                <Minimize2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Akıllı Sıkıştırma</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Metinleri ve görselleri optimize ederek dosya boyutunu küçültür. Profesyonel kalite kaybı olmadan sıkıştırma yapar.
                                </p>
                            </div>

                            <div className="space-y-4 py-4">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <span>Hedef Kalite</span>
                                    <span className="text-orange-400">{Math.round(compressionQuality * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.05"
                                    value={compressionQuality}
                                    onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    title="Sıkıştırma Kalitesi"
                                    aria-label="Sıkıştırma Kalitesi"
                                />
                                <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                                    <span>Küçük Boyut</span>
                                    <span>Yüksek Kalite</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCompress}
                                disabled={processing}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="animate-spin" /> : <Plus size={20} />}
                                {processing ? statusText : 'Sıkıştırmayı Başlat'}
                            </button>
                        </div>
                    </div>
                )}

                {/* WATERMARK */}
                {activeTab === 'watermark' && (
                    <div className="max-w-md mx-auto py-10">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400 border border-purple-500/20">
                                <Stamp size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-center">Filigran Ekle</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filigran Metni</label>
                                    <input
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-400/50 outline-none transition-all placeholder:text-slate-700"
                                        title="Filigran Metni"
                                        placeholder="Örn: GİZLİ"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Renk</label>
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={watermarkColor}
                                                onChange={(e) => setWatermarkColor(e.target.value)}
                                                className="w-full h-11 bg-transparent border-none cursor-pointer rounded-xl"
                                                title="Filigran Rengi"
                                                aria-label="Filigran Rengi"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opaklık</label>
                                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-3 h-11">
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1"
                                                step="0.1"
                                                value={watermarkOpacity}
                                                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                title="Filigran Opaklığı"
                                                aria-label="Filigran Opaklığı"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{Math.round(watermarkOpacity * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleWatermark}
                                disabled={processing}
                                className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-2xl font-bold text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="animate-spin" /> : <Stamp size={20} />}
                                {processing ? 'Ekleniyor...' : 'Filigranı PDFye Ekle'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {processing && statusText && (
                <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5 animate-pulse">
                    <RefreshCw className="animate-spin text-blue-400" size={16} />
                    {statusText}
                </div>
            )}
        </div>
    );
};

