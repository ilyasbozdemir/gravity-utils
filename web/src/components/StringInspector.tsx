import React, { useState } from 'react';
import { ArrowLeft, Info, Scale } from 'lucide-react';

interface StringInspectorProps {
    onBack: () => void;
}

export const StringInspector: React.FC<StringInspectorProps> = ({ onBack }) => {
    const [input, setInput] = useState('');

    const stats = {
        chars: input.length,
        charsNoSpace: input.replace(/\s/g, '').length,
        words: input.trim() ? input.trim().split(/\s+/).length : 0,
        lines: input ? input.split('\n').length : 0,
        bytes: new TextEncoder().encode(input).length,
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-cyan-500/20 border border-cyan-500/40 text-white rounded-lg hover:bg-cyan-500/40 transition-all"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">Metin Müfettişi</h2>
                    <p className="text-sm text-cyan-400 font-medium tracking-wide">Detaylı Karakter ve Kelime Analizi</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 block text-left">İncelenecek Metin</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="İncelemek istediğiniz metni buraya yapıştırın..."
                        className="w-full h-[200px] bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-1 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Karakter</span>
                        <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stats.chars}</span>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-1 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Boşluksuz</span>
                        <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stats.charsNoSpace}</span>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-1 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Kelime</span>
                        <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stats.words}</span>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-1 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Satır</span>
                        <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stats.lines}</span>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-1 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Boyut (Byte)</span>
                        <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stats.bytes}</span>
                    </div>
                    <div className="p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex flex-col items-center justify-center gap-1">
                        <Scale size={24} className="text-cyan-400 mb-1" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-black">Detaylı Analiz</span>
                    </div>
                </div>

                <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                        <Info size={16} className="text-cyan-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Metin Bilgisi</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                            <span className="text-slate-500">En sık karakter</span>
                            <span className="text-slate-200 font-mono font-bold">
                                {input ? Object.entries([...input].reduce((a: Record<string, number>, c) => (a[c] = (a[c] || 0) + 1, a), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0][0] : '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                            <span className="text-slate-500">Benzersiz kelime</span>
                            <span className="text-slate-200 font-mono font-bold">
                                {input ? new Set(input.toLocaleLowerCase('tr-TR').trim().split(/\s+/)).size : 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
