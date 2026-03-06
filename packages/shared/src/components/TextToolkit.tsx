'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Type, List, FileCode, Check, Copy,
    Trash2, Info, Zap, AlertCircle, Search, Edit3,
    Eye, Layout, Activity, Feather, ArrowLeft, RefreshCw
} from 'lucide-react';

type ToolTab = 'case' | 'lorem' | 'markdown' | 'mermaid' | 'diff' | 'cleaner';

interface TextToolkitProps {
    view?: ToolTab | 'text-cleaner' | 'case-converter-pro';
    onBack?: () => void;
}

export const TextToolkit: React.FC<TextToolkitProps> = ({ view, onBack }) => {
    // Map old view names to new tabs if necessary
    const initialTab = view === 'text-cleaner' ? 'cleaner' : (view === 'case-converter-pro' ? 'case' : (view as ToolTab || 'case'));
    const [activeTab, setActiveTab] = useState<ToolTab>(initialTab);
    const handleBack = onBack || (() => { window.location.hash = ''; });

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Feather size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Metin & İçerik Uzmanı</h1>
                        <p className="text-slate-500 text-sm font-medium">Bozdemir Engine Text Processor</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-200 dark:bg-white/5 p-2 rounded-2xl w-fit relative isolate shadow-inner">
                {[
                    { id: 'case', label: 'Vaka Çevirici', icon: <Type size={16} /> },
                    { id: 'cleaner', label: 'Metin Temizleyici', icon: <RefreshCw size={16} /> },
                    { id: 'lorem', label: 'Lorem Ipsum', icon: <List size={16} /> },
                    { id: 'markdown', label: 'Markdown Editor', icon: <Edit3 size={16} /> },
                    { id: 'mermaid', label: 'Mermaid Editor', icon: <Activity size={16} /> },
                    { id: 'diff', label: 'Text Diff', icon: <Layout size={16} /> },
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ToolTab)}
                            className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors z-10 ${isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="text-toolkit-tab"
                                    className="absolute inset-0 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.icon}
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'case' && <CaseTab />}
                {activeTab === 'cleaner' && <CleanerTab />}
                {activeTab === 'lorem' && <LoremTab />}
                {activeTab === 'markdown' && <MarkdownTab />}
                {activeTab === 'mermaid' && <MermaidTab />}
                {activeTab === 'diff' && <DiffTab />}
            </div>

            <TextGuide activeTab={activeTab} />
        </div>
    );
};

function CaseTab() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const convert = (type: string) => {
        if (!input) return;
        let res = '';
        if (type === 'upper') res = input.toLocaleUpperCase('tr-TR');
        else if (type === 'lower') res = input.toLocaleLowerCase('tr-TR');
        else if (type === 'title') res = input.toLocaleLowerCase('tr-TR').split(' ').map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1)).join(' ');
        else if (type === 'sentence') res = input.toLocaleLowerCase('tr-TR').charAt(0).toLocaleUpperCase('tr-TR') + input.slice(1).toLocaleLowerCase('tr-TR');
        setOutput(res);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Girdi Metni</label>
                        <button onClick={() => setInput('')} title="Temizle" className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="w-full h-80 p-8 bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] focus:ring-2 focus:ring-amber-500/50 outline-none text-sm font-medium leading-relaxed resize-none text-slate-700 dark:text-slate-300 shadow-inner"
                        placeholder="Metni buraya girin..."
                        title="Metin Girdisi"
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Çıktı</label>
                        {output && (
                            <button onClick={handleCopy} title="Kopyala" className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>
                    <div className="w-full h-80 p-8 bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-100 dark:border-amber-500/20 rounded-[2.5rem] text-sm font-black leading-relaxed text-amber-600 dark:text-amber-400 overflow-auto whitespace-pre-wrap shadow-inner">
                        {output || <span className="opacity-20 text-[10px] uppercase tracking-widest italic font-black">Çıktı bekleniyor...</span>}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => convert('upper')} className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">BÜYÜK HARF</button>
                <button onClick={() => convert('lower')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all">küçük harf</button>
                <button onClick={() => convert('title')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all">Başlık Düzeni</button>
                <button onClick={() => convert('sentence')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all">Cümle Düzeni</button>
            </div>
        </div>
    );
}

function CleanerTab() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const clean = (action: string) => {
        let res = input;
        if (action === 'spaces') res = input.replace(/\s+/g, ' ').trim();
        else if (action === 'lines') res = input.split('\n').map(l => l.trim()).filter(l => l).join('\n');
        else if (action === 'tr') {
            const trMap: Record<string, string> = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U' };
            res = input.replace(/[çÇğĞıİöÖşŞüÜ]/g, m => trMap[m] || m);
        }
        setOutput(res);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-80 p-8 bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] focus:ring-2 focus:ring-amber-500/50 outline-none text-sm font-medium leading-relaxed resize-none text-slate-700 dark:text-slate-300 shadow-inner"
                    placeholder="Temizlenecek metni girin..."
                    title="Temizleme Girdisi"
                />
                <div className="w-full h-80 p-8 bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 overflow-auto whitespace-pre-wrap shadow-inner relative">
                    {output || <span className="opacity-20 italic">Sonuç bekleniyor...</span>}
                    {output && (
                        <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-4 right-4 p-2 bg-amber-500 text-white rounded-lg shadow-lg">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => clean('spaces')} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Boşlukları Temizle</button>
                <button onClick={() => clean('lines')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Satırları Düzenle</button>
                <button onClick={() => clean('tr')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Türkçe Karakter Düzelt</button>
            </div>
        </div>
    );
}

function LoremTab() {
    const [count, setCount] = useState(3);
    const [output, setOutput] = useState('');

    const generate = () => {
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";
        setOutput(Array(count).fill(text).join('\n\n'));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in duration-500">
            <div className="p-10 bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-[3rem] text-center space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Paragraf Sayısı: {count}</label>
                    <input type="range" min={1} max={20} value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-64 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" title="Paragraf Sayısı Seçin" />
                </div>
                <button onClick={generate} className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">Metin Oluştur</button>
            </div>
            {output && (
                <div className="relative group animate-in slide-in-from-top-4 duration-500">
                    <div className="p-10 bg-white dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-[3rem] font-bold text-slate-600 dark:text-slate-300 leading-relaxed text-sm shadow-inner">
                        {output}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(output); }} title="Kopyala" className="absolute top-6 right-6 p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"><Copy size={20} /></button>
                </div>
            )}
        </div>
    );
}

function MarkdownTab() {
    const [input, setInput] = useState('# Merhaba Dünya\n\nBu bir **Markdown** örneğidir.');

    return (
        <div className="grid lg:grid-cols-2 gap-8 h-[500px] animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 h-full">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Markdown Editörü</label>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-8 bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] font-mono text-sm focus:ring-2 focus:ring-amber-500/50 outline-none resize-none shadow-inner text-slate-700 dark:text-slate-300"
                    title="Markdown Girişi"
                />
            </div>
            <div className="flex flex-col gap-4 h-full">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Önizleme</label>
                <div className="flex-1 p-8 bg-white dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-auto prose dark:prose-invert max-w-none prose-sm font-bold shadow-inner">
                    {input.split('\n').map((line, i) => (
                        <div key={i}>{line || <br />}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MermaidTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40 h-full">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-6">
                <Activity size={40} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 text-slate-800 dark:text-white">Mermaid Diagram Pro</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">Diyagram ve akış şeması vizüalizasyon motoru v3.3 ile yayında olacak. Çok yakında.</p>
        </div>
    );
}

function DiffTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40 h-full">
            <div className="p-6 bg-amber-500/10 rounded-3xl mb-6">
                <Layout size={64} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 text-slate-800 dark:text-white">Text Diff Engine</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">İki metin arasındaki farkları analiz eden algoritma optimize ediliyor.</p>
        </div>
    );
}

const TextGuide = ({ activeTab }: { activeTab: ToolTab }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-amber-500 rounded-[3rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><FileText size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Zap size={20} /> Pro Metin İpucu
            </h3>
            <p className="text-amber-50 text-sm font-medium leading-relaxed mb-6">
                Başlık Düzeni (Title Case) kullanarak içeriklerinizi daha profesyonel hale getirin. Metin temizleyici ile gereksiz boşluklardan saniyeler içinde kurtulun.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Gravity Text Engine v1.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <Info size={20} className="text-amber-500" /> Yerel Veri İşleme
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Tüm işlemler doğrudan tarayıcınızın RAM'inde gerçekleşir. Hiçbir metin içeriği sunucuya gönderilmez, verileriniz %100 yerel kalır.
            </p>
        </div>
    </div>
);
