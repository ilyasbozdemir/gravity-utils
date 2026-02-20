import React from 'react';
import {
    Lock, Share2, MousePointer2, Settings, Smartphone, RefreshCw, Layers, Globe,
    Type, Clock, Camera, Zap, Star, Calculator, FileText, Minimize2, Hash, Code, Search, QrCode, Archive,
    Image as ImageIcon
} from 'lucide-react';

export type ToolView =
    | 'home' | 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr'
    | 'social' | 'favicon' | 'units' | 'encrypt' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'case' | 'string'
    | 'json-xml' | 'date-time' | 'sql-formatter' | 'web-toolkit' | 'network-toolkit' | 'password-generator'
    | 'svg-optimizer' | 'cron-builder' | 'timezone-converter' | 'color-toolkit' | 'regex-tester'
    | 'csv-viewer' | 'markdown-editor' | 'json-ld' | 'network-cable' | 'lorem-ipsum' | 'aspect-ratio'
    | 'social-guide' | 'http-status' | 'json-csv' | 'word-pdf' | 'pdf-word' | 'excel-pdf' | 'pdf-excel'
    | 'ppt-pdf' | 'pdf-ppt' | 'pdf-image' | 'imagetopdf'
    | 'text-cleaner' | 'case-converter-pro' | 'css-units' | 'date-calculator' | 'internet-speed'
    | 'iban-checker' | 'tckn-checker' | 'file-size-calc' | 'viewport-calc' | 'exif-viewer' | 'bulk-rename'
    | 'email-header-analyzer';

interface LandingHeroProps {
    onFileSelect: (file: File) => void;
    onToolSelect: (tool: ToolView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onToolSelect }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <div className="px-4 pb-20">
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center relative pt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(167,139,250,0.15)_0%,rgba(96,165,250,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-4 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>80+ Ücretsiz Araç | %100 Güvenli ve Çevrimdışı</span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 max-w-[900px] text-slate-900 dark:text-white">
                    Profesyonel <span className="text-blue-600 dark:text-blue-400">Dijital Araçlar</span> <br />
                    Elinizin Altında.
                </h1>

                <p className="text-slate-500 dark:text-slate-400 max-w-[600px] mb-12 text-lg font-medium">
                    Dosyalarınızı tarayıcıdan çıkarmadan, %100 güvenli ve hızlı bir şekilde işleyin.
                    Popüler araçlara aşağıdan hızlıca erişebilirsiniz.
                </p>

                {/* Main Tool Grid */}
                <div className="w-full max-w-[1000px] grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20 relative z-20">
                    <HeroLink title="PDF Araçları" desc="Birleştir, Böl, Sıkıştır" icon={<FileText />} color="blue" onClick={() => onToolSelect('pdf')} />
                    <HeroLink title="Resim Sıkıştır" desc="%80 tasarruf ile ölçekle" icon={<ImageIcon />} color="emerald" onClick={() => onToolSelect('optimize')} />
                    <HeroLink title="Case Converter" desc="camelCase, snake_case Pro" icon={<Type />} color="indigo" onClick={() => onToolSelect('case-converter-pro')} />
                    <HeroLink title="Metin Temizleyici" desc="Boşluk, Emoji, Normalizasyon" icon={<RefreshCw />} color="amber" onClick={() => onToolSelect('text-cleaner')} />
                    <HeroLink title="Tarih Hesaplayıcı" desc="İki tarih arası gün say" icon={<Clock />} color="purple" onClick={() => onToolSelect('date-calculator')} />
                    <HeroLink title="Hız & Süre" desc="Dosya kaç dakikada iner?" icon={<Zap />} color="rose" onClick={() => onToolSelect('internet-speed')} />
                    <HeroLink title="CSS / Dev Units" desc="px ↔ rem ↔ em ↔ vw" icon={<Code />} color="sky" onClick={() => onToolSelect('css-units')} />
                    <HeroLink title="Media EXIF" desc="Görsel metadata görüntüle" icon={<Camera />} color="orange" onClick={() => onToolSelect('exif-viewer')} />
                </div>

                {/* Quick Search */}
                <div className="relative w-full max-w-xl mx-auto mb-20 px-4">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Hangi aracı arıyorsun? (Örn: pdf birleştir, exif temizle)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl py-4 pl-14 pr-4 text-base focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xl shadow-blue-500/10 dark:shadow-none"
                    />
                </div>
            </div>

            {/* Categorized Tools Menu */}
            <div className="w-full max-w-[1240px] mx-auto">
                <div className="flex flex-col gap-20">
                    {/* Category: Öne Çıkanlar */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400"><Zap size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Hızlı Dönüşümler</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <QuickAction title="Word → PDF" onClick={() => onToolSelect('word-pdf')} icon={<FileText size={16} />} color="blue" />
                            <QuickAction title="PDF → Word" onClick={() => onToolSelect('pdf-word')} icon={<FileText size={16} />} color="red" />
                            <QuickAction title="Resim → PDF" onClick={() => onToolSelect('imagetopdf')} icon={<ImageIcon size={16} />} color="emerald" />
                            <QuickAction title="PDF → Resim" onClick={() => onToolSelect('pdf-image')} icon={<ImageIcon size={16} />} color="sky" />
                            <QuickAction title="Dosya Boyutu" onClick={() => onToolSelect('file-size-calc')} icon={<Archive size={16} />} color="indigo" />
                            <QuickAction title="Aspect Ratio" onClick={() => onToolSelect('aspect-ratio')} icon={<Layers size={16} />} color="orange" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const HeroLink = ({ title, desc, icon, color, onClick }: { title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group p-6 text-left bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] transition-all duration-300 hover:border-blue-500/50 dark:hover:border-white/20 hover:-translate-y-2 active:scale-95 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
    >
        <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6
            ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
            ${color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
            ${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : ''}
            ${color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}
            ${color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : ''}
            ${color === 'rose' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : ''}
            ${color === 'sky' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' : ''}
            ${color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : ''}
        `}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 28 } as any) : icon}
        </div>
        <h4 className="text-base font-black mb-1 text-slate-800 dark:text-white uppercase tracking-tight">{title}</h4>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-snug">{desc}</p>
    </button>
);

const QuickAction = ({ title, onClick, icon, color }: { title: string, onClick: () => void, icon?: React.ReactNode, color: string }) => (
    <button
        onClick={onClick}
        className="group flex items-center gap-2 p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl hover:border-blue-300 dark:hover:border-white/10 transition-all text-left shadow-sm dark:shadow-none"
    >
        <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110
            ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
            ${color === 'red' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : ''}
            ${color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
            ${color === 'sky' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' : ''}
            ${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : ''}
            ${color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : ''}
        `}>
            {icon}
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{title}</span>
    </button>
);
