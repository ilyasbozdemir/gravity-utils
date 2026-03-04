import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ArrowLeft, FileText, Upload, X, AlertCircle, Download,
    FileSpreadsheet, Image as ImageIcon, FileType,
    GripVertical, ArrowUp, ArrowDown, Plus, Layers, Sparkles, Wand2,
    Settings2, CheckCircle2, Loader2, Info, Eye, ChevronRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, type ISectionOptions } from 'docx';
import { renderAsync } from 'docx-preview';
import jsPDF from 'jspdf';
import { SHARED_ENGINE } from '../../../shared';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type OfficeToolMode = 'word-pdf' | 'pdf-word' | 'excel-pdf' | 'pdf-excel' | 'ppt-pdf' | 'pdf-ppt' | 'pdf-image' | 'imagetopdf' | 'excel-word';

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

const TOOL_CONFIG: Record<string, any> = {
    'word-pdf': { title: 'Word → PDF', from: 'Word', to: 'PDF', accept: '.doc,.docx', icon: <FileText size={24} />, color: 'text-blue-600', bg: 'bg-blue-600', real: true },
    'pdf-word': { title: 'PDF → Word', from: 'PDF', to: 'Word', accept: '.pdf', icon: <FileText size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'excel-pdf': { title: 'Excel → PDF', from: 'Excel', to: 'PDF', accept: '.xls,.xlsx', icon: <FileSpreadsheet size={24} />, color: 'text-green-600', bg: 'bg-green-600', real: true },
    'pdf-excel': { title: 'PDF → Excel', from: 'PDF', to: 'Excel', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'ppt-pdf': { title: 'PowerPoint → PDF', from: 'PPT', to: 'PDF', accept: '.ppt,.pptx', icon: <FileSpreadsheet size={24} />, color: 'text-orange-500', bg: 'bg-orange-500', real: false },
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

const OfficeToolsView: React.FC = () => {
    const [mode, setMode] = useState<OfficeToolMode | null>(null);

    if (!mode) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 group hover:rotate-6 transition-transform">
                        <FileText size={40} className="text-white fill-white/10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Ofis & Döküman Merkezi</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Core Office Engine v3.1.0-STABLE</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(TOOL_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setMode(key as OfficeToolMode)}
                            title={`${config.title} Aracını Başlat`}
                            className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] text-left hover:scale-[1.02] hover:shadow-2xl transition-all group overflow-hidden relative shadow-lg active:scale-95"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${config.bg} text-white group-hover:rotate-12 transition-transform`}>
                                {config.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">{config.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                {config.from} dökümanlarını saniyeler içinde mükemmel {config.to} formatına dönüştürün.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Şimdi Kullan <Zap size={10} className="fill-emerald-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return <OfficeToolComponent mode={mode} onBack={() => setMode(null)} />;
};

// --- Office Tool Component ---
const OfficeToolComponent: React.FC<{ mode: OfficeToolMode; onBack: () => void }> = ({ mode, onBack }) => {
    if (mode === 'imagetopdf') return <ImageToPdfTool onBack={onBack} />;

    const config = TOOL_CONFIG[mode];
    const [files, setFiles] = useState<FileState[]>([]);
    const [orientation, setOrientation] = useState<PageOrientation>('portrait');
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const inputRef = useRef<HTMLInputElement>(null);
    const renderContainerRef = useRef<HTMLDivElement>(null);

    const handleNativeSave = async (blob: Blob, name: string) => {
        if (window.electron && window.electron.selectSavePath) {
            const filePath = await window.electron.selectSavePath(name);
            if (filePath) {
                const buffer = await blob.arrayBuffer();
                await window.electron.saveFileFromBuffer({ filePath, buffer });
            }
        } else {
            saveAs(blob, name);
        }
    };

    const handleNativeSelect = async () => {
        if (window.electron && window.electron.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                title: 'Dosya Seçin',
                filters: [{ name: 'Belgeler', extensions: config.accept.replace(/\./g, "").split(",") }],
                properties: ['openFile', 'multiSelections']
            });
            if (result) {
                const nativeFiles = result.map((f: any) => new File([f.data], f.name, { type: SHARED_ENGINE.getMimeType(f.name) }));
                const fakeEvent = { target: { files: nativeFiles } } as any;
                handleFileSelect(fakeEvent);
            }
        } else {
            inputRef.current?.click();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = await Promise.all(Array.from(e.target.files).map(async f => {
                let gridData: any[][] | undefined;
                let insights: FileInsight[] = [];

                if ((mode === 'excel-word' || mode === 'excel-pdf') && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
                    const { read, utils } = await import('xlsx');
                    const arrayBuffer = await f.arrayBuffer();
                    const wb = read(new Uint8Array(arrayBuffer), { type: 'array' });
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    gridData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                    // Smart Insights (Ported from Web)
                    if (gridData && gridData.length > 0) {
                        const headers = gridData[0] || [];
                        if (headers.length > 7) {
                            insights.push({
                                id: 'orientation',
                                type: 'suggestion',
                                message: 'Geniş Tablo Tespit Edildi',
                                description: 'Tablonuzda çok fazla sütun var. Daha iyi görünüm için Yatay (Landscape) düzen önerilir.',
                                actionLabel: 'YATAY YAP',
                                onAction: () => setOrientation('landscape')
                            });
                        }
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
        }
    };

    const processFile = async (item: FileState, index: number) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'converting', progress: 5 } : f));

        try {
            let result: Blob | string | undefined;
            let resultName = item.file.name;

            // --- PDF to Image (Enhanced with ZIP) ---
            if (mode === 'pdf-image') {
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const zipFiles: { name: string; blob: Blob }[] = [];
                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context!, viewport } as any).promise;
                    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92));
                    zipFiles.push({ name: `sayfa-${p}.jpg`, blob });
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 10 + Math.round((p / pdf.numPages) * 80) } : f));
                }

                if (zipFiles.length === 1) {
                    result = zipFiles[0].blob;
                    resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                } else {
                    const JSZip = (await import('jszip')).default;
                    const z = new JSZip();
                    zipFiles.forEach(({ name, blob }) => z.file(name, blob));
                    result = await z.generateAsync({ type: 'blob' });
                    resultName = item.file.name.replace(/\.[^/.]+$/, '') + '-sayfalar.zip';
                }
            }
            // --- Word to PDF ---
            else if (mode === 'word-pdf') {
                if (renderContainerRef.current) {
                    const container = renderContainerRef.current;
                    container.innerHTML = '';
                    const arrayBuffer = await item.file.arrayBuffer();
                    await renderAsync(arrayBuffer, container, undefined, {
                        className: 'docx',
                        inWrapper: true,
                        useBase64URL: true,
                    });
                    await new Promise(r => setTimeout(r, 1000));
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    await pdf.html(container, {
                        callback: function (doc) {
                            const b = doc.output('blob');
                            resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', progress: 100, result: b, resultName } : f));
                        },
                        x: 0, y: 0, width: 210, windowWidth: 800,
                        autoPaging: 'text'
                    });
                    return;
                }
            }
            // --- PDF to Word (Better Grouping) ---
            else if (mode === 'pdf-word') {
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const sections: ISectionOptions[] = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const items = textContent.items as any[];

                    // Simple line grouping by Y coordinate
                    const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
                    const lines: any[][] = [];
                    let curLine: any[] = [];
                    let lastY = -1;

                    sorted.forEach(it => {
                        const y = it.transform[5];
                        if (lastY === -1 || Math.abs(y - lastY) < 5) {
                            curLine.push(it);
                        } else {
                            lines.push(curLine.sort((a, b) => a.transform[4] - b.transform[4]));
                            curLine = [it];
                        }
                        lastY = y;
                    });
                    if (curLine.length) lines.push(curLine.sort((a, b) => a.transform[4] - b.transform[4]));

                    const pageChildren: Paragraph[] = lines.map(line => new Paragraph({
                        children: [new TextRun({ text: line.map(it => it.str).join(' '), size: 22 })]
                    }));
                    sections.push({ children: pageChildren });
                    setFiles(prev => prev.map((f, idx) => idx === index ? { ...f, progress: 10 + Math.round((i / pdf.numPages) * 80) } : f));
                }
                const wordDoc = new Document({ sections });
                result = await Packer.toBlob(wordDoc);
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.docx';
            }
            // --- Excel to Word ---
            else if (mode === 'excel-word') {
                const jsonData = item.gridData;
                if (!jsonData) throw new Error("Excel verisi bulunamadı.");

                const tableRows = jsonData.map((row, rIdx) => new TableRow({
                    children: row.map(cell => new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: String(cell || ""), bold: rIdx === 0, size: rIdx === 0 ? 24 : 20 })] })],
                        width: { size: 100 / (row.length || 1), type: WidthType.PERCENTAGE }
                    }))
                }));
                const doc = new Document({ sections: [{ children: [new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } })] }] });
                result = await Packer.toBlob(doc);
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.docx';
            }
            // --- PDF to Excel ---
            else if (mode === 'pdf-excel') {
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const rows: any[][] = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    // Basic text extraction for Excel
                    const items = textContent.items as any[];
                    const lineMap: Record<number, string[]> = {};
                    items.forEach(it => {
                        const y = Math.round(it.transform[5]);
                        if (!lineMap[y]) lineMap[y] = [];
                        lineMap[y].push(it.str);
                    });
                    Object.keys(lineMap).sort((a, b) => Number(b) - Number(a)).forEach(y => {
                        rows.push(lineMap[Number(y)]);
                    });
                }
                const { utils, write } = await import('xlsx');
                const wb = utils.book_new();
                const ws = utils.aoa_to_sheet(rows);
                utils.book_append_sheet(wb, ws, "PDF Verileri");
                const out = write(wb, { type: 'array', bookType: 'xlsx' });
                result = new Blob([out], { type: 'application/octet-stream' });
                resultName = item.file.name.replace(/\.[^/.]+$/, '') + '.xlsx';
            }
            else {
                result = new Blob([`Mock dönüşüm: ${item.file.name}`], { type: 'text/plain' });
                resultName = item.file.name + '.txt';
            }

            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', progress: 100, result, resultName } : f));
            toast.success(`${item.file.name} hazırlandı.`);
        } catch (error: any) {
            console.error(error);
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', errorMsg: error.message } : f));
            toast.error(`${item.file.name} dönüştürülürken hata: ${error.message}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full px-6">
            <div ref={renderContainerRef} className="fixed -left-[9999px] top-0 w-[800px] bg-white text-black" />

            <div className="flex items-center gap-6 mb-12">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön" className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:scale-110 transition-all shadow-sm">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{config.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Core Office Engine</p>
                </div>
            </div>

            <div
                onClick={handleNativeSelect}
                className="border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3.5rem] p-16 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer mb-12 group relative overflow-hidden"
                onDragOver={(e) => { e.preventDefault(); (e.currentTarget as any).classList.add('bg-blue-600/5'); }}
                onDragLeave={(e) => { e.preventDefault(); (e.currentTarget as any).classList.remove('bg-blue-600/5'); }}
                onDrop={(e) => {
                    e.preventDefault();
                    (e.currentTarget as any).classList.remove('bg-blue-600/5');
                    if (e.dataTransfer.files) {
                        const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
                        handleFileSelect(fakeEvent);
                    }
                }}
            >
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all group-hover:scale-110 group-hover:rotate-12 shadow-2xl ${config.bg} text-white relative z-10`}>
                    <Upload size={48} className="group-hover:animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter relative z-10">Dosyaları Sürükle veya Bırak</h3>
                <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest relative z-10 opacity-70">
                    Desteklenen Formatlar: {config.accept}
                </p>
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" ref={inputRef} className="hidden" accept={config.accept} multiple onChange={handleFileSelect} title="Dosya Seçin" aria-label="Dosya yükleme girişi" />
            </div>

            <div className="space-y-6">
                {files.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${config.bg} opacity-80`}>
                                    {item.file.name.endsWith('.pdf') ? <FileText size={28} /> :
                                        item.file.name.endsWith('.docx') ? <FileText size={28} /> : <FileSpreadsheet size={28} />}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-[400px] uppercase italic tracking-tight">{item.file.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{SHARED_ENGINE.formatBytes(item.file.size)}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'success' ? 'text-emerald-500' : 'text-slate-500'}`}>{item.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {item.status === 'idle' && (
                                    <button
                                        onClick={() => processFile(item, idx)}
                                        className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Dönüştür
                                    </button>
                                )}
                                {item.status === 'success' && (
                                    <button
                                        onClick={() => handleNativeSave(item.result as Blob, item.resultName!)}
                                        title="Dosyayı Kaydet"
                                        className="px-8 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Download size={14} /> İndir
                                    </button>
                                )}
                                <button
                                    onClick={() => setFiles(f => f.filter((_, i) => i !== idx))}
                                    title="Dosyayı Kaldır"
                                    aria-label="Dosyayı listeden kaldır"
                                    className="p-3 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar & Insights */}
                        {item.status === 'converting' && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        ref={(el) => { if (el) el.style.width = `${item.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {item.insights && item.insights.length > 0 && (
                            <div className="mt-6 space-y-3">
                                {item.insights.map((ins, iIdx) => (
                                    <div key={iIdx} className="flex items-start gap-4 p-5 bg-blue-50/50 dark:bg-blue-600/5 border border-blue-200/50 dark:border-blue-500/10 rounded-2xl">
                                        <Sparkles size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h5 className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">{ins.message}</h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-relaxed lowercase">{ins.description}</p>
                                        </div>
                                        {ins.actionLabel && (
                                            <button
                                                onClick={ins.onAction}
                                                className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg"
                                            >
                                                {ins.actionLabel}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Image to PDF Tool (Advanced Settings) ---
function ImageToPdfTool({ onBack }: { onBack: () => void }) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const [orientation, setOrientation] = useState<PageOrientation>('portrait');
    const [imageFit, setImageFit] = useState<ImageFit>('fit');
    const [margin, setMargin] = useState(20);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFiles = async (fileList: FileList | File[]) => {
        const accepted = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (!accepted.length) return;
        const loaded = await Promise.all(accepted.map(f => new Promise<ImageItem>(res => {
            const r = new FileReader(); r.onload = (e) => {
                const img = new Image(); img.onload = () => res({ id: Math.random().toString(), file: f, preview: e.target?.result as string, width: img.naturalWidth, height: img.naturalHeight });
                img.src = e.target?.result as string;
            }; r.readAsDataURL(f);
        })));
        setImages(prev => [...prev, ...loaded as ImageItem[]]);
    };

    const handleNativeSelect = async () => {
        if (window.electron && window.electron.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                title: 'Görsel Seçin',
                filters: [{ name: 'Görseller', extensions: ['jpg', 'png', 'webp', 'jpeg'] }],
                properties: ['openFile', 'multiSelections']
            });
            if (result) {
                const nativeFiles = result.map((f: any) => new File([f.data], f.name, { type: SHARED_ENGINE.getMimeType(f.name) }));
                handleFiles(nativeFiles);
            }
        } else {
            inputRef.current?.click();
        }
    };

    const buildPdf = async () => {
        setIsBuilding(true);
        setProgress(0);
        try {
            const pdfDoc = await PDFDocument.create();
            for (let i = 0; i < images.length; i++) {
                const item = images[i];
                const jpegBytes = await fetch(item.preview).then(res => res.arrayBuffer());
                const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

                let pgWidth: number, pgHeight: number;
                if (pageSize === 'auto') {
                    pgWidth = item.width; pgHeight = item.height;
                } else {
                    const size = { a4: PageSizes.A4, a3: PageSizes.A3, letter: PageSizes.Letter, legal: PageSizes.Legal }[pageSize] as [number, number];
                    [pgWidth, pgHeight] = orientation === 'portrait' ? size : [size[1], size[0]];
                }

                const page = pdfDoc.addPage([pgWidth, pgHeight]);
                const drawW = pgWidth - (margin * 2);
                const drawH = pgHeight - (margin * 2);

                let imgW = drawW, imgH = drawH;
                if (imageFit === 'fit') {
                    const scale = Math.min(drawW / item.width, drawH / item.height);
                    imgW = item.width * scale; imgH = item.height * scale;
                } else if (imageFit === 'fill') {
                    const scale = Math.max(drawW / item.width, drawH / item.height);
                    imgW = item.width * scale; imgH = item.height * scale;
                }

                page.drawImage(embeddedImg, {
                    x: (pgWidth - imgW) / 2,
                    y: (pgHeight - imgH) / 2,
                    width: imgW, height: imgH
                });
                setProgress(Math.round(((i + 1) / images.length) * 100));
            }
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const name = `combined-${Date.now()}.pdf`;

            if (window.electron && window.electron.selectSavePath) {
                const filePath = await window.electron.selectSavePath(name);
                if (filePath) {
                    await window.electron.saveFileFromBuffer({ filePath, buffer: pdfBytes.buffer as ArrayBuffer });
                }
            } else {
                saveAs(blob, name);
            }
            toast.success("PDF başarıyla oluşturuldu.");
        } catch (e) { toast.error("PDF oluşturma hatası."); } finally { setIsBuilding(false); }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 h-full overflow-y-auto">
            <div className="flex items-center gap-6 mb-12">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön" className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Görsel → PDF Gelişmiş</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Advanced Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Settings2 size={14} /> Çıktı Ayarları
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Sayfa Boyutu</label>
                                <select
                                    value={pageSize}
                                    title="Sayfa Boyutu Seçin"
                                    onChange={e => setPageSize(e.target.value as PageSize)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Yönlendirme</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setOrientation('portrait')} className={`py-2 rounded-xl text-[10px] font-black border transition-all ${orientation === 'portrait' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/5'}`}>DIKEY</button>
                                    <button onClick={() => setOrientation('landscape')} className={`py-2 rounded-xl text-[10px] font-black border transition-all ${orientation === 'landscape' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/5'}`}>YATAY</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Kenar Boşluğu: {margin}pt</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={margin}
                                    title="Kenar Boşluğu"
                                    placeholder="Kenar boşluğu ayarla"
                                    onChange={e => setMargin(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>
                        </div>

                        <button
                            onClick={buildPdf}
                            disabled={images.length === 0 || isBuilding}
                            className="w-full mt-10 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {isBuilding ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="fill-white" />}
                            PDF OLUŞTUR
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div onClick={handleNativeSelect} className="border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] p-10 text-center hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 shadow-xl transition-transform">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Görselleri Buraya Ekleyin</h3>
                        <input type="file" ref={inputRef} multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} title="Görsel Dosyaları Seçin" aria-label="Görsel yükleme" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, i) => (
                            <div key={img.id} className="aspect-square relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 group shadow-xl bg-white dark:bg-[#0e121b]">
                                <img src={img.preview} alt={img.file.name} title={img.file.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => setImages(prev => prev.filter(x => x.id !== img.id))} title="Görseli Kaldır" className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform"><X size={20} /></button>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl text-[8px] text-white font-black truncate border border-white/10 uppercase tracking-widest">{img.file.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OfficeToolsView;
