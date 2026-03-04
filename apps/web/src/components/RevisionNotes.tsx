"use client";

import React, { useState } from 'react';
import { Bug, CheckCircle2, AlertTriangle, Calendar, X, Info } from 'lucide-react';

interface Revision {
    version: string;
    date: string;
    fixes: string[];
    improvements: string[];
}

const REVISIONS: Revision[] = [
    {
        version: "v1.2.5",
        date: "25 Şubat 2025",
        fixes: [
            "Vercel ortamındaki PDF font yükleme sorunu giderildi (Turkish Character Support).",
            "Excel dönüştürücüde 255 sütun/karakter limitinden kaynaklanan koordinat hataları minimize edildi.",
            "PPTX ve XLSX dosyalarındaki ZIP parsing hatası (end of central directory) için yeni tampon bellek (Uint8Array) yönetimi eklendi.",
            "Bozuk veya eski formatlı (.doc, .xls) dosyalar için detaylı hata mesajları eklendi."
        ],
        improvements: [
            "PDF -> Word dönüşümünde 'Taranmış Belge/Resim' tespiti eklendi. Metinsiz PDF'ler için uyarı veriliyor.",
            "Dosya dönüştürme işleminde daha yüksek bellek kapasiteli 'Uint8Array' moduna geçildi.",
            "Arayüzde işlem durumlarını gösteren yeni toast bildirimleri sistemi güncellendi."
        ]
    },
    {
        version: "v1.2.0",
        date: "20 Şubat 2025",
        fixes: [
            "Sidebar mobil uyumluluk sorunları giderildi.",
            "Renk araçlarındaki kontrast hesaplama hatası düzeltildi."
        ],
        improvements: [
            "SEO Araçları paketi eklendi.",
            "Dark mode geçişleri optimize edildi."
        ]
    }
];

export const RevisionNotes: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-pink-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all text-sm font-medium border border-white/10"
            >
                <Bug size={16} />
                <span>Sürüm Notları</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-xl text-pink-600">
                            <Info size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sürüm Notları & Hata Düzeltmeleri</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Yapılan son güncellemeler ve iyileştirmeler</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        title="Kapat"
                        className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    <div className="space-y-8">
                        {REVISIONS.map((rev, idx) => (
                            <div key={rev.version} className="relative pl-8 border-l-2 border-pink-500/20 last:border-0 pb-2">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-pink-500 ring-4 ring-white dark:ring-slate-900" />

                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold rounded-full">
                                        {rev.version}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar size={12} />
                                        <span>{rev.date}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                            <Bug size={14} className="text-red-500" /> Giderilen Hatalar
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {rev.fixes.map((fix, fIdx) => (
                                                <li key={fIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                    {fix}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" /> İyileştirmeler
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {rev.improvements.map((imp, iIdx) => (
                                                <li key={iIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="text-xs leading-relaxed">
                            <strong>Not:</strong> PDF ve Office araçları tarayıcı tabanlı çalıştığı için çok büyük dosyalarda (50MB+) performans sorunları yaşanabilir. Bu durumlarda dosyaları parçalara ayırarak işlem yapmanız önerilir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
