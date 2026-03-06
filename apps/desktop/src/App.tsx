import React, { Suspense, lazy } from 'react';
import { HashRouter } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import { PlatformProvider } from '@shared/index';
import { electronAdapter } from './adapters/electron-adapter';

// Lazy load main view
const HomeView = lazy(() => import('./views/HomeView'));


const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white select-none transition-colors duration-300">
            <Toaster position="top-right" theme="dark" richColors />
            <TitleBar />
            <div className="flex flex-1 overflow-hidden relative">
                <Suspense fallback={
                    <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-blue-500">
                        <Loader2 size={42} className="animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Bozdemir Engine Yükleniyor...</p>
                    </div>
                }>
                    <HomeView />
                </Suspense>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <PlatformProvider adapter={electronAdapter}>
                <MainLayout />
            </PlatformProvider>
        </HashRouter>
    );
};

export default App;
