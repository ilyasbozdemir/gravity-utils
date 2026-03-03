import React, { useState } from 'react';
import {
    LayoutGrid, FileText, Code2, Shield, Settings2,
    Monitor, Zap, Globe, Package, Trash2, Search,
    Moon, Sun, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ToolView =
    | 'home'
    | 'pdf-manager'
    | 'office-tools'
    | 'converter'
    | 'dev-tools'
    | 'security'
    | 'system'
    | 'web-toolkit'
    | 'network-toolkit'
    | 'media-tools';

interface SidebarProps {
    currentView: ToolView;
    onViewChange: (view: ToolView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { theme, toggleTheme } = useTheme();

    const activeClass = "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]";
    const inactiveClass = "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent";

    const MenuItem = ({ icon, label, view }: { icon: React.ReactNode, label: string, view: ToolView }) => (
        <button
            onClick={() => onViewChange(view)}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 group ${currentView === view ? activeClass : inactiveClass}`}
        >
            <span className={`transition-transform duration-300 ${currentView === view ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
        </button>
    );

    return (
        <aside className="w-72 h-full bg-[#f8f9fa] dark:bg-[#06070a] border-r border-slate-200 dark:border-white/5 flex flex-col z-50 transition-colors duration-300">
            {/* Branding Region */}
            <div className="px-8 border-b border-slate-200 dark:border-white/5 h-20 flex items-center bg-white dark:bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white fill-white" size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">Gravity</h1>
                        <p className="text-[9px] font-bold text-blue-500 tracking-[0.3em] uppercase mt-1">Desktop Engine</p>
                    </div>
                </div>
            </div>

            {/* Quick Search */}
            <div className="p-4 border-b border-slate-200 dark:border-white/5">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Araç ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar no-drag">
                <div className="px-6 mb-4">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">Ana Panel</p>
                </div>
                <MenuItem icon={<LayoutGrid size={18} />} label="Hızlı Erişim" view="home" />

                <div className="px-6 mt-8 mb-4">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">Döküman Motoru</p>
                </div>
                <MenuItem icon={<FileText size={18} />} label="PDF Merkezi" view="pdf-manager" />
                <MenuItem icon={<Globe size={18} />} label="Ofis Araçları" view="office-tools" />
                <MenuItem icon={<Package size={18} />} label="Dönüştürücü" view="converter" />

                <div className="px-6 mt-8 mb-4">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">Geliştirici & Sistem</p>
                </div>
                <MenuItem icon={<Code2 size={18} />} label="Kod & JSON" view="dev-tools" />
                <MenuItem icon={<Globe size={18} />} label="Web Araçları" view="web-toolkit" />
                <MenuItem icon={<Zap size={18} />} label="Ağ & Network" view="network-toolkit" />
                <MenuItem icon={<ShieldCheck size={18} />} label="Güvenlik & Hash" view="security" />
                <MenuItem icon={<Settings2 size={18} />} label="Sistem Paneli" view="system" />
            </nav>

            {/* Footer Sign */}
            <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                <div className="flex items-center gap-4 mb-6 bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none">Safe Mode</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tight">Yerel İşleme Aktif</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Görünüm</span>
                    <div className="flex bg-slate-200 dark:bg-white/5 rounded-lg p-1">
                        <button
                            title="Koyu Mod"
                            onClick={() => theme === 'light' && toggleTheme()}
                            className={`p-1 px-2 rounded-md transition-all ${theme === 'dark' ? 'text-blue-400 bg-white/5' : 'text-slate-400'}`}
                        >
                            <Moon size={12} />
                        </button>
                        <button
                            title="Açık Mod"
                            onClick={() => theme === 'dark' && toggleTheme()}
                            className={`p-1 px-2 rounded-md transition-all ${theme === 'light' ? 'text-blue-600 bg-white' : 'text-slate-600'}`}
                        >
                            <Sun size={12} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-2 px-2">
                    <div className="w-6 h-px bg-slate-300 dark:bg-slate-800"></div>
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest leading-none">Bozdemir Core</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-tight px-2">Version 3.1.0-PRO-FINAL</p>
            </div>
        </aside>
    );
};
