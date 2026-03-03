import React from 'react';
import { Monitor, Download, Zap, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';

export const DesktopPromotion: React.FC = () => {
    return (
        <section className="px-8 max-w-[1400px] mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative overflow-hidden rounded-[3.5rem] bg-[#06070a] border border-white/5 shadow-2xl group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 -z-10"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 lg:p-20 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-xs font-black uppercase tracking-widest text-blue-400">
                            <Zap size={14} className="fill-blue-400" /> Masaüstü Gücü Şimdi Yayında
                        </div>

                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                            Gravity Utils <br />
                            <span className="text-blue-500 italic">Masaüstünde.</span>
                        </h2>

                        <p className="text-slate-400 text-lg lg:text-xl font-bold leading-relaxed max-w-xl">
                            Tarayıcı kısıtlamalarından kurtulun. Gelişmiş <span className="text-white">Bozdemir Desktop Engine</span> ile
                            büyük dosyaları saniyeler içinde, %100 çevrimdışı ve güvenli bir şekilde işleyin.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <FeatureItem icon={<ShieldCheck className="text-emerald-500" />} text="%100 Gizlilik: Veriler Cihazda Kalır" />
                            <FeatureItem icon={<Zap className="text-amber-500" />} text="20x Daha Hızlı Dosya İşleme" />
                            <FeatureItem icon={<Smartphone className="text-blue-500" />} text="RAM & CPU Tasarruflu Mimari" />
                            <FeatureItem icon={<Monitor className="text-purple-500" />} text="Native Windows Entegrasyonu" />
                        </div>

                        <div className="flex flex-wrap gap-6 pt-10 items-end">
                            <div className="flex flex-col gap-3">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); alert('Gravity Desktop v3.1.0 yakında indirmeye açılacaktır! Beklemede kalın.'); }}
                                    className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-lg uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 group"
                                >
                                    <Download size={24} className="group-hover:animate-bounce" /> Windows İçin İndir (.exe)
                                </a>
                                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    SHA256: 7e3d8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e
                                </div>
                            </div>
                            <div className="flex flex-col justify-center mb-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sürüm: 3.1.0-PRO-FINAL</span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">Windows 10/11 Desteklenir</span>
                            </div>
                        </div>

                        {/* Quick Hash Verify Tool */}
                        <div className="mt-12 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-sm relative group/tool overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/tool:opacity-30 transition-opacity">
                                <ShieldCheck size={120} className="text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Monitor size={16} className="text-blue-500" />
                                Güvenlik Doğrulama Paneli
                            </h4>
                            <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
                                İndirdiğiniz .exe dosyasının bütünlüğünü kontrol edin. <br />
                                <span className="text-emerald-500/80 italic">Orijinal dosya imzası ile karşılaştırmak her zaman güvenlidir.</span>
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="İndirdiğiniz dosyanın hash değerini yapıştırın..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                />
                                <button className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                                    Doğrula
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/mockup">
                        {/* Fake App Mockup */}
                        <div className="relative aspect-[16/10] bg-[#0c0e14] rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden transform group-hover/mockup:scale-[1.02] group-hover/mockup:-rotate-1 transition-all duration-700">
                            {/* Window Header */}
                            <div className="h-8 bg-[#161b22] border-b border-white/5 flex items-center px-4 justify-between">
                                <div className="flex gap-1.5 leading-none">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                                </div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gravity Desktop Engine</div>
                                <div className="w-10"></div>
                            </div>
                            {/* Content Mockup */}
                            <div className="p-8 space-y-6 opacity-40">
                                <div className="h-4 w-32 bg-slate-800 rounded-full"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-24 bg-white/5 rounded-3xl border border-white/5"></div>
                                    <div className="h-24 bg-white/5 rounded-3xl border border-white/5"></div>
                                </div>
                                <div className="h-40 bg-blue-600/5 rounded-[2rem] border border-blue-500/10 flex items-center justify-center">
                                    <Zap size={48} className="text-blue-500/20" />
                                </div>
                            </div>

                            {/* Overlay Badge */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-blue-600/90 backdrop-blur-md px-8 py-4 rounded-2xl font-black text-white uppercase tracking-[0.3em] shadow-2xl border border-blue-400/50 -rotate-12 scale-110">
                                    Native Build
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl border border-white/5">
            {icon}
        </div>
        <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{text}</span>
    </div>
);
