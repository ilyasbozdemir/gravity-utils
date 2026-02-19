'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Cable, Check, RotateCcw, Play, Pause, Info, AlertTriangle, Zap } from 'lucide-react';

type CableStandard = 'T568B' | 'T568A' | 'RJ11';
type CableType = 'Straight' | 'Crossover' | 'Rollover' | 'Custom';

interface PinMapping {
    [key: number]: number; // master -> remote
}

const PIN_COLORS_T568B = [
    { label: 'O/W', color: 'bg-orange-200 border-orange-400' },
    { label: 'O', color: 'bg-orange-500 border-orange-600' },
    { label: 'G/W', color: 'bg-green-200 border-green-400' },
    { label: 'B', color: 'bg-blue-500 border-blue-600' },
    { label: 'B/W', color: 'bg-blue-200 border-blue-400' },
    { label: 'G', color: 'bg-green-500 border-green-600' },
    { label: 'Br/W', color: 'bg-amber-200 border-amber-400' },
    { label: 'Br', color: 'bg-amber-800 border-amber-900' },
];

const PIN_COLORS_T568A = [
    { label: 'G/W', color: 'bg-green-200 border-green-400' },
    { label: 'G', color: 'bg-green-500 border-green-600' },
    { label: 'O/W', color: 'bg-orange-200 border-orange-400' },
    { label: 'B', color: 'bg-blue-500 border-blue-600' },
    { label: 'B/W', color: 'bg-blue-200 border-blue-400' },
    { label: 'O', color: 'bg-orange-500 border-orange-600' },
    { label: 'Br/W', color: 'bg-amber-200 border-amber-400' },
    { label: 'Br', color: 'bg-amber-800 border-amber-900' },
];

const PIN_COLORS_RJ11 = [
    { label: 'W', color: 'bg-white border-slate-300' },
    { label: 'B', color: 'bg-black border-slate-700' },
    { label: 'R', color: 'bg-red-500 border-red-600' },
    { label: 'G', color: 'bg-green-500 border-green-600' },
    { label: 'Y', color: 'bg-yellow-400 border-yellow-500' },
    { label: 'Bl', color: 'bg-blue-500 border-blue-600' },
];

const PRESET_MAPPINGS: Record<CableType, PinMapping> = {
    'Straight': { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 },
    'Crossover': { 1: 3, 2: 6, 3: 1, 4: 4, 5: 5, 6: 2, 7: 7, 8: 8 },
    'Rollover': { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 },
    'Custom': { 1: 3, 2: 4, 3: 1, 4: 2, 5: 5, 6: 6, 7: 8, 8: 7 }, // Random miswire example
};

export function NetworkCableTester({ onBack }: { onBack: () => void }) {
    const [mode, setMode] = useState<'simulation' | 'diagnostic'>('simulation');
    const [standard, setStandard] = useState<CableStandard>('T568B');
    const [type, setType] = useState<CableType>('Straight');
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePin, setActivePin] = useState<number | null>(null);
    const [manualMap, setManualMap] = useState<Record<number, number>>({});
    const [speed, setSpeed] = useState(800);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const pins = standard === 'RJ11' ? 6 : 8;
    const pinColors = standard === 'T568A' ? PIN_COLORS_T568A : standard === 'T568B' ? PIN_COLORS_T568B : PIN_COLORS_RJ11;

    const startScan = useCallback(() => {
        setIsPlaying(true);
        setActivePin(1);
        if (mode === 'diagnostic') setManualMap({});
    }, [mode]);

    const stopScan = useCallback(() => {
        setIsPlaying(false);
        setActivePin(null);
    }, []);

    useEffect(() => {
        if (isPlaying && mode === 'simulation') {
            timerRef.current = setInterval(() => {
                setActivePin(prev => {
                    if (prev === null || prev >= pins) return 1;
                    return prev + 1;
                });
            }, speed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, pins, speed, mode]);

    const handleRemoteClick = (remoteIdx: number) => {
        if (mode !== 'diagnostic' || activePin === null) return;

        setManualMap(prev => ({ ...prev, [activePin]: remoteIdx }));

        // Auto advance master pin
        if (activePin < pins) {
            setActivePin(activePin + 1);
        } else {
            setIsPlaying(false);
            setActivePin(null);
        }
    };

    const getRemoteStatus = (idx: number) => {
        if (mode === 'simulation') {
            return activePin && PRESET_MAPPINGS[type][activePin] === idx;
        }
        // In diagnostic mode, show the mapping for the active pin OR show all recorded mappings if not playing
        if (activePin) return manualMap[activePin] === idx;
        return Object.values(manualMap).includes(idx);
    };

    const analyzeManualMap = () => {
        const pinCount = pins;
        if (Object.keys(manualMap).length < pinCount) return { label: 'Eksik Veri', desc: 'Tüm pinleri eşleştirin.', color: 'text-slate-400' };

        const mappedEntries = Object.entries(manualMap).map(([m, r]) => [parseInt(m), r]);

        // 1. Check for Straight
        const isStraight = mappedEntries.every(([m, r]) => m === r);
        if (isStraight) return { label: 'Düz (Straight)', desc: 'İki uç da aynı standartta.', color: 'text-green-500' };

        // 2. Check for Crossover (T568A to T568B)
        // 1-3, 2-6 mapping
        const crossoverPairs: Record<number, number> = { 1: 3, 2: 6, 3: 1, 6: 2 };
        const isCrossover = mappedEntries.every(([m, r]) => {
            if (crossoverPairs[m]) return r === crossoverPairs[m];
            return m === r;
        });
        if (isCrossover) return { label: 'Çapraz (Crossover)', desc: 'T568A ve T568B arası bağlantı.', color: 'text-amber-500' };

        // 3. Check for Rollover (Console)
        const isRollover = mappedEntries.every(([m, r]) => r === (pinCount - m + 1));
        if (isRollover) return { label: 'Ters (Rollover)', desc: 'Console kablosu dizilimi.', color: 'text-blue-500' };

        return { label: 'Özel / Hatalı', desc: 'Standart dışı veya arızalı dizilim.', color: 'text-red-500' };
    };

    const verdict = mode === 'diagnostic' ? analyzeManualMap() : null;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                        <Cable className="w-6 h-6 text-indigo-500" /> Kablo Pin Dizilimi & Teşhis
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">RJ45 ve RJ11 interaktif test simülasyonu</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                        {/* Mode Switcher */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                            <button onClick={() => { setMode('simulation'); stopScan(); }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'simulation' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                                Simülasyon
                            </button>
                            <button onClick={() => { setMode('diagnostic'); stopScan(); }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'diagnostic' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                                Manuel Teşhis
                            </button>
                        </div>

                        {/* Standard Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-indigo-500" /> Standart
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {(['T568B', 'T568A', 'RJ11'] as CableStandard[]).map(s => (
                                    <button key={s} onClick={() => { setStandard(s); setType('Straight'); stopScan(); setManualMap({}); }}
                                        className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${standard === s ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                        <div className="font-bold">{s}</div>
                                        {standard === s && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {mode === 'simulation' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                    <Info size={14} className="text-indigo-500" /> Kablo Tipi
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['Straight', 'Crossover', 'Rollover'] as CableType[]).map(t => (
                                        <button key={t} onClick={() => { setType(t); stopScan(); }}
                                            className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${type === t ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            <div className="font-bold">{t}</div>
                                            {type === t && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label htmlFor="test-speed" className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                                <span>Hız</span>
                                <span className="text-indigo-500">{speed}ms</span>
                            </label>
                            <input id="test-speed" type="range" min={200} max={2000} step={100} value={speed} onChange={e => setSpeed(parseInt(e.target.value))}
                                title="Hız Ayarı" className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Main Visual Panel */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 dark:bg-slate-800 hidden md:block opacity-50"></div>
                        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/20 pointer-events-none"></div>

                        {/* Master Unit */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-slate-200 dark:bg-slate-800 rounded-[2rem] p-6 border-4 border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col items-center gap-6">
                                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">MASTER</div>
                                <div className="grid grid-cols-4 gap-4 w-full px-4">
                                    {Array.from({ length: pins }).map((_, i) => (
                                        <button key={i} onClick={() => mode === 'diagnostic' && setActivePin(i + 1)}
                                            className={`flex flex-col items-center gap-2 group/pin ${mode === 'diagnostic' ? 'cursor-pointer' : 'cursor-default'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${activePin === i + 1 ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-125' : manualMap[i + 1] ? 'bg-indigo-500/50 border-indigo-400/50' : 'bg-slate-400/20 border-slate-400/30'}`}></div>
                                            <span className="text-[10px] font-mono font-bold opacity-60">{i + 1}</span>
                                        </button>
                                    ))}
                                </div>
                                {mode === 'diagnostic' && (
                                    <div className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full animate-pulse">
                                        Test edilecek pini seçin
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remote Unit */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-b from-orange-500 to-amber-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-slate-200 dark:bg-slate-800 rounded-[2rem] p-6 border-4 border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col items-center gap-6">
                                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">REMOTE</div>
                                <div className="grid grid-cols-4 gap-4 w-full px-4">
                                    {Array.from({ length: pins }).map((_, i) => (
                                        <button key={i} onClick={() => handleRemoteClick(i + 1)}
                                            className={`flex flex-col items-center gap-2 group/pin ${mode === 'diagnostic' && activePin ? 'cursor-pointer' : 'cursor-default'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${getRemoteStatus(i + 1) ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-125' : 'bg-slate-400/20 border-slate-400/30'}`}></div>
                                            <span className="text-[10px] font-mono font-bold opacity-60">{i + 1}</span>
                                        </button>
                                    ))}
                                </div>
                                {mode === 'diagnostic' && activePin && (
                                    <div className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full animate-bounce">
                                        {activePin}. Master pin nerede yanıyor?
                                    </div>
                                )}
                                {mode === 'diagnostic' && !activePin && (
                                    <div className="text-[9px] font-bold opacity-40 px-2 py-1">
                                        Bekleniyor...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls & Diagnosis Footer */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                            <div className="flex gap-2">
                                {!isPlaying ? (
                                    <button onClick={startScan} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                                        <Play size={18} fill="currentColor" /> {mode === 'diagnostic' ? 'Teşhis Başlat' : 'Testi Başlat'}
                                    </button>
                                ) : (
                                    <button onClick={stopScan} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                                        <Pause size={18} fill="currentColor" /> Durdur
                                    </button>
                                )}
                                <button onClick={() => { stopScan(); setManualMap({}); setActivePin(null); }}
                                    title="Sıfırla" className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">
                                    <RotateCcw size={18} />
                                </button>
                            </div>

                            {mode === 'diagnostic' && verdict && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-indigo-500/10 ${verdict.color}`}>
                                        <Zap size={16} />
                                    </div>
                                    <div className="text-xs">
                                        <span className={`font-black uppercase block ${verdict.color}`}>{verdict.label}</span>
                                        <span className="opacity-60">{verdict.desc}</span>
                                    </div>
                                </div>
                            )}

                            {mode === 'simulation' && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${type === 'Straight' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                        <Check size={16} />
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-bold block">{type === 'Straight' ? 'Simülasyon Aktif' : 'Çapraz Bağlantı'}</span>
                                        <span className="opacity-60">Master pin {activePin || '-'} aktif.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">{standard} Renk Şeması</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {pinColors.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-3 h-6 rounded-sm border ${p.color}`}></div>
                                        <span className="text-[10px] font-mono text-slate-400 w-3">{i + 1}</span>
                                        <span className="text-xs font-bold">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500 text-white rounded-2xl">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-indigo-900 dark:text-indigo-300 uppercase leading-none mb-2">Nasıl Kullanılır?</h3>
                                <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 leading-relaxed font-medium">
                                    <b>Teşhis Modu:</b> Sahadaki kabloyu test ederken master cihazdaki hangi pine akım verdiğinizde remote tarafta hangi LED yanıyorsa o LED'e tıklayın. Tüm pinleri işaretlediğinizde sistem kablo tipini otomatik analiz eder.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

