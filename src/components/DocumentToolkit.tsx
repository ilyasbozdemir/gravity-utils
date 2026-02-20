'use client';

import React, { useState } from 'react';
import {
    ArrowLeft, FileText, Layers, Scissors, Minimize2, Stamp,
    RefreshCw, Globe, FileType, Search, ChevronRight, Zap,
    FileStack, Image as ImageIcon, FileSpreadsheet, PlayCircle
} from 'lucide-react';
import { PdfManager } from './PdfManager';
import { OfficeTools, OfficeToolMode } from './OfficeTools';
import { FileConverter } from './FileConverter';

type DocToolSubView = 'dashboard' | 'pdf-manager' | 'office-tools' | 'general-converter';

interface DocumentToolkitProps {
    onBack: () => void;
    initialView?: DocToolSubView;
}

export const DocumentToolkit: React.FC<DocumentToolkitProps> = ({ onBack, initialView = 'dashboard' }) => {
    const [view, setView] = useState<DocToolSubView>(initialView);
    const [officeMode, setOfficeMode] = useState<OfficeToolMode>('word-pdf');
    const [pdfTab, setPdfTab] = useState<'split' | 'merge' | 'compress' | 'watermark' | 'convert'>('merge');

    const handleOfficeTool = (mode: OfficeToolMode) => {
        setOfficeMode(mode);
        setView('office-tools');
    };

    const handlePdfTool = (tab: 'split' | 'merge' | 'compress' | 'watermark' | 'convert') => {
        setPdfTab(tab);
        setView('pdf-manager');
    };

    if (view === 'pdf-manager') {
        return <PdfManager file={null} onBack={() => setView('dashboard')} initialTab={pdfTab} />;
    }

    if (view === 'office-tools') {
        return <OfficeTools mode={officeMode} onBack={() => setView('dashboard')} />;
    }

    if (view === 'general-converter') {
        return <FileConverter file={null} onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Belge & Ofis Çıkın</h1>
                    <p className="text-slate-500 text-sm font-medium">PDF yönetimi, ofis dökümanı dönüşümleri ve akıllı dosya araçları.</p>
                </div>
            </div>

            {/* Quick X to Y Converter Grid */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <RefreshCw size={18} className="text-blue-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Popüler Dönüşümler (X → Y)</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ToolCard
                        title="Word → PDF"
                        desc="DOCX belgelerini PDF'e çevir"
                        icon={<FileText className="text-blue-500" />}
                        onClick={() => handleOfficeTool('word-pdf')}
                    />
                    <ToolCard
                        title="PDF → Word"
                        desc="PDF'i düzenlenebilir Word yap"
                        icon={<FileText className="text-red-500" />}
                        onClick={() => handleOfficeTool('pdf-word')}
                    />
                    <ToolCard
                        title="Görsel → PDF"
                        desc="Resimleri PDF olarak birleştir"
                        icon={<ImageIcon className="text-emerald-500" />}
                        onClick={() => handleOfficeTool('imagetopdf')}
                    />
                    <ToolCard
                        title="PDF → Görsel"
                        desc="Sayfaları JPG/PNG olarak dışa aktar"
                        icon={<ImageIcon className="text-purple-500" />}
                        onClick={() => handleOfficeTool('pdf-image')}
                    />
                    <ToolCard
                        title="Excel → PDF"
                        desc="Tabloları PDF formatına aktar"
                        icon={<FileSpreadsheet className="text-green-600" />}
                        onClick={() => handleOfficeTool('excel-pdf')}
                    />
                    <ToolCard
                        title="PPT → PDF"
                        desc="Sunumları PDF'e dönüştür"
                        icon={<PlayCircle className="text-orange-500" />}
                        onClick={() => handleOfficeTool('ppt-pdf')}
                    />
                    <ToolCard
                        title="Dosya Dönüştürücü"
                        desc="Genel amaçlı akıllı format çevirici"
                        icon={<RefreshCw className="text-indigo-500" />}
                        onClick={() => setView('general-converter')}
                        highlight
                    />
                    <ToolCard
                        title="PDF → Metin"
                        desc="Dökümandan metinleri ayıkla"
                        icon={<FileType className="text-slate-500" />}
                        onClick={() => handlePdfTool('convert')}
                    />
                </div>
            </section>

            {/* PDF Master Suite */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <FileStack size={18} className="text-red-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">PDF Master Suite</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BigActionCard
                        title="PDF Birleştir"
                        desc="Birden fazla PDF'i tek dosyada topla"
                        icon={<Layers size={24} />}
                        color="red"
                        onClick={() => handlePdfTool('merge')}
                    />
                    <BigActionCard
                        title="PDF Ayırıcı"
                        desc="Sayfaları ayır veya istediğini çıkar"
                        icon={<Scissors size={24} />}
                        color="blue"
                        onClick={() => handlePdfTool('split')}
                    />
                    <BigActionCard
                        title="Boyut Küçült"
                        desc="PDF boyutunu optimize et"
                        icon={<Minimize2 size={24} />}
                        color="orange"
                        onClick={() => handlePdfTool('compress')}
                    />
                    <BigActionCard
                        title="Filigran Ekle"
                        desc="Dökümana güvenli mühür/yazı ekle"
                        icon={<Stamp size={24} />}
                        color="purple"
                        onClick={() => handlePdfTool('watermark')}
                    />
                </div>
            </section>

            {/* Smart Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" /> Neden Gravity Utils?
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Tüm belge işlemleriniz <strong>%100 tarayıcı tarafında</strong> gerçekleşir. Dosyalarınız hiçbir sunucuya yüklenmez, verileriniz cihazınızdan çıkmaz. Bu hem maksimum hız hem de en yüksek gizliliği sağlar.
                    </p>
                </div>
                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                    <h3 className="text-lg font-black flex items-center gap-2">
                        <FileType size={20} /> Belge İpucu
                    </h3>
                    <p className="text-sm text-blue-100 leading-relaxed">
                        PDF dosyalarını Word'e çevirirken yüksek doğruluk için 'Görsel Fidelity' modunu kullanabilirsiniz. Form kaybı yaşamadan en iyi görüntüyü yakalarsınız.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ToolCard = ({ title, desc, icon, onClick, highlight }: {
    title: string; desc: string; icon: React.ReactNode; onClick: () => void; highlight?: boolean
}) => (
    <button
        onClick={onClick}
        className={`group p-5 bg-white dark:bg-[#0b101b] border-2 transition-all hover:-translate-y-1 text-left rounded-3xl ${highlight ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 dark:border-white/5 hover:border-blue-500/30 shadow-sm'}`}
    >
        <div className="mb-3 p-2 w-fit bg-slate-50 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{title}</h3>
        <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
    </button>
);

const BigActionCard = ({ title, desc, icon, color, onClick }: {
    title: string; desc: string; icon: React.ReactNode; color: string; onClick: () => void
}) => {
    const colors: Record<string, string> = {
        red: 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-100 dark:border-red-500/20 hover:border-red-500',
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 border-blue-100 dark:border-blue-500/20 hover:border-blue-500',
        orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 border-orange-100 dark:border-orange-500/20 hover:border-orange-500',
        purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-500 border-purple-100 dark:border-purple-500/20 hover:border-purple-500',
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] text-left flex flex-col items-center text-center gap-4 ${colors[color]}`}
        >
            <div className={`p-4 rounded-2xl ${color === 'red' ? 'bg-red-500 text-white' : color === 'blue' ? 'bg-blue-500 text-white' : color === 'orange' ? 'bg-orange-500 text-white' : 'bg-purple-500 text-white'}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-black uppercase tracking-tight text-sm mb-1">{title}</h3>
                <p className="text-[10px] font-bold opacity-80 leading-relaxed">{desc}</p>
            </div>
        </button>
    );
};
