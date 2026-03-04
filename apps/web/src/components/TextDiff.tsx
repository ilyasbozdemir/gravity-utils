'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Layers, Split, Layout, Info, Terminal } from 'lucide-react';

export const TextDiff: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [text1, setText1] = useState('{\n  "name": "Gravity Utils",\n  "version": "1.0.0",\n  "status": "Beta"\n}');
    const [text2, setText2] = useState('{\n  "name": "Gravity Utils Pro",\n  "version": "2.0.0",\n  "status": "Production",\n  "theme": "Dark"\n}');
    const [diffResult, setDiffResult] = useState<Array<{ type: 'added' | 'removed' | 'equal'; value: string }>>([]);
    const [mode, setMode] = useState<'side-by-side' | 'inline'>('side-by-side');

    const computeDiff = (s1: string, s2: string) => {
        const lines1 = s1.split('\n');
        const lines2 = s2.split('\n');
        const results: Array<{ type: 'added' | 'removed' | 'equal'; value: string }> = [];

        // Simple line-based diff algorithm for demonstration (LCS would be better but this is fine for now)
        let i = 0, j = 0;
        while (i < lines1.length || j < lines2.length) {
            if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
                results.push({ type: 'equal', value: lines1[i] });
                i++; j++;
            } else {
                // Check if lines1[i] exists later in lines2
                const foundIn2 = lines2.slice(j).indexOf(lines1[i]);
                const foundIn1 = lines1.slice(i).indexOf(lines2[j]);

                if (foundIn2 !== -1 && (foundIn1 === -1 || foundIn2 <= foundIn1)) {
                    // Added lines in 2
                    for (let k = 0; k < foundIn2; k++) {
                        results.push({ type: 'added', value: lines2[j + k] });
                    }
                    j += foundIn2;
                } else if (foundIn1 !== -1) {
                    // Removed lines in 1
                    for (let k = 0; k < foundIn1; k++) {
                        results.push({ type: 'removed', value: lines1[i + k] });
                    }
                    i += foundIn1;
                } else {
                    // Just different lines
                    if (i < lines1.length) {
                        results.push({ type: 'removed', value: lines1[i] });
                        i++;
                    }
                    if (j < lines2.length) {
                        results.push({ type: 'added', value: lines2[j] });
                        j++;
                    }
                }
            }
        }
        setDiffResult(results);
    };

    useEffect(() => {
        computeDiff(text1, text2);
    }, [text1, text2]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Metin Karşılaştırıcı <span className="text-indigo-500">(Diff Tool)</span></h1>
                        <p className="text-slate-500 text-sm font-medium">İki metin arasındaki farkları satır satır analiz edin.</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <button
                        onClick={() => setMode('side-by-side')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'side-by-side' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Split size={14} /> Yan Yana
                    </button>
                    <button
                        onClick={() => setMode('inline')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'inline' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layout size={14} /> Tek Liste
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Metin A (Orijinal)</label>
                    <textarea
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 font-mono text-[12px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-sm custom-scrollbar"
                        placeholder="İlk metni buraya yapıştırın..."
                        spellCheck={false}
                        title="Orijinal Metin"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Metin B (Değiştirilmiş)</label>
                    <textarea
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 font-mono text-[12px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-sm custom-scrollbar"
                        placeholder="İkinci metni buraya yapıştırın..."
                        spellCheck={false}
                        title="Değiştirilmiş Metin"
                    />
                </div>
            </div>

            {/* Results Area */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> {diffResult.filter(d => d.type === 'added').length} Eklendi</span>
                        <span className="flex items-center gap-1.5 text-rose-400"><div className="w-2 h-2 bg-rose-500 rounded-full" /> {diffResult.filter(d => d.type === 'removed').length} Silindi</span>
                    </div>
                </div>

                <div className="p-8 font-mono text-[12px] leading-relaxed max-h-[600px] overflow-auto custom-scrollbar">
                    {mode === 'inline' ? (
                        <div className="space-y-0.5">
                            {diffResult.map((line, idx) => (
                                <div key={idx} className={`flex gap-4 px-4 py-1 rounded transition-colors ${line.type === 'added' ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' :
                                        line.type === 'removed' ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500 italic' :
                                            'text-slate-400 opacity-60'
                                    }`}>
                                    <span className="w-8 shrink-0 text-slate-600 text-[10px] text-right select-none">{idx + 1}</span>
                                    <span className="shrink-0 w-4 font-bold">{line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}</span>
                                    <pre className="whitespace-pre-wrap">{line.value}</pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="bg-slate-900 space-y-0.5 p-4">
                                {diffResult.map((line, idx) => (
                                    line.type !== 'added' && (
                                        <div key={idx} className={`flex gap-3 px-2 py-0.5 rounded ${line.type === 'removed' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400 opacity-60'}`}>
                                            <span className="w-6 shrink-0 text-slate-600 text-[10px] select-none">{idx + 1}</span>
                                            <pre className="whitespace-pre-wrap font-mono">{line.value}</pre>
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="bg-slate-900 space-y-0.5 p-4 border-l border-slate-800">
                                {diffResult.map((line, idx) => (
                                    line.type !== 'removed' && (
                                        <div key={idx} className={`flex gap-3 px-2 py-0.5 rounded ${line.type === 'added' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 opacity-60'}`}>
                                            <span className="w-6 shrink-0 text-slate-600 text-[10px] select-none">{idx + 1}</span>
                                            <pre className="whitespace-pre-wrap font-mono">{line.value}</pre>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Masterclass Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-12 pb-20 pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
                        <Info size={20} className="text-indigo-500" /> Analiz Rehberi
                    </h4>
                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Check size={16} /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Yeşil Satırlar (+)</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Yeni eklenen satırları veya değiştirilmiş bloğun yeni halini temsil eder.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Terminal size={16} /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Kırmızı Satırlar (-)</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Orijinal metinden silinen veya güncellenmiş satırları gösterir.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 p-8 bg-indigo-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
                    <RefreshCw size={200} className="absolute -right-20 -bottom-20 opacity-5 group-hover:rotate-45 transition-transform duration-1000" />
                    <div className="flex-1 space-y-4 relative z-10">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Hıza İhtiyacınız mı Var?</h4>
                        <p className="text-indigo-50 text-base font-bold leading-relaxed italic">
                            "Dosya karşılaştırması yapmak artık saniyeler sürüyor. Git commit öncesi metin analizleri veya JSON farklarını yakalamak için en hızlı çözüm."
                        </p>
                        <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/20">
                            <Layers size={14} className="animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Çevrimdışı Çalışır & %100 Güvenlidir</span>
                        </div>
                    </div>
                    <div className="w-fit p-6 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
                        <Layout className="w-20 h-20 opacity-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};
