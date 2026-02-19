import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, Scissors, Download, Layers, Minimize2, Stamp, RefreshCw, Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid, GripVertical, Image as ImageIcon } from 'lucide-react';
import { PDFDocument, degrees, rgb, PDFImage } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import fontkit from '@pdf-lib/fontkit';
import { loadTurkishFont } from '../utils/fontLoader';

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
    const [activeTab, setActiveTab] = useState<TabType>('merge');
    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
    const [organizedPages, setOrganizedPages] = useState<OrganizedPage[]>([]);
    const [loadingThumbnails, setLoadingThumbnails] = useState(false);

    const [splitPage, setSplitPage] = useState<number>(1);
    const [mainPdfPageCount, setMainPdfPageCount] = useState<number>(0);

    const [watermarkText, setWatermarkText] = useState('GİZLİ');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
    const [watermarkColor, setWatermarkColor] = useState('#ff0000');
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkImage, setWatermarkImage] = useState<string | null>(null);

    const [compressionQuality, setCompressionQuality] = useState(0.7);

    const mergeInputRef = useRef<HTMLInputElement>(null);

    const downloadPdf = useCallback((data: Uint8Array, filename: string) => {
        const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }, []);

    const generateThumbnails = useCallback(async (newFileId: string, f: File) => {
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

                await page.render({
                    canvasContext: (context as unknown as CanvasRenderingContext2D),
                    viewport: viewport
                } as unknown as Parameters<typeof page.render>[0]).promise;
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
    }, []);

    const handleFileAdd = useCallback(async (f: File) => {
        const id = Math.random().toString(36).substr(2, 9);
        try {
            if (f.type.startsWith('image/')) {
                const imgData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(f);
                });

                const tempDoc = await PDFDocument.create();
                const img = f.type === 'image/jpeg' || f.type === 'image/jpg' ? await tempDoc.embedJpg(imgData) : await tempDoc.embedPng(imgData);
                const page = tempDoc.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
                const pdfBytes = await tempDoc.save();

                const newFileInfo: PdfFileInfo = {
                    id,
                    file: new File([pdfBytes as unknown as BlobPart], f.name, { type: 'application/pdf' }),
                    name: f.name,
                    pageCount: 1
                };
                setPdfFiles(prev => [...prev, newFileInfo]);

                setOrganizedPages(prev => [...prev, {
                    id: `${id}-0-${Math.random().toString(36).substr(2, 9)}`,
                    fileId: id,
                    pageIndex: 0,
                    thumbnail: imgData,
                    fileName: f.name
                }]);
                return;
            }

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
            setMainPdfPageCount(pageCount);

            generateThumbnails(id, f);
        } catch (err) {
            console.error(err);
            alert(`${f.name} yüklenemedi. Dosya bozuk veya desteklenmeyen format.`);
        }
    }, [generateThumbnails]);

    useEffect(() => {
        if (file) {
            const timer = setTimeout(() => {
                handleFileAdd(file);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [file, handleFileAdd]);

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
            pdfDoc.registerFontkit(fontkit);
            const fontBytes = await loadTurkishFont();
            const font = await pdfDoc.embedFont(fontBytes);
            const pages = pdfDoc.getPages();

            let embeddedImage: PDFImage | null = null;
            if (watermarkType === 'image' && watermarkImage) {
                embeddedImage = watermarkImage.startsWith('data:image/jpeg') || watermarkImage.startsWith('data:image/jpg')
                    ? await pdfDoc.embedJpg(watermarkImage)
                    : await pdfDoc.embedPng(watermarkImage);
            }

            const r = parseInt(watermarkColor.slice(1, 3), 16) / 255;
            const g = parseInt(watermarkColor.slice(3, 5), 16) / 255;
            const b = parseInt(watermarkColor.slice(5, 7), 16) / 255;

            pages.forEach((page) => {
                const { width, height } = page.getSize();

                if (watermarkType === 'text') {
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
                } else if (embeddedImage) {
                    const imgDims = embeddedImage.scale(0.5); // Default scale
                    // Fit image to page if too large
                    const scale = Math.min(1, (width * 0.4) / imgDims.width, (height * 0.4) / imgDims.height);
                    const finalWidth = imgDims.width * scale;
                    const finalHeight = imgDims.height * scale;

                    page.drawImage(embeddedImage, {
                        x: width / 2 - finalWidth / 2,
                        y: height / 2 - finalHeight / 2,
                        width: finalWidth,
                        height: finalHeight,
                        opacity: watermarkOpacity,
                    });
                }
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

                await page.render({
                    canvasContext: (context as unknown as CanvasRenderingContext2D),
                    viewport: viewport
                } as unknown as Parameters<typeof page.render>[0]).promise;
                const imgDataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
                const imgImage = await newPdfDoc.embedJpg(imgDataUrl);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(imgImage, {
                    x: 0, y: 0, width: viewport.width, height: viewport.height,
                });
            }

            const pdfBytes = await newPdfDoc.save();
            downloadPdf(pdfBytes, `sikistirilmis-${mainFile.name}`);
        } catch (err: unknown) {
            console.error(err);
            alert(`Sıkıştırma hatası: ${err instanceof Error ? err.message : String(err)}`);
        }
        setProcessing(false);
        setStatusText('');
    };

    return (
        <div className="w-full max-w-[1000px] mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                        title="Geri Dön"
                        aria-label="Geri Dön"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <FileText className="text-red-500" />
                            PDF Araçları
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">PDF dosyalarını yönet, birleştir ve düzenle</p>
                    </div>
                </div>
                {pdfFiles.length > 0 && (
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['merge', 'split', 'compress', 'watermark'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab === 'merge' && <Layers size={16} className="inline mr-2" />}
                                {tab === 'split' && <Scissors size={16} className="inline mr-2" />}
                                {tab === 'compress' && <Minimize2 size={16} className="inline mr-2" />}
                                {tab === 'watermark' && <Stamp size={16} className="inline mr-2" />}
                                {tab === 'merge' ? 'Birleştir' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="min-h-[400px]">
                {pdfFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-red-500/10 dark:bg-red-500/20 blur-2xl rounded-full"></div>
                            <FileText size={80} className="text-red-500 relative" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">PDF İşlemeye Başlayın</h3>
                            <p className="text-slate-500 dark:text-slate-400">PDF dosyalarınızı birleştirin, ayırın, sıkıştırın veya filigran ekleyin.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl px-8">
                            <div
                                onClick={() => mergeInputRef.current?.click()}
                                className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer group text-left"
                            >
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">PDF Dosyası Ekle</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Düzenlemek için bir veya daha fazla PDF seçin.</p>
                            </div>
                            <div
                                onClick={() => mergeInputRef.current?.click()}
                                className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group text-left"
                            >
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Resimleri PDF Yap</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">JPG veya PNG resimlerini PDF'e dönüştürün.</p>
                            </div>
                        </div>

                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            multiple
                            ref={mergeInputRef}
                            className="hidden"
                            onChange={handleFileInput}
                            title="Dosya Seç"
                        />
                    </div>
                ) : (
                    <>
                        {/* MERGE & ORGANIZE */}
                        {activeTab === 'merge' && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                            <LayoutGrid size={20} className="text-blue-500" />
                                            Sayfa Düzenleyici
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Sürükleyip bırakarak sıralamayı değiştirin.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => mergeInputRef.current?.click()}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm flex items-center gap-2 transition-all font-medium"
                                        >
                                            <Plus size={16} /> Dosya Ekle
                                        </button>
                                        <input
                                            type="file"
                                            accept="application/pdf,image/*"
                                            multiple
                                            ref={mergeInputRef}
                                            className="hidden"
                                            onChange={handleFileInput}
                                            title="Dosya Seç"
                                        />
                                    </div>
                                </div>

                                {/* ORGANIZER GRID */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6">
                                    {loadingThumbnails && organizedPages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                                            <RefreshCw className="animate-spin text-blue-500" size={32} />
                                            <p>Sayfalar yükleniyor...</p>
                                        </div>
                                    ) : organizedPages.length === 0 ? (
                                        <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                            <p className="text-slate-500 dark:text-slate-400 mb-4">Düzenlemek için PDF veya Resim dosyaları ekleyin.</p>
                                            <button onClick={() => mergeInputRef.current?.click()} className="text-blue-500 hover:underline text-sm font-medium">Dosyaları Seçin</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                            {organizedPages.map((page, index) => (
                                                <div key={page.id} className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 transition-all hover:border-blue-500 hover:shadow-lg">
                                                    {/* Page Thumbnail */}
                                                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 mb-3 border border-slate-100 dark:border-slate-800 relative">
                                                        {page.thumbnail ? (
                                                            <img src={page.thumbnail} alt={`Page ${page.pageIndex + 1}`} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <FileText size={40} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-1 left-1 bg-slate-900/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono z-10">
                                                            P{page.pageIndex + 1}
                                                        </div>
                                                    </div>

                                                    {/* Info & Controls */}
                                                    <div className="flex flex-col gap-1 px-1">
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block font-medium" title={page.fileName}>
                                                            {page.fileName}
                                                        </span>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => movePage(index, 'up')} disabled={index === 0} title="Yukarı taşı" aria-label="Sayfayı yukarı taşı" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20">
                                                                    <ArrowUp size={14} />
                                                                </button>
                                                                <button onClick={() => movePage(index, 'down')} disabled={index === organizedPages.length - 1} title="Aşağı taşı" aria-label="Sayfayı aşağı taşı" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20">
                                                                    <ArrowDown size={14} />
                                                                </button>
                                                            </div>
                                                            <button onClick={() => removePage(page.id)} title="Sayfayı kaldır" aria-label="Sayfayı kaldır" className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-auto">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => mergeInputRef.current?.click()}
                                                className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all bg-slate-50 dark:bg-slate-800/50"
                                            >
                                                <Plus size={24} />
                                                <span className="text-xs font-medium">Dosya Ekle</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* FOOTER ACTION */}
                                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{organizedPages.length} Sayfa Hazır</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Tüm sayfalar tek bir PDF olarak birleştirilecek.</p>
                                    </div>
                                    <button
                                        onClick={handleMerge}
                                        disabled={processing || organizedPages.length === 0}
                                        className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 w-full sm:w-auto flex justify-center items-center transition-all ${organizedPages.length === 0 || processing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
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
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                                        <Scissors size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Sayfa Çıkar</h3>
                                        <p className="text-sm text-slate-500">"{pdfFiles[0]?.name || 'Belge'}"</p>
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
                                                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 w-24 text-center text-xl font-bold text-slate-800 dark:text-white focus:border-red-500 focus:outline-none transition-all"
                                                title="Çıkarılacak Sayfa Numarası"
                                            />
                                        </div>
                                        <div className="text-4xl text-slate-300 dark:text-slate-700 font-light mt-4">/</div>
                                        <div className="text-left mt-4">
                                            <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">{mainPdfPageCount}</span>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Toplam</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSplit}
                                        disabled={processing || pdfFiles.length === 0}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5"
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
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto text-orange-500">
                                        <Minimize2 size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Akıllı Sıkıştırma</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Metinleri ve görselleri optimize ederek dosya boyutunu küçültür.
                                        </p>
                                    </div>

                                    <div className="space-y-4 py-4">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                            <span>Hedef Kalite</span>
                                            <span className="text-orange-500">{Math.round(compressionQuality * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.05"
                                            value={compressionQuality}
                                            onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            title="Sıkıştırma Kalitesi"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                                            <span>Küçük Boyut</span>
                                            <span>Yüksek Kalite</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCompress}
                                        disabled={processing || pdfFiles.length === 0}
                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5"
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
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto text-purple-500">
                                        <Stamp size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white">Filigran Ekle</h3>

                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                                        <button
                                            onClick={() => setWatermarkType('text')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${watermarkType === 'text' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        >
                                            Metin
                                        </button>
                                        <button
                                            onClick={() => setWatermarkType('image')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${watermarkType === 'image' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        >
                                            Resim (Logo)
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {watermarkType === 'text' ? (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filigran Metni</label>
                                                    <input
                                                        type="text"
                                                        value={watermarkText}
                                                        onChange={(e) => setWatermarkText(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-400"
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
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opaklık</label>
                                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-11">
                                                            <input
                                                                type="range"
                                                                min="0.1"
                                                                max="1"
                                                                step="0.1"
                                                                value={watermarkOpacity}
                                                                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                                title="Filigran Opaklığı"
                                                            />
                                                            <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{Math.round(watermarkOpacity * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Resim Seç (PNG/JPG)</label>
                                                    <div
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e: Event) => {
                                                                const target = e.target as HTMLInputElement;
                                                                const file = target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = () => setWatermarkImage(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        className="w-full aspect-video bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group overflow-hidden"
                                                    >
                                                        {watermarkImage ? (
                                                            <img src={watermarkImage} className="w-full h-full object-contain p-2" alt="Filigran" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="text-slate-400 group-hover:text-purple-500 mb-2" size={32} />
                                                                <span className="text-xs text-slate-500">Logo veya Resim Yükle</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opaklık</label>
                                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-11">
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="1"
                                                            step="0.1"
                                                            value={watermarkOpacity}
                                                            onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                                            className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                            title="Filigran Opaklığı"
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{Math.round(watermarkOpacity * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleWatermark}
                                        disabled={processing || pdfFiles.length === 0}
                                        className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-2xl font-bold text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Stamp size={20} />}
                                        {processing ? 'Ekleniyor...' : 'Filigranı PDFye Ekle'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {processing && statusText && (
                <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg animate-pulse">
                    <RefreshCw className="animate-spin text-blue-500" size={16} />
                    {statusText}
                </div>
            )}
        </div>
    );
};
