'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Download, Copy, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import type { QrEntry } from '@/components/QrManager';

const LS_KEY = 'gravity_qr_history';

function loadEntry(id: string): QrEntry | null {
    try {
        const list: QrEntry[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
        return list.find(e => e.id === id) ?? null;
    } catch { return null; }
}

export default function QrSharePage() {
    const { id } = useParams<{ id: string }>();
    const [entry, setEntry] = useState<QrEntry | null | 'loading'>('loading');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) { setEntry(null); return; }
        setEntry(loadEntry(id));
    }, [id]);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const download = (e: QrEntry) => {
        const a = document.createElement('a');
        a.href = e.dataUrl;
        a.download = `qr-${e.id.slice(0, 8)}.png`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Minimal header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold">
                    <ArrowLeft size={16} /> Gravity Utils
                </Link>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <QrCode size={14} /> QR Paylaşım
                </span>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center p-6">
                {entry === 'loading' && (
                    <div className="text-center text-slate-400">
                        <QrCode size={40} className="mx-auto mb-3 animate-pulse" />
                        <p>Yükleniyor...</p>
                    </div>
                )}

                {entry === null && (
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={36} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-2">QR Bulunamadı</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            Bu QR kodu bu cihazda oluşturulmadı veya silinmiş olabilir.
                            QR kodları yalnızca oluşturulduğu cihazın localStorage'ında saklanır.
                        </p>
                        <Link href="/?tool=qr"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
                            <QrCode size={16} /> Yeni QR Oluştur
                        </Link>
                    </div>
                )}

                {entry && entry !== 'loading' && (
                    <div className="max-w-sm w-full">
                        {/* Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                            {/* Top accent */}
                            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500" />

                            <div className="p-8 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
                                    <QrCode size={12} /> Gravity Utils QR
                                </div>

                                {/* QR Image */}
                                <div className="flex justify-center mb-6">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={entry.dataUrl} alt={`QR: ${entry.label}`}
                                        className="w-56 h-56 rounded-2xl shadow-lg border-4 border-slate-100 dark:border-slate-800" />
                                </div>

                                {/* Label */}
                                <h1 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">{entry.label}</h1>
                                <p className="text-xs text-slate-400 font-mono break-all bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-6">
                                    {entry.content}
                                </p>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button onClick={() => copy(entry.content)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all">
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        {copied ? 'Kopyalandı!' : 'İçeriği Kopyala'}
                                    </button>
                                    <button onClick={() => download(entry)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all">
                                        <Download size={16} /> PNG İndir
                                    </button>
                                    {entry.content.startsWith('http') && (
                                        <a href={entry.content} target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all">
                                            🔗 Bağlantıyı Aç
                                        </a>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-5 font-mono">
                                    ID: {entry.id}
                                </p>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-4">
                            <Link href="/" className="hover:text-blue-500 transition-colors font-bold">Gravity Utils</Link> ile oluşturuldu
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
