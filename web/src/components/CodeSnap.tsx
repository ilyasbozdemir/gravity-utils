'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Check, Camera, Palette, Type, Monitor, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Default style

const LANGUAGES = [
    { label: 'Auto Detect', value: 'auto' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
    { label: 'HTML/XML', value: 'xml' },
    { label: 'CSS', value: 'css' },
    { label: 'JSON', value: 'json' },
    { label: 'Java', value: 'java' },
    { label: 'C#', value: 'csharp' },
    { label: 'SQL', value: 'sql' },
];

const GRADIENTS = [
    'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    'bg-gradient-to-br from-blue-600 to-cyan-400',
    'bg-gradient-to-br from-orange-400 to-red-600',
    'bg-gradient-to-br from-emerald-400 to-cyan-500',
    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    'bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500',
    'bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500',
];

const WINDOW_STYLES = [
    { label: 'Mac OS', value: 'mac' },
    { label: 'Simple', value: 'simple' },
    { label: 'Outline', value: 'outline' },
    { label: 'None', value: 'none' },
];

export function CodeSnap({ onBack }: { onBack: () => void }) {
    const [code, setCode] = useState('// Your professional code here\nfunction helloWorld() {\n  console.log("Hello Gravity Utils!");\n}');
    const [language, setLanguage] = useState('auto');
    const [gradient, setGradient] = useState(GRADIENTS[0]);
    const [windowStyle, setWindowStyle] = useState('mac');
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [padding, setPadding] = useState(64);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const snapRef = useRef<HTMLDivElement>(null);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.removeAttribute('data-highlighted');
            if (language === 'auto') {
                hljs.highlightElement(codeRef.current);
            } else {
                codeRef.current.className = `language-${language} py-4 block overflow-x-auto custom-scrollbar`;
                hljs.highlightElement(codeRef.current);
            }
        }
    }, [code, language]);

    const handleDownload = async () => {
        if (!snapRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(snapRef.current, {
                scale: 2, // Retine quality
                backgroundColor: null,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = 'codesnap.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Snapshot error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön"
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Camera className="w-6 h-6 text-purple-500" /> CodeSnap Pro
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Kodlarınızı şık ve paylaşılabilir görsellere dönüştürün.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-purple-500 transition-all">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Kopyalandı' : 'Kod Kopyala'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download size={16} />}
                        GÖRSEL İNDİR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
                        {/* Editor Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Kod Editörü</label>
                                <button
                                    onClick={() => setCode(`const GravityUtils = () => {\n  const [active, setActive] = useState(true);\n\n  return (\n    <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600">\n      <h1>Gravity Utils Premium</h1>\n      <p>Local-first toolkit for designers.</p>\n    </div>\n  );\n};`)}
                                    className="text-[10px] font-bold text-purple-500 hover:text-purple-600 underline"
                                >
                                    Örnek Kod Yükle
                                </button>
                            </div>
                            <textarea
                                value={code}
                                title="Kodunuzu Buraya Girin"
                                placeholder="// Kodunuzu buraya yapıştırın..."
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-48 bg-slate-50 dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-mono text-xs focus:outline-none focus:border-purple-500 transition-all resize-none dark:text-purple-200"
                            />
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-3">
                            <label htmlFor="language-select" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <Monitor size={12} /> Dil
                            </label>
                            <select
                                id="language-select"
                                value={language}
                                title="Yazılım Dili Seçin"
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Gradient Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <Palette size={12} /> Arka Plan
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {GRADIENTS.map((g, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setGradient(g)}
                                        title={`Arka Plan ${idx + 1}`}
                                        className={`h-10 rounded-lg transition-all border-2 ${gradient === g ? 'border-purple-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'} ${g}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Ayarlar</label>

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pencere</span>
                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                                    {WINDOW_STYLES.map(s => (
                                        <button key={s.value} onClick={() => setWindowStyle(s.value)}
                                            className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${windowStyle === s.value ? 'bg-white dark:bg-white/10 text-purple-500 shadow-sm' : 'text-slate-500'}`}>
                                            {s.value.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Kenar Boşluğu</span>
                                    <span className="text-purple-500">{padding}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="16"
                                    max="128"
                                    step="16"
                                    value={padding}
                                    onChange={(e) => setPadding(parseInt(e.target.value))}
                                    className="w-full accent-purple-500 h-1 rounded-lg cursor-pointer appearance-none bg-slate-200 dark:bg-white/10"
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={showLineNumbers}
                                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 transition-all"
                                />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-purple-500">Satır Numaraları</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#06070a] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 overflow-hidden shadow-inner relative group">
                    <div className="absolute top-4 left-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">Önizleme Alanı</div>

                    <div
                        ref={snapRef}
                        className={`transition-all duration-300 ease-out shadow-2xl overflow-hidden ${gradient}`}
                        style={{ padding: `${padding}px` }}
                    >
                        <div className={`
                            bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl transition-all duration-300
                            ${windowStyle === 'mac' ? 'border border-white/5' : windowStyle === 'outline' ? 'border-2 border-white/20' : ''}
                        `}>
                            {windowStyle === 'mac' && (
                                <div className="px-4 py-3 bg-[#161b22] flex items-center gap-2 border-b border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                </div>
                            )}

                            <div className="relative font-mono text-sm leading-relaxed p-6">
                                <pre className="m-0">
                                    <code
                                        ref={codeRef}
                                        className={language === 'auto' ? '' : `language-${language}`}
                                    >
                                        {code}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                            <Camera size={12} /> Otomatik HD Çıktı
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                            <Palette size={12} /> Ultra Kalite
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

