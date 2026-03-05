'use client';

import React, { useState } from 'react';
import { ArrowLeft, Database, Copy, Check, Trash2 } from 'lucide-react';
import { format } from 'sql-formatter';

export function SqlFormatter({ onBack }: { onBack: () => void }) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dialect, setDialect] = useState<'sql' | 'postgresql' | 'mysql'>('sql');

    const handleFormat = () => {
        try {
            setError(null);
            if (!input.trim()) return;

            const formatted = format(input, {
                language: dialect,
                tabWidth: 2,
                keywordCase: 'upper',
                linesBetweenQueries: 2,
            });
            setOutput(formatted);
        } catch (err) {
            setError('SQL Formatlama hatası: Geçersiz sorgu.');
            console.error(err);
        }
    };

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
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
                            <Database className="w-6 h-6 text-indigo-500" />
                            SQL Formatlayıcı
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Karmaşık SQL sorgularınızı düzenleyin ve güzelleştirin
                        </p>
                    </div>
                </div>

                <select
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value as any)}
                    aria-label="SQL Dili Seçin"
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                    <option value="sql">Standart SQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                {/* Input Panel */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Ham SQL Sorgusu
                        </label>
                        <button
                            onClick={() => { setInput(''); setOutput(''); setError(null); }}
                            className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="SELECT * FROM users WHERE..."
                        className="flex-1 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm placeholder:text-slate-400/50"
                        spellCheck={false}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Düzenlenmiş Sorgu
                        </label>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${copied ? 'text-green-500 bg-green-500/10' : 'text-slate-500 hover:text-indigo-500'}`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                    </div>
                    <div className="flex-1 relative group">
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Düzenlenmiş SQL burada görünecek..."
                            className="w-full h-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none font-mono text-sm text-indigo-600 dark:text-indigo-400"
                            spellCheck={false}
                        />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium animate-in slide-in-from-bottom-2">
                                {error}
                            </div>
                        )}
                        {!output && !error && input && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleFormat}
                                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    Formatla
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick Action Button (Visible always if input exists) */}
            {input && !output && !error && (
                <div className="flex justify-center mt-6 md:hidden">
                    <button
                        onClick={handleFormat}
                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        Formatla
                    </button>
                </div>
            )}
        </div>
    );
}
