import React from 'react';
import { FileType, Archive, Image as ImageIcon, ShieldCheck, Zap, Star } from 'lucide-react';
import { FileDropper } from './FileDropper';

interface LandingHeroProps {
    onFileSelect: (file: File) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onFileSelect }) => {
    return (
        <div className="px-4">
            {/* Hero Section */}
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(167,139,250,0.15)_0%,rgba(96,165,250,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-2 text-sm text-slate-400">
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>Beta Sürümü Yayında</span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 max-w-[900px] bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                    Dosyalarınız İçin <br />
                    <span className="text-blue-400">Süper Güçler.</span>
                </h1>

                <p className="text-[clamp(1.1rem,2vw,1.25rem)] text-slate-400 max-w-[600px] mb-12 leading-relaxed">
                    Format dönüştürme, içerik inceleme ve optimizasyon.
                    Hepsi tarayıcınızda, kurulumsuz ve %100 güvenli.
                </p>

                {/* Main Action Area */}
                <div className="w-full max-w-[600px] relative z-10">
                    <div className="p-2 rounded-3xl bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-xl">
                        <FileDropper onFileSelect={onFileSelect} />
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex gap-8 justify-center opacity-60">
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck size={18} /> Sunucusuz Çalışır
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Zap size={18} /> Anında İşlem
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="w-full max-w-[1200px] mx-auto py-16">
                <h3 className="text-center mb-12 text-2xl font-semibold">Tüm Araçlar Tek Noktada</h3>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
                    <FeatureCard
                        icon={<FileType size={32} className="text-blue-400" />}
                        title="Evrensel Dönüştürücü"
                        desc="Resimlerden PDF'e, Word'den metne. Dosyalarınızı ihtiyacınız olan formata saniyeler içinde çevirin."
                    />
                    <FeatureCard
                        icon={<Archive size={32} className="text-pink-400" />}
                        title="Derinlemesine İnceleme"
                        desc="Zip arşivlerini veya Office belgelerini açmadan içindekileri görün. Gizli dosyaları keşfedin."
                    />
                    <FeatureCard
                        icon={<ImageIcon size={32} className="text-emerald-400" />}
                        title="Medya Optimizasyonu"
                        desc="Görüntü kalitesinden ödün vermeden dosya boyutlarını küçültün ve web için hazırlayın."
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 text-left transition-all duration-300 cursor-default bg-white/[0.02] border border-white/5 hover:-translate-y-2 hover:bg-white/5 rounded-2xl group">
        <div className="mb-6 bg-white/5 w-fit p-3 rounded-xl">
            {icon}
        </div>
        <h4 className="text-xl font-semibold mb-3 text-white">{title}</h4>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);
