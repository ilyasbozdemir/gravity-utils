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
const JsonXmlConverter = dynamic(() => import('@/components/JsonXmlConverter').then(mod => mod.JsonXmlConverter));
const DateTimeConverter = dynamic(() => import('@/components/DateTimeConverter').then(mod => mod.DateTimeConverter));
const SqlFormatter = dynamic(() => import('@/components/SqlFormatter').then(mod => mod.SqlFormatter));
const StringInspector = dynamic(() => import('@/components/StringInspector').then(mod => mod.StringInspector));
const OfficeTools = dynamic(() => import('@/components/OfficeTools').then(mod => mod.OfficeTools));
const WebToolkit = dynamic(() => import('@/components/WebToolkit').then(mod => mod.WebToolkit));
const NetworkToolkit = dynamic(() => import('@/components/NetworkToolkit').then(mod => mod.NetworkToolkit));
const PasswordGenerator = dynamic(() => import('@/components/PasswordGenerator').then(mod => mod.PasswordGenerator));
const SvgOptimizer = dynamic(() => import('@/components/SvgOptimizer').then(mod => mod.SvgOptimizer));
const CronBuilder = dynamic(() => import('@/components/CronBuilder').then(mod => mod.CronBuilder));
const TimezoneConverter = dynamic(() => import('@/components/TimezoneConverter').then(mod => mod.TimezoneConverter));
const ColorToolkit = dynamic(() => import('@/components/ColorToolkit').then(mod => mod.ColorToolkit));
const RegexTester = dynamic(() => import('@/components/RegexTester').then(mod => mod.RegexTester));
const CsvViewer = dynamic(() => import('@/components/CsvViewer').then(mod => mod.CsvViewer));
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor').then(mod => mod.MarkdownEditor));
const JsonLdEditor = dynamic(() => import('@/components/JsonLdEditor').then(mod => mod.JsonLdEditor));
const NetworkCableTester = dynamic(() => import('@/components/NetworkCableTester').then(mod => mod.NetworkCableTester));
const LoremIpsumGenerator = dynamic(() => import('@/components/LoremIpsumGenerator').then(mod => mod.LoremIpsumGenerator));
const AspectRatioCalculator = dynamic(() => import('@/components/AspectRatioCalculator').then(mod => mod.AspectRatioCalculator));
const SocialGuide = dynamic(() => import('@/components/SocialGuide').then(mod => mod.SocialGuide));
const HttpStatusCodes = dynamic(() => import('@/components/HttpStatusCodes').then(mod => mod.HttpStatusCodes));
const JsonCsvConverter = dynamic(() => import('@/components/JsonCsvConverter').then(mod => mod.JsonCsvConverter));
const TextToolkit = dynamic(() => import('@/components/TextToolkit').then(mod => mod.TextToolkit));
const SmartCalculator = dynamic(() => import('@/components/SmartCalculator').then(mod => mod.SmartCalculator));
const MediaToolkit = dynamic(() => import('@/components/MediaToolkit').then(mod => mod.MediaToolkit));
const IdentifierConverter = dynamic(() => import('@/components/IdentifierConverter').then(mod => mod.IdentifierConverter));
const SchemaGenerator = dynamic(() => import('@/components/SchemaGenerator').then(mod => mod.SchemaGenerator));
const MetadataGenerator = dynamic(() => import('@/components/MetadataGenerator').then(mod => mod.MetadataGenerator));

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [view, setView] = useState<ViewType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Initial routing check
        const hash = window.location.hash.replace('#/', '');
        if (hash) {
            setView(hash as ViewType);
        }

        // Listen for hash changes (browser back/forward)
        const handleHashChange = () => {
            const currentHash = window.location.hash.replace('#/', '');
            if (currentHash) {
                setView(currentHash as ViewType);
            } else {
                setView('home');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Sync state to hash
    useEffect(() => {
        if (!isClient) return;
        if (view === 'home' && window.location.hash === '') return;

        const currentHash = window.location.hash.replace('#/', '');
        if (currentHash !== view) {
            window.location.hash = view === 'home' ? '' : `/${view}`;
        }
    }, [view, isClient]);

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
                {/* Mobile Header (Only on phones now) */}
                <div className="md:hidden px-4 py-3 bg-white dark:bg-[#0b101b] border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        title="Menü"
                        aria-label="Menü"
                        className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
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

                {/* Tablet & Desktop Header */}
                {(file || view !== 'home') && (
                    <header className="hidden md:flex px-8 py-5 border-b border-slate-200 dark:border-white/5 items-center justify-between bg-white/80 dark:bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest leading-none">
                                {view.replace(/-/g, ' ')}
                            </h2>
                        </div>
                        {file && (
                            <button
                                onClick={clearFile}
                                title="Dosyayı Kaldır"
                                aria-label="Dosyayı Kaldır"
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
                        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full animate-[fadeIn_0.5s_ease] pb-20">
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
                            {view === 'json-xml' && <JsonXmlConverter onBack={() => setView('home')} />}
                            {view === 'date-time' && <DateTimeConverter onBack={() => setView('home')} />}
                            {view === 'sql-formatter' && <SqlFormatter onBack={() => setView('home')} />}
                            {view === 'web-toolkit' && <WebToolkit onBack={() => setView('home')} />}
                            {view === 'network-toolkit' && <NetworkToolkit onBack={() => setView('home')} />}
                            {view === 'password-generator' && <PasswordGenerator onBack={() => setView('home')} />}
                            {view === 'svg-optimizer' && <SvgOptimizer onBack={() => setView('home')} />}
                            {view === 'cron-builder' && <CronBuilder onBack={() => setView('home')} />}
                            {view === 'timezone-converter' && <TimezoneConverter onBack={() => setView('home')} />}
                            {view === 'color-toolkit' && <ColorToolkit onBack={() => setView('home')} />}
                            {view === 'regex-tester' && <RegexTester onBack={() => setView('home')} />}
                            {view === 'csv-viewer' && <CsvViewer onBack={() => setView('home')} />}
                            {view === 'markdown-editor' && <MarkdownEditor onBack={() => setView('home')} />}
                            {view === 'json-ld' && <JsonLdEditor onBack={() => setView('home')} />}
                            {view === 'network-cable' && <NetworkCableTester onBack={() => setView('home')} />}
                            {view === 'lorem-ipsum' && <LoremIpsumGenerator onBack={() => setView('home')} />}
                            {view === 'aspect-ratio' && <AspectRatioCalculator onBack={() => setView('home')} />}
                            {view === 'social-guide' && <SocialGuide onBack={() => setView('home')} />}
                            {view === 'http-status' && <HttpStatusCodes onBack={() => setView('home')} />}
                            {view === 'json-csv' && <JsonCsvConverter onBack={() => setView('home')} />}

                            {/* New Toolkit Views */}
                            {(view === 'text-cleaner' || view === 'case-converter-pro') &&
                                <TextToolkit view={view} onBack={() => setView('home')} />}

                            {(view === 'date-calculator' || view === 'internet-speed' || view === 'file-size-calc' ||
                                view === 'iban-checker' || view === 'tckn-checker' || view === 'css-units' || view === 'viewport-calc') &&
                                <SmartCalculator view={view} onBack={() => setView('home')} />}

                            {(view === 'exif-viewer' || view === 'bulk-rename' || view === 'social') &&
                                <MediaToolkit view={view} onBack={() => setView('home')} />}

                            {view === 'identifier-converter' && <IdentifierConverter onBack={() => setView('home')} />}
                            {view === 'schema-generator' && <SchemaGenerator onBack={() => setView('home')} />}
                            {view === 'metadata-generator' && <MetadataGenerator onBack={() => setView('home')} />}
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
