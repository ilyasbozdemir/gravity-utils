"use client";

import { useState, useEffect } from 'react';
import React, { lazy, Suspense } from 'react';
import { Menu, Monitor } from 'lucide-react';
import { Sidebar, ToolView as ViewType } from '../components/Sidebar';
import { LandingHero } from '@/components/LandingHero';
import { ActionPanel } from '@/components/ActionPanel';
import { RevisionNotes } from '@/components/RevisionNotes';
import { DesktopDashboard } from '@/components/DesktopDashboard';
import { DesktopPromotion } from '@/components/DesktopPromotion';
import { isElectron, useIsElectron } from '@/utils/electron';

// Dynamically import components to improve initial load
const DesktopToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.DesktopToolkit })));
const DevTools = lazy(() => import('@shared/index').then(mod => ({ default: mod.DevTools })));
const OTAGuide = lazy(() => import('@/components/OTAGuide').then(mod => ({ default: mod.OTAGuide })));
const FileConverter = lazy(() => import('@shared/index').then(mod => ({ default: mod.FileConverter })));
const ZipInspector = lazy(() => import('@/components/ZipInspector').then(mod => ({ default: mod.ZipInspector })));
const Base64Viewer = lazy(() => import('@/components/Base64Viewer').then(mod => ({ default: mod.Base64Viewer })));
const ImageOptimizer = lazy(() => import('@/components/ImageOptimizer').then(mod => ({ default: mod.ImageOptimizer })));
const HashGenerator = lazy(() => import('@/components/HashGenerator').then(mod => ({ default: mod.HashGenerator })));
const JsonFormatter = lazy(() => import('@shared/index').then(mod => ({ default: mod.JsonFormatter })));
const TextAnalyzer = lazy(() => import('@/components/TextAnalyzer').then(mod => ({ default: mod.TextAnalyzer })));
const PdfManager = lazy(() => import('@shared/index').then(mod => ({ default: mod.PdfManager })));
const ExifCleaner = lazy(() => import('@/components/ExifCleaner').then(mod => ({ default: mod.ExifCleaner })));
const QrManager = lazy(() => import('@/components/QrManager').then(mod => ({ default: mod.QrManager })));
const FileEncryptor = lazy(() => import('@/components/FileEncryptor').then(mod => ({ default: mod.FileEncryptor })));
const SocialResizer = lazy(() => import('@/components/SocialResizer').then(mod => ({ default: mod.SocialResizer })));
const FaviconGenerator = lazy(() => import('@/components/FaviconGenerator').then(mod => ({ default: mod.FaviconGenerator })));
const UnitConverter = lazy(() => import('@/components/UnitConverter').then(mod => ({ default: mod.UnitConverter })));
const UuidGenerator = lazy(() => import('@/components/UuidGenerator').then(mod => ({ default: mod.UuidGenerator })));
const YamlConverter = lazy(() => import('@/components/YamlConverter').then(mod => ({ default: mod.YamlConverter })));
const JwtDebugger = lazy(() => import('@shared/index').then(mod => ({ default: mod.JwtDebugger })));
const UrlEncoder = lazy(() => import('@/components/UrlEncoder').then(mod => ({ default: mod.UrlEncoder })));
const CaseConverter = lazy(() => import('@/components/CaseConverter').then(mod => ({ default: mod.CaseConverter })));
const JsonXmlConverter = lazy(() => import('@/components/JsonXmlConverter').then(mod => ({ default: mod.JsonXmlConverter })));
const DateTimeConverter = lazy(() => import('@/components/DateTimeConverter').then(mod => ({ default: mod.DateTimeConverter })));
const SqlFormatter = lazy(() => import('@shared/index').then(mod => ({ default: mod.SqlFormatter })));
const StringInspector = lazy(() => import('@/components/StringInspector').then(mod => ({ default: mod.StringInspector })));
const OfficeTools = lazy(() => import('@shared/index').then(mod => ({ default: mod.OfficeTools })));
const WebToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.WebToolkit })));
const NetworkToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.NetworkToolkit })));
const PasswordGenerator = lazy(() => import('@/components/PasswordGenerator').then(mod => ({ default: mod.PasswordGenerator })));
const SvgOptimizer = lazy(() => import('@/components/SvgOptimizer').then(mod => ({ default: mod.SvgOptimizer })));
const CronBuilder = lazy(() => import('@/components/CronBuilder').then(mod => ({ default: mod.CronBuilder })));
const TimezoneConverter = lazy(() => import('@/components/TimezoneConverter').then(mod => ({ default: mod.TimezoneConverter })));
const ColorToolkit = lazy(() => import('@/components/ColorToolkit').then(mod => ({ default: mod.ColorToolkit })));
const RegexTester = lazy(() => import('@shared/index').then(mod => ({ default: mod.RegexTester })));
const CsvViewer = lazy(() => import('@/components/CsvViewer').then(mod => ({ default: mod.CsvViewer })));
const MarkdownEditor = lazy(() => import('@/components/MarkdownEditor').then(mod => ({ default: mod.MarkdownEditor })));
const JsonLdEditor = lazy(() => import('@/components/JsonLdEditor').then(mod => ({ default: mod.JsonLdEditor })));
const NetworkCableTester = lazy(() => import('@/components/NetworkCableTester').then(mod => ({ default: mod.NetworkCableTester })));
const LoremIpsumGenerator = lazy(() => import('@/components/LoremIpsumGenerator').then(mod => ({ default: mod.LoremIpsumGenerator })));
const AspectRatioCalculator = lazy(() => import('@/components/AspectRatioCalculator').then(mod => ({ default: mod.AspectRatioCalculator })));
const SocialGuide = lazy(() => import('@/components/SocialGuide').then(mod => ({ default: mod.SocialGuide })));
const HttpStatusCodes = lazy(() => import('@/components/HttpStatusCodes').then(mod => ({ default: mod.HttpStatusCodes })));
const JsonCsvConverter = lazy(() => import('@/components/JsonCsvConverter').then(mod => ({ default: mod.JsonCsvConverter })));
const TextToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.TextToolkit })));
const SmartCalculator = lazy(() => import('@shared/index').then(mod => ({ default: mod.SmartCalculator })));
const MediaToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.MediaToolkit })));
const DataToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.DataToolkit })));
const DesignToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.DesignToolkit })));
const IdentifierConverter = lazy(() => import('@/components/IdentifierConverter').then(mod => ({ default: mod.IdentifierConverter })));
const SchemaGenerator = lazy(() => import('@/components/SchemaGenerator').then(mod => ({ default: mod.SchemaGenerator })));
const MetadataGenerator = lazy(() => import('@/components/MetadataGenerator').then(mod => ({ default: mod.MetadataGenerator })));
const EmailHeaderAnalyzer = lazy(() => import('@shared/index').then(mod => ({ default: mod.EmailHeaderAnalyzer })));
const DocumentToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.DocumentToolkit })));
const CheckToolkit = lazy(() => import('@shared/index').then(mod => ({ default: mod.CheckToolkit })));
const JsonToCode = lazy(() => import('@/components/JsonToCode').then(mod => ({ default: mod.JsonToCode })));
const TextDiff = lazy(() => import('@/components/TextDiff').then(mod => ({ default: mod.TextDiff })));
const MermaidEditor = lazy(() => import('@/components/MermaidEditor').then(mod => ({ default: mod.MermaidEditor })));
const CodeSnap = lazy(() => import('@/components/CodeSnap').then(mod => ({ default: mod.CodeSnap })));
const SmartMockGenerator = lazy(() => import('@/components/SmartMockGenerator').then(mod => ({ default: mod.SmartMockGenerator })));
const SqlConverter = lazy(() => import('@/components/SqlConverter').then(mod => ({ default: mod.SqlConverter })));
const TerminalMastery = lazy(() => import('@/components/TerminalMastery').then(mod => ({ default: mod.TerminalMastery })));
const SitemapGenerator = lazy(() => import('@/components/SitemapGenerator').then(mod => ({ default: mod.SitemapGenerator })));
const RobotsTxtBuilder = lazy(() => import('@/components/RobotsTxtBuilder').then(mod => ({ default: mod.RobotsTxtBuilder })));
const XmlValidator = lazy(() => import('@/components/XmlValidator').then(mod => ({ default: mod.XmlValidator })));
const ExamGenerator = lazy(() => import('@shared/index').then(mod => ({ default: mod.ExamGenerator })));
const FigmaToCode = lazy(() => import('@/components/FigmaToCode').then(mod => ({ default: mod.FigmaToCode })));
const HtmlToPdf = lazy(() => import('@/components/HtmlToPdf').then(mod => ({ default: mod.HtmlToPdf })));

export default function HomeView() {
    // Extracted from web page.tsx
    const [file, setFile] = useState<File | null>(null);
    const [view, setView] = useState<ViewType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const isApp = useIsElectron();

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
                        <>
                            <LandingHero onFileSelect={handleFileSelect} onToolSelect={handleToolSelect} />
                            {isApp && (
                                <div className="px-8 max-w-[1400px] mx-auto w-full -mt-10 pb-20">
                                    <div className="flex items-center gap-2 mb-6 opacity-60">
                                        <div className="h-px bg-slate-800 flex-1"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                            <Monitor size={10} /> Bozdemir Desktop Engine Status
                                        </span>
                                        <div className="h-px bg-slate-800 flex-1"></div>
                                    </div>
                                    <DesktopDashboard />
                                </div>
                            )}
                            {!isApp && (
                                <div className="px-8 max-w-[1400px] mx-auto w-full pb-20">
                                    <div className="flex items-center gap-2 mb-12 opacity-40">
                                        <div className="h-px bg-slate-300 dark:bg-slate-800 flex-1"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                            <Monitor size={10} /> Gravity Desktop Experience
                                        </span>
                                        <div className="h-px bg-slate-300 dark:bg-slate-800 flex-1"></div>
                                    </div>
                                    <DesktopPromotion />
                                </div>
                            )}
                        </>
                    )}

                    {(file || view !== 'home') && (
                        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full animate-[fadeIn_0.5s_ease] pb-20">
                            {view === 'home' && file && (
                                <ActionPanel file={file} onClear={clearFile} onAction={handleAction} />
                            )}

                            {/* Dynamic Components Rendering */}
                            <Suspense fallback={<div className="flex-1 flex items-center justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
                                {(view === 'pdf' || view === 'pdf-word' || view === 'word-pdf' || view === 'pdf-image' || view === 'pdf-split' || view === 'pdf-text' || view === 'imagetopdf' || view === 'exam-generator' || view === 'pdf-merge' || view === 'pdf-compress' || view === 'pdf-watermark' || view === 'excel-pdf' || view === 'pdf-excel' || view === 'ppt-pdf' || view === 'pdf-ppt' || view === 'excel-word' || view === 'document-toolkit') &&
                                    <DocumentToolkit view={view as any} onBack={() => setView('home')} />}

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
                                {view === 'date-time' && <DateTimeConverter onBack={() => setView('home')} />}
                                {view === 'sql-formatter' && <SqlFormatter onBack={() => setView('home')} />}
                                {view === 'web-toolkit' && <WebToolkit onBack={() => setView('home')} />}
                                {view === 'network-toolkit' && <NetworkToolkit onBack={() => setView('home')} />}
                                {(view === 'json-csv' || view === 'json-xml' || view === 'units' || view === 'zip' || view === 'data-toolkit') &&
                                    <DataToolkit view={view === 'data-toolkit' ? 'json-csv' : view as any} onBack={() => setView('home')} />}
                                {(view === 'color-toolkit' || view === 'qr' || view === 'favicon' || view === 'figma-to-code' || view === 'design-toolkit') &&
                                    <DesignToolkit view={view === 'color-toolkit' ? 'color' : (view === 'design-toolkit' ? 'color' : view as any)} onBack={() => setView('home')} />}
                                {view === 'password-generator' && <PasswordGenerator onBack={() => setView('home')} />}
                                {view === 'social-guide' && <SocialGuide onBack={() => setView('home')} />}
                                {view === 'http-status' && <HttpStatusCodes onBack={() => setView('home')} />}

                                {/* Core Developer & File Tools */}
                                {view === 'json' && <JsonFormatter file={file} onBack={() => setView('home')} />}
                                {view === 'text' && <TextAnalyzer file={file} onBack={() => setView('home')} />}
                                {view === 'optimize' && <ImageOptimizer file={file} onBack={() => setView('home')} />}
                                {view === 'hash' && <HashGenerator file={file} onBack={() => setView('home')} />}
                                {view === 'inspect' && <ZipInspector file={file} onBack={() => setView('home')} />}
                                {view === 'base64' && <Base64Viewer file={file} onBack={() => setView('home')} />}

                                {/* New Toolkit Views */}
                                {(view === 'text-cleaner' || view === 'case-converter-pro' || view === 'case' || view === 'lorem-ipsum' || view === 'markdown-editor' || view === 'mermaid' || view === 'text-diff' || view === 'text-toolkit') &&
                                    <TextToolkit view={view === 'lorem-ipsum' ? 'lorem' : (view === 'markdown-editor' ? 'markdown' : (view === 'text-toolkit' ? 'case-converter-pro' : view as any))} onBack={() => setView('home')} />}

                                {(view === 'date-calculator' || view === 'internet-speed' || view === 'file-size-calc' ||
                                    view === 'iban-checker' || view === 'tckn-checker' || view === 'css-units' || view === 'viewport-calc') &&
                                    <SmartCalculator view={view} onBack={() => setView('home')} />}

                                {(view === 'exif-viewer' || view === 'bulk-rename' || view === 'media-toolkit') &&
                                    <MediaToolkit view={view === 'media-toolkit' ? 'exif-viewer' : view as any} onBack={() => setView('home')} />}

                                {view === 'identifier-converter' && <IdentifierConverter onBack={() => setView('home')} />}
                                {view === 'schema-generator' && <SchemaGenerator onBack={() => setView('home')} />}
                                {view === 'metadata-generator' && <MetadataGenerator onBack={() => setView('home')} />}
                                {view === 'email-header-analyzer' && <EmailHeaderAnalyzer onBack={() => setView('home')} />}
                                {view === 'check-toolkit' && <CheckToolkit onBack={() => setView('home')} />}
                                {view === 'xml-validator' && <XmlValidator onBack={() => setView('home')} />}
                                {view === 'exam-generator' && <ExamGenerator onBack={() => setView('home')} />}
                                {view === 'html-to-pdf' && <HtmlToPdf onBack={() => setView('home')} />}
                                {view === 'desktop-toolkit' && <DesktopToolkit onBack={() => setView('home')} onViewOTA={() => setView('ota-guide')} />}
                                {view === 'ota-guide' && <OTAGuide onBack={() => setView('home')} />}
                                {view === 'convert' && <FileConverter file={file} onBack={() => setView('home')} />}

                                {/* Dev Tools consolidated dashboard or individual */}
                                {view === 'dev-tools' && <DevTools onBack={() => setView('home')} />}
                            </Suspense>
                        </div>
                    )}

                    {/* Premium Desktop-like Footer */}
                    <footer className="px-8 py-3 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-sm text-[10px] font-black text-slate-400 dark:text-slate-600 flex justify-between items-center tracking-widest uppercase mt-auto">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <span className="text-slate-900 dark:text-white/80">© 2026 Gravity Web Engine</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                <span className="text-blue-500 italic">Bozdemir Core v4.0-WEB</span>
                            </div>

                            <div className="hidden lg:flex items-center gap-6 text-slate-400 dark:text-slate-700">
                                <span className="flex items-center gap-1.5">Browser Optimized</span>
                                <span className="flex items-center gap-1.5">AES-256 Cloud-Free</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-emerald-500">Fast Local Engine Active</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">Secure Sandbox Mode</span>
                        </div>
                    </footer>

                    <RevisionNotes />
                </main>
            </div>
        </div>
    );
}
