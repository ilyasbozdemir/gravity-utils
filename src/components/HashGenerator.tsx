"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check, Fingerprint } from 'lucide-react';

interface HashGeneratorProps {
    file: File | null;
    onBack: () => void;
}

export const HashGenerator: React.FC<HashGeneratorProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [hashes, setHashes] = useState<{ sha1: string; sha256: string }>({ sha1: '', sha256: '' });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!file) return;
        const generateHashes = async () => {
            setLoading(true);
            try {
                const arrayBuffer = await file.arrayBuffer();

                // SHA-1
                const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
                const sha1Array = Array.from(new Uint8Array(sha1Buffer));
                const sha1Hex = sha1Array.map(b => b.toString(16).padStart(2, '0')).join('');

                // SHA-256
                const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                const sha256Array = Array.from(new Uint8Array(sha256Buffer));
                const sha256Hex = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('');

                setHashes({ sha1: sha1Hex, sha256: sha256Hex });
            } catch {
                // Error handling
            } finally {
                setLoading(false);
            }
        };

        generateHashes();
    }, [file]);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all shadow-sm"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dosya İmzası (Hash)</h2>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">SHA-1 ve SHA-256 Hesaplayıcı</p>
                </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-left mb-6 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</span> dosyası için benzersiz imzalar oluşturuldu. Bu imzalar dosyanın bütünlüğünü doğrulamak için kullanılır.
                    </>
                ) : (
                    'İmzasını (hash) hesaplamak istediğiniz dosyayı seçin. Dosya içeriği asla sunucuya yüklenmez, işlem tarayıcınızda yapılır.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                >
                    <div className="p-5 bg-emerald-500/10 rounded-full text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <Fingerprint size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1 text-slate-800 dark:text-slate-200">Hash Hesaplamak İçin Dosya Seçin</p>
                        <p className="text-sm text-slate-500">Herhangi bir dosya türü desteklenir</p>
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
                <div className="flex flex-col gap-8">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center gap-4 text-emerald-400 animate-pulse">
                            <RefreshCw size={40} className="animate-spin" />
                            <span className="font-bold tracking-widest uppercase text-xs">Hesaplanıyor...</span>
                        </div>
                    ) : (
                        <>
                            {/* SHA-1 */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">SHA-1</label>
                                    <span className="text-[10px] text-emerald-500/70 font-mono select-none">40 Karakter</span>
                                </div>
                                <div className="flex items-center gap-3 w-full group">
                                    <div className="relative flex-1">
                                        <input
                                            readOnly
                                            value={hashes.sha1}
                                            title="SHA-1 Hash"
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-[13px] font-mono text-emerald-700 dark:text-emerald-200/90 leading-none focus:outline-none focus:border-emerald-500/30 transition-all select-all scrollbar-hide"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(hashes.sha1, 'sha1')}
                                        className={`p-3.5 rounded-xl border transition-all shadow-lg ${copied === 'sha1'
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                        title="Kopyala"
                                    >
                                        {copied === 'sha1' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* SHA-256 */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">SHA-256</label>
                                    <span className="text-[10px] text-emerald-500/70 font-mono select-none">64 Karakter</span>
                                </div>
                                <div className="flex items-center gap-3 w-full group">
                                    <div className="relative flex-1">
                                        <textarea
                                            readOnly
                                            value={hashes.sha256}
                                            title="SHA-256 Hash"
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-[13px] font-mono text-emerald-700 dark:text-emerald-200/90 leading-relaxed focus:outline-none focus:border-emerald-500/30 transition-all select-all resize-none scrollbar-hide"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(hashes.sha256, 'sha256')}
                                        className={`p-3.5 rounded-xl border transition-all h-fit shadow-lg ${copied === 'sha256'
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                        title="Kopyala"
                                    >
                                        {copied === 'sha256' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Dosya Hazır</span>
                                <button
                                    onClick={() => { setFile(null); setHashes({ sha1: '', sha256: '' }); }}
                                    className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest py-1"
                                >
                                    Değiştir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

