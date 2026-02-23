'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ArrowLeft, FileText, Upload, X, AlertCircle, Download,
    FileSpreadsheet, Image as ImageIcon, FileType,
    GripVertical, ArrowUp, ArrowDown, Plus, Layers,
    Settings2, CheckCircle2, Loader2, Info
} from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, ImageRun, type ISectionOptions } from 'docx';
import fontkit from '@pdf-lib/fontkit';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { loadTurkishFont } from '../utils/fontLoader';
import jsPDF from 'jspdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type OfficeToolMode = 'word-pdf' | 'pdf-word' | 'excel-pdf' | 'pdf-excel' | 'ppt-pdf' | 'pdf-ppt' | 'pdf-image' | 'imagetopdf';

interface OfficeToolsProps {
    mode: OfficeToolMode;
    onBack: () => void;
}

interface FileState {
    file: File;
    status: 'idle' | 'converting' | 'success' | 'error';
    progress: number;
    result?: string | Blob;
    errorMsg?: string;
    resultName?: string;
}

interface ImageItem {
    id: string;
    file: File;
    preview: string;
    width: number;
    height: number;
}

const TOOL_CONFIG = {
    'word-pdf': { title: 'Word → PDF', accept: '.doc,.docx', icon: <FileText size={24} />, color: 'text-blue-600', bg: 'bg-blue-600', real: true },
    'pdf-word': { title: 'PDF → Word', accept: '.pdf', icon: <FileText size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'excel-pdf': { title: 'Excel → PDF', accept: '.xls,.xlsx', icon: <FileSpreadsheet size={24} />, color: 'text-green-600', bg: 'bg-green-600', real: false },
    'pdf-excel': { title: 'PDF → Excel', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: false },
    'ppt-pdf': { title: 'PowerPoint → PDF', accept: '.ppt,.pptx', icon: <FileSpreadsheet size={24} />, color: 'text-orange-500', bg: 'bg-orange-500', real: false },
    'pdf-ppt': { title: 'PDF → PowerPoint', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: false },
    'pdf-image': { title: 'PDF → Görsel', accept: '.pdf', icon: <ImageIcon size={24} />, color: 'text-purple-500', bg: 'bg-purple-500', real: true },
    'imagetopdf': { title: 'Görsel → PDF', accept: 'image/*', icon: <ImageIcon size={24} />, color: 'text-blue-500', bg: 'bg-blue-500', real: true },
};

type PageSize = 'auto' | 'a4' | 'a3' | 'letter' | 'legal';
type PageOrientation = 'portrait' | 'landscape';
type ImageFit = 'fit' | 'fill' | 'stretch';

const PAGE_SIZES: Record<PageSize, string> = {
    auto: 'Otomatik (görsel boyutu)',
    a4: 'A4 (210×297mm)',
    a3: 'A3 (297×420mm)',
    letter: 'Letter (216×279mm)',
    legal: 'Legal (216×356mm)',
};

// ─── Progress Bar (no inline style) ──────────────────────────────────────────
function ProgressBar({ value, color = 'bg-blue-500' }: { value: number; color?: string }) {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (barRef.current) {
            barRef.current.style.width = `${value}%`;
        }
    }, [value]);

    return (
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
                ref={barRef}
                className={`h-full transition-all duration-300 rounded-full ${color}`}
            />
        </div>
    );
}

// ─── Multi-Image → PDF Component ─────────────────────────────────────────────
function ImageToPdfTool({ onBack }: { onBack: () => void }) {
    const handleBack = onBack;
    const [images, setImages] = useState<ImageItem[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [dragItemId, setDragItemId] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const [orientation, setOrientation] = useState<PageOrientation>('portrait');
    const [imageFit, setImageFit] = useState<ImageFit>('fit');
    const [margin, setMargin] = useState(20);
    const [quality, setQuality] = useState(0.92);
    const [isBuilding, setIsBuilding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadImage = useCallback((file: File): Promise<ImageItem> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    resolve({
                        id: `${file.name}-${Date.now()}-${Math.random()}`,
                        file,
                        preview: src,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    });
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleFiles = useCallback(async (fileList: FileList | File[]) => {
        const accepted = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (!accepted.length) return;
        const loaded = await Promise.all(accepted.map(loadImage));
        setImages(prev => [...prev, ...loaded]);
        setDone(false);
    }, [loadImage]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const moveImage = (id: string, dir: 'up' | 'down') => {
        setImages(prev => {
            const idx = prev.findIndex(i => i.id === id);
            if (idx === -1) return prev;
            const next = [...prev];
            const target = dir === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= next.length) return prev;
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(i => i.id !== id));
        setDone(false);
    };

    const handleDragStart = (id: string) => setDragItemId(id);
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!dragItemId || dragItemId === targetId) return;
        setImages(prev => {
            const from = prev.findIndex(i => i.id === dragItemId);
            const to = prev.findIndex(i => i.id === targetId);
            if (from === -1 || to === -1) return prev;
            const next = [...prev];
            next.splice(to, 0, next.splice(from, 1)[0]);
            return next;
        });
    };
    const handleDragEnd = () => setDragItemId(null);

    const buildPdf = async () => {
        if (!images.length) return;
        setIsBuilding(true);
        setProgress(0);
        setDone(false);

        try {
            const pdfDoc = await PDFDocument.create();

            for (let i = 0; i < images.length; i++) {
                const item = images[i];
                setProgress(Math.round(((i) / images.length) * 90));

                const canvas = document.createElement('canvas');
                const img = new Image();
                await new Promise<void>(res => { img.onload = () => res(); img.src = item.preview; });

                let pgW: number, pgH: number;
                if (pageSize === 'auto') {
                    pgW = item.width;
                    pgH = item.height;
                } else {
                    const sizePts = {
                        a4: PageSizes.A4,
                        a3: PageSizes.A3,
                        letter: PageSizes.Letter,
                        legal: PageSizes.Legal,
                    }[pageSize] as [number, number];
                    [pgW, pgH] = orientation === 'portrait' ? sizePts : [sizePts[1], sizePts[0]];
                }

                const mPts = margin;
                const drawW = pgW - mPts * 2;
                const drawH = pgH - mPts * 2;

                let imgX = mPts, imgY = mPts;
                let imgW = drawW, imgH = drawH;

                if (imageFit === 'fit') {
                    const scale = Math.min(drawW / item.width, drawH / item.height);
                    imgW = item.width * scale;
                    imgH = item.height * scale;
                    imgX = mPts + (drawW - imgW) / 2;
                    imgY = mPts + (drawH - imgH) / 2;
                } else if (imageFit === 'fill') {
                    const scale = Math.max(drawW / item.width, drawH / item.height);
                    imgW = item.width * scale;
                    imgH = item.height * scale;
                    imgX = mPts + (drawW - imgW) / 2;
                    imgY = mPts + (drawH - imgH) / 2;
                }

                canvas.width = item.width;
                canvas.height = item.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
                const base64 = jpegDataUrl.split(',')[1];
                const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

                const embeddedImg = await pdfDoc.embedJpg(jpegBytes);
                const page = pdfDoc.addPage([pgW, pgH]);
                const pdfImgY = pgH - imgY - imgH;
                page.drawImage(embeddedImg, { x: imgX, y: pdfImgY, width: imgW, height: imgH });
            }

            setProgress(95);
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            saveAs(blob, `images-to-pdf-${Date.now()}.pdf`);
            setProgress(100);
            setDone(true);
        } catch (e) {
            console.error(e);
            alert('PDF oluşturulurken hata oluştu: ' + (e as Error).message);
        } finally {
            setIsBuilding(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-blue-500" /> Görsel → PDF Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Birden fazla görsel yükle, sırala ve tek PDF&apos;e birleştir
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                            <Settings2 size={16} className="text-blue-500" /> Sayfa Ayarları
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sayfa Boyutu</label>
                                <select value={pageSize} onChange={e => setPageSize(e.target.value as PageSize)}
                                    title="Sayfa boyutu seç" aria-label="Çıktı PDF sayfa boyutu"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                                    {Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>

                            {pageSize !== 'auto' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Yön</label>
                                    <div className="flex gap-2">
                                        {(['portrait', 'landscape'] as const).map(o => (
                                            <button key={o} onClick={() => setOrientation(o)}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${orientation === o
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                                {o === 'portrait' ? '📄 Dikey' : '🖼️ Yatay'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Görsel Yerleşimi</label>
                                <div className="space-y-1">
                                    {([
                                        { id: 'fit', label: 'Sığdır', desc: 'En-boy oranını korur' },
                                        { id: 'fill', label: 'Doldur', desc: 'Kenarlar kesilebilir' },
                                        { id: 'stretch', label: 'Uzat', desc: 'Tam sayfa, çarpıtılabilir' },
                                    ] as const).map(opt => (
                                        <button key={opt.id} onClick={() => setImageFit(opt.id)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${imageFit === opt.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                            <div className="font-bold">{opt.label}</div>
                                            <div className={`text-[10px] mt-0.5 ${imageFit === opt.id ? 'text-blue-500' : 'text-slate-400'}`}>{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {pageSize !== 'auto' && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Kenar Boşluğu</label>
                                        <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">{margin} pt</span>
                                    </div>
                                    <input type="range" min={0} max={60} value={margin}
                                        onChange={e => setMargin(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                        aria-label="Kenar boşluğu" title="Kenar boşluğu (pt)" />
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">JPEG Kalitesi</label>
                                    <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">{Math.round(quality * 100)}%</span>
                                </div>
                                <input type="range" min={0.5} max={1.0} step={0.01} value={quality}
                                    onChange={e => setQuality(Number(e.target.value))}
                                    className="w-full accent-blue-500"
                                    aria-label="JPEG çıktı kalitesi" title="JPEG çıktı kalitesi" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Küçük dosya</span><span>Yüksek kalite</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Build button */}
                    <button onClick={buildPdf} disabled={images.length === 0 || isBuilding}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3">
                        {isBuilding ? (
                            <><Loader2 size={20} className="animate-spin" /> Oluşturuluyor... {progress}%</>
                        ) : done ? (
                            <><CheckCircle2 size={20} /> Tekrar İndir</>
                        ) : (
                            <><Layers size={20} /> {images.length > 0 ? `${images.length} Görseli PDF'e Dönüştür` : 'Görsel Ekle'}</>
                        )}
                    </button>

                    {isBuilding && <ProgressBar value={progress} color="bg-blue-600" />}

                    {done && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
                            <CheckCircle2 size={16} /> PDF başarıyla indirildi!
                        </div>
                    )}
                </div>

                {/* Image List */}
                <div className="lg:col-span-2">
                    {/* Drop zone */}
                    <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${dragOver
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Görsel eklemek için tıkla veya sürükle</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF, BMP — birden fazla seçilebilir</p>
                        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                            title="Görsel seç" aria-label="Görsel dosyaları seç"
                            onChange={e => e.target.files && handleFiles(e.target.files)} />
                    </div>

                    {images.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Henüz görsel eklenmedi</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1 mb-2">
                                <p className="text-xs font-bold text-slate-500 uppercase">{images.length} Görsel — sürükleyerek sırala</p>
                                <button onClick={() => { setImages([]); setDone(false); }}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium">
                                    Tümünü Temizle
                                </button>
                            </div>

                            {images.map((item, idx) => (
                                <div key={item.id} draggable
                                    onDragStart={() => handleDragStart(item.id)}
                                    onDragOver={(e) => handleDragOver(e, item.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border rounded-xl transition-all cursor-grab active:cursor-grabbing ${dragItemId === item.id
                                        ? 'border-blue-500 opacity-50 scale-95'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                    <GripVertical size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                    <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">{idx + 1}</span>
                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.file.name}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                                            <span>{item.width} × {item.height}px</span>
                                            <span>{(item.file.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <button onClick={() => moveImage(item.id, 'up')} disabled={idx === 0}
                                            title="Yukarı taşı" aria-label="Yukarı taşı"
                                            className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20 transition-colors rounded">
                                            <ArrowUp size={14} />
                                        </button>
                                        <button onClick={() => moveImage(item.id, 'down')} disabled={idx === images.length - 1}
                                            title="Aşağı taşı" aria-label="Aşağı taşı"
                                            className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20 transition-colors rounded">
                                            <ArrowDown size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeImage(item.id)} title="Kaldır" aria-label="Görseli kaldır"
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Standard Office Tool ────────────────────────────────────────────────────
export const OfficeTools: React.FC<OfficeToolsProps> = ({ mode, onBack }) => {
    const handleBack = onBack;
    if (mode === 'imagetopdf') return <ImageToPdfTool onBack={onBack} />;

    const config = TOOL_CONFIG[mode];
    const isMock = !config.real;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [files, setFiles] = useState<FileState[]>([]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const inputRef = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const renderContainerRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                status: 'idle' as const,
                progress: 0
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const processFile = async (item: FileState, index: number) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'converting', progress: 5 } : f));

        try {
            let result: Blob | string | undefined;
            let resultName = item.file.name;

            // ── PDF → Görsel ──────────────────────────────────────────────
            if (mode === 'pdf-image') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                // Tüm sayfaları ayrı görsel olarak indir
                const zip: { name: string; blob: Blob }[] = [];
                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context!, viewport } as Parameters<typeof page.render>[0]).promise;
                    const blob = await new Promise<Blob>(res =>
                        canvas.toBlob(b => res(b!), 'image/jpeg', 0.92)
                    );
                    zip.push({ name: `sayfa-${p}.jpg`, blob });
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 + Math.round((p / pdf.numPages) * 70) } : f));
                }

                // Tek sayfa ise direkt indir
                if (zip.length === 1) {
                    result = zip[0].blob;
                    resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                } else {
                    // Çok sayfa: JSZip ile zip oluştur
                    try {
                        const JSZip = (await import('jszip')).default;
                        const z = new JSZip();
                        zip.forEach(({ name, blob }) => z.file(name, blob));
                        result = await z.generateAsync({ type: 'blob' });
                        resultName = item.file.name.replace(/\.[^/.]+$/, '') + '-sayfalar.zip';
                    } catch {
                        // JSZip yoksa sadece ilk sayfayı ver
                        result = zip[0].blob;
                        resultName = item.file.name.replace(/\.[^/.]+$/, '') + '-sayfa1.jpg';
                    }
                }
            }

            // ── Word → PDF ────────────────────────────────────────────────
            else if (mode === 'word-pdf') {
                if (renderContainerRef.current) {
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));
                    const container = renderContainerRef.current;
                    container.innerHTML = '';
                    const arrayBuffer = await item.file.arrayBuffer();
                    await renderAsync(arrayBuffer, container, undefined, {
                        className: 'docx',
                        inWrapper: true,
                        ignoreLastRenderedPageBreak: false,
                        useBase64URL: true,
                    });
                    await new Promise(r => setTimeout(r, 800));
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 55 } : f));

                    const canvas = await html2canvas(container, { scale: 1.5, useCORS: true, logging: false });
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    const totalPdfH = (imgProps.height * pdfWidth) / imgProps.width;

                    let heightLeft = totalPdfH;
                    let position = 0;
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfH);
                    heightLeft -= pdfHeight;

                    while (heightLeft > 0) {
                        position -= pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfH);
                        heightLeft -= pdfHeight;
                    }

                    result = pdf.output('blob');
                    resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                    container.innerHTML = '';
                } else {
                    throw new Error('Render container bulunamadı');
                }
            }

            // ── PDF → Word ────────────────────────────────────────────────
            else if (mode === 'pdf-word') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 10 } : f));
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                const sections: ISectionOptions[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const items = textContent.items as any[];

                    if (items.length === 0) {
                        // Boş sayfa veya sadece görsel var, eski yöntemi (görsel) kullanabiliriz veya boş geçebiliriz
                        sections.push({
                            children: [new Paragraph({ text: "" })]
                        });
                        continue;
                    }

                    // Satırları grupla (Y koordinatına göre)
                    const lines: any[][] = [];
                    let currentLine: any[] = [];
                    let lastY = -1;

                    // Y koordinatına göre (yukarıdan aşağıya) ve sonra X koordinatına göre sırala
                    const sortedItems = [...items].sort((a, b) => {
                        const yA = a.transform[5];
                        const yB = b.transform[5];
                        if (Math.abs(yA - yB) < 3) { // Aynı satır toleransı
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

                            // Kelimeler arası boşluk kontrolü (basit)
                            if (lastX !== -1 && x - lastX > 10) {
                                runs.push(new TextRun({ text: " ", size: Math.round(textItem.transform[0] * 2) || 22 }));
                            }

                            // Font büyüklüğünü belirle (transform[0] veya transform[3] genellikle font size'dır)
                            // docx size birimi half-points'tir (pt * 2)
                            const fontSize = Math.abs(Math.round(textItem.transform[0] * 2)) || 22;

                            runs.push(new TextRun({
                                text: textItem.str,
                                size: fontSize,
                                font: "Arial", // Varsayılan font, PDF'den eşleştirmek zordur
                            }));
                            lastX = x + textItem.width;
                        }

                        pageChildren.push(new Paragraph({
                            children: runs,
                            spacing: { before: 100, after: 100 }
                        }));
                    }

                    sections.push({
                        children: pageChildren
                    });

                    setFiles(prev => prev.map((f, idx) => idx === index ? { ...f, progress: 10 + Math.round((i / pdf.numPages) * 80) } : f));
                }

                const wordDoc = new Document({
                    sections,
                    creator: "Antigravity Office Tools",
                    title: item.file.name
                });
                result = await Packer.toBlob(wordDoc);
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.docx';
            }

            // ── PDF → Excel ──────────────────────────────────────────────
            else if (mode === 'pdf-excel') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const allRows: string[][] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const items = textContent.items as any[];

                    const lines: Record<number, any[]> = {};
                    items.forEach(it => {
                        const y = Math.round(it.transform[5]);
                        if (!lines[y]) lines[y] = [];
                        lines[y].push(it);
                    });

                    Object.keys(lines).sort((a, b) => Number(b) - Number(a)).forEach(y => {
                        const row = lines[Number(y)].sort((a, b) => a.transform[4] - b.transform[4]).map(it => it.str);
                        allRows.push(row);
                    });
                    setFiles(prev => prev.map((f, idx) => idx === index ? { ...f, progress: 20 + Math.round((i / pdf.numPages) * 70) } : f));
                }

                const { utils, write } = await import('xlsx');
                const ws = utils.aoa_to_sheet(allRows);
                const wb = utils.book_new();
                utils.book_append_sheet(wb, ws, "PDF Verileri");
                const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
                result = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.xlsx';
            }

            // ── Excel / PPT (mock) ────────────────────────────────────────
            else {
                await new Promise(r => setTimeout(r, 1200));
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 80 } : f));

                if (mode.endsWith('-pdf')) {
                    const pdfDoc = await PDFDocument.create();
                    pdfDoc.registerFontkit(fontkit);
                    const fontBytes = await loadTurkishFont();
                    const customFont = await pdfDoc.embedFont(fontBytes);
                    const page = pdfDoc.addPage();
                    page.drawText(
                        `Bu dosya tarayıcı ortamında tam dönüştürülemiyor.\n\nDosya: ${item.file.name}\n\nNOT: Excel ve PowerPoint dönüşümleri için\nsunucu taraflı işlem gereklidir.\nBu bir önizleme çıktısıdır.\n\nTürkçe test: ĞÜŞİÖÇ ğüşiöç`,
                        { x: 50, y: 700, size: 12, font: customFont }
                    );
                    const pdfBytes = await pdfDoc.save();
                    result = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                } else {
                    result = new Blob([`Mock dönüşüm sonucu: ${item.file.name}`], { type: 'text/plain' });
                    resultName = item.file.name + '.txt';
                }
            }

            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', progress: 100, result, resultName } : f));
        } catch (error) {
            console.error(error);
            setFiles(prev => prev.map((f, i) => i === index ? {
                ...f, status: 'error',
                errorMsg: (error as Error).message || 'Bilinmeyen hata'
            } : f));
        }
    };

    const downloadFile = (item: FileState) => {
        if (!item.result) return;
        saveAs(item.result instanceof Blob ? item.result : item.result, item.resultName || `converted-${item.file.name}`);
    };

    return (
        <div className="max-w-[1000px] mx-auto p-8 animate-in fade-in zoom-in duration-300">
            {/* Hidden DOCX render container */}
            <div ref={renderContainerRef}
                className="fixed -left-[9999px] top-0 w-[800px] bg-white text-black pointer-events-none overflow-hidden font-sans" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        {config.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Güvenli, hızlı ve ücretsiz dosya dönüştürme aracı.
                    </p>
                </div>
            </div>

            {/* Mock notice banner */}
            {isMock && (
                <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Sınırlı Tarayıcı Desteği</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                            Excel ve PowerPoint dosyaları karmaşık formatlara sahip olduğundan tarayıcı ortamında tam dönüşüm mümkün değildir.
                            Çıktı dosyası bir önizleme/placeholder içerecektir. Tam dönüşüm için sunucu tabanlı bir çözüm gereklidir.
                        </p>
                    </div>
                </div>
            )}

            {/* Dropper */}
            <div onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer mb-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Dosyayı Buraya Sürükleyin</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">veya seçmek için tıklayın</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400">
                    <FileType size={12} />
                    {config.accept.replace(/,/g, ' ')}
                </div>
                <input type="file" ref={inputRef} className="hidden" accept={config.accept} multiple
                    onChange={handleFileSelect} title="Dosya Seç" aria-label="Dosya yükle" />
            </div>

            {/* File list */}
            <div className="space-y-3">
                {files.map((item, index) => (
                    <div key={index}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all hover:shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                                {config.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate text-sm">{item.file.name}</p>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2 shrink-0">
                                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <ProgressBar
                                    value={item.progress}
                                    color={item.status === 'error' ? 'bg-red-500' : item.status === 'success' ? 'bg-green-500' : 'bg-blue-500'}
                                />
                                {item.status === 'success' && item.resultName && (
                                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-medium">
                                        ✅ {item.resultName}
                                    </p>
                                )}
                                {item.status === 'error' && item.errorMsg && (
                                    <p className="text-[10px] text-red-500 mt-1 truncate">
                                        ❌ {item.errorMsg}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {item.status === 'idle' && (
                                    <button onClick={() => processFile(item, index)}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                        Dönüştür
                                    </button>
                                )}
                                {item.status === 'converting' && (
                                    <span className="text-xs font-medium text-blue-500 flex items-center gap-1">
                                        <Loader2 size={14} className="animate-spin" /> İşleniyor...
                                    </span>
                                )}
                                {item.status === 'success' && (
                                    <button onClick={() => downloadFile(item)}
                                        className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                        title="İndir" aria-label="Dosyayı indir">
                                        <Download size={20} />
                                    </button>
                                )}
                                {item.status === 'error' && (
                                    <button onClick={() => processFile(item, index)}
                                        title="Tekrar dene" aria-label="Tekrar dene"
                                        className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                        <AlertCircle size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                    title="Kaldır" aria-label="Dosyayı listeden kaldır">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {files.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">Henüz dosya eklenmedi</p>
                    </div>
                )}
            </div>
        </div>
    );
};
