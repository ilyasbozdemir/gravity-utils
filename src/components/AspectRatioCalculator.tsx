'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Layers, RefreshCw, Copy, Check, Ratio, Info } from 'lucide-react';

export function AspectRatioCalculator({ onBack }: { onBack: () => void }) {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [targetWidth, setTargetWidth] = useState(1280);
    const [targetHeight, setTargetHeight] = useState(720);
    const [copied, setCopied] = useState(false);

    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const rGCD = gcd(width, height);
    const simplified = `${width / rGCD}:${height / rGCD}`;

    const updateTargetHeight = useCallback((w: number) => {
        setTargetWidth(w);
        if (width > 0) setTargetHeight(Math.round((w * height) / width));
    }, [width, height]);

    const updateTargetWidth = useCallback((h: number) => {
        setTargetHeight(h);
        if (height > 0) setTargetWidth(Math.round((h * width) / height));
    }, [width, height]);

    const PRESETS = [
        { name: '16:9 (HD)', w: 16, h: 9 },
        { name: '4:3 (Legacy)', w: 4, h: 3 },
        { name: '1:1 (Square)', w: 1, h: 1 },
        { name: '21:9 (Ultrawide)', w: 21, h: 9 },
        { name: '9:16 (Mobile)', w: 9, h: 16 },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <Ratio className="w-6 h-6 text-indigo-500" /> Aspect Ratio Hesapla
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ekran ve görsel oranlarını dinamik olarak hesaplayın</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Source Ratio */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Orijinal Boyut & Oran</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Genişlik (px)</label>
                            <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || 0)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Yükseklik (px)</label>
                            <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-center">
                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{simplified}</div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">EN:BOY ORANI</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map(p => (
                            <button key={p.name} onClick={() => { setWidth(p.w * 100); setHeight(p.h * 100); }}
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 transition-all">
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculation */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-inner space-y-8">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Ölçekli Boyut Hesaplayıcı</p>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Yeni Genişlik</label>
                            <input type="number" value={targetWidth} onChange={e => updateTargetHeight(parseInt(e.target.value) || 0)}
                                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                                <RefreshCw size={14} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Yeni Yükseklik</label>
                            <input type="number" value={targetHeight} onChange={e => updateTargetWidth(parseInt(e.target.value) || 0)}
                                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>

                    <div className="pt-4 flex items-start gap-3 text-slate-500 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Info size={16} className="mt-0.5" />
                        <p className="text-[11px] leading-relaxed">Değerlerden birini değiştirdiğinizde, orijinal orana (<b>{simplified}</b>) sadık kalarak diğer değer otomatik hesaplanır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
