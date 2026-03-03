import React, { useState, useEffect } from 'react';
import {
    Monitor, Cpu, HardDrive, User,
    Activity, ShieldCheck, Zap, RefreshCw
} from 'lucide-react';

const SystemView: React.FC = () => {
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        const getInfo = async () => {
            if (window.electron) {
                const data = await window.electron.getSystemInfo();
                setInfo(data);
            }
        };
        getInfo();
    }, []);

    if (!info) return null;

    return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Monitor size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Sistem Çekirdeği</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Desktop Diagnostics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SystemCard
                    icon={<Cpu size={24} />}
                    label="İşlemci ve Mimari"
                    title={`${info.cpus} Çekirdekli ${info.arch}`}
                    desc={`Platform: ${info.platform.toUpperCase()}`}
                />
                <SystemCard
                    icon={<HardDrive size={24} />}
                    label="Toplam Fiziksel Bellek"
                    title={`${info.memory} GB RAM`}
                    desc="Sistem Kaynağı Optimize Edildi"
                />
                <SystemCard
                    icon={<User size={24} />}
                    label="Aktif Kullanıcı"
                    title={info.user}
                    desc="Yetkili Erişim Aktif"
                />
                <SystemCard
                    icon={<ShieldCheck size={24} />}
                    label="Güvenlik Durumu"
                    title="İzole Edilmiş"
                    desc="Veriler Cihazınızda Kalır"
                />
            </div>

            <div className="mt-12 p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Activity size={32} className="text-blue-500" />
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Motor Durumu: Stabil</h3>
                        <p className="text-sm text-blue-400 font-bold opacity-60">High-Performance Multithreading Enabled</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                    Yeniden Başlat
                </button>
            </div>
        </div>
    );
};

const SystemCard = ({ icon, label, title, desc }: any) => (
    <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] group hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all shadow-xl dark:shadow-none">
        <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform origin-left">
            {icon}
        </div>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-2">{label}</p>
        <h4 className="text-xl font-black mb-1 text-slate-900 dark:text-white uppercase italic tracking-tighter">{title}</h4>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold opacity-80 uppercase tracking-tighter">{desc}</p>
    </div>
);

export default SystemView;
