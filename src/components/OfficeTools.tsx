import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Upload, X, AlertCircle, Download, FileSpreadsheet, Presentation, Image as ImageIcon, FileType } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
}

const TOOL_CONFIG = {
    'word-pdf': { title: 'Word to PDF', accept: '.doc,.docx', icon: <FileText size={24} />, color: 'text-blue-600', bg: 'bg-blue-600' },
    'pdf-word': { title: 'PDF to Word', accept: '.pdf', icon: <FileText size={24} />, color: 'text-red-500', bg: 'bg-red-500' },
    'excel-pdf': { title: 'Excel to PDF', accept: '.xls,.xlsx', icon: <FileSpreadsheet size={24} />, color: 'text-green-600', bg: 'bg-green-600' },
    'pdf-excel': { title: 'PDF to Excel', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500' },
    'ppt-pdf': { title: 'PowerPoint to PDF', accept: '.ppt,.pptx', icon: <Presentation size={24} />, color: 'text-orange-500', bg: 'bg-orange-500' },
    'pdf-ppt': { title: 'PDF to PowerPoint', accept: '.pdf', icon: <Presentation size={24} />, color: 'text-red-500', bg: 'bg-red-500' },
    'pdf-image': { title: 'PDF to Image', accept: '.pdf', icon: <ImageIcon size={24} />, color: 'text-purple-500', bg: 'bg-purple-500' },
    'imagetopdf': { title: 'Image to PDF', accept: 'image/*', icon: <ImageIcon size={24} />, color: 'text-blue-500', bg: 'bg-blue-500' },
};

export const OfficeTools: React.FC<OfficeToolsProps> = ({ mode, onBack }) => {
    const config = TOOL_CONFIG[mode];
    const [files, setFiles] = useState<FileState[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

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
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'converting', progress: 10 } : f));

        try {
            // Simulated delay for UX
            await new Promise(r => setTimeout(r, 1000));
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 40 } : f));

            let result: Blob | string | undefined;

            if (mode === 'imagetopdf') {
                // Real Implementation: Image to PDF
                const pdfDoc = await PDFDocument.create();
                const imageBytes = await item.file.arrayBuffer();
                let image;
                if (item.file.type === 'image/jpeg') image = await pdfDoc.embedJpg(imageBytes);
                else if (item.file.type === 'image/png') image = await pdfDoc.embedPng(imageBytes);
                else throw new Error('Format desteklenmiyor (Sadece JPG/PNG)');

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                const pdfBytes = await pdfDoc.save();
                result = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            } else if (mode === 'pdf-image') {
                // Real Implementation: PDF to Image (First page preview)
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context!,
                    viewport: viewport
                };
                await page.render(renderContext as any).promise;
                result = canvas.toDataURL('image/jpeg');
            } else {
                // Simulation for formats that require server-side heavy lifting
                // In a real app this would call an API
                await new Promise(r => setTimeout(r, 1500));

                if (mode.endsWith('-pdf')) {
                    // Mock PDF result
                    const pdfDoc = await PDFDocument.create();
                    const page = pdfDoc.addPage();
                    page.drawText(`Bu ${item.file.name} dosyasının PDF çıktısıdır.\n\nGerçek dönüşüm için sunucu tarafı gereklidir.`, { x: 50, y: 700, size: 12 });
                    const pdfBytes = await pdfDoc.save();
                    result = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                } else {
                    // Mock text result
                    result = new Blob([`Mock dönüşüm sonucu: ${item.file.name}`], { type: 'text/plain' });
                }
            }

            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', progress: 100, result } : f));

        } catch (error) {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', errorMsg: (error as Error).message } : f));
        }
    };

    const downloadFile = (item: FileState) => {
        if (!item.result) return;
        const link = document.createElement('a');
        if (typeof item.result === 'string') {
            link.href = item.result;
            link.download = `converted-${item.file.name.split('.')[0]}.jpg`; // Simplified extension logic
        } else {
            link.href = URL.createObjectURL(item.result);
            link.download = `converted-${item.file.name}.pdf`; // Simplified
        }
        link.click();
    };

    return (
        <div className="max-w-[1000px] mx-auto p-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
                </button>
                <div className={`p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm ${config.color}`}>
                    {config.icon}
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        {config.title}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Güvenli, hızlı ve ücretsiz dosya dönüştürme aracı.
                    </p>
                </div>
            </div>

            {/* Dropper */}
            <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-white/5 rounded-3xl p-12 text-center cursor-pointer transition-all group mb-8"
            >
                <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-slate-400 dark:text-slate-300 group-hover:text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Dosyayı Buraya Sürükleyin</h3>
                <p className="text-slate-500 text-sm">veya seçmek için tıklayın</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-200 dark:bg-white/10 rounded-full text-xs font-mono text-slate-600 dark:text-slate-400">
                    <FileType size={12} />
                    {config.accept.replace(/,/g, ' ')}
                </div>
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept={config.accept}
                    multiple
                    onChange={handleFileSelect}
                    title="Dosya Seç"
                    aria-label="Dosya yükle"
                />
            </div>

            {/* File List */}
            <div className="space-y-4">
                {files.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.07]">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                            {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.file.name}</p>
                                <span className="text-xs text-slate-500 font-mono">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {item.status === 'idle' && (
                                <button
                                    onClick={() => processFile(item, index)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Dönüştür
                                </button>
                            )}
                            {item.status === 'converting' && (
                                <span className="text-xs font-medium text-blue-500 animate-pulse">İşleniyor...</span>
                            )}
                            {item.status === 'success' && (
                                <button
                                    onClick={() => downloadFile(item)}
                                    className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                    title="İndir"
                                >
                                    <Download size={20} />
                                </button>
                            )}
                            {item.status === 'error' && (
                                <div className="group relative">
                                    <AlertCircle size={20} className="text-red-500 cursor-help" />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-black/80 backdrop-blur text-white text-xs p-2 rounded hidden group-hover:block z-20">
                                        {item.errorMsg}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                title="Kaldır"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
