import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Upload, X, AlertCircle, Download, FileSpreadsheet, Presentation, Image as ImageIcon, FileType } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, ImageRun, type ISectionOptions } from 'docx';
import fontkit from '@pdf-lib/fontkit';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { loadTurkishFont } from '../utils/fontLoader';
import jsPDF from 'jspdf';

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
    resultName?: string;
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

            // --- IMAGE TO PDF ---
            if (mode === 'imagetopdf') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 30 } : f));
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
                resultName = item.file.name.replace(/\.[^/.]+$/, "") + ".pdf";
            }
            // --- PDF TO IMAGE ---
            else if (mode === 'pdf-image') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 30 } : f));
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
                resultName = item.file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            }
            // --- WORD TO PDF ---
            else if (mode === 'word-pdf') {
                if (renderContainerRef.current) {
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));
                    const container = renderContainerRef.current;
                    container.innerHTML = '';
                    const arrayBuffer = await item.file.arrayBuffer();

                    // Render docx to HTML
                    await renderAsync(arrayBuffer, container, undefined, {
                        className: "docx",
                        inWrapper: true,
                        ignoreLastRenderedPageBreak: false,
                        useBase64URL: true // Ensure images are base64
                    });

                    // Wait for images
                    await new Promise(r => setTimeout(r, 1000));
                    setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 60 } : f));

                    // Convert HTML to Canvas
                    const canvas = await html2canvas(container, {
                        scale: 1.5,
                        useCORS: true,
                        logging: false
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    let heightLeft = pdfHeight;
                    let position = 0;
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    // Handle multi-page
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                    while (heightLeft >= 0) {
                        position = heightLeft - pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight;
                    }

                    result = pdf.output('blob');
                    resultName = item.file.name.replace(/\.[^/.]+$/, "") + ".pdf";
                    container.innerHTML = ''; // Clean up
                } else {
                    throw new Error("Render container not found");
                }
            }
            // --- PDF TO WORD ---
            else if (mode === 'pdf-word') {
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 20 } : f));
                const arrayBuffer = await item.file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const pageImages: string[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
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
                        pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
                    }
                    setFiles(prev => prev.map((f, idx) => idx === index ? { ...f, progress: 20 + Math.round((i / pdf.numPages) * 60) } : f));
                }

                const sections: ISectionOptions[] = [];
                for (const imgData of pageImages) {
                    const res = await fetch(imgData);
                    const imgArrayBuffer = await res.arrayBuffer();
                    sections.push({
                        properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: imgArrayBuffer,
                                        transformation: { width: 595, height: 841 }, // A4 approx
                                        type: 'jpg'
                                    }),
                                ],
                            }),
                        ],
                    });
                }

                const wordDoc = new Document({ sections });
                result = await Packer.toBlob(wordDoc);
                resultName = item.file.name.replace(/\.[^/.]+$/, "") + ".docx";
            }
            // --- OTHERS (Excel, PPT - Mock with Font Support) ---
            else {
                // Simulate delay
                await new Promise(r => setTimeout(r, 1500));
                setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 80 } : f));

                if (mode.endsWith('-pdf')) {
                    // Create basic PDF with Turkish font support
                    const pdfDoc = await PDFDocument.create();
                    pdfDoc.registerFontkit(fontkit);
                    const fontBytes = await loadTurkishFont(); // Load Roboto
                    const customFont = await pdfDoc.embedFont(fontBytes);

                    const page = pdfDoc.addPage();
                    page.drawText(`Bu ${item.file.name} dosyasının PDF çıktısıdır.\n\nNOT: Excel ve PowerPoint dönüşümleri, karmaşık yapıları nedeniyle\ntam olarak sunucu tarafında işlenmelidir. \nBu bir önizleme/mock çıktısıdır.\n\nTürkçe karakter test: ĞÜŞİÖÇ ğüşiöç`, {
                        x: 50,
                        y: 700,
                        size: 12,
                        font: customFont
                    });
                    const pdfBytes = await pdfDoc.save();
                    result = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    resultName = item.file.name.replace(/\.[^/.]+$/, "") + ".pdf";
                } else {
                    result = new Blob([`Mock dönüşüm sonucu: ${item.file.name}`], { type: 'text/plain' });
                    resultName = item.file.name + ".txt";
                }
            }

            setFiles(prev => prev.map((f, i) => i === index ? {
                ...f,
                status: 'success',
                progress: 100,
                result,
                resultName
            } : f));

        } catch (error) {
            console.error(error);
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', errorMsg: (error as Error).message } : f));
        }
    };

    const downloadFile = (item: FileState) => {
        if (!item.result) return;
        saveAs(item.result, item.resultName || `converted-${item.file.name}`);
    };

    return (
        <div className="max-w-[1000px] mx-auto p-8 animate-fadeIn">
            {/* Hidden container for DOCX rendering */}
            <div
                ref={renderContainerRef}
                className="fixed -left-[9999px] top-0 w-[800px] bg-white text-black pointer-events-none overflow-hidden font-sans"
            ></div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
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

            {/* Dropper */}
            <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer mb-8"
            >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Dosyayı Buraya Sürükleyin</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">veya seçmek için tıklayın</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400">
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
                    <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                            {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.file.name}</p>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
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
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 text-white text-xs p-2 rounded hidden group-hover:block z-20 shadow-lg">
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
