"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, FileText, ArrowLeft, RefreshCw } from 'lucide-react';

interface Base64ViewerProps {
    file: File | null;
    onBack: () => void;
}

export const Base64Viewer: React.FC<Base64ViewerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [base64, setBase64] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [includeScheme, setIncludeScheme] = useState(true);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newFile = e.target.files[0];
            setFile(newFile);
            setLoading(true);
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setBase64(ev.target.result as string);
                    setLoading(false);
                }
            };
            reader.readAsDataURL(newFile);
        }
    };

    useEffect(() => {
        if (!initialFile) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setBase64(e.target.result as string);
                setLoading(false);
            }
        };
        reader.readAsDataURL(initialFile);
    }, [initialFile]);

    const handleCopy = () => {
        const textToCopy = includeScheme ? base64 : base64.split(',')[1];
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const previewText = includeScheme ? base64 : base64.split(',')[1];

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-400 rounded-2xl hover:bg-violet-500/20 transition-all shadow-sm"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Base64 Araçları</h2>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Resim ve Metin Dönüşümü</p>
                </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-left mb-6 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</span> dosyası Base64 formatına dönüştürüldü.
                    </>
                ) : (
                    'Herhangi bir dosyayı (resim, belge, vb.) Base64 metne dönüştürün veya Base64 kodlarını çözün.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-violet-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-5 bg-violet-500/10 rounded-full text-violet-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                        <Share2 size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1 text-slate-800 dark:text-slate-200">Dönüştürmek için Dosya Seçin</p>
                        <p className="text-sm text-slate-500">Resim, metin veya herhangi bir binary dosya</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="p-12 flex flex-col items-center gap-4 text-violet-400 animate-pulse">
                            <RefreshCw size={40} className="animate-spin" />
                            <span className="font-medium">Kodlanıyor...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 items-start">
                            <div className="flex items-center justify-between w-full flex-wrap gap-4">
                                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        id="scheme"
                                        checked={includeScheme}
                                        onChange={(e) => setIncludeScheme(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-black/50 text-violet-500 focus:ring-violet-500/50 cursor-pointer"
                                    />
                                    <label htmlFor="scheme" className="text-sm text-slate-300 cursor-pointer select-none">
                                        Data URI Şemasını Dahil Et <span className="text-slate-500">(data:image/...)</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className={`px-6 py-2.5 flex items-center gap-2 rounded-xl text-sm font-semibold transition-all border shadow-lg ${copied
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                        : 'bg-violet-500/20 border-violet-500/40 text-violet-100 hover:bg-violet-500/30'
                                        }`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                                </button>
                            </div>

                            <div className="relative w-full h-[400px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden group">
                                <textarea
                                    value={previewText}
                                    readOnly
                                    title="Base64 Çıktısı"
                                    className="w-full h-full bg-slate-50 dark:bg-black/40 text-slate-700 dark:text-slate-300 p-6 resize-none font-mono text-[13px] leading-relaxed outline-none overflow-auto custom-scrollbar select-text"
                                />
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-400 font-mono">
                                        BASE64
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full px-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <FileText size={14} className="opacity-50" />
                                    <span>{previewText?.length.toLocaleString()} Karakter</span>
                                </div>
                                <button
                                    onClick={() => { setFile(null); setBase64(''); }}
                                    className="text-xs font-semibold text-red-500/60 hover:text-red-400 transition-colors uppercase tracking-wider"
                                >
                                    Temizle
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
