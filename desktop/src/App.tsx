import React, { useState, Suspense, lazy } from 'react';
import { Sidebar, ToolView } from './components/Sidebar';
import TitleBar from './components/TitleBar';
import { LayoutGrid, Loader2 } from 'lucide-react';
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

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ToolView>('home');

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

                            {/* Implement dynamic routing based on ToolView */}
                            {!['home', 'system', 'security', 'converter', 'pdf-manager', 'dev-tools', 'network-toolkit', 'web-toolkit', 'office-tools'].includes(currentView) && (
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
                    <footer className="px-8 py-3 border-t border-white/5 bg-black/40 text-[9px] font-black text-slate-600 flex justify-between items-center tracking-widest uppercase">
                        <div className="flex items-center gap-6">
                            <span>© 2026 Gravity Desktop Engine</span>
                            <span className="text-blue-500 italic">Bozdemir Core v3.1.0-PRO</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-emerald-500 opacity-50 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Local Engine Active</span>
                            <span className="text-slate-700">Native Performance Mode</span>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default App;
