import React, { useState } from 'react';
import {
    Search, FileText, ImageIcon, ShieldCheck, Zap,
    Code, Globe, Hash, Calculator, Layers, Settings,
    Smartphone, QrCode, Lock, Share2, Archive, FileJson,
    X, Home, Type, Sun, Moon,
    FileCode,
    Database,
    CaseSensitive,
    Clock,
    Network,
    Code2,
    Cable,
    RefreshCw,
    Split,
    HelpCircle,
    Merge,
    Scissors,
    Minimize2,
    Stamp,
    Sparkles,
    Camera,
    Repeat,
    Terminal,
    Palette,
    FileSpreadsheet,
    ArrowLeft, Copy, Check, Download, AlertCircle, Shield, Plus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ToolView =
    | 'home' | 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr'
    | 'social' | 'favicon' | 'units' | 'encrypt' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'imagetopdf' | 'case' | 'string'
    | 'json-xml' | 'date-time' | 'sql-formatter' | 'word-pdf' | 'pdf-word' | 'excel-pdf' | 'pdf-excel' | 'ppt-pdf'
    | 'pdf-ppt' | 'pdf-image' | 'word-html' | 'pdf-text' | 'web-toolkit' | 'network-toolkit' | 'color-toolkit'
    | 'regex-tester' | 'csv-viewer' | 'markdown-editor' | 'password-generator' | 'svg-optimizer' | 'cron-builder'
    | 'timezone-converter' | 'json-ld' | 'network-cable' | 'lorem-ipsum' | 'aspect-ratio' | 'social-guide' | 'http-status'
    | 'json-csv' | 'text-cleaner' | 'case-converter-pro' | 'css-units' | 'date-calculator' | 'internet-speed'
    | 'iban-checker' | 'tckn-checker' | 'file-size-calc' | 'viewport-calc' | 'exif-viewer' | 'bulk-rename'
    | 'email-header-analyzer' | 'identifier-converter' | 'schema-generator' | 'metadata-generator' | 'document-toolkit' | 'check-toolkit'
    | 'json-to-code' | 'text-diff' | 'exam-generator' | 'pdf-merge' | 'pdf-split' | 'pdf-compress' | 'pdf-watermark' | 'mermaid'
    | 'codesnap' | 'mock-generator' | 'sql-converter' | 'terminal-mastery' | 'excel-word' | 'sitemap-generator' | 'robots-txt-builder' | 'xml-validator' | 'figma-to-code' | 'html-to-pdf';

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
    addedAt?: string; // ISO format: YYYY-MM-DD
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
];

const NAV_ITEMS: NavItem[] = [
    // Office & Documents
    // Office & Documents
    { id: 'document-toolkit', title: 'Belge & Ofis Çıkın', icon: <FileText size={18} />, category: 'office', addedAt: '2026-02-20' },
    { id: 'exam-generator', title: 'Sınav Hazırlayıcı', icon: <HelpCircle size={18} />, category: 'office', addedAt: '2026-02-23' },
    { id: 'pdf-merge', title: 'PDF Birleştir', icon: <Merge size={18} />, category: 'office', addedAt: '2026-02-23' },
    { id: 'pdf-split', title: 'PDF Ayırıcı', icon: <Scissors size={18} />, category: 'office', addedAt: '2026-02-23' },
    { id: 'pdf-compress', title: 'PDF Boyut Küçült', icon: <Minimize2 size={18} />, category: 'office', addedAt: '2026-02-23' },
    { id: 'pdf-watermark', title: 'PDF Filigran Ekle', icon: <Stamp size={18} />, category: 'office', addedAt: '2026-02-23' },
    { id: 'excel-word', title: 'Excel → Word (Tablo)', icon: <FileSpreadsheet size={18} />, category: 'office', addedAt: '2026-02-24' },
    { id: 'convert', title: 'Dosya Dönüştürücü', icon: <Layers size={18} />, category: 'office' },

    // Text & Content (New)
    { id: 'text-cleaner', title: 'Metin Temizleyici Pro', icon: <RefreshCw size={18} />, category: 'text-content', addedAt: '2026-02-20' },
    { id: 'case-converter-pro', title: 'Case Converter Pro', icon: <CaseSensitive size={18} />, category: 'text-content', addedAt: '2026-02-20' },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum Üretici', icon: <Type size={18} />, category: 'text-content' },
    { id: 'text', title: 'Metin Analizi', icon: <Search size={18} />, category: 'text-content' },
    { id: 'markdown-editor', title: 'Markdown Editör', icon: <FileCode size={18} />, category: 'text-content' },

    // Media
    { id: 'optimize', title: 'Resim Sıkıştırıcı', icon: <ImageIcon size={18} />, category: 'media' },
    { id: 'color-toolkit', title: 'Renk Araç Seti (Pro)', icon: <Palette size={18} />, category: 'media', addedAt: '2026-02-23' },
    { id: 'social', title: 'Sosyal Medya Boyut', icon: <Smartphone size={18} />, category: 'media' },
    { id: 'exif-viewer', title: 'EXIF Görüntüleyici', icon: <Search size={18} />, category: 'media', addedAt: '2026-02-20' },
    { id: 'bulk-rename', title: 'Toplu İsimlendir', icon: <Type size={18} />, category: 'media', addedAt: '2026-02-20' },
    { id: 'qr', title: 'QR Kod İşlemleri', icon: <QrCode size={18} />, category: 'media' },

    // Dev
    { id: 'json', title: 'JSON Formatlayıcı', icon: <FileJson size={18} />, category: 'dev' },
    { id: 'jwt', title: 'JWT Debugger', icon: <ShieldCheck size={18} />, category: 'dev' },
    { id: 'http-status', title: 'HTTP Durum Kodları', icon: <Globe size={18} />, category: 'dev' },
    { id: 'css-units', title: 'CSS Birim Çevirici', icon: <Code2 size={18} />, category: 'dev', addedAt: '2026-02-20' },
    { id: 'viewport-calc', title: 'Viewport Calculator', icon: <Smartphone size={18} />, category: 'dev', addedAt: '2026-02-20' },
    { id: 'network-cable', title: 'Network Kablo Testi', icon: <Cable size={18} />, category: 'dev' },
    { id: 'sql-formatter', title: 'SQL Formatlayıcı', icon: <Database size={18} />, category: 'dev' },
    { id: 'json-to-code', title: 'JSON ↔ Code Generator', icon: <FileCode size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'mermaid', title: 'Mermaid Diyagram Pro', icon: <Sparkles size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'codesnap', title: 'CodeSnap Pro', icon: <Camera size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'terminal-mastery', title: 'Terminal Mastery Pro', icon: <Terminal size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'mock-generator', title: 'Smart Mock Generator', icon: <Database size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'sql-converter', title: 'SQL Schema Converter', icon: <Repeat size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'text-diff', title: 'Metin Karşılaştırıcı', icon: <Split size={18} />, category: 'dev', addedAt: '2026-02-23' },
    { id: 'identifier-converter', title: 'Akıllı İsim Çevirici', icon: <Type size={18} />, category: 'dev', addedAt: '2026-02-20' },
    { id: 'figma-to-code', title: 'Design → Code Pro', icon: <Code size={18} />, category: 'dev', addedAt: '2026-02-24' },

    // Web & SEO
    { id: 'web-toolkit', title: 'Web Geliştirici Kutusu', icon: <Globe size={18} />, category: 'seo', addedAt: '2026-02-24' },
    { id: 'sitemap-generator', title: 'Sitemap Oluşturucu', icon: <Network size={18} />, category: 'seo', addedAt: '2026-02-24' },
    { id: 'robots-txt-builder', title: 'Robots.txt Hazırlayıcı', icon: <FileCode size={18} />, category: 'seo', addedAt: '2026-02-24' },
    { id: 'xml-validator', title: 'XML / XSD / JSON Pro', icon: <FileCode size={18} />, category: 'seo', addedAt: '2026-02-24' },
    { id: 'html-to-pdf', title: 'Web → PDF Pro', icon: <FileText size={18} />, category: 'seo', addedAt: '2026-02-24' },
    { id: 'schema-generator', title: 'Şema & Form Üretici', icon: <Layers size={18} />, category: 'seo', addedAt: '2026-02-20' },
    { id: 'metadata-generator', title: 'Meta Etiketi Üretici', icon: <Globe size={18} />, category: 'seo', addedAt: '2026-02-20' },
    { id: 'json-ld', title: 'JSON-LD Editörü', icon: <FileJson size={18} />, category: 'seo', addedAt: '2026-02-23' },

    // Calculators (New)
    { id: 'date-calculator', title: 'Tarih & Gün Hesapla', icon: <Clock size={18} />, category: 'calculators', addedAt: '2026-02-20' },
    { id: 'internet-speed', title: 'Download Süresi', icon: <Zap size={18} />, category: 'calculators', addedAt: '2026-02-20' },
    { id: 'file-size-calc', title: 'Dosya Boyutu Tahmin', icon: <Layers size={18} />, category: 'calculators', addedAt: '2026-02-20' },
    { id: 'units', title: 'Birim Dönüştürücü', icon: <Calculator size={18} />, category: 'calculators' },
    { id: 'aspect-ratio', title: 'Aspect Ratio', icon: <Layers size={18} />, category: 'calculators' },

    // Checks (New)
    // Verification Tools
    { id: 'check-toolkit', title: 'Güvenlik & Doğrulama', icon: <ShieldCheck size={18} />, category: 'checks', addedAt: '2026-02-20' },

    // Security
    { id: 'encrypt', title: 'Dosya Şifreleyici', icon: <Lock size={18} />, category: 'security' },
    { id: 'hash', title: 'Hash Oluşturucu', icon: <Hash size={18} />, category: 'security' },
    { id: 'password-generator', title: 'Şifre Üretici', icon: <Lock size={18} />, category: 'security' },
];

function isNew(dateStr?: string) {
    if (!dateStr) return false;
    const addedAt = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    return (now - addedAt) < weekInMs;
}

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
                            <div className="flex items-center">
                                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Gravity</span>
                                <span className="text-lg font-black tracking-tight text-blue-600 uppercase italic ml-1">Utils</span>
                            </div>
                            <a href="https://ilyasbozdemir.dev" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider -mt-1 hover:text-blue-500 transition-colors">
                                ilyasbozdemir.dev
                            </a>
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
                                            <span className="flex-1 text-left">{item.title}</span>
                                            {isNew(item.addedAt) && (
                                                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[8px] font-black rounded-md leading-none animate-pulse">
                                                    NEW
                                                </span>
                                            )}
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
