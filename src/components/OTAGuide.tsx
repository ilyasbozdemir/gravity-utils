"use client";

import React from 'react';
import {
    Zap, Sparkles, RefreshCw,
    ShieldCheck, Rocket, Github,
    CheckCircle2, Cpu, ArrowLeft, Cloud
} from 'lucide-react';

interface OTAGuideProps {
    onBack: () => void;
}

export const OTAGuide: React.FC<OTAGuideProps> = ({ onBack }) => {
    return (
        <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section */}
            <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Sparkles size={14} className="animate-pulse" /> Bozdemir Desktop Engine
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                    Akıllı Güncelleme <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 animate-gradient">OTA Teknolojisi</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                    Gravity Utils artık klasik bir yazılım değil; kendini yenileyen, arka planda gelişen canlı bir organizma. Yeni sürüm için tekrar .exe indirmenize gerek yok.
                </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-8 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <RefreshCw size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Sessiz Güncelleme</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Yeni sürüm yayınlandığında motorumuz otomatik olarak paketleri arka planda indirir. Siz sadece işinize odaklanın.
                    </p>
                </div>

                <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-8 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Setup Gerektirmez</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Uygulamadan çıkıp tekrar girdiğinizde yeni kodlar hazır olur. "İleri - İleri - Kur" devri kapandı.
                    </p>
                </div>

                <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-8 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                        <Github size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Cloud Entegre</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Bozdemir Engine, doğrudan GitHub altyapısıyla konuşarak en güncel sürümleri anlık olarak denetler.
                    </p>
                </div>
            </div>

            {/* How it works Section */}
            <div className="bg-slate-900 dark:bg-black rounded-[4rem] p-12 text-white relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent -z-0"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-8 flex items-center gap-3 italic">
                            <Rocket className="text-blue-500" /> OTA SÜRECİ NASIL İŞLER?
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-6 group">
                                <div className="text-3xl font-black text-white/10 group-hover:text-blue-500/50 transition-colors uppercase italic">01</div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight">Kontrol</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">Motor her açılışta buluttaki versiyon ile sendeki versiyonu karşılaştırır.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="text-3xl font-black text-white/10 group-hover:text-blue-500/50 transition-colors uppercase italic">02</div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight">Arka Planda İndir</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">Eğer fark varsa, internetini yormadan yeni özellikleri sessizce çeker.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="text-3xl font-black text-white/10 group-hover:text-blue-500/50 transition-colors uppercase italic">03</div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight">Sıcak Kurulum</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">Uygulamayı kapatıp açtığında yeni motor otomatik devreye girer.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h4 className="font-black leading-tight">ENGINE INFO</h4>
                                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Bozdemir Desktop v1.0.0</p>
                            </div>
                        </div>
                        <div className="space-y-4 font-mono text-xs">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-500 uppercase tracking-widest">Update Mode</span>
                                <span className="text-emerald-400 font-bold">AUTOMATIC (OTA)</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-500 uppercase tracking-widest">Provider</span>
                                <span className="text-white">GitHub API v3</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-500 uppercase tracking-widest">Channel</span>
                                <span className="text-blue-400 font-bold">PRODUCTION</span>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                            <p className="text-[11px] leading-relaxed opacity-60">Sistem şu an güncel ve korumalı modda çalışıyor.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <button onClick={onBack} className="text-slate-500 text-sm font-bold uppercase tracking-widest hover:text-blue-500 transition-all flex items-center gap-2 mx-auto">
                    <ArrowLeft size={14} /> Panele Geri Dön
                </button>
            </div>
        </div>
    );
};
