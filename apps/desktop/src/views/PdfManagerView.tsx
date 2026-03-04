import React from 'react';
import {
    FileText, Scissors, Combine, FileSignature,
    Zap, ArrowRight, Download, Eye, Trash2, Plus,
    ArrowLeft, History, FileStack, Minimize2, Stamp,
    RefreshCw, FileType, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';

const PdfManagerView: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Mirroring Web Aesthetics */}
            <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 w-fit">
                    <Zap size={14} className="fill-emerald-400 animate-pulse" /> BOZDEMIR NATIVE ENGINE v3.0
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-none text-white">
                    PDF <span className="text-emerald-500 italic">Master Merkezi.</span>
                </h1>
                <p className="text-slate-500 text-lg font-bold tracking-tight max-w-2xl">
                    Tarayıcı sınırlaması olmadan, yerel disk üzerinden yüksek hızlı PDF yönetimi.
                    Tüm işlemler <span className="text-emerald-500">%100 gizli ve cihazınızda</span> gerçekleşir.
                </p>
            </div>

            {/* Smart Upload Section (Style like web) */}
            <section className="relative overflow-hidden p-10 rounded-[3.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-2xl shadow-emerald-500/10 border border-emerald-400/20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <FileText size={250} />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Akıllı PDF İşleme Aktif
                        </div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight">Hangi dökümanı<br />işlemek istersiniz?</h2>
                        <p className="text-emerald-100/70 text-lg font-bold">Dosyayı yan panele sürükleyin veya buraya tıklayın. Bozdemir Engine içeriği analiz edip size en iyi araçları sunacaktır.</p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <Plus size={18} className="text-emerald-300" />
                                <span className="text-xs font-black uppercase tracking-widest">Dosya Ekle</span>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-2xl border border-white/5 opacity-50">
                                <History size={18} className="text-emerald-300" />
                                <span className="text-xs font-black uppercase tracking-widest">Son İşlemler</span>
                            </div>
                        </div>
                    </div>

                    <div className="group aspect-video rounded-[3rem] border-4 border-dashed border-white/20 hover:border-emerald-400/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer relative overflow-hidden">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500">
                            <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-2xl uppercase tracking-tighter italic">PDF DOSYASINI BIRAKIN</p>
                            <p className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.3em] mt-1 opacity-60">High-Precision Desktop Engine</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Suite Tools Grid */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <FileStack size={18} className="text-emerald-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">PDF Master Suite Tools</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BigActionCard
                        title="PDF Birleştir"
                        desc="Birden fazla dosyayı tek dökümanda and topla."
                        icon={<Combine size={24} />}
                        color="emerald"
                    />
                    <BigActionCard
                        title="Sayfa Ayırıcı"
                        desc="Belirli sayfaları çıkar veya yeni PDF'ler yap."
                        icon={<Scissors size={24} />}
                        color="blue"
                    />
                    <BigActionCard
                        title="Boyut Sıkıştır"
                        desc="Kaliteyi bozmadan %90'a varan sıkıştırma."
                        icon={<Minimize2 size={24} />}
                        color="amber"
                    />
                    <BigActionCard
                        title="Mühür & İmza"
                        desc="Dökümanlara dijital mühür veya imza ekleyin."
                        icon={<Stamp size={24} />}
                        color="violet"
                    />
                </div>
            </section>

            {/* Converter Options (Quick X to Y) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <RefreshCw size={18} className="text-blue-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Popüler PDF Dönüşümleri</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <ToolCard title="Word → PDF" desc="DOCX dökümanı çevir" icon={<FileText size={16} />} color="blue" />
                    <ToolCard title="PDF → Word" desc="Düzenlenebilir Word yap" icon={<FileText size={16} />} color="red" />
                    <ToolCard title="Görsel → PDF" desc="Hızlı PDF oluştur" icon={<Plus size={16} />} color="emerald" />
                    <ToolCard title="PDF → Görsel" desc="JPG/PNG olarak çıkar" icon={<ArrowRight size={16} />} color="sky" />
                </div>
            </section>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div className="p-8 bg-[#0e121b] border border-white/5 rounded-[2.5rem] flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Maximum Güvenlik</h4>
                        <p className="text-sm text-slate-500 font-bold leading-relaxed">
                            Masaüstü sürümünde verileriniz internete çıkmaz. Tamamen yerel (local) işleme ile gizlilik en üst düzeydedir.
                        </p>
                    </div>
                </div>
                <div className="p-8 bg-[#0e121b] border border-white/5 rounded-[2.5rem] flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Nasıl Çalışır?</h4>
                        <p className="text-sm text-slate-500 font-bold leading-relaxed">
                            Dosyayı seçin, aracı belirleyin ve 'İşlemi Başlat' butonuna basın. Bozdemir Engine saniyeler içinde sonucu verecektir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolCard = ({ title, desc, icon, color }: any) => {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        red: "text-red-400 bg-red-500/10 border-red-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    };

    return (
        <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/30 transition-all text-left group">
            <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[12px] font-black uppercase text-white tracking-tight">{title}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">{desc}</p>
            </div>
        </button>
    );
};

const BigActionCard = ({ title, desc, icon, color, onClick }: any) => {
    const colors: any = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        violet: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]",
    };

    return (
        <button
            onClick={onClick}
            className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] text-left flex flex-col items-center gap-4 group ${colors[color]}`}
        >
            <div className={`p-5 rounded-2xl transition-transform group-hover:scale-110 ${color === 'emerald' ? 'bg-emerald-500 text-white' : color === 'blue' ? 'bg-blue-500 text-white' : color === 'amber' ? 'bg-amber-500 text-white' : 'bg-violet-500 text-white'}`}>
                {icon}
            </div>
            <div className="text-center">
                <h3 className="font-black uppercase tracking-tight text-sm mb-1">{title}</h3>
                <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">{desc}</p>
            </div>
        </button>
    );
};

export default PdfManagerView;
