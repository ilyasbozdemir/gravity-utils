'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileCode, Download, Monitor, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const HtmlToPdf: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [html, setHtml] = useState('<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; padding: 40px; background: #ffffff; }\n  .report-card { background: #f8fafc; padding: 30px; border: 2px solid #e2e8f0; border-radius: 12px; }\n  h1 { color: #1e293b; margin-bottom: 10px; }\n  p { color: #64748b; line-height: 1.6; }\n  .badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; }\n</style>\n</head>\n<body>\n  <div class="report-card">\n    <span class="badge">PRO RAPOR</span>\n    <h1>Akıllı PDF Çıktısı</h1>\n    <p>Bu döküman Gravity Utils üzerindeki HTML to PDF aracı ile anlık olarak üretilmiştir. Tüm CSS stilleri PDF dökümanına birebir yansıtılır.</p>\n  </div>\n</body>\n</html>');
    const [loading, setLoading] = useState(false);

    const generatePdf = async () => {
        setLoading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('p', 'pt', 'a4');

            // Simulating a more robust export
            await doc.html(html, {
                callback: function (doc) {
                    doc.save('gravity-export.pdf');
                    setLoading(false);
                    toast.success('PDF başarıyla oluşturuldu');
                },
                x: 30,
                y: 30,
                width: 535, // A4 width inside margins
                windowWidth: 800
            });
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('PDF oluşturulurken bir hata oluştu');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">HTML → PDF Dönüştürücü</h1>
                        <p className="text-slate-500 text-sm font-medium">Web dökümanlarınızı, faturalarınızı veya raporlarınızı anlık olarak PDF'e dönüştürün.</p>
                    </div>
                </div>
                <button
                    onClick={generatePdf}
                    disabled={loading}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                    <Download size={16} /> {loading ? 'ÜRETİLİYOR...' : 'PDF İNDİR'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <FileCode size={14} className="text-red-500" /> HTML / CSS EDİTÖRÜ
                        </label>
                        <button onClick={() => setHtml('')} title="İçeriği Temizle" className="p-1 text-slate-400 hover:text-red-500 transition-all">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="<html>...</html>"
                        title="HTML Editor"
                        className="w-full h-[500px] bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-slate-700 dark:text-red-400/80 focus:border-red-500 outline-none custom-scrollbar leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                {/* Preview Section */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Monitor size={14} className="text-blue-500" /> CANLI ÖNİZLEME (SANDBOX)
                        </label>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        <iframe
                            srcDoc={html}
                            title="Preview"
                            className="w-full h-full border-none"
                        />
                    </div>
                </div>
            </div>

            {/* Hoca Köşesi Academy Section */}
            <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/academy">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/academy:scale-110 transition-transform">
                    <BookOpen size={150} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <Sparkles className="w-8 h-8 text-indigo-200" />
                    </div>

                    <div className="space-y-4 max-w-3xl">
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Hoca Köşesi: PDF Üretmenin 'Client-Side' Yolu</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            "Hocam, eskiden PDF üretmek için backend taraflı kütüphanelere (Puppeteer, mPDF) mecburduk.
                            Ama artık tarayıcı gücü her şeye yetiyor! <span className="underline decoration-indigo-300">jsPDF</span> kütüphanesi ile client tarafında DOM öğelerini birebir yakalayıp
                            vektörel bir PDF haline getiriyoruz.
                            Dikkat etmeniz gereken en büyük nokta; PDF'in bir kağıt boyutu (A4) olmasıdır.
                            Web siteniz sonsuza kadar uzasa da PDF'de kesilir.
                            O yüzden tasarımlarınızda <span className="underline decoration-indigo-300">width: 800px</span> gibi sabit kağıt genişliklerini referans almak,
                            çıktının her zaman mükemmel görünmesini sağlar!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
