import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

import { ActionPanel } from './components/ActionPanel';
import { FileConverter } from './components/FileConverter';
import { ZipInspector } from './components/ZipInspector';
import { Base64Viewer } from './components/Base64Viewer';
import { ImageOptimizer } from './components/ImageOptimizer';
import { HashGenerator } from './components/HashGenerator';
import { JsonFormatter } from './components/JsonFormatter';
import { TextAnalyzer } from './components/TextAnalyzer';
import { PdfManager } from './components/PdfManager';
import { ExifCleaner } from './components/ExifCleaner';
import { QrManager } from './components/QrManager';
import { FileEncryptor } from './components/FileEncryptor';
import { SocialResizer } from './components/SocialResizer';
import { FaviconGenerator } from './components/FaviconGenerator';

import { UnitConverter } from './components/UnitConverter';
import { UuidGenerator } from './components/UuidGenerator';
import { YamlConverter } from './components/YamlConverter';
import { JwtDebugger } from './components/JwtDebugger';
import { UrlEncoder } from './components/UrlEncoder';
import { StringInspector } from './components/StringInspector';
import { CaseConverter } from './components/CaseConverter';

import { LandingHero } from './components/LandingHero';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import type { ToolView as ViewType } from './components/Sidebar';

const TOOL_TITLES: Record<ViewType, string> = {
  home: 'Gravity Utils - Güvenli Dosya Araçları',
  convert: 'Dosya Dönüştürücü - Gravity Utils',
  inspect: 'Arşiv İnceleyici - Gravity Utils',
  base64: 'Base64 Araçları - Gravity Utils',
  optimize: 'Resim Optimizasyon - Gravity Utils',
  hash: 'Hash Generator - Gravity Utils',
  json: 'JSON Formatter - Gravity Utils',
  text: 'Metin Analizi - Gravity Utils',
  pdf: 'PDF Araçları - Gravity Utils',
  exif: 'Exif Temizleyici - Gravity Utils',
  qr: 'QR Kod & Barkod - Gravity Utils',
  social: 'Sosyal Medya Boyutlandırıcı - Gravity Utils',
  favicon: 'Favicon Oluşturucu - Gravity Utils',
  units: 'Teknik Birim Çevirici - Gravity Utils',
  encrypt: 'Güvenli Şifreleme - Gravity Utils',
  uuid: 'UUID Oluşturucu - Gravity Utils',
  yaml: 'YAML / JSON Çevirici - Gravity Utils',
  jwt: 'JWT Debugger - Gravity Utils',
  url: 'URL Encoder / Decoder - Gravity Utils',
  imagetopdf: 'Resimden PDF Oluştur - Gravity Utils',
  case: 'Büyük / Küçük Harf Çevirici - Gravity Utils',
  string: 'Metin Müfettişi & Analiz - Gravity Utils',
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<ViewType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = TOOL_TITLES[view] || 'Gravity Utils';
  }, [view]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setView('home');
  };

  const handleAction = (action: ViewType) => {
    setView(action);
    setSidebarOpen(false); // Close sidebar on selection (mobile)
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#06070a] text-slate-800 dark:text-slate-200 transition-colors duration-300">

      <Sidebar
        currentView={view}
        onViewChange={handleAction}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Mobile Header - Always visible on mobile */}
        <div className="lg:hidden px-4 py-3 bg-white dark:bg-[#0b101b] border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            title="Menüyü Aç"
            aria-label="Menüyü Aç"
          >
            <Menu size={24} />
          </button>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {view === 'home' ? 'Gravity Utils' : TOOL_TITLES[view]?.split(' - ')[0]}
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

        {/* Desktop Header - Only for context or file actions */}
        {(file || view !== 'home') && (
          <header className="hidden lg:flex px-8 py-5 border-b border-slate-200 dark:border-white/5 items-center justify-between bg-white/80 dark:bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {view === 'home' && file ? 'Dosya İşlemleri' : TOOL_TITLES[view]?.split(' - ')[0]}
              </h2>
            </div>
            {file && (
              <button
                onClick={clearFile}
                className="text-xs font-bold text-slate-500 hover:text-white bg-white/5 px-4 py-2 rounded-lg border border-white/5 transition-all"
              >
                Dosyayı Kaldır
              </button>
            )}
          </header>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
          {/* Landing Page: Show if NO file AND view IS home */}
          {!file && view === 'home' && (
            <LandingHero onFileSelect={handleFileSelect} onToolSelect={handleToolSelect} />
          )}

          {/* Action Panel or Specific Tools */}
          {(file || view !== 'home') && (
            <div className="p-4 lg:p-8 max-w-[1200px] mx-auto w-full animate-[fadeIn_0.5s_ease] pb-20">
              {view === 'home' && file && (
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

              {(view === 'pdf' || view === 'imagetopdf') && (
                <PdfManager file={file} onBack={() => setView('home')} />
              )}

              {view === 'encrypt' && (
                <FileEncryptor file={file} onBack={() => setView('home')} />
              )}

              {view === 'exif' && (
                <ExifCleaner file={file} onBack={() => setView('home')} />
              )}

              {view === 'qr' && (
                <QrManager file={file} onBack={() => setView('home')} />
              )}

              {view === 'social' && (
                <SocialResizer file={file} onBack={() => setView('home')} />
              )}

              {view === 'favicon' && (
                <FaviconGenerator file={file} onBack={() => setView('home')} />
              )}

              {view === 'units' && (
                <UnitConverter file={file} onBack={() => setView('home')} />
              )}

              {view === 'uuid' && (
                <UuidGenerator onBack={() => setView('home')} />
              )}

              {view === 'yaml' && (
                <YamlConverter onBack={() => setView('home')} />
              )}

              {view === 'jwt' && (
                <JwtDebugger onBack={() => setView('home')} />
              )}

              {view === 'url' && (
                <UrlEncoder onBack={() => setView('home')} />
              )}

              {view === 'case' && (
                <CaseConverter onBack={() => setView('home')} />
              )}

              {view === 'string' && (
                <StringInspector onBack={() => setView('home')} />
              )}
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

export default App;
