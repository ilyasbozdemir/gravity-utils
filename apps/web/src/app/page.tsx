"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu, Monitor } from 'lucide-react';
import { Sidebar, ToolView as ViewType } from '@/components/Sidebar';
import { LandingHero } from '@/components/LandingHero';
import { ActionPanel } from '@/components/ActionPanel';
import { RevisionNotes } from '@/components/RevisionNotes';
import { DesktopDashboard } from '@/components/DesktopDashboard';
import { DesktopPromotion } from '@/components/DesktopPromotion';
import { isElectron, useIsElectron } from '@/utils/electron';

// Dynamically import components to improve initial load
const DesktopToolkit = dynamic(() => import('@shared/index').then(mod => mod.DesktopToolkit));
const DevTools = dynamic(() => import('@shared/index').then(mod => mod.DevTools), { ssr: false });
const OTAGuide = dynamic(() => import('@/components/OTAGuide').then(mod => mod.OTAGuide));
const FileConverter = dynamic(() => import('@shared/index').then(mod => mod.FileConverter));
const ZipInspector = dynamic(() => import('@/components/ZipInspector').then(mod => mod.ZipInspector));
const Base64Viewer = dynamic(() => import('@/components/Base64Viewer').then(mod => mod.Base64Viewer));
const ImageOptimizer = dynamic(() => import('@/components/ImageOptimizer').then(mod => mod.ImageOptimizer));
const HashGenerator = dynamic(() => import('@/components/HashGenerator').then(mod => mod.HashGenerator));
const JsonFormatter = dynamic(() => import('@shared/index').then(mod => mod.JsonFormatter), { ssr: false });
const TextAnalyzer = dynamic(() => import('@/components/TextAnalyzer').then(mod => mod.TextAnalyzer), { ssr: false });
const PdfManager = dynamic(() => import('@shared/index').then(mod => mod.PdfManager), { ssr: false });
const ExifCleaner = dynamic(() => import('@/components/ExifCleaner').then(mod => mod.ExifCleaner), { ssr: false });
const QrManager = dynamic(() => import('@/components/QrManager').then(mod => mod.QrManager), { ssr: false });
const FileEncryptor = dynamic(() => import('@/components/FileEncryptor').then(mod => mod.FileEncryptor), { ssr: false });
const SocialResizer = dynamic(() => import('@/components/SocialResizer').then(mod => mod.SocialResizer), { ssr: false });
const FaviconGenerator = dynamic(() => import('@/components/FaviconGenerator').then(mod => mod.FaviconGenerator), { ssr: false });
const UnitConverter = dynamic(() => import('@/components/UnitConverter').then(mod => mod.UnitConverter), { ssr: false });
const UuidGenerator = dynamic(() => import('@/components/UuidGenerator').then(mod => mod.UuidGenerator), { ssr: false });
const YamlConverter = dynamic(() => import('@/components/YamlConverter').then(mod => mod.YamlConverter), { ssr: false });
const JwtDebugger = dynamic(() => import('@shared/index').then(mod => mod.JwtDebugger), { ssr: false });
const UrlEncoder = dynamic(() => import('@/components/UrlEncoder').then(mod => mod.UrlEncoder), { ssr: false });
const CaseConverter = dynamic(() => import('@/components/CaseConverter').then(mod => mod.CaseConverter), { ssr: false });
const JsonXmlConverter = dynamic(() => import('@/components/JsonXmlConverter').then(mod => mod.JsonXmlConverter), { ssr: false });
const DateTimeConverter = dynamic(() => import('@/components/DateTimeConverter').then(mod => mod.DateTimeConverter), { ssr: false });
const SqlFormatter = dynamic(() => import('@shared/index').then(mod => mod.SqlFormatter), { ssr: false });
const StringInspector = dynamic(() => import('@/components/StringInspector').then(mod => mod.StringInspector), { ssr: false });
const OfficeTools = dynamic(() => import('@shared/index').then(mod => mod.OfficeTools), { ssr: false });
const WebToolkit = dynamic(() => import('@shared/index').then(mod => mod.WebToolkit), { ssr: false });
const NetworkToolkit = dynamic(() => import('@shared/index').then(mod => mod.NetworkToolkit), { ssr: false });
const PasswordGenerator = dynamic(() => import('@/components/PasswordGenerator').then(mod => mod.PasswordGenerator), { ssr: false });
const SvgOptimizer = dynamic(() => import('@/components/SvgOptimizer').then(mod => mod.SvgOptimizer), { ssr: false });
const CronBuilder = dynamic(() => import('@/components/CronBuilder').then(mod => mod.CronBuilder), { ssr: false });
const TimezoneConverter = dynamic(() => import('@/components/TimezoneConverter').then(mod => mod.TimezoneConverter), { ssr: false });
const ColorToolkit = dynamic(() => import('@/components/ColorToolkit').then(mod => mod.ColorToolkit), { ssr: false });
const RegexTester = dynamic(() => import('@shared/index').then(mod => mod.RegexTester), { ssr: false });
const CsvViewer = dynamic(() => import('@/components/CsvViewer').then(mod => mod.CsvViewer), { ssr: false });
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor').then(mod => mod.MarkdownEditor), { ssr: false });
const JsonLdEditor = dynamic(() => import('@/components/JsonLdEditor').then(mod => mod.JsonLdEditor), { ssr: false });
const NetworkCableTester = dynamic(() => import('@/components/NetworkCableTester').then(mod => mod.NetworkCableTester), { ssr: false });
const LoremIpsumGenerator = dynamic(() => import('@/components/LoremIpsumGenerator').then(mod => mod.LoremIpsumGenerator), { ssr: false });
const AspectRatioCalculator = dynamic(() => import('@/components/AspectRatioCalculator').then(mod => mod.AspectRatioCalculator), { ssr: false });
const SocialGuide = dynamic(() => import('@/components/SocialGuide').then(mod => mod.SocialGuide), { ssr: false });
const HttpStatusCodes = dynamic(() => import('@/components/HttpStatusCodes').then(mod => mod.HttpStatusCodes), { ssr: false });
const JsonCsvConverter = dynamic(() => import('@/components/JsonCsvConverter').then(mod => mod.JsonCsvConverter), { ssr: false });
const TextToolkit = dynamic(() => import('@shared/index').then(mod => mod.TextToolkit), { ssr: false });
const SmartCalculator = dynamic(() => import('@shared/index').then(mod => mod.SmartCalculator), { ssr: false });
const MediaToolkit = dynamic(() => import('@shared/index').then(mod => mod.MediaToolkit), { ssr: false });
const DataToolkit = dynamic(() => import('@shared/index').then(mod => mod.DataToolkit), { ssr: false });
const DesignToolkit = dynamic(() => import('@shared/index').then(mod => mod.DesignToolkit), { ssr: false });
const IdentifierConverter = dynamic(() => import('@/components/IdentifierConverter').then(mod => mod.IdentifierConverter), { ssr: false });
const SchemaGenerator = dynamic(() => import('@/components/SchemaGenerator').then(mod => mod.SchemaGenerator), { ssr: false });
const MetadataGenerator = dynamic(() => import('@/components/MetadataGenerator').then(mod => mod.MetadataGenerator), { ssr: false });
const EmailHeaderAnalyzer = dynamic(() => import('@shared/index').then(mod => mod.EmailHeaderAnalyzer), { ssr: false });
const DocumentToolkit = dynamic(() => import('@shared/index').then(mod => mod.DocumentToolkit), { ssr: false });
const CheckToolkit = dynamic(() => import('@shared/index').then(mod => mod.CheckToolkit), { ssr: false });
const JsonToCode = dynamic(() => import('@/components/JsonToCode').then(mod => mod.JsonToCode), { ssr: false });
const TextDiff = dynamic(() => import('@/components/TextDiff').then(mod => mod.TextDiff), { ssr: false });
const MermaidEditor = dynamic(() => import('@/components/MermaidEditor').then(mod => mod.MermaidEditor), { ssr: false });
const CodeSnap = dynamic(() => import('@/components/CodeSnap').then(mod => mod.CodeSnap), { ssr: false });
const SmartMockGenerator = dynamic(() => import('@/components/SmartMockGenerator').then(mod => mod.SmartMockGenerator), { ssr: false });
const SqlConverter = dynamic(() => import('@/components/SqlConverter').then(mod => mod.SqlConverter), { ssr: false });
const TerminalMastery = dynamic(() => import('@/components/TerminalMastery').then(mod => mod.TerminalMastery), { ssr: false });
const SitemapGenerator = dynamic(() => import('@/components/SitemapGenerator').then(mod => mod.SitemapGenerator), { ssr: false });
const RobotsTxtBuilder = dynamic(() => import('@/components/RobotsTxtBuilder').then(mod => mod.RobotsTxtBuilder), { ssr: false });
const XmlValidator = dynamic(() => import('@/components/XmlValidator').then(mod => mod.XmlValidator), { ssr: false });
const ExamGenerator = dynamic(() => import('@shared/index').then(mod => mod.ExamGenerator), { ssr: false });
const FigmaToCode = dynamic(() => import('@/components/FigmaToCode').then(mod => mod.FigmaToCode), { ssr: false });
const HtmlToPdf = dynamic(() => import('@/components/HtmlToPdf').then(mod => mod.HtmlToPdf), { ssr: false });

export default function Home() {
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
