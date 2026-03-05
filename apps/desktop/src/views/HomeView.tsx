import React, { useState } from 'react';
import {
    Lock, Share2, MousePointer2, Settings, Smartphone, RefreshCw, Layers, Globe,
    Type, Clock, Camera, Zap, Star, Calculator, FileText, Minimize2, Hash, Code, Search, QrCode, Archive, Database,
    Split, FileCode, CheckCircle2, ShieldCheck, Layout, Terminal,
    Image as ImageIcon, Palette
} from 'lucide-react';

interface HomeViewProps {
    onAction: (view: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onAction }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center relative pt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(96,165,250,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-4 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>80+ Masaüstü Aracı | %100 Güvenli ve Çevrimdışı</span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 max-w-[900px] text-slate-900 dark:text-white">
                    Profesyonel <span className="text-blue-600 dark:text-blue-400">Dijital Araçlar</span> <br />
                    Masaüstünde.
                </h1>

                <p className="text-slate-500 dark:text-slate-400 max-w-[600px] mb-12 text-lg font-medium">
                    Dosyalarınızı tarayıcıya ihtiyaç duymadan, %100 gizli ve yüksek performanslı Bozdemir Engine gücüyle işleyin.
                </p>

                {/* Main Tool Grid */}
                <div className="w-full max-w-[1100px] grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 relative z-20">
                    <HeroLink title="Dosya Dönüştür" desc="Format sınırı olmadan" icon={<Zap />} color="blue" onClick={() => onAction('converter')} />
                    <HeroLink title="PDF Merkezi" desc="Tüm PDF araçları tek yerde" icon={<FileText />} color="emerald" onClick={() => onAction('pdf-manager')} />
                    <HeroLink title="Geliştirici" desc="Kod ve Terminal" icon={<Terminal />} color="amber" onClick={() => onAction('dev-tools')} />
                    <HeroLink title="Medya & Görsel" desc="EXIF ve Medya" icon={<ImageIcon />} color="rose" onClick={() => onAction('media-tools')} />
                </div>

                {/* Quick Search */}
                <div className="relative w-full max-w-xl mx-auto mb-20 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                        type="text"
                        placeholder="Hangi aracı arıyorsun?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl py-5 pl-16 pr-8 text-base focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xl shadow-blue-500/10 dark:shadow-none font-medium"
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
                            <QuickAction title="PDF Birleştir" onClick={() => onAction('pdf-manager')} icon={<Layers size={16} />} color="blue" />
                            <QuickAction title="Word → PDF" onClick={() => onAction('document-toolkit')} icon={<FileText size={16} />} color="red" />
                            <QuickAction title="Medya Dönüştür" onClick={() => onAction('media-tools')} icon={<ImageIcon size={16} />} color="emerald" />
                            <QuickAction title="Hızlı Dönüştür" onClick={() => onAction('converter')} icon={<Archive size={16} />} color="indigo" />
                            <QuickAction title="Ofis Araçları" onClick={() => onAction('office-tools')} icon={<Globe size={16} />} color="sky" />
                        </div>
                    </section>

                    {/* Category: Tasarım & Kod */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400"><Layout size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tasarım & Kod Pro</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <QuickAction title="Tasarım Araçları" onClick={() => onAction('design-tools')} icon={<Palette size={16} />} color="pink" />
                            <QuickAction title="JSON İşlemleri" onClick={() => onAction('dev-tools')} icon={<FileCode size={16} />} color="blue" />
                            <QuickAction title="Veri Düzenleyici" onClick={() => onAction('data-tools')} icon={<Database size={16} />} color="emerald" />
                            <QuickAction title="Kod Terminali" onClick={() => onAction('dev-tools')} icon={<Terminal size={16} />} color="orange" />
                        </div>
                    </section>

                    {/* Category: Güvenlik & Doğrulama */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400"><ShieldCheck size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Güvenlik & Doğrulama</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <QuickAction title="Doğrulama Araçları" onClick={() => onAction('check-toolkit')} icon={<ShieldCheck size={16} />} color="blue" />
                            <QuickAction title="Hash & Güvenlik" onClick={() => onAction('security')} icon={<Lock size={16} />} color="rose" />
                            <QuickAction title="Ağ Güvenliği" onClick={() => onAction('network-toolkit')} icon={<Globe size={16} />} color="emerald" />
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
        className="group p-6 text-left bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] transition-all duration-300 hover:border-blue-500/50 dark:hover:border-white/20 hover:-translate-y-2 active:scale-95 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden h-full"
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
            ${color === 'pink' ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : ''}
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
            ${color === 'pink' ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : ''}
            ${color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}
        `}>
            {icon}
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
    </button>
);

export default HomeView;
