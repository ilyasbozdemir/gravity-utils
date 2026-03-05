"use client";

import React, { useEffect, useState } from 'react';
import {
    Monitor, Cpu, HardDrive, User, Terminal, FolderOpen,
    ShieldCheck, Zap, ArrowLeft, ExternalLink, RefreshCw,
    Download, Info
} from 'lucide-react';
import { isDesktop } from '../index';

interface DesktopToolkitProps {
    onBack: () => void;
    onViewOTA?: () => void;
}

export const DesktopToolkit: React.FC<DesktopToolkitProps> = ({ onBack, onViewOTA }) => {
    const [info, setInfo] = useState<any>(null);
    const [paths, setPaths] = useState<any>(null);
    const [engineStatus, setEngineStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isApp, setIsApp] = useState(false);
    useEffect(() => setIsApp(isDesktop()), []);

    useEffect(() => {
        if (isApp) {
            const electron = (window as any).electron;
            Promise.all([
                electron.getSystemInfo(),
                electron.getAppPaths(),
                electron.getEngineStatus()
            ]).then(([sys, p, engine]) => {
                setInfo(sys);
                setPaths(p);
                setEngineStatus(engine);
                setLoading(false);
            });
        }
    }, [isApp]);

    if (!isApp) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <Monitor size={64} className="text-slate-300 mb-6" />
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Bu Araç Sadece Masaüstünde Çalışır</h2>
                <p className="text-slate-500 max-w-sm">
                    Bu özellik sistem çekirdeğine erişim gerektirdiği için sadece Gravity Utils Desktop sürümü ile kullanılabilir.
                </p>
                <button onClick={onBack} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Geri Dön</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-40">
                <RefreshCw size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10 text-left">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Monitor className="text-blue-500" /> Masaüstü Motoru Paneli
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Bozdemir Desktop Engine v1.0.0 • Pro Entegrasyon</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: System Status */}
                <div className="lg:col-span-2 space-y-8 text-left">

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatusCard
                            icon={<Zap />}
                            label="Motor Durumu"
                            value={engineStatus?.status || 'Aktif'}
                            sub={`Build: ${engineStatus?.buildId || 'v1.0'} | RAM: ${Math.round(engineStatus?.memory || 0)} MB`}
                            color="amber"
                        />
                        <StatusCard
                            icon={<Cpu />}
                            label="İşlemci Mimarisi"
                            value={info?.arch?.toUpperCase() || '...'}
                            sub={`${info?.cpus || 0} Mantıksal Çekirdek`}
                            color="blue"
                        />
                        <StatusCard
                            icon={<HardDrive />}
                            label="Sistem Belleği"
                            value={`${info?.memory || 0} GB RAM`}
                            sub="Fiziksel Bellek Toplamı"
                            color="violet"
                        />
                        <StatusCard
                            icon={<User />}
                            label="Oturum Sahibi"
                            value={info?.user || 'Kullanıcı'}
                            sub={`Engine Uptime: ${Math.round(engineStatus?.uptime || 0)}s`}
                            color="emerald"
                        />
                    </div>

                    {/* Quick Paths */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-left">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <FolderOpen className="text-blue-500" size={18} /> Sistem Hızlı Erişimleri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(paths).map(([key, path]: any) => (
                                <button
                                    key={key}
                                    onClick={() => (window as any).electron.openPath(path)}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-blue-500/30 group transition-all"
                                >
                                    <div className="flex items-center gap-4 text-left overflow-hidden">
                                        <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <FolderOpen size={16} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{key}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate w-full font-mono">{path}</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Tools */}
                <div className="space-y-6 text-left">
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-500/20">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-black mb-2 relative z-10">Akıllı OTA Aktif</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10 opacity-80">
                            Bozdemir Engine sayesinde uygulama içinden setup gerektirmeden güncellenir.
                        </p>
                        <button
                            onClick={onViewOTA}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-black transition-all backdrop-blur-md border border-white/20 flex items-center gap-2"
                        >
                            <Info size={14} /> Nasıl Çalışır?
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Engine İşlemleri</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <ActionButton
                                icon={<RefreshCw size={16} />}
                                label="Uygulamayı Yenile"
                                onClick={() => window.location.reload()}
                            />
                            <ActionButton
                                icon={<Download size={16} />}
                                label="İndirme Klasörünü Aç"
                                onClick={() => (window as any).electron.openPath(paths.downloads)}
                            />
                            <ActionButton
                                icon={<Zap size={16} />}
                                label="Güncellemeleri Tara"
                                onClick={() => (window as any).electron.getEngineStatus().then(() => alert("Bozdemir Engine güncel sürüm denetliyor..."))}
                            />
                        </div>
                    </div>

                    <div className="text-center p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            Designed & Developed by<br />
                            <span className="text-blue-500 text-xs text-left">ILYAS BOZDEMIR</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Internal Components
const StatusCard = ({ icon, label, value, sub, color }: any) => {
    const colorMap: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };

    return (
        <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-3xl p-6 hover:translate-y-[-4px] transition-all">
            <div className={`p-2.5 rounded-xl w-fit mb-4 border ${colorMap[color]}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{value}</h4>
            <p className="text-xs text-slate-500 font-medium">{sub}</p>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick }: any) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
    >
        <span className="text-slate-500 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{icon}</span>
        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
    </button>
);
