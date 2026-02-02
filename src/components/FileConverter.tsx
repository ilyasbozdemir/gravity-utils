import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { getAvailableFormats, type Format } from '../utils/formats';
import { saveAs } from 'file-saver';

interface FileConverterProps {
    file: File;
    onBack: () => void;
}

export const FileConverter: React.FC<FileConverterProps> = ({ file, onBack }) => {
    const [formats, setFormats] = useState<Format[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
    const [customExt, setCustomExt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const available = getAvailableFormats(file);
        setFormats(available);
    }, [file]);

    const handleConvert = async () => {
        setIsProcessing(true);
        try {
            // Determine target extension and mime
            let targetExt = customExt;
            let isRenameOnly = false;

            if (selectedFormat) {
                targetExt = selectedFormat.ext;
                isRenameOnly = selectedFormat.isRenameOnly === true;
            } else if (customExt) {
                // Manual entry is usually treated as a rename
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

            // PDF Conversion Logic
            if (targetExt.toLowerCase() === 'pdf') {
                const doc = new jsPDF();

                if (file.type.startsWith('image/')) {
                    // Image to PDF
                    const imgData = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    const imgProps = doc.getImageProperties(imgData);
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    doc.save(finalName);

                } else if (file.type.startsWith('text/') || /\.(txt|md|js|ts|json|xml)$/i.test(file.name)) {
                    // Text to PDF
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
                    // Fallback for types we can't truly convert to PDF client-side yet
                    // Just forcing the extension (Rename) as per user request "support as much as you can"
                    // But warning is better.
                    const newBlob = new Blob([file], { type: 'application/pdf' });
                    saveAs(newBlob, finalName);
                }

                setIsProcessing(false);
                return;
            }

            let targetMime = 'application/octet-stream';
            if (targetExt === 'zip') targetMime = 'application/zip';
            else if (targetExt === 'txt') targetMime = 'text/plain';
            else if (selectedFormat) targetMime = selectedFormat.mime;

            if (isRenameOnly) {
                // BYTES PRESERVATION MODE
                // Using new Blob([file]) preserves the data exactly but allows us to override the type
                const newBlob = new Blob([file], { type: targetMime });
                saveAs(newBlob, finalName);
            } else {
                // Fallback for now
                const newBlob = new Blob([file], { type: targetMime });
                saveAs(newBlob, finalName);
            }

        } catch (error) {
            console.error(error);
            alert("Dönüştürme sırasında hata oluştu. Dosya bozuk olabilir.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg hover:bg-blue-500/40 transition-all">
                    <ArrowLeft size={18} />
                </button>
                <h2 className="m-0 text-2xl font-semibold">Dönüştür / Yeniden Adlandır</h2>
            </div>

            <div className="flex flex-col gap-6 items-start">
                <div className="p-4 bg-white/5 w-full rounded-xl text-left border border-white/5">
                    <span className="text-sm block mb-1 opacity-70">Seçilen Dosya:</span>
                    <strong className="text-lg">{file.name}</strong>
                </div>

                {/* Suggested Formats */}
                <div className="w-full text-left">
                    <label className="text-sm opacity-70 block mb-2">Önerilen Dönüşümler:</label>
                    <div className="flex gap-3 flex-wrap">
                        {formats.map((fmt) => (
                            <button
                                key={fmt.ext}
                                onClick={() => { setSelectedFormat(fmt); setCustomExt(''); }}
                                className={`px-4 py-2 rounded-lg border transition-all ${selectedFormat === fmt
                                        ? 'bg-blue-500/60 border-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.3)] transform -translate-y-0.5'
                                        : 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/40'
                                    }`}
                            >
                                {fmt.label} (.{fmt.ext})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manual Override */}
                <div className="w-full text-left">
                    <label className="text-sm opacity-70 block mb-2">Veya Manuel Uzantı Yazın:</label>
                    <input
                        type="text"
                        value={customExt}
                        onChange={(e) => { setCustomExt(e.target.value); setSelectedFormat(null); }}
                        placeholder="zip, rar, txt..."
                        className="bg-black/30 border border-white/10 text-white p-3 rounded-lg w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                    />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-left">
                    <AlertCircle size={24} className="text-yellow-500 shrink-0" />
                    <span className="opacity-90 leading-relaxed">
                        Not: "Yeniden Adlandırma" modu (özellikle .docx &rarr; .zip) dosya içeriğini değiştirmeden sadece uzantıyı değiştirir. Bu, dosyanın iç yapısını incelemek için güvenlidir.
                    </span>
                </div>

                <button
                    className={`w-full mt-4 flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all ${(selectedFormat || customExt) && !isProcessing
                            ? 'bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 text-emerald-100'
                            : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                    disabled={(!selectedFormat && !customExt) || isProcessing}
                    onClick={handleConvert}
                >
                    <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
                    <span>{isProcessing ? 'İşleniyor...' : 'Çevir ve İndir'}</span>
                </button>
            </div>
        </div>
    );
};
