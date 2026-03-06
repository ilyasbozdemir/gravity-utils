"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, Scissors, Download, Layers, Minimize2, Stamp, RefreshCw, Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid, GripVertical, Image as ImageIcon, Database, Info, Lock, Unlock, Search, PenTool, Hash, RotateCw, Edit3, Settings2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument, degrees, rgb, PDFImage, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, ImageRun, type ISectionOptions } from 'docx';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { loadTurkishFont } from '../utils/fontLoader';
import jsPDF from 'jspdf';
import { SHARED_ENGINE, platform } from '@shared/index';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfManagerProps {
    file: File | null;
    onBack: () => void;
    initialTab?: TabType;
}

type TabType = 'split' | 'merge' | 'compress' | 'watermark' | 'convert' | 'protect' | 'unlock' | 'edit' | 'ocr' | 'sign';

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

export const PdfManager: React.FC<PdfManagerProps> = ({ file, onBack, initialTab = 'merge' }) => {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    // Sync activeTab with prop changes (for deep linking)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
    const [organizedPages, setOrganizedPages] = useState<OrganizedPage[]>([]);
    const [loadingThumbnails, setLoadingThumbnails] = useState(false);

    const [splitPage, setSplitPage] = useState<number>(1);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [mainPdfPageCount, setMainPdfPageCount] = useState<number>(0);

    const [watermarkText, setWatermarkText] = useState('GİZLİ');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
    const [watermarkColor, setWatermarkColor] = useState('#ff0000');
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkImage, setWatermarkImage] = useState<string | null>(null);

    const [compressionQuality, setCompressionQuality] = useState(0.7);

    // New Conversion States
    const [convertFormat, setConvertFormat] = useState<'word' | 'image' | 'excel' | 'ppt'>('word');
    const [convertProgress, setConvertProgress] = useState(0);

    // Security States
    const [pdfPassword, setPdfPassword] = useState('');
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);

    // New Toolkit States
    const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '', creator: 'Gravity Utils' });
    const [rotateAngle, setRotateAngle] = useState<0 | 90 | 180 | 270>(0);
    const [pageNumbering, setPageNumbering] = useState({ enabled: false, position: 'bottom-right' as 'bottom-right' | 'bottom-center' | 'top-right' });
    const [ocrLanguage, setOcrLanguage] = useState<'tur' | 'eng'>('tur');
    const [ocrProgress, setOcrProgress] = useState(0);

    const mergeInputRef = useRef<HTMLInputElement>(null);
    const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
    const renderContainerRef = useRef<HTMLDivElement>(null);

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
        if (pdfFiles.length === 0 || (selectedPages.size === 0 && !splitPage)) return;
        setProcessing(true);
        setStatusText('Sayfalar ayrılıyor (Tarayıcıda)...');
        try {
            const mainFile = pdfFiles[0].file;
            const arrayBuffer = await mainFile.arrayBuffer();
            const sourceDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            const pagesToSplit = selectedPages.size > 0
                ? Array.from(selectedPages).sort((a, b) => a - b)
                : [splitPage];

            const copiedPages = await newDoc.copyPages(sourceDoc, pagesToSplit.map(p => p - 1));
            copiedPages.forEach((page: any) => newDoc.addPage(page));

            const pdfBytes = await newDoc.save();
            downloadPdf(pdfBytes, `split-${mainFile.name}`);
            toast.success("PDF başarıyla ayrıldı.");
        } catch (err) {
            console.error(err);
            toast.error('Dosya ayrılırken hata oluştu: ' + (err as Error).message);
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleMerge = async () => {
        if (organizedPages.length === 0) return;
        setProcessing(true);
        setStatusText('Dosyalar birleştiriliyor (Tarayıcıda)...');
        try {
            const mergedPdf = await PDFDocument.create();

            // Map to store loaded PDFs to avoid double loading
            const loadedPdfs: Record<string, PDFDocument> = {};

            for (const fInfo of pdfFiles) {
                const arrayBuffer = await fInfo.file.arrayBuffer();
                loadedPdfs[fInfo.id] = await PDFDocument.load(arrayBuffer);
            }

            for (const item of organizedPages) {
                const sourceDoc = loadedPdfs[item.fileId];
                const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [item.pageIndex]);
                mergedPdf.addPage(copiedPage);
            }

            const pdfBytes = await mergedPdf.save();
            downloadPdf(pdfBytes, `birlestirilmis-${Date.now()}.pdf`);
            toast.success("PDF dökümanları başarıyla birleştirildi.");
        } catch (err) {
            console.error(err);
            toast.error('Birleştirme hatası: ' + (err as Error).message);
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleWatermark = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('Filigran ekleniyor (Güvenli, Tarayıcıda)...');
        try {
            const mainFile = pdfFiles[0].file;
            const arrayBuffer = await mainFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.registerFontkit(fontkit);
            const fontBytes = await loadTurkishFont();
            const customFont = await pdfDoc.embedFont(fontBytes);

            const pages = pdfDoc.getPages();
            const color = rgb(
                parseInt(watermarkColor.substring(1, 3), 16) / 255,
                parseInt(watermarkColor.substring(3, 5), 16) / 255,
                parseInt(watermarkColor.substring(5, 7), 16) / 255
            );

            let embeddedImage: any = null;
            if (watermarkType === 'image' && watermarkImage) {
                const imgData = watermarkImage.split(',')[1];
                const imgBytes = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));
                embeddedImage = watermarkImage.includes('png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
            }

            for (const page of pages) {
                const { width, height } = page.getSize();
                if (watermarkType === 'text') {
                    page.drawText(watermarkText, {
                        x: width / 4,
                        y: height / 2,
                        size: 60,
                        font: customFont,
                        color: color,
                        opacity: watermarkOpacity,
                        rotate: degrees(45),
                    });
                } else if (embeddedImage) {
                    const imgWidth = 200;
                    const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;
                    page.drawImage(embeddedImage, {
                        x: (width - imgWidth) / 2,
                        y: (height - imgHeight) / 2,
                        width: imgWidth,
                        height: imgHeight,
                        opacity: watermarkOpacity,
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            downloadPdf(pdfBytes, `${mainFile.name.replace('.pdf', '')} - (Mühürlü).pdf`);
        } catch (err) {
            console.error(err);
            alert('Filigran eklenemedi: ' + (err as Error).message);
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
            toast.success("PDF başarıyla sıkıştırıldı.");
        } catch (err: unknown) {
            console.error(err);
            toast.error(`Sıkıştırma hatası: ${err instanceof Error ? err.message : String(err)}`);
        }
        setProcessing(false);
        setStatusText('');
    };

    const handleConversion = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        const mainFile = pdfFiles[0].file;

        try {
            if (convertFormat === 'image') {
                setStatusText('PDF görsele dönüştürülüyor...');
                const arrayBuffer = await mainFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                for (let p = 1; p <= pdf.numPages; p++) {
                    setStatusText(`Sayfa ${p}/${pdf.numPages} işleniyor...`);
                    const page = await pdf.getPage(p);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context!, viewport } as any).promise;

                    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.95));
                    saveAs(blob, `${mainFile.name.replace('.pdf', '')}-sayfa-${p}.jpg`);
                }
            } else if (convertFormat === 'word') {
                setStatusText('PDF Word formatına çevriliyor (Text-based)...');
                const arrayBuffer = await mainFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const sections: ISectionOptions[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    setStatusText(`Sayfa ${i}/${pdf.numPages} çıkarılıyor...`);
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const items = textContent.items as any[];

                    if (items.length === 0) {
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
                        if (Math.abs(yA - yB) < 3) {
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

                            if (lastX !== -1 && x - lastX > 10) {
                                runs.push(new TextRun({ text: " ", size: Math.round(textItem.transform[0] * 2) || 22 }));
                            }

                            const fontSize = Math.abs(Math.round(textItem.transform[0] * 2)) || 22;

                            runs.push(new TextRun({
                                text: textItem.str,
                                size: fontSize,
                                font: "Arial",
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
                }

                const wordDoc = new Document({
                    sections,
                    creator: "Antigravity PDF Tools",
                    title: mainFile.name
                });
                const blob = await Packer.toBlob(wordDoc);
                saveAs(blob, `${mainFile.name.replace('.pdf', '')}.docx`);
            } else if (convertFormat === 'excel') {
                setStatusText('Tablolar ayıklanıyor ve Excel\'e aktarılıyor...');
                const arrayBuffer = await mainFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                const allRows: string[][] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const items = textContent.items as any[];

                    // Basit tablo tespiti: Y koordinatına göre grupla
                    const lines: Record<number, any[]> = {};
                    items.forEach(item => {
                        const y = Math.round(item.transform[5]);
                        if (!lines[y]) lines[y] = [];
                        lines[y].push(item);
                    });

                    Object.keys(lines).sort((a, b) => Number(b) - Number(a)).forEach(y => {
                        const row = lines[Number(y)].sort((a, b) => a.transform[4] - b.transform[4]).map(item => item.str);
                        allRows.push(row);
                    });
                }

                const { utils, writeFile } = await import('xlsx');
                const ws = utils.aoa_to_sheet(allRows);
                const wb = utils.book_new();
                utils.book_append_sheet(wb, ws, "PDF Verileri");
                writeFile(wb, `${mainFile.name.replace('.pdf', '')}.xlsx`);
            } else {
                alert('Bu format henüz tarayıcı tarafında tam desteklenmiyor. Lütfen Word, Excel veya Görsel seçin.');
            }
        } catch (err) {
            console.error(err);
            alert('Dönüştürme sırasında bir hata oluştu.');
        } finally {
            setProcessing(false);
            setStatusText('');
        }
    };

    const handleProtect = async () => {
        if (pdfFiles.length === 0 || !pdfPassword) {
            alert('Lütfen şifrelenecek dosyayı ve şifreyi girin.');
            return;
        }
        setProcessing(true);
        setStatusText('PDF şifreleniyor (Sunucu Tarafında)...');
        try {
            const formData = new FormData();
            formData.append('file', pdfFiles[0].file);
            formData.append('type', 'pdf-protect');
            formData.append('password', pdfPassword);

            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Şifreleme sırasında bir hata oluştu.');
            }

            const blob = await response.blob();
            saveAs(blob, `sifreli-${pdfFiles[0].name}`);

            alert('PDF başarıyla şifrelendi.');
        } catch (err: any) {
            console.error(err);
            alert('Şifreleme hatası: ' + err.message);
        } finally {
            setProcessing(false);
            setStatusText('');
        }
    };

    const handleUnlock = async () => {
        if (pdfFiles.length === 0 || !pdfPassword) return;
        setProcessing(true);
        setStatusText('Şifre kaldırılıyor (Yeniden işleniyor)...');
        try {
            const arrayBuffer = await pdfFiles[0].file.arrayBuffer();

            // pdf-lib does not support password protected PDFs directly.
            // We use pdfjs-dist to read the password protected PDF and recreate it.
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                password: pdfPassword
            });

            const pdf = await loadingTask.promise;
            const newPdfDoc = await PDFDocument.create();

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatusText(`Sayfa işleniyor: ${i} / ${pdf.numPages}`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: (context as unknown as CanvasRenderingContext2D),
                    viewport: viewport
                } as any).promise;

                const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
            downloadPdf(pdfBytes, `sifresiz-${pdfFiles[0].name}`);
        } catch (err: any) {
            console.error(err);
            if (err.name === 'PasswordException') {
                alert('Geçersiz şifre. Lütfen tekrar deneyin.');
            } else {
                alert('Şifre kaldırılamadı: ' + err.message);
            }
        } finally {
            setProcessing(false);
            setStatusText('');
        }
    };

    const handleEditApply = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('Düzenlemeler uygulanıyor...');
        try {
            const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.setTitle(metadata.title || pdfFiles[0].name);
            pdfDoc.setAuthor(metadata.author);
            pdfDoc.setSubject(metadata.subject);
            pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
            pdfDoc.setProducer('Gravity Utils');
            pdfDoc.setCreator(metadata.creator);

            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                if (rotateAngle !== 0) {
                    page.setRotation(degrees(rotateAngle));
                }

                if (pageNumbering.enabled) {
                    const { width } = page.getSize();
                    const text = `${i + 1} / ${pages.length}`;
                    page.drawText(text, {
                        x: pageNumbering.position === 'bottom-right' ? width - 70 : pageNumbering.position === 'bottom-center' ? width / 2 - 20 : width - 70,
                        y: 20,
                        size: 10,
                        color: rgb(0.5, 0.5, 0.5),
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            downloadPdf(pdfBytes, `duzenlenmis-${pdfFiles[0].name}`);
            alert('Değişiklikler başarıyla uygulandı.');
        } catch (err: any) {
            console.error(err);
            alert('Hata: ' + err.message);
        } finally {
            setProcessing(false);
            setStatusText('');
        }
    };

    const handleOCR = async () => {
        if (pdfFiles.length === 0) return;
        setProcessing(true);
        setStatusText('OCR İşlemi Başlatılıyor (Tarayıcıda)...');
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker(ocrLanguage);

            const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatusText(`Sayfa ${i}/${pdf.numPages} metne dönüştürülüyor...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context!, viewport } as any).promise;

                const imageDataUrl = canvas.toDataURL('image/png');
                const { data: { text } } = await worker.recognize(imageDataUrl);
                fullText += `\n--- SAYFA ${i} ---\n\n${text}\n`;
                setOcrProgress((i / pdf.numPages) * 100);
            }

            await worker.terminate();

            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `ocr-${pdfFiles[0].name.replace('.pdf', '')}.txt`);
            alert('Tüm sayfalardaki metinler başarıyla ayrıştırıldı.');
        } catch (err: any) {
            console.error(err);
            alert('OCR hatası: ' + err.message);
        } finally {
            setProcessing(false);
            setStatusText('');
            setOcrProgress(0);
        }
    };

    const handleSignatureApply = async () => {
        if (pdfFiles.length === 0 || !signatureCanvasRef.current) return;
        setProcessing(true);
        setStatusText('İmza dökümana işleniyor...');
        try {
            const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const signatureImg = signatureCanvasRef.current.toDataURL('image/png');
            const signatureBytes = Uint8Array.from(atob(signatureImg.split(',')[1]), c => c.charCodeAt(0));
            const signatureImage = await pdfDoc.embedPng(signatureBytes);

            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1];
            const { width } = lastPage.getSize();

            lastPage.drawImage(signatureImage, {
                x: width - 220,
                y: 50,
                width: 150,
                height: 60,
            });

            const pdfBytes = await pdfDoc.save();
            downloadPdf(pdfBytes, `imzali-${pdfFiles[0].name}`);
            alert('İmza başarıyla eklendi.');
        } catch (err: any) {
            console.error(err);
            alert('İmza hatası: ' + err.message);
        } finally {
            setProcessing(false);
            setStatusText('');
        }
    };

    const clearSignature = () => {
        if (signatureCanvasRef.current) {
            const ctx = signatureCanvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
        }
    };

    return (
        <div className="w-full max-w-[1000px] mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm hover:scale-105 active:scale-95 group"
                        title="Geri Dön"
                        aria-label="Geri Dön"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-tight italic">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <FileText className="text-red-500" size={28} />
                            </div>
                            PDF Araç Seti
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Yerel PDF yönetimi, birleştirme ve düzenleme araçları.</p>
                    </div>
                </div>
                {pdfFiles.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
                            {[
                                { id: 'org', label: 'DÜZENLEME', tools: ['merge', 'split', 'edit', 'sign'] },
                                { id: 'opt', label: 'OPTİMİZE', tools: ['compress', 'convert', 'ocr'] },
                                { id: 'sec', label: 'GÜVENLİK', tools: ['protect', 'unlock', 'watermark'] }
                            ].map((group) => (
                                <div key={group.id} className="flex flex-col gap-1.5 min-w-max">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1 uppercase">{group.label}</span>
                                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl">
                                        {group.tools.map((tabId) => {
                                            const tab = tabId as TabType;
                                            const isActive = activeTab === tab;
                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${isActive
                                                        ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className={`${isActive ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {tab === 'merge' && <Layers size={14} />}
                                                        {tab === 'split' && <Scissors size={14} />}
                                                        {tab === 'compress' && <Minimize2 size={14} />}
                                                        {tab === 'watermark' && <Stamp size={14} />}
                                                        {tab === 'convert' && <RefreshCw size={14} />}
                                                        {tab === 'protect' && <Lock size={14} />}
                                                        {tab === 'unlock' && <Unlock size={14} />}
                                                        {tab === 'edit' && <Edit3 size={14} />}
                                                        {tab === 'ocr' && <Search size={14} />}
                                                        {tab === 'sign' && <PenTool size={14} />}
                                                    </span>
                                                    {tab === 'merge' ? 'Birleştir' :
                                                        tab === 'split' ? 'Ayır' :
                                                            tab === 'compress' ? 'Sıkıştır' :
                                                                tab === 'watermark' ? 'Filigran' :
                                                                    tab === 'convert' ? 'Dönüştür' :
                                                                        tab === 'protect' ? 'Şifrele' :
                                                                            tab === 'unlock' ? 'Kilit Aç' :
                                                                                tab === 'edit' ? 'Düzenle' :
                                                                                    tab === 'ocr' ? 'OCR' : 'İmzala'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
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

                            <button
                                onClick={() => {
                                    // Simple mock PDF for testing
                                    const dummy = new File(["%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n178\n%%EOF"], "ornek-dokuman.pdf", { type: 'application/pdf' });
                                    handleFileInput({ target: { files: [dummy] } } as any);
                                }}
                                className="mt-4 px-6 py-2 bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 mx-auto flex items-center gap-2"
                            >
                                <Settings2 size={16} />
                                Örnek PDF ile Dene
                            </button>
                        </div>

                        <div className="w-full max-w-2xl px-8">
                            <div
                                onClick={async () => {
                                    const selected = await platform.openFile({
                                        multi: activeTab === 'merge',
                                        filters: [{ name: 'PDF & Resim', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }]
                                    });
                                    if (selected) {
                                        if (Array.isArray(selected)) {
                                            selected.forEach(f => handleFileAdd(f));
                                        } else {
                                            handleFileAdd(selected);
                                        }
                                    }
                                }}
                                className="group relative p-12 bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer text-center"
                            >
                                <div className="p-5 bg-red-100 dark:bg-red-900/30 rounded-3xl text-red-500 w-fit mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                                    {activeTab === 'merge' ? <Layers size={40} /> :
                                        activeTab === 'split' ? <Scissors size={40} /> :
                                            activeTab === 'compress' ? <Minimize2 size={40} /> :
                                                activeTab === 'watermark' ? <Stamp size={40} /> :
                                                    activeTab === 'protect' ? <Lock size={40} /> :
                                                        activeTab === 'unlock' ? <Unlock size={40} /> :
                                                            activeTab === 'ocr' ? <Search size={40} /> :
                                                                activeTab === 'sign' ? <PenTool size={40} /> :
                                                                    <RefreshCw size={40} />}
                                </div>
                                <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">
                                    {activeTab === 'merge' ? 'Dosyaları Birleştir' :
                                        activeTab === 'split' ? 'Sayfaları Ayır' :
                                            activeTab === 'compress' ? 'Boyutu Küçült' :
                                                activeTab === 'watermark' ? 'Filigran Ekle' :
                                                    activeTab === 'protect' ? 'PDF Şifrele' :
                                                        activeTab === 'unlock' ? 'Şifre Kaldır' :
                                                            activeTab === 'ocr' ? 'Metin Tanıma (OCR)' :
                                                                activeTab === 'sign' ? 'PDF İmzala' : 'Format Dönüştür'}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[300px] mx-auto">
                                    PDF veya Resim dosyalarını sürükleyin veya <span className="text-red-500 font-bold underline">buraya tıklayarak</span> seçin.
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                    <ShieldCheck size={12} className="text-emerald-500" /> %100 Güvenli & Yerel
                                </div>
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
                        {/* CONVERT */}
                        {activeTab === 'convert' && (
                            <div className="max-w-md mx-auto py-10">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                                        <RefreshCw size={32} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Farklı Formata Dönüştür</h3>
                                        <p className="text-sm text-slate-500">"{pdfFiles[0]?.name}" dosyasını dönüştürün.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'word', label: 'Word (docx)', icon: <FileText size={18} /> },
                                            { id: 'image', label: 'Görsel (jpg)', icon: <ImageIcon size={18} /> },
                                            { id: 'excel', label: 'Excel (xlsx)', icon: <Database size={18} /> },
                                            { id: 'ppt', label: 'PowerPoint', icon: <Layers size={18} /> },
                                        ].map((fmt) => (
                                            <button
                                                key={fmt.id}
                                                onClick={() => setConvertFormat(fmt.id as any)}
                                                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${convertFormat === fmt.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'
                                                    }`}
                                            >
                                                {fmt.icon}
                                                <span className="text-[11px] font-bold">{fmt.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                                            <b>Not:</b> Word, Görsel ve Excel dönüşümleri tarayıcıda (offline) yapılır. PowerPoint dönüşümü henüz geliştirme aşamasındadır.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleConversion}
                                        disabled={processing}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
                                        {processing ? 'Dönüştürülüyor...' : 'Dönüştür ve İndir'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PROTECT */}
                        {activeTab === 'protect' && (
                            <div className="max-w-md mx-auto py-10">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto text-red-600">
                                        <Lock size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">PDF Şifrele</h3>
                                        <p className="text-sm text-slate-500">Dökümanınızı yetkisiz erişime karşı koruyun.</p>
                                    </div>
                                    <div className="space-y-4 text-left">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Şifre Belirleyin</label>
                                        <input
                                            type="password"
                                            value={pdfPassword}
                                            onChange={(e) => setPdfPassword(e.target.value)}
                                            placeholder="Güçlü bir şifre girin..."
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleProtect}
                                        disabled={processing || !pdfPassword}
                                        className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Lock size={20} />}
                                        {processing ? 'Şifreleniyor...' : 'Şifreli PDF İndir'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* UNLOCK */}
                        {activeTab === 'unlock' && (
                            <div className="max-w-md mx-auto py-10">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto text-green-600">
                                        <Unlock size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Şifre Kaldır</h3>
                                        <p className="text-sm text-slate-500">Şifreli bir PDF'in şifresini kalıcı olarak kaldırın.</p>
                                    </div>
                                    <div className="space-y-4 text-left">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Geçerli Şifreyi Girin</label>
                                        <input
                                            type="password"
                                            value={pdfPassword}
                                            onChange={(e) => setPdfPassword(e.target.value)}
                                            placeholder="Dosya şifresini girin..."
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-green-500 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUnlock}
                                        disabled={processing || !pdfPassword}
                                        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Unlock size={20} />}
                                        {processing ? 'Kaldırılıyor...' : 'Şifreyi Kaldır ve İndir'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* EDIT (Metadata & Rotation) */}
                        {activeTab === 'edit' && (
                            <div className="max-w-2xl mx-auto py-6">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                            <Edit3 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Künye & Düzenleme</h3>
                                            <p className="text-xs text-slate-500">Metadata, sayfa numarası ve yönlendirme</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Belge Başlığı</label>
                                            <input
                                                type="text"
                                                value={metadata.title}
                                                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                                placeholder="Örn: Rapor 2024"
                                                title="Belge Başlığı"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Yazar / Kurum</label>
                                            <input
                                                type="text"
                                                value={metadata.author}
                                                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                                                placeholder="İsim veya Şirket"
                                                title="Yazar veya Kurum Adı"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RotateCw size={18} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sayfa Yönlendirme</span>
                                            </div>
                                            <select
                                                value={rotateAngle}
                                                onChange={(e) => setRotateAngle(parseInt(e.target.value) as any)}
                                                title="Döndürme Açısı"
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                                            >
                                                <option value={0}>Değiştirme (0°)</option>
                                                <option value={90}>90° Sağa Döndür</option>
                                                <option value={180}>180° Döndür</option>
                                                <option value={270}>90° Sola Döndür</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Hash size={18} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sayfa Numaralandırma</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={pageNumbering.enabled}
                                                    onChange={(e) => setPageNumbering({ ...pageNumbering, enabled: e.target.checked })}
                                                    title="Sayfa Numarasını Etkinleştir"
                                                    className="w-4 h-4 rounded accent-blue-600"
                                                />
                                                <select
                                                    disabled={!pageNumbering.enabled}
                                                    value={pageNumbering.position}
                                                    onChange={(e) => setPageNumbering({ ...pageNumbering, position: e.target.value as any })}
                                                    title="Numara Konumu"
                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs disabled:opacity-50"
                                                >
                                                    <option value="bottom-right">Sağ Alt</option>
                                                    <option value="bottom-center">Orta Alt</option>
                                                    <option value="top-right">Sağ Üst</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleEditApply}
                                        disabled={processing}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
                                        {processing ? 'Uygulanıyor...' : 'Değişiklikleri Kaydet ve İndir'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* OCR */}
                        {activeTab === 'ocr' && (
                            <div className="max-w-md mx-auto py-10">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                                        <Search size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Metin Tanıma (OCR)</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Görsel tabanlı PDF'lerdeki metinleri otomatik olarak tanır ve yazı dosyası olarak indirmenizi sağlar.
                                        </p>
                                    </div>

                                    <div className="space-y-4 py-4 text-left">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Dil Seçimi</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setOcrLanguage('tur')}
                                                className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all ${ocrLanguage === 'tur' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                            >
                                                Türkçe
                                            </button>
                                            <button
                                                onClick={() => setOcrLanguage('eng')}
                                                className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all ${ocrLanguage === 'eng' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                            >
                                                İngilizce
                                            </button>
                                        </div>
                                    </div>

                                    {ocrProgress > 0 && (
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-300"
                                                style={{ width: `${ocrProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleOCR}
                                        disabled={processing}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <Search size={20} />}
                                        {processing ? 'Okunuyor...' : 'Metinleri Çıkar (.txt)'}
                                    </button>
                                    <p className="text-[10px] text-slate-400 italic">Not: Bu işlem tarayıcınızın CPU gücünü kullanır, işlem sırasında sekme donabilir.</p>
                                </div>
                            </div>
                        )}

                        {/* SIGN */}
                        {activeTab === 'sign' && (
                            <div className="max-w-md mx-auto py-10">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                                        <PenTool size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dijital İmza</h3>
                                        <p className="text-xs text-slate-500">Aşağıdaki alana imzanızı çizin ve dökümana ekleyin.</p>
                                    </div>

                                    <div className="relative bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden touch-none">
                                        <canvas
                                            ref={signatureCanvasRef}
                                            width={400}
                                            height={200}
                                            className="w-full cursor-crosshair"
                                            onMouseDown={(e) => {
                                                const canvas = signatureCanvasRef.current;
                                                if (!canvas) return;
                                                const ctx = canvas.getContext('2d');
                                                if (!ctx) return;
                                                ctx.beginPath();
                                                ctx.lineWidth = 2;
                                                ctx.lineCap = 'round';
                                                ctx.strokeStyle = '#000';
                                                const rect = canvas.getBoundingClientRect();
                                                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

                                                const onMouseMove = (moveEvent: MouseEvent) => {
                                                    ctx.lineTo(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top);
                                                    ctx.stroke();
                                                };

                                                const onMouseUp = () => {
                                                    window.removeEventListener('mousemove', onMouseMove);
                                                    window.removeEventListener('mouseup', onMouseUp);
                                                };

                                                window.addEventListener('mousemove', onMouseMove);
                                                window.addEventListener('mouseup', onMouseUp);
                                            }}
                                            onTouchStart={(e) => {
                                                const canvas = signatureCanvasRef.current;
                                                if (!canvas) return;
                                                const ctx = canvas.getContext('2d');
                                                if (!ctx) return;
                                                ctx.beginPath();
                                                ctx.lineWidth = 2;
                                                ctx.lineCap = 'round';
                                                ctx.strokeStyle = '#000';
                                                const rect = canvas.getBoundingClientRect();
                                                const touch = e.touches[0];
                                                ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);

                                                const onTouchMove = (moveEvent: TouchEvent) => {
                                                    const t = moveEvent.touches[0];
                                                    ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top);
                                                    ctx.stroke();
                                                };

                                                const onTouchEnd = () => {
                                                    window.removeEventListener('touchmove', onTouchMove);
                                                    window.removeEventListener('touchend', onTouchEnd);
                                                };

                                                window.addEventListener('touchmove', onTouchMove);
                                                window.addEventListener('touchend', onTouchEnd);
                                            }}
                                        />
                                        <button
                                            onClick={clearSignature}
                                            title="İmzayı Sil"
                                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-800 shadow-sm rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleSignatureApply}
                                        disabled={processing}
                                        className="w-full py-4 bg-amber-600 hover:bg-amber-700 rounded-2xl font-bold text-white shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" /> : <PenTool size={20} />}
                                        {processing ? 'Uygulanıyor...' : 'İmzayı Ekle ve İndir'}
                                    </button>
                                    <p className="text-[10px] text-slate-400 italic">Not: İmza dökümanın son sayfasının sağ altına eklenir.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pb-10 border-t border-slate-100 dark:border-white/5 pt-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Info size={20} className="text-blue-500" /> PDF Rehberi & SSS
                    </h3>
                    <div className="space-y-4 text-left">
                        <details className="group border-b border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                İşlemler nerede gerçekleşiyor?
                                <span className="group-open:rotate-180 transition-transform">↓</span>
                            </summary>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                Sıkıştırma, görsele dönüştürme ve Word'e çevirme işlemleri %100 tarayıcınızda (client-side) yapılır. Dosyalarınız asla bir sunucuya yüklenmez, verileriniz tamamen gizli kalır.
                            </p>
                        </details>
                        <details className="group border-b border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                Word dönüşümü nasıl çalışır?
                                <span className="group-open:rotate-180 transition-transform">↓</span>
                            </summary>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                Word dönüşümü, PDF sayfalarını yüksek kaliteli görsellere dönüştürüp bir Word belgesine yerleştirir. Bu sayede dosya yapısı bozulmaz, ancak metinler doğrudan düzenlenemez (imaj tabanlıdır).
                            </p>
                        </details>
                        <details className="group border-b border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                Dosya boyutu neden önemli?
                                <span className="group-open:rotate-180 transition-transform">↓</span>
                            </summary>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                Web sitelerine veya e-postalara PDF eklerken 2MB altında kalmak idealdir. "Sıkıştır" aracımız kaliteden en az ödün vererek boyutu optimize eder.
                            </p>
                        </details>
                    </div>
                </div>

                <div className="p-8 bg-red-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-red-500/20 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Güvenlik Önemlidir</h3>
                    </div>
                    <p className="text-red-50 text-sm leading-relaxed font-medium">
                        Gravity Utils, "Privacy First" (Önce Gizlilik) prensibiyle çalışır. PDF'lerinizi işlemek için yüksek performanslı `pdf-lib` ve `pdf.js` kütüphanelerini doğrudan tarayıcınızda çalıştırıyoruz. İnternetiniz olmasa bile çoğu aracı kullanmaya devam edebilirsiniz.
                    </p>
                    <div className="pt-4 border-t border-white/10 italic text-[11px] text-red-100">
                        * Dosyalarınız bellekte (RAM) işlenir ve indirildikten sonra tamamen temizlenir.
                    </div>
                </div>
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
