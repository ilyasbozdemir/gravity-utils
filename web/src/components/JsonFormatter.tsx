"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface JsonFormatterProps {
    file?: File | null;
    onBack: () => void;
}

export const JsonFormatter: React.FC<JsonFormatterProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile ?? null);
    const [jsonContent, setJsonContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const obj = JSON.parse(text);
                setJsonContent(JSON.stringify(obj, null, 4));
                setError(null);
            } catch {
                setError("Geçersiz JSON formatı.");
            }
        };
        reader.readAsText(file);
    }, [file]);

    const handleFormat = () => {
        try {
            const obj = JSON.parse(jsonContent);
            setJsonContent(JSON.stringify(obj, null, 4));
            setError(null);
        } catch {
            setError("Formatlanamadı: Geçersiz JSON.");
        }
    };

    const handleMinify = () => {
        try {
            const obj = JSON.parse(jsonContent);
            setJsonContent(JSON.stringify(obj));
            setError(null);
        } catch {
            setError("Küçültülemedi: Geçersiz JSON.");
        }
    };

    const handleCopy = () => {
        if (!jsonContent) return;
        navigator.clipboard.writeText(jsonContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!jsonContent || error) return;
        const blob = new Blob([jsonContent], { type: 'application/json' });
        saveAs(blob, `formatted-${file?.name || 'json'}.json`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-700 dark:text-white rounded-lg hover:bg-indigo-500/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">JSON Formatlayıcı</h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium tracking-wide">Düzenle, Doğrula ve Güzelleştir</p>
                </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-left mb-6 leading-relaxed">
                JSON metninizi buraya yapıştırın veya bir dosya yükleyin. Otomatik olarak doğrulanacak ve okunaklı hale getirilecektir.
            </p>

            <div className="flex flex-col gap-6">
                <div className="relative group">
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 animate-pulse">
                                <RefreshCw size={10} /> GEÇERSİZ
                            </div>
                        )}
                        {!error && jsonContent && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                                <Check size={10} /> GEÇERLİ
                            </div>
                        )}
                    </div>
                    <textarea
                        value={jsonContent}
                        onChange={(e) => {
                            setJsonContent(e.target.value);
                            try {
                                if (e.target.value) JSON.parse(e.target.value);
                                setError(null);
                            } catch {
                                setError("Geçersiz JSON");
                            }
                        }}
                        placeholder='{"mesaj": "JSON metnini buraya yapıştırın..."}'
                        className={`w-full h-[400px] bg-slate-50 dark:bg-black/40 border ${error ? 'border-red-500/30' : 'border-slate-200 dark:border-white/10'} rounded-2xl p-6 font-mono text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all resize-none custom-scrollbar`}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFormat}
                            disabled={!jsonContent}
                            className="px-6 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-700 dark:text-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                        >
                            <RefreshCw size={14} className={jsonContent ? 'animate-spin-slow' : ''} />
                            Formatla
                        </button>
                        <button
                            onClick={handleMinify}
                            disabled={!jsonContent}
                            className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all"
                        >
                            Küçült (Minify)
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            disabled={!jsonContent}
                            title="Kopyala"
                            className={`p-2.5 rounded-xl border transition-all ${copied
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!jsonContent || !!error}
                            title="İndir (.json)"
                            className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="json-upload"
                            ref={fileInputRef}
                        />
                        <label
                            htmlFor="json-upload"
                            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-400 transition-colors"
                        >
                            Dosya Yükle
                        </label>
                    </div>
                    <button
                        onClick={() => { setJsonContent(''); setError(null); setFile(null); }}
                        className="text-[10px] font-bold text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors"
                    >
                        Temizle
                    </button>
                </div>
            </div>
        </div>
    );
};
