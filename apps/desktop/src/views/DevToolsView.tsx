import React from 'react';
import {
    Code2, Braces, Search, Terminal,
    Layers, Cpu, Zap, ArrowRight, Save, Copy,
    Database, FileCode, CheckCircle2, ShieldCheck,
    Hash, Github, Globe, RefreshCw, Smartphone
} from 'lucide-react';

const DevToolsView: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 w-fit">
                    <Terminal size={14} className="fill-blue-400" /> BOZDEMIR DEV TOOLS EX v3.2
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-none text-white">
                    Geliştirici <span className="text-blue-500 italic">Laboratuvarı.</span>
                </h1>
                <p className="text-slate-500 text-lg font-bold tracking-tight max-w-2xl">
                    Kod, JSON, Regex ve Debugger araçları masaüstü gücüyle. Tamamen çevrimdışı
                    ve <span className="text-blue-500">Bozdemir Core</span> motoru ile yüksek hızlı veri işleme.
                </p>
            </div>

            {/* Quick Access Tool Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <HeroLink title="JSON İşlemci Pro" desc="Daha hızlı veri ağacı oluştur." icon={<Braces />} color="amber" />
                <HeroLink title="Kod Güzelleştirici" desc="Temiz kod, profesyonel çıktı." icon={<Code2 />} color="blue" />
                <HeroLink title="Regex Laboratuvarı" desc="İfadeleri test et ve oluştur." icon={<Search />} color="emerald" />
                <HeroLink title="Base64 & Hash" desc="Güvenli şifreleme araçları." icon={<Hash />} color="rose" />
            </div>

            {/* Interactive Workspace (Split View) */}
            <div className="bg-[#0e121b] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col min-h-[650px] relative shadow-2xl">
                {/* Workspace Header Toolbar */}
                <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        <div className="flex gap-4">
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">JSON Formatter</button>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">Schema View</button>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">Minify</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button title="Kopyala" className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                            <Copy size={18} />
                        </button>
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20">
                            <Save size={18} /> Kaydet / Dışa Aktar
                        </button>
                    </div>
                </div>

                {/* Main Workspace Splitter */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 border-r border-white/5 relative bg-[#06070a] group">
                        <div className="absolute top-6 left-10 text-[10px] font-black uppercase tracking-widest text-slate-700 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none">Input Source</div>
                        <textarea
                            className="w-full h-full bg-transparent p-12 pt-16 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-800 transition-all"
                            placeholder='{"key": "value", "array": [1, 2, 3]}'
                        ></textarea>
                    </div>
                    <div className="flex-1 relative bg-black/50">
                        <div className="absolute top-6 left-10 text-[10px] font-black uppercase tracking-widest text-slate-700 z-10 pointer-events-none">Result Viewer</div>
                        <div className="w-full h-full p-12 pt-16 text-emerald-400 font-mono text-sm overflow-auto">
                            <span className="text-slate-800 italic uppercase tracking-[0.2em] text-[11px] font-black group-hover:text-blue-800 transition-colors">// Veri girişi bekliyor...</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Footer State */}
                <div className="px-10 py-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                    <div className="flex gap-8">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div> Engine Ready</span>
                        <span className="flex items-center gap-2">UTF-8 Encoding</span>
                        <span className="text-blue-500/50 hover:text-blue-500 transition-colors cursor-pointer">Local Storage Active</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-slate-800">Bozdemir core-v3.2.0</span>
                        <div className="h-4 w-px bg-white/5"></div>
                        <span className="text-emerald-500/50">Runtime: 12ms</span>
                    </div>
                </div>
            </div>

            {/* Additional Dev Toolkit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="p-8 bg-[#0e121b] border border-white/5 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20"><Database size={24} /></div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">SQL Schema Expert</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        SQL şemalarını otomatik optimize edin, JSON verilerini SQL tablolarına dönüştürün veya karmaşık sorguları tek tıkla formatlayın.
                    </p>
                </div>
                <div className="p-8 bg-[#0e121b] border border-white/5 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20"><CheckCircle2 size={24} /></div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">XML / XSD Validator Pro</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        Endüstriyel standartlarda XML doğrulama ve XSD şema uyumluluğu kontrolü. Büyük dosyalar için özel olarak tasarlanmış native motor.
                    </p>
                </div>
            </div>
        </div>
    );
};

const HeroLink = ({ title, desc, icon, color }: any) => {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };

    return (
        <button className="group p-8 text-left bg-[#06070a] border border-white/5 rounded-[3rem] transition-all hover:bg-[#0e121b] hover:border-blue-500/30 hover:-translate-y-2 active:scale-95 relative overflow-hidden h-full">
            <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 32 }) : icon}
            </div>
            <h4 className="text-lg font-black mb-1 text-white uppercase tracking-tight leading-none">{title}</h4>
            <p className="text-[11px] text-slate-600 font-bold leading-tight uppercase tracking-widest mt-2">{desc}</p>
        </button>
    );
};

export default DevToolsView;
