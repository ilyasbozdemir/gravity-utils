'use client';

import React, { useState } from 'react';
import {
    Palette, PenTool, Layout, Globe, QrCode,
    Copy, Trash2, Download, AlertCircle, Info,
    Zap, MousePointer2, Layers, Figma, Sparkles,
    ArrowLeft, Check
} from 'lucide-react';

type ToolTab = 'color' | 'figma' | 'favicon' | 'qr';

interface DesignToolkitProps {
    view?: ToolTab;
    onBack?: () => void;
}

export const DesignToolkit: React.FC<DesignToolkitProps> = ({ view, onBack }) => {
    const [activeTab, setActiveTab] = useState<ToolTab>(view || 'color');
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
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Palette size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tasarım & UI Laboratuvarı</h1>
                        <p className="text-slate-500 text-sm font-medium">Bozdemir Engine Design Studio</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'color', label: 'Renk Paleti', icon: <Palette size={16} /> },
                    { id: 'figma', label: 'Figma to Code', icon: <Figma size={16} /> },
                    { id: 'favicon', label: 'Favicon Gen', icon: <Globe size={16} /> },
                    { id: 'qr', label: 'QR Oluşturucu', icon: <QrCode size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'color' && <ColorTab />}
                {activeTab === 'figma' && <FigmaTab />}
                {activeTab === 'favicon' && <FaviconTab />}
                {activeTab === 'qr' && <QrTab />}
            </div>

            <DesignGuide activeTab={activeTab} />
        </div>
    );
};

function ColorTab() {
    const COLORS = [
        { name: 'Indigo', hex: '#6366f1' }, { name: 'Rose', hex: '#f43f5e' },
        { name: 'Amber', hex: '#f59e0b' }, { name: 'Emerald', hex: '#10b981' },
        { name: 'Sky', hex: '#0ea5e9' }, { name: 'Violet', hex: '#8b5cf6' },
        { name: 'Pink', hex: '#ec4899' }, { name: 'Slate', hex: '#64748b' }
    ];

    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const copy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedColor(hex);
        setTimeout(() => setCopiedColor(null), 1500);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {COLORS.map(c => (
                    <button
                        key={c.hex}
                        onClick={() => copy(c.hex)}
                        className="group flex flex-col gap-4 p-6 bg-slate-50 dark:bg-white/[0.02] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] transition-all hover:-translate-y-2"
                    >
                        <div className="w-full aspect-square rounded-[2rem] shadow-xl relative overflow-hidden" style={{ backgroundColor: c.hex }}>
                            {copiedColor === c.hex && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center animate-in fade-in duration-200">
                                    <Check className="text-white" size={32} />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{c.name}</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white font-mono uppercase">{c.hex}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-8 bg-violet-600 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-violet-500/20 group cursor-pointer overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                <div className="flex items-center gap-6 relative z-10 font-bold">
                    <MousePointer2 className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <div>
                        <h4 className="text-xl font-black tracking-tight">Kendi Rengini Seç</h4>
                        <p className="text-xs text-violet-100 uppercase tracking-widest opacity-60">Canvas Render Modu Aktif</p>
                    </div>
                </div>
                <input type="color" className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer p-0 relative z-10" title="Renk Seçin" />
            </div>
        </div>
    );
}

function FigmaTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40 h-full">
            <div className="p-6 bg-violet-500/10 rounded-3xl mb-6">
                <Figma size={64} className="text-violet-500" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2 text-slate-800 dark:text-white">Figma To Code AI</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-md leading-relaxed">Figma tasarımlarınızı Tailwind CSS ve React bileşenlerine dönüştüren yapay zeka motoru entegre ediliyor.</p>
        </div>
    );
}

function FaviconTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40 h-full">
            <div className="p-6 bg-violet-500/10 rounded-3xl mb-6">
                <Globe size={64} className="text-violet-500" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2 text-slate-800 dark:text-white">Favicon Generator</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">Tek tıkla tüm tarayıcı ve platformlar için uyumlu ikon setlerini oluşturma aracı.</p>
        </div>
    );
}

function QrTab() {
    const [text, setText] = useState('https://ilyasbozdemir.dev');

    return (
        <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in duration-500 p-6">
            <div className="space-y-6">
                <div>
                    <label htmlFor="qrData" className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 mb-3 block">QR Verisi (URL, Metin, WiFi)</label>
                    <textarea
                        id="qrData"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="QR kod içeriği..."
                        title="QR Verisi"
                        className="w-full h-48 p-8 bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] focus:ring-2 focus:ring-violet-500/50 outline-none font-bold text-sm resize-none text-slate-700 dark:text-slate-300 shadow-inner"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-500/20 transition-all">SVG İNDİR</button>
                    <button className="py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all">PNG İNDİR</button>
                </div>
            </div>
            <div className="flex items-center justify-center bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-[3rem] p-12 relative group shadow-inner">
                <div className="w-64 h-64 bg-white rounded-3xl p-6 shadow-2xl shadow-violet-500/20 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <QrCode size={120} />
                    </div>
                </div>
                <div className="absolute bottom-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Real-time Render Active</div>
            </div>
        </div>
    );
}

const DesignGuide = ({ activeTab }: { activeTab: ToolTab }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-violet-600 rounded-[3rem] text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Layers size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Sparkles size={20} className="fill-white" /> Pro Tasarım İpucu
            </h3>
            <p className="text-violet-50 text-sm font-medium leading-relaxed mb-6">
                Uyumlu bir renk paleti oluşturmak için ana renginizi seçtikten sonra 60-30-10 kuralını uygulayın. Tasarımlarınız daha profesyonel görünecektir.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Gravity Design Engine v1.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <Layout size={20} className="text-violet-500" /> UI Kaynakları
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Tüm araçlarımızda Apple HIG ve Google Material design standartları baz alınmıştır. Native görünümlü modern arayüzler için ideal olan bu araçlarla hız kazanın.
            </p>
        </div>
    </div>
);
