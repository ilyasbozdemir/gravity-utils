'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, FileText, Copy, Check, Hash, RefreshCw, Type, AlignLeft } from 'lucide-react';

const LOREM_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export function LoremIpsumGenerator({ onBack }: { onBack: () => void }) {
    const [count, setCount] = useState(3);
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [generated, setGenerated] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = useCallback(() => {
        let result = '';
        if (type === 'paragraphs') {
            result = Array.from({ length: count }).map(() => LOREM_TEXT).join('\n\n');
        } else if (type === 'sentences') {
            const sentences = LOREM_TEXT.split('. ');
            result = Array.from({ length: count }).map((_, i) => sentences[i % sentences.length] + '.').join(' ');
        } else {
            const words = LOREM_TEXT.replace(/[.,]/g, '').split(' ');
            result = Array.from({ length: count }).map((_, i) => words[i % words.length]).join(' ');
        }
        setGenerated(result);
    }, [count, type]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generated);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <Type className="w-6 h-6 text-indigo-500" /> Lorem Ipsum Üretici
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tasarım ve testler için örnek metin oluşturun</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <label htmlFor="lorem-count" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Miktar</label>
                            <input id="lorem-count" type="number" min={1} max={100} value={count} onChange={e => setCount(parseInt(e.target.value) || 1)}
                                title="Oluşturulacak miktar"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tür</label>
                            <div className="space-y-2">
                                {(['paragraphs', 'sentences', 'words'] as const).map(t => (
                                    <button key={t} onClick={() => setType(t)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${type === t ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                                        {t === 'paragraphs' ? 'Paragraf' : t === 'sentences' ? 'Cümle' : 'Kelime'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={generate} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                            <RefreshCw size={18} /> Oluştur
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <AlignLeft size={14} /> Oluşturulan Metin
                            </p>
                            <button onClick={handleCopy} disabled={!generated}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-30">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 font-serif text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[500px] border border-slate-100 dark:border-slate-900 shadow-inner italic">
                            {generated || "Oluşturmak için butona basın..."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
