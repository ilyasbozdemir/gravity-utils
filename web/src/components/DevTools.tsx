'use client';

import React, { useState } from 'react';
import {
    ArrowLeft, Code2, Braces, Search, Terminal,
    Database, FileCode, Hash, RefreshCw, Zap
} from 'lucide-react';
import { JsonFormatter } from './JsonFormatter';
import { SqlFormatter } from './SqlFormatter';
import { RegexTester } from './RegexTester';
import { JwtDebugger } from './JwtDebugger';

type DevSubView = 'dashboard' | 'json' | 'sql' | 'regex' | 'jwt';

interface DevToolsProps {
    onBack?: () => void;
    initialView?: DevSubView;
}

export const DevTools: React.FC<DevToolsProps> = ({ onBack, initialView = 'dashboard' }) => {
    const [view, setView] = useState<DevSubView>(initialView);

    if (view === 'json') return <JsonFormatter onBack={() => setView('dashboard')} />;
    if (view === 'sql') return <SqlFormatter onBack={() => setView('dashboard')} />;
    if (view === 'regex') return <RegexTester onBack={() => setView('dashboard')} />;
    if (view === 'jwt') return <JwtDebugger onBack={() => setView('dashboard')} />;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 w-fit">
                        <Terminal size={14} className="fill-blue-400" /> BOZDEMIR DEV TOOLS WEB v4.0
                    </div>
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
                    Geliştirici <span className="text-blue-500 italic">Laboratuvarı.</span>
                </h1>
                <p className="text-slate-500 text-lg font-bold tracking-tight max-w-2xl">
                    Kod, JSON, Regex ve Debugger araçları web hızıyla. Tamamen güvenli
                    ve <span className="text-blue-500">Bozdemir Core</span> motoru ile tarayıcı içi veri işleme.
                </p>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DevCard
                    title="JSON İşlemci Pro"
                    desc="Veri ağacı görselleştirme ve formatlama."
                    icon={<Braces size={32} />}
                    color="amber"
                    onClick={() => setView('json')}
                />
                <DevCard
                    title="SQL Sihirbazı"
                    desc="Sorguları düzenle ve optimize et."
                    icon={<Database size={32} />}
                    color="blue"
                    onClick={() => setView('sql')}
                />
                <DevCard
                    title="Regex Atölyesi"
                    desc="Düzenli ifadeleri test et ve oluştur."
                    icon={<Search size={32} />}
                    color="emerald"
                    onClick={() => setView('regex')}
                />
                <DevCard
                    title="JWT & Auth Debug"
                    desc="Token çözümleme ve doğrulama araçları."
                    icon={<Hash size={32} />}
                    color="rose"
                    onClick={() => setView('jwt')}
                />
            </div>

            {/* Premium Info Panel */}
            <div className="bg-[#0e121b] border border-white/5 rounded-[3rem] p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <Code2 size={200} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">Native Güç, Web Esnekliği.</h3>
                        <p className="text-slate-400 font-bold leading-relaxed italic uppercase tracking-tight text-sm">
                            Geliştirici araçlarımız Electron çekirdeğinden WebAssembly katmanına taşındı. Artık devasa JSON dosyalarını ve karmaşık SQL şemalarını tarayıcınızda donmadan saniyeler içinde işleyebilirsiniz.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase text-blue-400 tracking-widest">Low Latency</span>
                            <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase text-emerald-400 tracking-widest">Self-Hosted Engine</span>
                            <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase text-rose-400 tracking-widest">Memory Optimized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DevCard = ({ title, desc, icon, color, onClick }: any) => {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    };

    return (
        <button
            onClick={onClick}
            className="group p-8 text-left bg-white dark:bg-[#06070a] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] transition-all hover:bg-slate-50 dark:hover:bg-[#0e121b] hover:border-blue-500/30 hover:-translate-y-2 active:scale-95 shadow-xl dark:shadow-none"
        >
            <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
                {icon}
            </div>
            <h4 className="text-lg font-black mb-1 text-slate-800 dark:text-white uppercase tracking-tight leading-none">{title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-600 font-bold leading-tight uppercase tracking-widest mt-2">{desc}</p>
        </button>
    );
};
