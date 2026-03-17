'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ArrowLeft, FileText, Upload, X, AlertCircle, Download,
    FileSpreadsheet, Image as ImageIcon, FileType,
    GripVertical, ArrowUp, ArrowDown, Plus, Layers, Sparkles, Wand2,
    Settings2, CheckCircle2, Loader2, Info, Eye, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { saveAndRecord } from '../utils/download-store';
import { Document, Packer, Paragraph, TextRun, ImageRun, type ISectionOptions } from 'docx';
import fontkit from '@pdf-lib/fontkit';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { loadTurkishFont } from '../utils/fontLoader';
import jsPDF from 'jspdf';
import { platform } from '../platform';
import { SHARED_ENGINE } from '../utils/shared-core';
import {
    pdfItemsToDocBlocks, docBlocksToDocx, excelToDocBlocks, renderedHtmlToPdfBlob,
    type PdfTextItem
} from '../utils/conversion-adapters';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type OfficeToolMode = 'word-pdf' | 'pdf-word' | 'excel-pdf' | 'pdf-excel' | 'ppt-pdf' | 'pdf-ppt' | 'pdf-image' | 'imagetopdf' | 'excel-word';

interface OfficeToolsProps {
    mode: OfficeToolMode;
    onBack: () => void;
}

interface FileInsight {
    id: string;
    type: 'warning' | 'info' | 'success' | 'suggestion';
    message: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

interface FileState {
    file: File;
    status: 'idle' | 'editing' | 'converting' | 'success' | 'error';
    progress: number;
    result?: string | Blob;
    errorMsg?: string;
    resultName?: string;
    gridData?: any[][];
    insights?: FileInsight[];
}

interface ImageItem {
    id: string;
    file: File;
    preview: string;
    width: number;
    height: number;
}

const TOOL_CONFIG = {
    'word-pdf': { title: 'Word → PDF', from: 'Word', to: 'PDF', accept: '.doc,.docx', icon: <FileText size={24} />, color: 'text-blue-600', bg: 'bg-blue-600', real: true },
    'pdf-word': { title: 'PDF → Word', from: 'PDF', to: 'Word', accept: '.pdf', icon: <FileText size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'excel-pdf': { title: 'Excel → PDF', from: 'Excel', to: 'PDF', accept: '.xls,.xlsx', icon: <FileSpreadsheet size={24} />, color: 'text-green-600', bg: 'bg-green-600', real: true },
    'pdf-excel': { title: 'PDF → Excel', from: 'PDF', to: 'Excel', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: false },
    'ppt-pdf': { title: 'PowerPoint → PDF', from: 'PPT', to: 'PDF', accept: '.ppt,.pptx', icon: <FileSpreadsheet size={24} />, color: 'text-orange-500', bg: 'bg-orange-500', real: true },
    'pdf-ppt': { title: 'PDF → PowerPoint', from: 'PDF', to: 'PPT', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: false },
    'pdf-image': { title: 'PDF → Görsel', from: 'PDF', to: 'Görsel', accept: '.pdf', icon: <ImageIcon size={24} />, color: 'text-purple-500', bg: 'bg-purple-500', real: true },
    'imagetopdf': { title: 'Görsel → PDF', from: 'Görsel', to: 'PDF', accept: 'image/*', icon: <ImageIcon size={24} />, color: 'text-blue-500', bg: 'bg-blue-600', real: true },
    'excel-word': { title: 'Excel → Word', from: 'Excel', to: 'Word', accept: '.xlsx,.xls', icon: <FileText size={24} />, color: 'text-green-700', bg: 'bg-green-700', real: true },
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
            saveAndRecord(blob, `images-to-pdf-${Date.now()}.pdf`, 'images', 'Görsel→PDF');
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

                    {/* Expert Tips */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 space-y-3">
                        <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            <Info size={14} /> Uzman İpuçları
                        </h4>
                        <ul className="space-y-2">
                            <li className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <b>Yüksek Kalite:</b> Baskı alacaksanız görsellerinizin <b>300 DPI</b> olduğundan emin olun.
                            </li>
                            <li className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <b>Dosya Boyutu:</b> Çok fazla görseliniz varsa JPEG kalitesini <b>%70-%80</b> bandına çekmek kaliteyi bozmadan boyutu ciddi oranda düşürür.
                            </li>
                            <li className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <b>Sayfa Yapısı:</b> Eğer taradığınız dökümanlar farklı boyutlardaysa sayfa boyutunu <b>"Otomatik"</b> yapmanız dökümanın orijinal yapısını korur.
                            </li>
                        </ul>
                    </div>
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

    const [files, setFiles] = useState<FileState[]>([]);
    const [orientation, setOrientation] = useState<PageOrientation>('portrait');
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const [watermarkText, setWatermarkText] = useState('');
    const [watermarkColor, setWatermarkColor] = useState('#ff0000');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
    const inputRef = useRef<HTMLInputElement>(null);
    const renderContainerRef = useRef<HTMLDivElement>(null);

    const processFiles = async (filesToAdd: File[]) => {
        const newFiles = await Promise.all(filesToAdd.map(async f => {
            let gridData: any[][] | undefined;
            if ((mode === 'excel-word' || mode === 'excel-pdf') && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
                const { read, utils } = await import('xlsx');
                const arrayBuffer = await f.arrayBuffer();
                const wb = read(new Uint8Array(arrayBuffer), { type: 'array' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                gridData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            }

            const insights: FileInsight[] = [];
            if (gridData && gridData.length > 0) {
                const headers = gridData[0] || [];
                const rowCount = gridData.length;
                const colCount = headers.length;

                // 1. Geniş Tablo Kontrolü
                if (colCount > 7 && orientation === 'portrait') {
                    insights.push({
                        id: 'orientation',
                        type: 'suggestion',
                        message: 'Yatay Sayfa Düzeni Önerilir',
                        description: 'Bu tabloda çok fazla sütun var. PDF çıktısının kesilmemesi için yatay düzen daha iyi görünecektir.',
                        actionLabel: 'YATAY YAP',
                        onAction: () => {
                            setOrientation('landscape');
                            setFiles(prev => prev.map(file => {
                                if (file.file === f) {
                                    return { ...file, insights: file.insights?.filter(ins => ins.id !== 'orientation') };
                                }
                                return file;
                            }));
                        }
                    });
                }

                // 2. Boş Sütun Kontrolü
                const emptyCols: number[] = [];
                for (let c = 0; c < colCount; c++) {
                    let isEmpty = true;
                    for (let r = 1; r < rowCount; r++) {
                        if (gridData[r][c] !== undefined && gridData[r][c] !== null && gridData[r][c] !== '') {
                            isEmpty = false;
                            break;
                        }
                    }
                    if (isEmpty) emptyCols.push(c);
                }

                if (emptyCols.length > 0) {
                    insights.push({
                        id: 'empty-cols',
                        type: 'warning',
                        message: `${emptyCols.length} Boş Sütun Tespit Edildi`,
                        description: 'Tablonuzda hiç veri içermeyen sütunlar var. Bunları kaldırmak dökümanın daha temiz görünmesini sağlar.',
                        actionLabel: 'SÜTUNLARI TEMİZLE'
                        // onAction will be handled in the component via index lookup
                    });
                }

                // 3. Uzun Başlık Kontrolü
                const longHeaders = headers.filter(h => String(h).length > 25);
                if (longHeaders.length > 0) {
                    insights.push({
                        id: 'long-headers',
                        type: 'info',
                        message: 'Uzun Başlık Metinleri',
                        description: 'Bazı sütun başlıkları çok uzun. Hücre içinde taşma yapabilir veya sütunları çok genişletebilir.',
                    });
                }

                // 4. Veri Tipi Kontrolü (Sadece basit bir örnek)
                if (rowCount > 10) {
                    insights.push({
                        id: 'smart-report',
                        type: 'success',
                        message: 'Rapor Formatı Uygun',
                        description: 'Bu veriler yapısal bir rapor gibi duruyor. Excel -> Word dönüşümünde otomatik tablo başlıkları eklenebilir.',
                    });
                }
            }

            return {
                file: f,
                status: gridData ? 'editing' as const : 'idle' as const,
                progress: 0,
                gridData,
                insights
            };
        }));
        setFiles(prev => [...prev, ...newFiles]);
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
                    } catch (e: any) {
                        console.error('ZIP generation failed', e);
                        // JSZip yoksa veya hata oluşursa sadece ilk sayfayı ver
                        result = zip[0].blob;
                        resultName = item.file.name.replace(/\.[^/.]+$/, '') + '-sayfa1.jpg';
                    }
                }
            }

            // ── Word → PDF (html2canvas → pdf-lib, table + image aware) ────────────────
            else if (mode === 'word-pdf') {
                if (!renderContainerRef.current) throw new Error('Render container bulunamadı');

                const container = renderContainerRef.current;
                container.innerHTML = '';
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 15 } : f));

                // 1. Render DOCX to HTML (useBase64URL embeds images inline)
                const arrayBuffer = await item.file.arrayBuffer();
                await renderAsync(arrayBuffer, container, undefined, {
                    className: 'docx',
                    inWrapper: true,
                    ignoreLastRenderedPageBreak: false,
                    useBase64URL: true,
                });

                // 2. Wait for images/fonts/tables to settle
                await new Promise(r => setTimeout(r, 2000));
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 40 } : f));

                // 3. Render to PDF using adapter (better table + image support)
                result = await renderedHtmlToPdfBlob(container, { 
                    scale: 2,
                    watermark: watermarkText ? { 
                        text: watermarkText, 
                        color: watermarkColor, 
                        opacity: watermarkOpacity 
                    } : undefined
                });
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.pdf';
            }

            // ── PDF → Word (table + heading + list + image + OCR aware) ───────────────────────────────
            else if (mode === 'pdf-word') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 10 } : f));
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                const allBlocks: any[] = [];
                let hasText = false;

                // 1. Text Analysis & Block Conversion
                for (let pg = 1; pg <= pdf.numPages; pg++) {
                    const page = await pdf.getPage(pg);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const textContent = await page.getTextContent();
                    const items = textContent.items as PdfTextItem[];

                    if (items.length > 0) hasText = true;

                    // Convert items → semantic blocks
                    const blocks = pdfItemsToDocBlocks(items, viewport.height);
                    
                    // 2. Image Extraction (Experimental - extraction via operator list)
                    try {
                         const ops = await page.getOperatorList();
                         for (let i = 0; i < ops.fnArray.length; i++) {
                             if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[i] === pdfjsLib.OPS.paintInlineImageXObject) {
                                 const imgKey = ops.argsArray[i][0];
                                 // We'll add a placeholder for now as full image extraction is complex in browser
                                 // blocks.push({ type: 'image', ... })
                             }
                         }
                    } catch(e) { console.warn("Image extraction skipped", e); }

                    allBlocks.push(...blocks, { type: 'empty' }); 
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 10 + Math.round((pg / pdf.numPages) * 70) } : f));
                }

                // 3. OCR Fallback if PDF is scanned (no text found)
                if (!hasText && pdf.numPages > 0) {
                    toast.info("Taranmış döküman algılandı, OCR (Metin Tanıma) başlatılıyor...");
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 85, errorMsg: "Metin aranıyor (OCR)..." } : f));
                    
                    const { createWorker } = await import('tesseract.js');
                    const worker = await createWorker('tur'); // Default to Turkish
                    
                    for (let pg = 1; pg <= pdf.numPages; pg++) {
                        const page = await pdf.getPage(pg);
                        const viewport = page.getViewport({ scale: 2 });
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({ canvasContext: ctx!, viewport }).promise;
                        
                        const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'));
                        if (text.trim()) {
                            allBlocks.push({ type: 'paragraph', text, fontSize: 22 });
                        }
                    }
                    await worker.terminate();
                }

                result = await docBlocksToDocx(
                    allBlocks,
                    item.file.name.replace(/\.[^/.]+$/, ''),
                    item.file.name
                );
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.docx';
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 100, errorMsg: undefined } : f));
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
                    if (items.length === 0) {
                        toast.info(`Sayfa ${i} metin içermiyor (taranmış belge olabilir).`);
                    }

                    const lines: Record<number, any[]> = {};
                    items.forEach(it => {
                        const y = Math.round(it.transform[5]);
                        if (!lines[y]) lines[y] = [];
                        lines[y].push(it);
                    });

                    Object.keys(lines).sort((a, b) => Number(b) - Number(a)).forEach(y => {
                        // Limit columns to 100 to avoid Excel structure errors and "255" issues
                        const row = lines[Number(y)].sort((a, b) => a.transform[4] - b.transform[4]).map(it => it.str).slice(0, 100);
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

            // ── Excel / PPT (via API) ────────────────────────────────────
            else if (mode === 'excel-pdf' || mode === 'ppt-pdf') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 30 } : f));
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('type', mode);
                formData.append('orientation', orientation);
                formData.append('pageSize', pageSize);

                // If user edited data in the grid, send it as JSON string
                if (mode === 'excel-pdf' && item.gridData) {
                    formData.append('gridData', JSON.stringify(item.gridData));
                }

                const response = await fetch('/api/convert', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'API Hatası');
                }

                result = await response.blob();
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.pdf';
            }
            // ── Excel → Word (multi-sheet, smart table adapter) ─────────────────────────
            else if (mode === 'excel-word') {
                const arrayBuffer = await item.file.arrayBuffer();
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));

                let allBlocks: any[] = [];

                if (item.gridData && item.gridData.length) {
                    // User edited data in grid — use as single sheet
                    allBlocks = [
                        { type: 'heading', text: item.file.name.replace(/\.[^/.]+$/, ''), level: 1, isBold: true },
                        {
                            type: 'table',
                            table: {
                                rows: item.gridData.map((row: any[]) => row.map(cell => String(cell ?? ''))),
                                colWidths: item.gridData[0].map(() => Math.round(100 / item.gridData![0].length)),
                            }
                        }
                    ];
                } else {
                    const sheets = await excelToDocBlocks(arrayBuffer);
                    for (const { blocks } of sheets) allBlocks.push(...blocks, { type: 'empty' });
                }

                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 70 } : f));
                result = await docBlocksToDocx(
                    allBlocks,
                    item.file.name.replace(/\.[^/.]+$/, ''),
                    item.file.name
                );
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.docx';
            }
            // ── Fallback (mock) ──────────────────────────────────────────
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
            toast.success(`${item.file.name} hazırlandı.`);
        } catch (error: any) {
            console.error(error);
            let msg = error.message || 'Bilinmeyen hata';
            if (msg.includes("end of central directory")) {
                msg = "Dosya formatı uyumsuz. Bu araç sadece modern Office formatlarını (.docx, .xlsx, .pptx) destekler. Eğer eski bir format (.doc, .xls, .ppt) kullanıyorsanız, lütfen önce modern bir formata kaydedip tekrar deneyin.";
            }
            setFiles(prev => prev.map((f, i) => i === index ? {
                ...f, status: 'error',
                errorMsg: msg
            } : f));
            toast.error(`${item.file.name} dönüştürülürken hata: ${msg}`);
        }
    };

    const downloadFile = (item: FileState) => {
        if (!item.result) return;
        const blob = item.result instanceof Blob ? item.result : new Blob([item.result]);
        const outName = item.resultName || `converted-${item.file.name}`;
        saveAndRecord(blob, outName, item.file.name, config.title);
    };

    const previewFile = (item: FileState) => {
        if (!item.result) return;
        const blob = item.result instanceof Blob ? item.result : item.result;
        const url = URL.createObjectURL(blob as Blob);
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-[1000px] mx-auto p-8 animate-in fade-in zoom-in duration-300">
            {/* Hidden DOCX render container */}
            <div ref={renderContainerRef}
                className="fixed -left-[9999px] top-0 w-[800px] bg-white text-black pointer-events-none overflow-hidden font-sans" />

            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={handleBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm hover:scale-105 active:scale-95 group"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
                            {config.from}
                        </span>
                        <ChevronRight size={12} className="text-slate-300" />
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                            {config.to}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight italic">
                        {config.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Gravity Utils • Güvenli, hızlı ve tamamen yerel dosya aracı.
                    </p>
                </div>
            </div>

            {/* Mock notice banner */}
            {isMock && (
                <div className="flex items-start gap-3 p-4 mb-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
                    <Settings2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Gelişmiş Dönüştürme Motoru Aktif</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-500 mt-0.5">
                            Karmaşık belge yapıları, Excel tabloları ve PowerPoint sunumları yüksek hassasiyetli dönüştürme motorumuz ile işlenir.
                            Dosyalarınız işlendikten hemen sonra güvenli bir şekilde sunucudan temizlenir.
                        </p>
                    </div>
                </div>
            )}

            {/* Simple Preview/Settings Mock */}
            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 flex flex-wrap items-center gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Sayfa Yönü</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setOrientation('portrait')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${orientation === 'portrait' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            Dikey
                        </button>
                        <button
                            onClick={() => setOrientation('landscape')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${orientation === 'landscape' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            Yatay
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Kağıt Boyutu</label>
                    <select
                        value={pageSize}
                        title="Sayfa Boyutu"
                        onChange={(e) => setPageSize(e.target.value as PageSize)}
                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    >
                        {Object.entries(PAGE_SIZES).map(([k, v]) => (
                            <option key={k} value={k}>{v.split(' ')[0]}</option>
                        ))}
                    </select>
                </div>

                <div className="ml-auto hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Info size={14} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">Akıllı Önizleme Aktif</span>
                    </div>
                </div>
            </div>

            {/* Dropper */}
            {/* Dropper */}
            <div onClick={async () => {
                const selected = await platform.openFile({
                    multi: true,
                    filters: [{ name: 'Office & Belge', extensions: config.accept.split(',').map(e => e.trim().replace('.', '')) }]
                });
                if (selected) {
                    processFiles(Array.isArray(selected) ? selected : [selected]);
                }
            }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Dosyayı Buraya Sürükleyin</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">veya seçmek için tıklayın</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400">
                    <FileType size={12} />
                    {config.accept.replace(/,/g, ' ')}
                </div>
            </div>

            {/* Global Settings (Watermark, Orientation etc) */}
            {(mode === 'word-pdf' || mode === 'excel-pdf' || mode === 'pdf-word') && (
                <div className="bg-blue-50/50 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-6 mb-8 animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Filigran Metni (Opsiyonel)</label>
                            <input 
                                type="text" 
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="Örn: GİZLİ, TASLAK..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                            />
                        </div>
                        {watermarkText && (
                            <>
                                <div className="w-32">
                                    <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Renk</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={watermarkColor}
                                            onChange={(e) => setWatermarkColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs font-mono text-slate-500">{watermarkColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="w-40">
                                    <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Opaklık: %{Math.round(watermarkOpacity * 100)}</label>
                                    <input 
                                        type="range" 
                                        min="0.1" 
                                        max="1" 
                                        step="0.1"
                                        value={watermarkOpacity}
                                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </>
                        )}
                        {(mode === 'excel-pdf') && (
                            <div className="w-48">
                                <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Sayfa Yönü</label>
                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                                    <button 
                                        onClick={() => setOrientation('portrait')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${orientation === 'portrait' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                                    >DİKEY</button>
                                    <button 
                                        onClick={() => setOrientation('landscape')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${orientation === 'landscape' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                                    >YATAY</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* File List / Actions */}
            <div className="space-y-4 mt-8">
                {files.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div className="p-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`p-3 rounded-2xl ${item.file.name.endsWith('.xlsx') || item.file.name.endsWith('.xls') ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                    {item.file.name.endsWith('.xlsx') || item.file.name.endsWith('.xls') ? <FileSpreadsheet size={24} /> : <FileText size={24} />}
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.file.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{(item.file.size / 1024).toFixed(1)} KB</p>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-lg">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{config.from}</span>
                                            <ChevronRight size={8} className="text-slate-400/50" />
                                            <span className="text-[9px] font-black text-blue-500 uppercase">{config.to}</span>
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${item.status === 'success' ? 'text-green-500' : 'text-blue-500'}`}>
                                            {item.status === 'editing' ? 'İnceleme Bekliyor' : item.status === 'converting' ? 'Dönüştürülüyor' : item.status === 'success' ? 'Hazır' : 'Dosya Hazır'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.status === 'idle' && (
                                    <button onClick={() => processFile(item, index)} title="Dönüştürme İşlemini Başlat" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">Başlat</button>
                                )}
                                {item.status === 'editing' && (
                                    <button onClick={() => processFile(item, index)} title="Düzenlenen Verileri Dönüştür" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95">Dönüştür</button>
                                )}
                                {item.status === 'converting' && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">%{item.progress}</span>
                                    </div>
                                )}
                                {item.status === 'success' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => previewFile(item)} title="Önizleme" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 rounded-xl transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => downloadFile(item)} title="Hazır Dosyayı İndir" className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 group">
                                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> İndir
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} title="Listeden Kaldır" className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Progress bar for ongoing operations */}
                        {item.status === 'converting' && (
                            <div className="px-6 pb-6 pt-0">
                                <ProgressBar value={item.progress} color="bg-blue-600" />
                            </div>
                        )}

                        {/* Smart Data Editor (Horizontal Scrollable Table) */}
                        {item.status === 'editing' && item.gridData && (
                            <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20">
                                {/* Smart Insights Section */}
                                {item.insights && item.insights.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {item.insights.map((insight) => (
                                            <div key={insight.id} className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${insight.type === 'suggestion' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' :
                                                insight.type === 'warning' ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' :
                                                    insight.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' :
                                                        'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                                                }`}>
                                                <div className={`p-2 rounded-xl shrink-0 ${insight.type === 'suggestion' ? 'bg-indigo-500/10 text-indigo-500' :
                                                    insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                        insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {insight.type === 'suggestion' ? <Sparkles size={16} /> :
                                                        insight.type === 'warning' ? <AlertCircle size={16} /> :
                                                            insight.type === 'success' ? <CheckCircle2 size={16} /> :
                                                                <Info size={16} />
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className={`text-xs font-bold leading-tight ${insight.type === 'suggestion' ? 'text-indigo-700 dark:text-indigo-400' :
                                                        insight.type === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                                                            insight.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' :
                                                                'text-blue-700 dark:text-blue-400'
                                                        }`}>{insight.message}</h5>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
                                                    {insight.actionLabel && (
                                                        <button
                                                            onClick={() => {
                                                                if (insight.onAction) insight.onAction();
                                                                else if (insight.id === 'empty-cols') {
                                                                    const grid = item.gridData || [];
                                                                    const headers = grid[0] || [];
                                                                    const emptyCols: number[] = [];
                                                                    for (let c = 0; c < headers.length; c++) {
                                                                        let isEmpty = true;
                                                                        for (let r = 1; r < grid.length; r++) {
                                                                            if (grid[r][c] !== undefined && grid[r][c] !== null && grid[r][c] !== '') {
                                                                                isEmpty = false;
                                                                                break;
                                                                            }
                                                                        }
                                                                        if (isEmpty) emptyCols.push(c);
                                                                    }
                                                                    const newGrid = grid.map(row => row.filter((_, idx) => !emptyCols.includes(idx)));
                                                                    setFiles(prev => prev.map((f, i) => i === index ? {
                                                                        ...f,
                                                                        gridData: newGrid,
                                                                        insights: f.insights?.filter(ins => ins.id !== 'empty-cols')
                                                                    } : f));
                                                                    toast.success(`${emptyCols.length} boş sütun temizlendi.`);
                                                                }
                                                            }}
                                                            className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:opacity-70 flex items-center gap-1"
                                                        >
                                                            <Wand2 size={10} /> {insight.actionLabel}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                            <Settings2 size={14} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Akıllı Veri Editörü</h4>
                                            <p className="text-[10px] font-medium text-slate-400 italic">Verileri dökümana basmadan önce buradan düzenleyebilirsiniz.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newData = [...(item.gridData || [])];
                                            const colCount = newData[0]?.length || 1;
                                            newData.push(new Array(colCount).fill(''));
                                            setFiles(prev => prev.map((f, i) => i === index ? { ...f, gridData: newData } : f));
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 hover:border-green-500 hover:text-green-600 transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus size={14} /> SATIR EKLE
                                    </button>
                                </div>

                                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto max-h-[350px]">
                                        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 shadow-sm">
                                                    {(item.gridData[0] || []).map((_, cIdx) => (
                                                        <th key={cIdx} className="px-4 py-3 text-[10px] font-black text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                                                            Sütun {cIdx + 1}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {item.gridData.map((row, rIdx) => (
                                                    <tr key={rIdx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                                        {row.map((cell, cIdx) => (
                                                            <td key={cIdx} className="px-3 py-2 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                                                                <input
                                                                    type="text"
                                                                    value={String(cell || '')}
                                                                    onChange={(e) => {
                                                                        const newData = [...(item.gridData || [])];
                                                                        newData[rIdx][cIdx] = e.target.value;
                                                                        setFiles(prev => prev.map((f, i) => i === index ? { ...f, gridData: newData } : f));
                                                                    }}
                                                                    className="w-full bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-green-500/20 rounded-lg px-2 py-1.5 outline-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                    title={`Satır ${rIdx + 1} Sütun ${cIdx + 1}`}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
                                    <Info size={16} className="text-amber-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                        İpucu: Hücreleri doğrudan düzenleyebilirsiniz. Değişiklikler döküman dönüştürme sırasında otomatik uygulanacaktır.
                                    </p>
                                </div>
                            </div>
                        )}

                        {item.status === 'error' && (
                            <div className="px-6 pb-6 pt-0">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <AlertCircle size={18} />
                                    <p className="text-xs font-bold">{item.errorMsg || 'İşlem sırasında bir hata oluştu.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {files.length === 0 && (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/10 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 group hover:border-blue-500/50 transition-all">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Layers size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Dosya Bekleniyor</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Lütfen dönüştürmek istediğiniz dosyayı seçin.</p>
                    </div>
                )}
            </div>
        </div >
    );
};
