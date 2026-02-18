import React, { useState } from 'react';
import {
    Search, FileText, ImageIcon, ShieldCheck, Zap,
    Code, Globe, Hash, Calculator, Layers, Settings,
    Smartphone, QrCode, Lock, Share2, Archive, FileJson,
    Menu, X, Home, Type, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ToolView = 'home' | 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'imagetopdf' | 'case' | 'string';

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

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = NAV_ITEMS.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-500 text-white rounded-full shadow-2xl active:scale-95 transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-50 dark:bg-[#0a0b10] border-r border-slate-200 dark:border-white/5 z-40 transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full overflow-hidden">

                    {/* Brand */}
                    <div className="p-6 flex items-center justify-between">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => { onViewChange('home'); setIsOpen(false); }}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap size={18} className="text-white fill-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic">Gravity <span className="text-blue-600">Utils</span></span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 mb-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Araç ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">

                        <button
                            onClick={() => { onViewChange('home'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all mb-6 ${currentView === 'home'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
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
                                    <div className="flex items-center gap-2 px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                                        {cat.icon}
                                        {cat.title}
                                    </div>
                                    <div className="space-y-1">
                                        {catItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => { onViewChange(item.id); setIsOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${currentView === item.id
                                                    ? 'bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-600 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className={`${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
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
                    <div className="p-4 bg-slate-100 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 space-y-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {theme === 'dark' ? 'Koyu Mod' : 'Aydınlık Mod'}
                                </span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                        </button>

                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="min-w-[2rem] h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <ShieldCheck size={16} />
                            </div>
                            <div className="text-[10px]">
                                <p className="font-bold text-slate-700 dark:text-slate-300">Güvenli ve Yerel</p>
                                <p className="text-slate-500">Verileriniz asla buluta çıkmaz.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
