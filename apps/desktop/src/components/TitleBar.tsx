import React from 'react';
import { Globe, Zap, RefreshCw, Monitor } from 'lucide-react';

const TitleBar: React.FC = () => {
    return (
        <div className="h-8 w-full flex items-center justify-between px-4 bg-slate-50 dark:bg-[#0b101b] border-b border-slate-200 dark:border-white/5 drag-region sticky top-0 z-[100] active:cursor-grabbing group transition-colors duration-300">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity no-drag select-none cursor-default">
                    <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white transition-colors duration-300">Gravity <span className="text-blue-500">Desktop</span></span>
                </div>

                <div className="hidden md:flex items-center gap-3 no-drag">
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        HB: 60FPS
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 pr-[120px]"> {/* Space for Electron window controls */}
                <a
                    href="https://gravity-utils.ilyasbozdemir.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Web Sürümünü Dene"
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:scale-105 no-drag cursor-pointer"
                >
                    <Globe size={10} /> Web
                </a>

                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500/80 no-drag select-none cursor-default bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                    <RefreshCw size={10} className="animate-spin-slow" /> v3.1.0
                </div>
            </div>
        </div>
    );
};

export default TitleBar;
