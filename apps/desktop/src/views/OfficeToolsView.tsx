import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Image as ImageIcon, Zap } from 'lucide-react';
import { OfficeTools, OfficeToolMode } from '@shared/index';

const TOOL_CONFIG: Record<string, any> = {
    'word-pdf': { title: 'Word → PDF', from: 'Word', to: 'PDF', accept: '.doc,.docx', icon: <FileText size={24} />, color: 'text-blue-600', bg: 'bg-blue-600', real: true },
    'pdf-word': { title: 'PDF → Word', from: 'PDF', to: 'Word', accept: '.pdf', icon: <FileText size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'excel-pdf': { title: 'Excel → PDF', from: 'Excel', to: 'PDF', accept: '.xls,.xlsx', icon: <FileSpreadsheet size={24} />, color: 'text-green-600', bg: 'bg-green-600', real: true },
    'pdf-excel': { title: 'PDF → Excel', from: 'PDF', to: 'Excel', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: true },
    'ppt-pdf': { title: 'PowerPoint → PDF', from: 'PPT', to: 'PDF', accept: '.ppt,.pptx', icon: <FileSpreadsheet size={24} />, color: 'text-orange-500', bg: 'bg-orange-500', real: false },
    'pdf-ppt': { title: 'PDF → PowerPoint', from: 'PDF', to: 'PPT', accept: '.pdf', icon: <FileSpreadsheet size={24} />, color: 'text-red-500', bg: 'bg-red-500', real: false },
    'pdf-image': { title: 'PDF → Görsel', from: 'PDF', to: 'Görsel', accept: '.pdf', icon: <ImageIcon size={24} />, color: 'text-purple-500', bg: 'bg-purple-500', real: true },
    'imagetopdf': { title: 'Görsel → PDF', from: 'Görsel', to: 'PDF', accept: 'image/*', icon: <ImageIcon size={24} />, color: 'text-blue-500', bg: 'bg-blue-600', real: true },
    'excel-word': { title: 'Excel → Word', from: 'Excel', to: 'Word', accept: '.xlsx,.xls', icon: <FileText size={24} />, color: 'text-green-700', bg: 'bg-green-700', real: true },
};

const OfficeToolsView: React.FC = () => {
    const [mode, setMode] = useState<OfficeToolMode | null>(null);

    if (!mode) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto w-full h-full">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 group hover:rotate-6 transition-transform">
                        <FileText size={40} className="text-white fill-white/10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Ofis & Döküman Merkezi</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Core Office Engine v3.1.0-STABLE</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(TOOL_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setMode(key as OfficeToolMode)}
                            title={`${config.title} Aracını Başlat`}
                            className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] text-left hover:scale-[1.02] hover:shadow-2xl transition-all group overflow-hidden relative shadow-lg active:scale-95"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${config.bg} text-white group-hover:rotate-12 transition-transform`}>
                                {config.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">{config.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                {config.from} dökümanlarını saniyeler içinde mükemmel {config.to} formatına dönüştürün.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Şimdi Kullan <Zap size={10} className="fill-emerald-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="h-full w-full overflow-y-auto"><OfficeTools mode={mode} onBack={() => setMode(null)} /></div>;
};

export default OfficeToolsView;
