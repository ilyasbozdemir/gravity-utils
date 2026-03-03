import React, { useState } from 'react';
import {
    Search, Zap, FileText, Smartphone, Globe, Terminal,
    FileCode, Code, Star, Layout, Database, ShieldCheck,
    Type, Smartphone as Mobile, Clock, Calculator, Lock, Hash, RefreshCw, Layers,
    Image as ImageIcon, Monitor
} from 'lucide-react';

interface HomeViewProps {
    onAction: (view: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onAction }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-8">
            {/* Hero Section - Mirroring Web Pro Look */}
            <div className="flex flex-col items-center justify-center text-center relative pt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,rgba(30,58,138,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-6 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 inline-flex items-center gap-2 text-xs text-blue-400 font-black uppercase tracking-widest">
                    <Star size={14} className="fill-blue-400" />
                    <span>80+ Ücretsiz Masaüstü Aracı | %100 Güvenli ve Çevrimdışı</span>
                </div>

                <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-white max-w-4xl">
                    Profesyonel <span className="text-blue-500 italic">Dijital Laboratuvarınız.</span> <br />
                    Masaüstünde.
                </h1>

                <p className="text-slate-500 text-lg font-bold tracking-tight max-w-2xl mb-12">
                    Dosyalarınızı tarayıcıya ihtiyaç duymadan, %100 gizli ve yüksek performanslı
                    <span className="text-blue-500"> Bozdemir Engine</span> gücüyle işleyin.
                </p>

                {/* Main Tool Grid (Mirroring Web) */}
                <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
                    <HeroLink title="Hızlı Dosya Dönüştür" desc="Format sınırı olmadan yerel disk gücü." icon={<Zap />} color="blue" onClick={() => onAction('converter')} />
                    <HeroLink title="PDF Master Merkezi" desc="Tüm PDF araçları tek bir panelde." icon={<FileText />} color="emerald" onClick={() => onAction('pdf-manager')} />
                    <HeroLink title="Geliştirici Terminali" desc="Kod ve JSON araçları masada." icon={<Terminal />} color="amber" onClick={() => onAction('dev-tools')} />
                    <HeroLink title="Sistem Diagnostiği" desc="PC donanım ve CPU durum paneli." icon={<Layout />} color="violet" onClick={() => onAction('system')} />
                </div>

                {/* Quick Search (Exactly like web) */}
                <div className="relative w-full max-w-2xl mx-auto mb-10 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Hangi aracı arıyorsun? (Örn: pdf birleştir, json format)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0e121b] border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all text-white placeholder:text-slate-600 font-bold"
                    />
                </div>
            </div>

            {/* Categorized Tools Menu (Native Mirroring Web Categories) */}
            <div className="w-full space-y-24">
                {/* Hızlı Dönüşümler */}
                <ToolCategory title="Hızlı Dönüşümler" icon={<Zap className="text-amber-500" />}>
                    <QuickAction title="Word → PDF" onClick={() => onAction('pdf-manager')} icon={<FileText size={16} />} color="blue" />
                    <QuickAction title="Resim → PDF" onClick={() => onAction('pdf-manager')} icon={<ImageIcon size={16} />} color="emerald" />
                    <QuickAction title="Dosya Boyutu" onClick={() => onAction('system')} icon={<Layers size={16} />} color="indigo" />
                    <QuickAction title="Format Değiştir" onClick={() => onAction('converter')} icon={<RefreshCw size={16} />} color="orange" />
                </ToolCategory>

                {/* Tasarım & Kod */}
                <ToolCategory title="Tasarım & Kod Pro" icon={<Code className="text-pink-500" />}>
                    <QuickAction title="JSON Format" onClick={() => onAction('dev-tools')} icon={<FileCode size={16} />} color="amber" />
                    <QuickAction title="JSON ↔ XML" onClick={() => onAction('dev-tools')} icon={<Database size={16} />} color="emerald" />
                    <QuickAction title="Base64 Code" onClick={() => onAction('dev-tools')} icon={<FileCode size={16} />} color="blue" />
                    <QuickAction title="Regex Tester" onClick={() => onAction('dev-tools')} icon={<Search size={16} />} color="rose" />
                </ToolCategory>

                {/* SEO & Web */}
                <ToolCategory title="Sistem & Donanım" icon={<Monitor className="text-blue-500" />}>
                    <QuickAction title="CPU Durumu" onClick={() => onAction('system')} icon={<Layout size={16} />} color="blue" />
                    <QuickAction title="Bellek Kullanımı" onClick={() => onAction('system')} icon={<Database size={16} />} color="indigo" />
                    <QuickAction title="Disk Sağlığı" onClick={() => onAction('system')} icon={<Layers size={16} />} color="emerald" />
                    <QuickAction title="Process Kontrol" onClick={() => onAction('system')} icon={<Terminal size={16} />} color="amber" />
                </ToolCategory>
            </div>
        </div>
    );
};

const HeroLink = ({ title, desc, icon, color, onClick }: any) => {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    };

    return (
        <button
            onClick={onClick}
            className="group p-8 text-left bg-[#0e121b] border border-white/5 rounded-[3rem] transition-all hover:border-blue-500/30 hover:-translate-y-2 active:scale-95 relative overflow-hidden h-full shadow-2xl"
        >
            <div className={`mb-6 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 32 }) : icon}
            </div>
            <h4 className="text-lg font-black mb-1 text-white uppercase tracking-tight">{title}</h4>
            <p className="text-[13px] text-slate-500 font-bold leading-tight">{desc}</p>
        </button>
    );
};

const ToolCategory = ({ title, icon, children }: any) => (
    <section>
        <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-white/5 rounded-2xl">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </section>
);

const QuickAction = ({ title, onClick, icon, color }: any) => {
    const colors: any = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };

    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-white/10 transition-all text-left"
        >
            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${colors[color]}`}>
                {icon}
            </div>
            <span className="text-[13px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{title}</span>
        </button>
    );
};

export default HomeView;
