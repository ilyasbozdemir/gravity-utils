'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRightLeft, Copy, Download, Trash2, FileJson, FileCode } from 'lucide-react';
import { js2xml, xml2js } from 'xml-js';

export function JsonXmlConverter({ onBack }: { onBack: () => void }) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'json2xml' | 'xml2json'>('json2xml');
    const [error, setError] = useState<string | null>(null);

    const handleConvert = () => {
        try {
            setError(null);
            if (!input.trim()) return;

            if (mode === 'json2xml') {
                const jsonObj = JSON.parse(input);
                const xml = js2xml(jsonObj, { compact: true, spaces: 4 });
                setOutput(xml);
            } else {
                const json = xml2js(input, { compact: true, spaces: 4 });
                setOutput(JSON.stringify(json, null, 4));
            }
        } catch (err) {
            setError('Dönüştürme hatası: Geçersiz format.');
            console.error(err);
        }
    };

    const handleCopy = () => {
        if (output) navigator.clipboard.writeText(output);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: mode === 'json2xml' ? 'application/xml' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${mode === 'json2xml' ? 'xml' : 'json'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {mode === 'json2xml' ? <FileJson className="w-6 h-6 text-blue-500" /> : <FileCode className="w-6 h-6 text-orange-500" />}
                            JSON <> XML Dönüştürücü
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Verilerinizi formatlar arasında hızlıca dönüştürün
                            </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setMode(prev => prev === 'json2xml' ? 'xml2json' : 'json2xml');
                        setInput(output);
                        setOutput(input);
                        setError(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium"
                >
                    <ArrowRightLeft size={18} />
                    {mode === 'json2xml' ? 'JSON → XML' : 'XML → JSON'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                {/* Input Panel */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Girdi ({mode === 'json2xml' ? 'JSON' : 'XML'})
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
                        placeholder={mode === 'json2xml' ? '{"key": "value"}' : '<root><key>value</key></root>'}
                        className="flex-1 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                        spellCheck={false}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Çıktı ({mode === 'json2xml' ? 'XML' : 'JSON'})
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                disabled={!output}
                                className="p-1.5 text-slate-500 hover:text-blue-500 disabled:opacity-50 transition-colors"
                                title="Kopyala"
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={!output}
                                className="p-1.5 text-slate-500 hover:text-green-500 disabled:opacity-50 transition-colors"
                                title="İndir"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative group">
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Dönüştürülen çıktı burada görünecek..."
                            className="w-full h-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none font-mono text-sm text-slate-600 dark:text-slate-300"
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
                                    onClick={handleConvert}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    Dönüştür
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
                        onClick={handleConvert}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Dönüştür
                    </button>
                </div>
            )}
        </div>
    );
}
