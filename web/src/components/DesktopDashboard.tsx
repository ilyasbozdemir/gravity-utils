"use client";

import React, { useEffect, useState } from 'react';
import { Monitor, Cpu, HardDrive, User, Terminal, Info } from 'lucide-react';
import { useIsElectron, getSystemInfo } from '../utils/electron';

export const DesktopDashboard: React.FC = () => {
    const isApp = useIsElectron();
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        if (isApp) {
            getSystemInfo().then(setInfo);
        }
    }, [isApp]);

    if (!isApp || !info) return null;

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                        <Cpu size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">İşlemci Gücü</span>
                </div>
                <div className="text-2xl font-black text-slate-100">{info.cpus} Çekirdek</div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{info.arch} Mimarisi</p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 group-hover:scale-110 transition-transform">
                        <HardDrive size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bellek</span>
                </div>
                <div className="text-2xl font-black text-slate-100">{info.memory} GB RAM</div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Sistem Toplamı</p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                        <User size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Kullanıcı</span>
                </div>
                <div className="text-2xl font-black text-slate-100 truncate">{info.user}</div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Masaüstü Oturumu</p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                        <Terminal size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Motor</span>
                </div>
                <div className="text-2xl font-black text-slate-100 italic">Bozdemir v1</div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Gravity Desktop Engine</p>
            </div>
        </div>
    );
};
