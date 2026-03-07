"use client";

import React, { useEffect, useState } from 'react';
import { Download, Folder, FileText, ExternalLink, Clock, Trash2, CheckCircle2 } from 'lucide-react';

interface DownloadItem {
    id: string;
    name: string;
    type: string;
    date: string;
    path?: string;
    size?: string;
}

export const DownloadCenter: React.FC = () => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('gravity_downloads');
        if (saved) {
            setDownloads(JSON.parse(saved));
        } else {
            // Mock data for initial look
            const mockData: DownloadItem[] = [
                { id: '1', name: 'analiz_raporu_2026.pdf', type: 'PDF', date: '5 dakika önce', size: '2.4 MB' },
                { id: '2', name: 'logo_tasarim_v2.png', type: 'IMAGE', date: '2 saat önce', size: '1.1 MB' },
                { id: '3', name: 'kullanici_verileri.xlsx', type: 'EXCEL', date: 'Dün', size: '850 KB' }
            ];
            setDownloads(mockData);
        }
    }, []);

    const clearHistory = () => {
        setDownloads([]);
        localStorage.removeItem('gravity_downloads');
    };

    const openFolder = async (filePath?: string) => {
        if (window.electron) {
            if (filePath) {
                // Dosyayı klasörde göster
                window.electron.showItemInFolder(filePath);
            } else {
                // Genel indirilenler klasörünü aç
                const paths = await window.electron.getAppPaths();
                if (paths && paths.downloads) {
                    window.electron.openPath(paths.downloads);
                }
            }
        }
    };

    const openFile = (filePath?: string) => {
        if (window.electron && filePath) {
            window.electron.openPath(filePath);
        }
    };

    return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <Download size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">İndirilenler & İşlemler</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">Son gerçekleştirilen yerel işlemler</p>
                    </div>
                </div>
                {downloads.length > 0 && (
                    <button
                        onClick={clearHistory}
                        title="Geçmişi Temizle"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-white/5"
                    >
                        <Trash2 size={12} /> Geçmişi Temizle
                    </button>
                )}
            </div>

            {downloads.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-black/20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                        <Clock size={32} />
                    </div>
                    <h4 className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-sm">Henüz bir işlem yapmadınız</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-700 mt-2">Dönüştürdüğünüz veya kaydettiğiniz dosyalar burada görünecektir.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {downloads.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500/50 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                        >
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <FileText size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => openFile(item.path)}
                                    title={item.name}
                                    className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block w-full text-left"
                                >
                                    {item.name}
                                </button>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md">
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-600 flex items-center gap-1 font-medium">
                                        <Clock size={10} /> {item.date}
                                    </span>
                                    {item.size && (
                                        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium italic">
                                            {item.size}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openFolder(item.path)}
                                    title="Klasörde Göster"
                                    className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all"
                                >
                                    <Folder size={16} />
                                </button>
                                <button
                                    onClick={() => openFile(item.path)}
                                    title="Dosyayı Aç"
                                    className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </div>

                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle2 size={10} /> Tamamlandı
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 flex items-center gap-4 p-6 bg-blue-600/[0.03] dark:bg-blue-600/[0.02] border border-blue-600/10 rounded-[2rem]">
                <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <Download size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">İndirilenler Klasörünü Akıllı Takip</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Bozdemir Engine, tüm masaüstü kayıtlarını varsayılan "İndirilenler" klasöründe Gravity kategorisi altında toplar.
                    </p>
                </div>
                <button
                    onClick={() => openFolder()}
                    title="Tüm İndirilenleri Gör"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
                >
                    Tümünü Gör
                </button>
            </div>
        </div>
    );
};
