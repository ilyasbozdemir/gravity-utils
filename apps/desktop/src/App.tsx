import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Sidebar, ToolView } from './components/Sidebar';
import TitleBar from './components/TitleBar';
import { LayoutGrid, Loader2, Cpu, HardDrive } from 'lucide-react';
import { Toaster } from 'sonner';

// Lazy load views for high performance
const HomeView = lazy(() => import('./views/HomeView'));
const SystemView = lazy(() => import('./views/SystemView'));
const ConverterView = lazy(() => import('./views/ConverterView'));
const PdfManagerView = lazy(() => import('./views/PdfManagerView'));
const DevToolsView = lazy(() => import('./views/DevToolsView'));
const NetworkToolkitView = lazy(() => import('./views/NetworkToolkitView'));
const WebToolkitView = lazy(() => import('./views/WebToolkitView'));
const OfficeToolsView = lazy(() => import('./views/OfficeToolsView'));
const SecurityView = lazy(() => import('./views/SecurityView'));
const MediaToolkitView = lazy(() => import('./views/MediaToolkitView'));
const DataToolkitView = lazy(() => import('./views/DataToolkitView'));
const TextToolkitView = lazy(() => import('./views/TextToolkitView'));
const DesignToolkitView = lazy(() => import('./views/DesignToolkitView'));

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ToolView>('home');
    const [sysInfo, setSysInfo] = useState<any>(null);

    useEffect(() => {
        const fetchSys = async () => {
            if (window.electron) {
                const info = await window.electron.getSystemInfo();
                setSysInfo(info);
            }
        };
        fetchSys();
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white select-none transition-colors duration-300">
            <Toaster position="top-right" theme="dark" richColors />

            {/* Native Window Title Bar */}
            <TitleBar />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar currentView={currentView} onViewChange={setCurrentView} />

                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                        <Suspense fallback={
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-blue-500">
                                <Loader2 size={42} className="animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Bozdemir Engine Yükleniyor...</p>
                            </div>
                        }>
                            {currentView === 'home' && <HomeView onAction={setCurrentView} />}
                            {currentView === 'system' && <SystemView />}
                            {currentView === 'security' && <SecurityView />}
                            {currentView === 'converter' && <ConverterView />}
                            {currentView === 'pdf-manager' && <PdfManagerView />}
                            {currentView === 'dev-tools' && <DevToolsView />}
                            {currentView === 'network-toolkit' && <NetworkToolkitView />}
                            {currentView === 'web-toolkit' && <WebToolkitView />}
                            {currentView === 'office-tools' && <OfficeToolsView />}
                            {currentView === 'media-tools' && <MediaToolkitView />}
                            {currentView === 'data-tools' && <DataToolkitView />}
                            {currentView === 'text-tools' && <TextToolkitView />}
                            {currentView === 'design-tools' && <DesignToolkitView />}

                            {/* Implement dynamic routing based on ToolView */}
                            {!['home', 'system', 'security', 'converter', 'pdf-manager', 'dev-tools', 'network-toolkit', 'web-toolkit', 'office-tools', 'media-tools', 'data-tools', 'text-tools', 'design-tools'].includes(currentView) && (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                    <LayoutGrid size={64} className="text-slate-800 mb-6" />
                                    <h2 className="text-2xl font-black mb-2">Çok Yakında</h2>
                                    <p className="text-slate-500 max-w-sm">
                                        Bu araç masaüstü motoru için optimize ediliyor. En kısa sürede en yüksek performansta burada olacak.
                                    </p>
                                </div>
                            )}
                        </Suspense>
                    </div>

                    {/* Global Footer (Desktop Version) */}
                    <footer className="px-8 py-2.5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 text-[9px] font-black text-slate-400 dark:text-slate-600 flex justify-between items-center tracking-widest uppercase no-drag">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <span className="text-slate-900 dark:text-white/80">© 2026 Gravity Desktop Engine</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800"></div>
                                <span className="text-blue-500 italic">Bozdemir Core v3.1.0-PRO</span>
                            </div>

                            {sysInfo && (
                                <div className="hidden lg:flex items-center gap-6 text-slate-400 dark:text-slate-700">
                                    <span className="flex items-center gap-1.5"><Cpu size={10} /> {sysInfo.cpus} Core</span>
                                    <span className="flex items-center gap-1.5"><HardDrive size={10} /> {sysInfo.memory}GB RAM</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-emerald-500">Local Engine Active</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">Native Performance Mode</span>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default App;
