"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';
import { Sidebar, ToolView as ViewType } from '@/components/Sidebar';
import { LandingHero } from '@/components/LandingHero';
import { ActionPanel } from '@/components/ActionPanel';

// Dynamically import components to improve initial load
const FileConverter = dynamic(() => import('@/components/FileConverter').then(mod => mod.FileConverter));
const ZipInspector = dynamic(() => import('@/components/ZipInspector').then(mod => mod.ZipInspector));
const Base64Viewer = dynamic(() => import('@/components/Base64Viewer').then(mod => mod.Base64Viewer));
const ImageOptimizer = dynamic(() => import('@/components/ImageOptimizer').then(mod => mod.ImageOptimizer));
const HashGenerator = dynamic(() => import('@/components/HashGenerator').then(mod => mod.HashGenerator));
const JsonFormatter = dynamic(() => import('@/components/JsonFormatter').then(mod => mod.JsonFormatter));
const TextAnalyzer = dynamic(() => import('@/components/TextAnalyzer').then(mod => mod.TextAnalyzer));
const PdfManager = dynamic(() => import('@/components/PdfManager').then(mod => mod.PdfManager));
const ExifCleaner = dynamic(() => import('@/components/ExifCleaner').then(mod => mod.ExifCleaner));
const QrManager = dynamic(() => import('@/components/QrManager').then(mod => mod.QrManager));
const FileEncryptor = dynamic(() => import('@/components/FileEncryptor').then(mod => mod.FileEncryptor));
const SocialResizer = dynamic(() => import('@/components/SocialResizer').then(mod => mod.SocialResizer));
const FaviconGenerator = dynamic(() => import('@/components/FaviconGenerator').then(mod => mod.FaviconGenerator));
const UnitConverter = dynamic(() => import('@/components/UnitConverter').then(mod => mod.UnitConverter));
const UuidGenerator = dynamic(() => import('@/components/UuidGenerator').then(mod => mod.UuidGenerator));
const YamlConverter = dynamic(() => import('@/components/YamlConverter').then(mod => mod.YamlConverter));
const JwtDebugger = dynamic(() => import('@/components/JwtDebugger').then(mod => mod.JwtDebugger));
const UrlEncoder = dynamic(() => import('@/components/UrlEncoder').then(mod => mod.UrlEncoder));
const CaseConverter = dynamic(() => import('@/components/CaseConverter').then(mod => mod.CaseConverter));
const StringInspector = dynamic(() => import('@/components/StringInspector').then(mod => mod.StringInspector));
const OfficeTools = dynamic(() => import('@/components/OfficeTools').then(mod => mod.OfficeTools));

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [view, setView] = useState<ViewType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleFileSelect = (f: File) => {
        setFile(f);
        setView('home');
    };

    const handleAction = (action: ViewType) => {
        setView(action);
        setSidebarOpen(false);
    };

    const clearFile = () => {
        setFile(null);
        setView('home');
    };

    const handleToolSelect = (tool: ViewType) => {
        setFile(null);
        setView(tool);
        setSidebarOpen(false);
    };

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#06070a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Sidebar
                currentView={view}
                onViewChange={handleAction}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <div className="lg:hidden px-4 py-3 bg-white dark:bg-[#0b101b] border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                        {/* Title Logic can be moved to a separate component or utility */}
                        Gravity Utils
                    </span>
                    {file ? (
                        <button
                            onClick={clearFile}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                            Kaldır
                        </button>
                    ) : (
                        <div className="w-8" />
                    )}
                </div>

                {/* Desktop Header */}
                {(file || view !== 'home') && (
                    <header className="hidden lg:flex px-8 py-5 border-b border-slate-200 dark:border-white/5 items-center justify-between bg-white/80 dark:bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">
                                {/* Title logic simplified */}
                                Application Tool
                            </h2>
                        </div>
                        {file && (
                            <button
                                onClick={clearFile}
                                className="text-xs font-bold text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5 transition-all"
                            >
                                Dosyayı Kaldır
                            </button>
                        )}
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    {!file && view === 'home' && (
                        <LandingHero onFileSelect={handleFileSelect} onToolSelect={handleToolSelect} />
                    )}

                    {(file || view !== 'home') && (
                        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto w-full animate-[fadeIn_0.5s_ease] pb-20">
                            {view === 'home' && file && (
                                <ActionPanel file={file} onClear={clearFile} onAction={handleAction} />
                            )}

                            {/* Dynamic Components Rendering */}
                            {/* Note: In a full Next.js App Router migration, these should be separate routes (pages).
                  For this step, we keep the SPA behavior within the main page for quick migration. */}

                            {(view === 'word-pdf' || view === 'pdf-word' ||
                                view === 'excel-pdf' || view === 'pdf-excel' ||
                                view === 'ppt-pdf' || view === 'pdf-ppt' ||
                                view === 'pdf-image' || view === 'imagetopdf') && (
                                    <OfficeTools mode={view as any} onBack={() => setView('home')} />
                                )}

                            {view === 'convert' && <FileConverter file={file} onBack={() => setView('home')} />}
                            {view === 'inspect' && <ZipInspector file={file} onBack={() => setView('home')} />}
                            {view === 'base64' && <Base64Viewer file={file} onBack={() => setView('home')} />}
                            {view === 'optimize' && <ImageOptimizer file={file} onBack={() => setView('home')} />}
                            {view === 'hash' && <HashGenerator file={file} onBack={() => setView('home')} />}
                            {view === 'json' && <JsonFormatter file={file} onBack={() => setView('home')} />}
                            {view === 'text' && <TextAnalyzer file={file} onBack={() => setView('home')} />}
                            {view === 'pdf' && <PdfManager file={file} onBack={() => setView('home')} />}
                            {view === 'encrypt' && <FileEncryptor file={file} onBack={() => setView('home')} />}
                            {view === 'exif' && <ExifCleaner file={file} onBack={() => setView('home')} />}
                            {view === 'qr' && <QrManager file={file} onBack={() => setView('home')} />}
                            {view === 'social' && <SocialResizer file={file} onBack={() => setView('home')} />}
                            {view === 'favicon' && <FaviconGenerator file={file} onBack={() => setView('home')} />}
                            {view === 'units' && <UnitConverter file={file} onBack={() => setView('home')} />}
                            {view === 'uuid' && <UuidGenerator onBack={() => setView('home')} />}
                            {view === 'yaml' && <YamlConverter onBack={() => setView('home')} />}
                            {view === 'jwt' && <JwtDebugger onBack={() => setView('home')} />}
                            {view === 'url' && <UrlEncoder onBack={() => setView('home')} />}
                            {view === 'case' && <CaseConverter onBack={() => setView('home')} />}
                            {view === 'string' && <StringInspector onBack={() => setView('home')} />}
                        </div>
                    )}

                    <footer className="text-sm p-8 text-center opacity-30 mt-auto">
                        <p>© 2026 Gravity Utils • %100 Yerel Veri İşleme</p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
