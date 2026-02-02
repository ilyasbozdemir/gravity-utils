import { useState } from 'react';

import { ActionPanel } from './components/ActionPanel';
import { FileConverter } from './components/FileConverter';
import { ZipInspector } from './components/ZipInspector';
import { Base64Viewer } from './components/Base64Viewer';
import { ImageOptimizer } from './components/ImageOptimizer';
import { HashGenerator } from './components/HashGenerator';
import { JsonFormatter } from './components/JsonFormatter';
import { TextAnalyzer } from './components/TextAnalyzer';

import { Zap } from 'lucide-react';
import { LandingHero } from './components/LandingHero';

type ViewType = 'home' | 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<ViewType>('home');

  const handleFileSelect = (f: File) => {
    setFile(f);
    setView('home');
  };

  const handleAction = (action: ViewType) => {
    setView(action);
  };

  const clearFile = () => {
    setFile(null);
    setView('home');
  };

  return (
    <div className="flex flex-col min-h-screen box-border">

      {/* Show simple header only when a file is active */}
      {file && (
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={clearFile}>
            <Zap size={24} color="#a78bfa" fill="rgba(167, 139, 250, 0.2)" />
            <span className="font-bold text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Gravity Utils</span>
          </div>
          <button onClick={clearFile} className="text-sm hover:text-white bg-transparent border-none cursor-pointer text-slate-400 transition-colors">
            Ana Sayfaya Dön
          </button>
        </header>
      )}

      <main className="w-full flex-1 flex flex-col">
        {!file && (
          <LandingHero onFileSelect={handleFileSelect} />
        )}

        {file && (
          <div className="p-8 max-w-[1200px] mx-auto w-full animate-[fadeIn_0.5s_ease]">
            {view === 'home' && (
              <ActionPanel file={file} onClear={clearFile} onAction={handleAction} />
            )}

            {view === 'convert' && (
              <FileConverter file={file} onBack={() => setView('home')} />
            )}

            {view === 'inspect' && (
              <ZipInspector file={file} onBack={() => setView('home')} />
            )}

            {view === 'base64' && (
              <Base64Viewer file={file} onBack={() => setView('home')} />
            )}

            {view === 'optimize' && (
              <ImageOptimizer file={file} onBack={() => setView('home')} />
            )}

            {view === 'hash' && (
              <HashGenerator file={file} onBack={() => setView('home')} />
            )}

            {view === 'json' && (
              <JsonFormatter file={file} onBack={() => setView('home')} />
            )}

            {view === 'text' && (
              <TextAnalyzer file={file} onBack={() => setView('home')} />
            )}
          </div>
        )}
      </main>

      {!file && (
        <footer className="text-sm p-8 text-center opacity-50 border-t border-white/5">
          <p>© 2026 Gravity Utils. Tarayıcı tabanlı güvenli araçlar.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
