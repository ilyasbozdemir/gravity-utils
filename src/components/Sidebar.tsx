import React, { useState } from 'react';
import {
    Search, FileText, ImageIcon, ShieldCheck, Zap,
    Code, Globe, Hash, Calculator, Layers, Settings,
    Smartphone, QrCode, Lock, Share2, Archive, FileJson,
    X, Home, Type, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ToolView = 'home' | 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'imagetopdf' | 'case' | 'string';

interface SidebarProps {
    currentView: ToolView;
    onViewChange: (view: ToolView) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    id: ToolView;
    title: string;
    icon: React.ReactNode;
    category: string;
}

const CATEGORIES = [
    { id: 'files', title: 'Dosya & PDF', icon: <FileText size={16} /> },
    { id: 'media', title: 'Görsel & Medya', icon: <ImageIcon size={16} /> },
    { id: 'dev', title: 'Geliştirici', icon: <Code size={16} /> },
    { id: 'security', title: 'Güvenlik', icon: <ShieldCheck size={16} /> },
    { id: 'utils', title: 'Genel Araçlar', icon: <Settings size={16} /> },
];

const NAV_ITEMS: NavItem[] = [
    { id: 'convert', title: 'Dosya Dönüştürücü', icon: <Layers size={18} />, category: 'files' },
    { id: 'pdf', title: 'PDF Yönetimi', icon: <FileText size={18} />, category: 'files' },
    { id: 'inspect', title: 'Arşiv Görüntüleyici', icon: <Archive size={18} />, category: 'files' },

    { id: 'optimize', title: 'Resim Sıkıştırıcı', icon: <ImageIcon size={18} />, category: 'media' },
    { id: 'social', title: 'Sosyal Medya Boyut', icon: <Smartphone size={18} />, category: 'media' },
    { id: 'favicon', title: 'Favicon Oluşturucu', icon: <ImageIcon size={18} />, category: 'media' },
    { id: 'qr', title: 'QR Kod İşlemleri', icon: <QrCode size={18} />, category: 'media' },

    { id: 'json', title: 'JSON Formatlayıcı', icon: <FileJson size={18} />, category: 'dev' },
    { id: 'yaml', title: 'YAML / JSON Çevirici', icon: <Code size={18} />, category: 'dev' },
    { id: 'jwt', title: 'JWT Debugger', icon: <ShieldCheck size={18} />, category: 'dev' },
    { id: 'base64', title: 'Base64 Çevirici', icon: <Share2 size={18} />, category: 'dev' },
    { id: 'url', title: 'URL Encoder', icon: <Globe size={18} />, category: 'dev' },
    { id: 'uuid', title: 'UUID Oluşturucu', icon: <Zap size={18} />, category: 'dev' },

    { id: 'encrypt', title: 'Dosya Şifreleyici', icon: <Lock size={18} />, category: 'security' },
    { id: 'hash', title: 'Hash Oluşturucu', icon: <Hash size={18} />, category: 'security' },
    { id: 'exif', title: 'Exif Temizleyici', icon: <Settings size={18} />, category: 'security' },

    { id: 'units', title: 'Birim Çevirici', icon: <Calculator size={18} />, category: 'utils' },
    { id: 'text', title: 'Dosya Analizi', icon: <FileText size={18} />, category: 'utils' },
    { id: 'case', title: 'Harf Çevirici', icon: <Type size={18} />, category: 'utils' },
    { id: 'string', title: 'Metin Müfettişi', icon: <Search size={18} />, category: 'utils' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = NAV_ITEMS.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-72 
                    bg-white dark:bg-[#0b101b] 
                    border-r border-slate-200 dark:border-white/5
                    transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Brand */}
                <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => { onViewChange('home'); onClose(); }}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <Zap size={18} className="text-white fill-white" />
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Gravity</span>
                            <span className="text-lg font-black tracking-tight text-blue-600 uppercase italic ml-1">Utils</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        title="Menüyü Kapat"
                        aria-label="Menüyü Kapat"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Araç ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <button
                        onClick={() => { onViewChange('home'); onClose(); }}
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
                                            onClick={() => { onViewChange(item.id); onClose(); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${currentView === item.id
                                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <span className={`transition-colors ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                                {item.icon}
                                            </span>
                                            {item.title}
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
                            <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 leading-none mb-0.5">Güvenli İşlem</p>
                            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/60 leading-tight">Veriler tarayıcıdan çıkmaz.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
