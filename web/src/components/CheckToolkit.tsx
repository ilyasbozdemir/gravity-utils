'use client';

import React, { useState } from 'react';
import {
    ArrowLeft, ShieldCheck, CreditCard, UserCheck, Globe,
    AlertCircle, CheckCircle2, Zap, HelpCircle
} from 'lucide-react';
import { SmartCalculator } from './SmartCalculator';
import { EmailHeaderAnalyzer } from './EmailHeaderAnalyzer';

type CheckSubView = 'dashboard' | 'iban' | 'tckn' | 'email';

interface CheckToolkitProps {
    onBack?: () => void;
    initialView?: CheckSubView;
}

export const CheckToolkit: React.FC<CheckToolkitProps> = ({ onBack, initialView = 'dashboard' }) => {
    const handleBack = onBack || (() => { window.history.back(); });
    const [view, setView] = useState<CheckSubView>(initialView);

    if (view === 'iban') {
        return <SmartCalculator view="iban-checker" onBack={() => setView('dashboard')} />;
    }
    if (view === 'tckn') {
        return <SmartCalculator view="tckn-checker" onBack={() => setView('dashboard')} />;
    }
    if (view === 'email') {
        return <EmailHeaderAnalyzer onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={handleBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Güvenlik & Doğrulama</h1>
                    <p className="text-slate-500 text-sm font-medium">TCKN, IBAN ve E-posta güvenliğini anında kontrol edin.</p>
                </div>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CheckCard
                    title="IBAN Doğrulama"
                    desc="TR ve EU standartlarında IBAN algoritma kontrolü."
                    icon={<CreditCard size={32} />}
                    color="blue"
                    onClick={() => setView('iban')}
                />
                <CheckCard
                    title="TCKN Kontrolü"
                    desc="TC Kimlik Numarası algoritma ve format denetimi."
                    icon={<UserCheck size={32} />}
                    color="emerald"
                    onClick={() => setView('tckn')}
                />
                <CheckCard
                    title="E-posta Analizi"
                    desc="SPF, DKIM ve DMARC başlıklarını teknik olarak inceleyin."
                    icon={<Globe size={32} />}
                    color="indigo"
                    onClick={() => setView('email')}
                />
            </div>

            {/* Smart Info Section */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-10 border border-slate-100 dark:border-white/5">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">
                            <Zap size={14} /> Bilgi Güvenliği
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Verileriniz Asla Cihazınızdan Çıkmaz.</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            IBAN veya TCKN gibi hassas verileri kontrol ederken hiçbir veritabanına kayıt yapılmaz ve internete gönderilmez. İşlemler tamamen tarayıcınızdaki matematiksel algoritmalarla yerel olarak koşturulur.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                <CheckCircle2 size={16} className="text-emerald-500" /> %100 Safe & Local
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                <CheckCircle2 size={16} className="text-emerald-500" /> No Database Storage
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Algorithmic Verification
                            </li>
                        </ul>
                    </div>
                    <div className="w-full md:w-[300px] aspect-square bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 animate-pulse bg-blue-500/5 rounded-full"></div>
                        <ShieldCheck size={120} className="text-blue-500 relative animate-in zoom-in duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCard = ({ title, desc, icon, color, onClick }: {
    title: string; desc: string; icon: React.ReactNode; color: string; onClick: () => void
}) => {
    const colorClasses: Record<string, string> = {
        blue: 'hover:border-blue-500/50 shadow-blue-500/5',
        emerald: 'hover:border-emerald-500/50 shadow-emerald-500/5',
        indigo: 'hover:border-indigo-500/50 shadow-indigo-500/5',
    };

    const iconColors: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
        emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500',
        indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500',
    };

    return (
        <button
            onClick={onClick}
            className={`group p-8 bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:-translate-y-2 hover:shadow-2xl ${colorClasses[color]}`}
        >
            <div className={`mb-6 p-4 w-fit rounded-2xl transition-transform group-hover:scale-110 ${iconColors[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
        </button>
    );
};
