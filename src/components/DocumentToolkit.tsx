'use client';

import React, { useState } from 'react';
import {
    ArrowLeft, FileText, Layers, Scissors, Minimize2, Stamp,
    RefreshCw, Globe, FileType, Search, ChevronRight, Zap,
    FileStack, Image as ImageIcon, FileSpreadsheet, PlayCircle,
    Plus, X, Upload,
    HelpCircle
} from 'lucide-react';
import { PdfManager } from './PdfManager';
import { OfficeTools, OfficeToolMode } from './OfficeTools';
import { FileConverter } from './FileConverter';
import { ExamGenerator } from './ExamGenerator';
import { getAvailableFormats, type Format } from '../utils/formats';

type DocToolSubView = 'dashboard' | 'pdf-manager' | 'office-tools' | 'general-converter' | 'exam-generator';

interface DocumentToolkitProps {
    onBack: () => void;
    initialView?: DocToolSubView;
    view?: string;
}

export const DocumentToolkit: React.FC<DocumentToolkitProps> = ({ onBack, initialView = 'dashboard', view: externalView }) => {
    // Initialize states from prop if available to avoid "flash" of dashboard
    const [view, setView] = useState<DocToolSubView>(() => {
        if (externalView) {
            if (externalView.includes('pdf')) {
                const officeModes: OfficeToolMode[] = ['word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf', 'pdf-ppt', 'pdf-image', 'excel-word', 'imagetopdf'];
                if (officeModes.includes(externalView as any)) return 'office-tools';
                return 'pdf-manager';
            }
            if (externalView.includes('office') || externalView.includes('word') || externalView.includes('excel') || externalView.includes('ppt') || externalView.includes('image')) {
                return 'office-tools';
            }
            if (externalView === 'exam-generator') return 'exam-generator';
            if (externalView === 'convert') return 'general-converter';
        }
        return initialView;
    });

    const [officeMode, setOfficeMode] = useState<OfficeToolMode>(() => {
        if (externalView) {
            const officeModes: OfficeToolMode[] = ['word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf', 'pdf-ppt', 'pdf-image', 'excel-word', 'imagetopdf'];
            if (officeModes.includes(externalView as any)) return externalView as OfficeToolMode;
        }
        return 'word-pdf';
    });

    const [pdfTab, setPdfTab] = useState<'split' | 'merge' | 'compress' | 'watermark' | 'convert'>(() => {
        if (externalView && externalView.includes('pdf')) {
            if (externalView.includes('split')) return 'split';
            if (externalView.includes('merge')) return 'merge';
            if (externalView.includes('compress')) return 'compress';
            if (externalView.includes('watermark')) return 'watermark';
            if (externalView.includes('convert')) return 'convert';
        }
        return 'merge';
    });

    // Sync with external view if provided (for when the user clicks sidebar while DocumentToolkit is already mounted)
    React.useEffect(() => {
        if (externalView) {
            if (externalView.includes('pdf')) {
                const officeModes: OfficeToolMode[] = ['word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf', 'pdf-ppt', 'pdf-image', 'excel-word', 'imagetopdf'];
                if (officeModes.includes(externalView as any)) {
                    setView('office-tools');
                    setOfficeMode(externalView as any);
                } else {
                    setView('pdf-manager');
                    if (externalView.includes('split')) setPdfTab('split');
                    else if (externalView.includes('merge')) setPdfTab('merge');
                    else if (externalView.includes('compress')) setPdfTab('compress');
                    else if (externalView.includes('watermark')) setPdfTab('watermark');
                    else if (externalView.includes('convert')) setPdfTab('convert');
                }
            } else if (externalView.includes('office') || externalView.includes('word') || externalView.includes('excel') || externalView.includes('ppt') || externalView.includes('image')) {
                setView('office-tools');
                const officeModes: OfficeToolMode[] = ['word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf', 'pdf-ppt', 'pdf-image', 'excel-word', 'imagetopdf'];
                if (officeModes.includes(externalView as any)) setOfficeMode(externalView as any);
            } else if (externalView === 'exam-generator') {
                setView('exam-generator');
            } else if (externalView === 'convert') {
                setView('general-converter');
            } else {
                setView('dashboard');
            }
        }
    }, [externalView]);

    const [pdfTabState, setPdfTabState] = useState<'split' | 'merge' | 'compress' | 'watermark' | 'convert'>('merge'); // Not needed if we use pdfTab
    const [smartFile, setSmartFile] = useState<File | null>(null);
    const [smartFormats, setSmartFormats] = useState<Format[]>([]);
    const [selectedSmartFormat, setSelectedSmartFormat] = useState<Format | null>(null);

    const handleOfficeTool = (mode: OfficeToolMode) => {
        setOfficeMode(mode);
        setView('office-tools');
        window.location.hash = `/${mode}`;
    };

    const handlePdfTool = (tab: 'split' | 'merge' | 'compress' | 'watermark' | 'convert') => {
        setPdfTab(tab);
        setView('pdf-manager');
        window.location.hash = `/pdf-${tab}`;
    };

    const handleSmartUpload = (file: File) => {
        setSmartFile(file);
        const formats = getAvailableFormats(file);
        setSmartFormats(formats);
        if (formats.length > 0) {
            setSelectedSmartFormat(formats[0]);
        }
    };

    const jumpToConverter = (fmt: Format) => {
        setSelectedSmartFormat(fmt);
        setView('general-converter');
    };

    if (view === 'pdf-manager') {
        return <PdfManager file={null} onBack={() => setView('dashboard')} initialTab={pdfTab} />;
    }

    if (view === 'office-tools') {
        return <OfficeTools mode={officeMode} onBack={() => setView('dashboard')} />;
    }

    if (view === 'general-converter') {
        return <FileConverter file={smartFile} onBack={() => setView('dashboard')} initialFormat={selectedSmartFormat} />;
    }

    if (view === 'exam-generator') {
        return <ExamGenerator onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Belge & Ofis Çıkın</h1>
                    <p className="text-slate-500 text-sm font-medium">PDF yönetimi, ofis dökümanı dönüşümleri ve akıllı dosya araçları.</p>
                </div>
            </div>

            {/* Smart Upload Section */}
            <section className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/20 border border-blue-400/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={180} />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                            <Zap size={14} className="text-yellow-400" /> Akıllı Algılama Aktif
                        </div>
                        <h2 className="text-4xl font-black leading-tight">Hangi dosyayı<br />dönüştürmek istersiniz?</h2>
                        <p className="text-blue-100/80 text-lg">Dosyanızı yan panele sürükleyin veya tıklayarak seçin. Formatı otomatik algılayıp size en iyi seçenekleri sunacağız.</p>

                        {!smartFile ? (
                            <div className="flex flex-wrap gap-3 pt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                    <FileText size={16} className="text-blue-300" />
                                    <span className="text-xs font-bold uppercase tracking-widest">PDF & Word</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                    <FileSpreadsheet size={16} className="text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Excel</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                    <ImageIcon size={16} className="text-purple-300" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Görsel</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="p-4 bg-white/10 rounded-2xl flex items-center justify-between border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg"><FileText size={20} /></div>
                                        <span className="font-bold truncate max-w-[200px]">{smartFile.name}</span>
                                    </div>
                                    <button
                                        onClick={() => { setSmartFile(null); setSelectedSmartFormat(null); }}
                                        title="Dosyayı Kaldır"
                                        aria-label="Dosyayı Kaldır"
                                        className="p-1 hover:bg-white/20 rounded-md transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200"> Şuna Dönüştür: </p>
                                    <div className="flex flex-wrap gap-2">
                                        {smartFormats.map(fmt => (
                                            <button
                                                key={fmt.ext}
                                                onClick={() => jumpToConverter(fmt)}
                                                title={`${fmt.label} olarak dönüştür`}
                                                className="px-4 py-2 bg-white text-blue-600 rounded-xl text-xs font-black shadow-lg hover:bg-blue-50 transition-colors"
                                            >
                                                .{fmt.ext.toUpperCase()}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setView('general-converter')}
                                            title="Tüm formatları gör"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black border border-blue-400/30"
                                        >
                                            Diğer...
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            id="smart-upload-input"
                            className="hidden"
                            title="Akıllı Dosya Yükleyici"
                            onChange={(e) => e.target.files?.[0] && handleSmartUpload(e.target.files[0])}
                        />
                    </div>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleSmartUpload(e.dataTransfer.files[0]);
                        }}
                        className="group aspect-square lg:aspect-video rounded-[3rem] border-4 border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden"
                        onClick={() => document.getElementById('smart-upload-input')?.click()}
                    >
                        <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                            <Upload size={40} className="group-hover:-translate-y-1 transition-transform" />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-2xl uppercase tracking-tighter italic">DOSYA SEÇİN / BIRAKIN</p>
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-60">Tüm formatlar desteklenir</p>
                        </div>
                    </div>
                </div>
            </section>

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
                    <BigActionCard
                        title="Sınav Hazırlayıcı"
                        desc="PDF test dökümanları oluştur"
                        icon={<HelpCircle size={24} />}
                        color="amber"
                        onClick={() => setView('exam-generator')}
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
        amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 border-amber-100 dark:border-amber-500/20 hover:border-amber-500',
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] text-left flex flex-col items-center gap-4 ${colors[color]}`}
        >
            <div className={`p-4 rounded-2xl ${color === 'red' ? 'bg-red-500 text-white' : color === 'blue' ? 'bg-blue-500 text-white' : color === 'orange' ? 'bg-orange-500 text-white' : color === 'amber' ? 'bg-amber-500 text-white' : 'bg-purple-500 text-white'}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-black uppercase tracking-tight text-sm mb-1">{title}</h3>
                <p className="text-[10px] font-bold opacity-80 leading-relaxed">{desc}</p>
            </div>
        </button>
    );
};
