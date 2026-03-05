import React, { useState } from 'react';
import {
    Search, FileText, ImageIcon, ShieldCheck, Zap,
    Code, Globe, Hash, Calculator, Layers, Settings,
    Smartphone, QrCode, Lock, Share2, Archive, FileJson,
    X, Home, Type, Sun, Moon,
    FileCode, Database, CaseSensitive, Clock, Network,
    Code2, Cable, RefreshCw, Split, HelpCircle, Merge,
    Scissors, Minimize2, Stamp, Sparkles, Camera, Repeat,
    Terminal, Palette, FileSpreadsheet, ArrowLeft, Copy, Check, Download, AlertCircle, Shield, Plus, Monitor, Settings2
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
    | 'media-tools'
    | 'data-tools'
    | 'text-tools'
    | 'design-tools'
    | 'document-toolkit'
    | 'check-toolkit'
    | 'desktop-toolkit';

interface SidebarProps {
    currentView: ToolView;
    onViewChange: (view: ToolView) => void;
}

interface NavItem {
    id: ToolView;
    title: string;
    icon: React.ReactNode;
    category: string;
}

const CATEGORIES = [
    { id: 'office', title: 'Ofis & Belge', icon: <FileText size={16} /> },
    { id: 'text-content', title: 'Metin & İçerik', icon: <Type size={16} /> },
    { id: 'media', title: 'Görsel & Medya', icon: <ImageIcon size={16} /> },
    { id: 'dev', title: 'Geliştirici', icon: <Code size={16} /> },
    { id: 'seo', title: 'Web & SEO', icon: <Globe size={16} /> },
    { id: 'calculators', title: 'Hesaplamalar', icon: <Calculator size={16} /> },
    { id: 'checks', title: 'Form & Kontrol', icon: <ShieldCheck size={16} /> },
    { id: 'security', title: 'Güvenlik & Gizlilik', icon: <Lock size={16} /> },
    { id: 'desktop', title: 'Masaüstü & Sistem', icon: <Monitor size={16} /> },
];

const NAV_ITEMS: NavItem[] = [
    // Ana Panel
    { id: 'home', title: 'Hızlı Erişim', icon: <Home size={18} />, category: 'desktop' },

    // Döküman Motoru
    { id: 'pdf-manager', title: 'PDF Merkezi', icon: <FileText size={18} />, category: 'office' },
    { id: 'document-toolkit', title: 'Belge İşleme Merkezi', icon: <FileText size={18} />, category: 'office' },
    { id: 'office-tools', title: 'Ofis Araçları', icon: <Globe size={18} />, category: 'office' },
    { id: 'converter', title: 'Dosya Dönüştürücü', icon: <Layers size={18} />, category: 'office' },

    // Geliştirici & Sistem
    { id: 'dev-tools', title: 'Kod & JSON Araçları', icon: <Code2 size={18} />, category: 'dev' },
    { id: 'web-toolkit', title: 'Web Geliştirici Kutusu', icon: <Globe size={18} />, category: 'seo' },
    { id: 'network-toolkit', title: 'Ağ & Network', icon: <Zap size={18} />, category: 'seo' },
    { id: 'security', title: 'Güvenlik & Hash', icon: <Shield size={18} />, category: 'security' },
    { id: 'check-toolkit', title: 'Güvenlik & Doğrulama', icon: <ShieldCheck size={18} />, category: 'security' },

    // Medya & Tasarım
    { id: 'media-tools', title: 'Medya Kitaplığı', icon: <ImageIcon size={18} />, category: 'media' },
    { id: 'design-tools', title: 'Tasarım & UI Lab', icon: <Palette size={18} />, category: 'media' },

    // Veri & Metin
    { id: 'data-tools', title: 'Veri İşleme Merkezi', icon: <Database size={18} />, category: 'dev' },
    { id: 'text-tools', title: 'Metin Araçları Pro', icon: <Type size={18} />, category: 'text-content' },

    // System
    { id: 'desktop-toolkit', title: 'Desktop Engine Paneli', icon: <Monitor size={18} />, category: 'desktop' },
    { id: 'system', title: 'Sistem Bilgisi', icon: <Settings2 size={18} />, category: 'desktop' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = NAV_ITEMS.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside
            className={`
                    relative z-50 h-screen w-72 
                    bg-white dark:bg-[#0b101b] 
                    border-r border-slate-200 dark:border-white/5
                    flex flex-col transition-colors duration-300
                `}
        >
            {/* Brand */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                <button
                    className="flex items-center gap-3 cursor-pointer group w-full text-left"
                    onClick={() => onViewChange('home')}
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <div className="flex items-center">
                            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Gravity</span>
                            <span className="text-lg font-black tracking-tight text-blue-600 uppercase italic ml-1">Desktop</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider -mt-1 transition-colors">
                                ilyasbozdemir.dev
                            </span>
                            <span className="text-[8px] font-black bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-md mt-1 self-start border border-blue-500/20">
                                BOZDEMIR ENGINE v3.1.0
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Araç ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <button
                    onClick={() => onViewChange('home')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all mb-6 ${currentView === 'home'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Home size={18} />
                    Ana Sayfa
                </button>

                {CATEGORIES.map(cat => {
                    const catItems = filteredItems.filter(item => item.category === cat.id);
                    if (catItems.length === 0) return null;

                    return (
                        <div key={cat.id} className="mb-6">
                            <div className="flex items-center gap-2 px-3 mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {cat.title}
                            </div>
                            <div className="space-y-0.5">
                                {catItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => onViewChange(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${currentView === item.id
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className={`transition-colors flex shrink-0 items-center justify-center ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                            {item.icon}
                                        </span>
                                        <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0e17]">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Görünüm</span>
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                    >
                        {theme === 'dark' ? <Moon size={14} className="text-blue-400" /> : <Sun size={14} className="text-amber-500" />}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {theme === 'dark' ? 'Koyu' : 'Açık'}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 leading-none mb-0.5">Yerel Motor Aktif</p>
                        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/60 leading-tight">Yüksek performans devrede.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

