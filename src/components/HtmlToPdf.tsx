'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileCode, Download, Monitor, Sparkles, BookOpen, Trash2, Globe, Settings, FileBox } from 'lucide-react';
import { toast } from 'sonner';

type PageFormat = 'a4' | 'a3' | 'letter';
type Orientation = 'p' | 'l';

export const HtmlToPdf: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [html, setHtml] = useState('<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: -apple-system, sans-serif; padding: 40px; background: #ffffff; }\n  .report-card { background: #f8fafc; padding: 40px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }\n  h1 { color: #0f172a; font-size: 32px; font-weight: 800; margin-bottom: 8px; }\n  p { color: #475569; line-height: 1.6; font-size: 14px; }\n  .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }\n</style>\n</head>\n<body>\n  <div class="report-card">\n    <h1>Profesyonel Rapor</h1>\n    <p>Bu PDF dökümanı Gravity Utils HTML-to-PDF motoru kullanılarak hazırlanmıştır. Web teknolojileri ile PDF üretmenin en hızlı yoludur.</p>\n    <div class="footer">Oluşturulma Tarihi: ' + new Date().toLocaleDateString() + '</div>\n  </div>\n</body>\n</html>');
    const [loading, setLoading] = useState(false);
    const [pageFormat, setPageFormat] = useState<PageFormat>('a4');
    const [orientation, setOrientation] = useState<Orientation>('p');
    const [url, setUrl] = useState('');

    const fetchUrl = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.contents) {
                setHtml(data.contents);
                toast.success('Sayfa içeriği başarıyla çekildi');
            }
        } catch (error) {
            toast.error('URL içeriği çekilemedi (CORS veya bağlantı hatası)');
        } finally {
            setLoading(false);
        }
    };

    const generatePdf = async () => {
        setLoading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'pt',
                format: pageFormat
            });

            await doc.html(html, {
                callback: function (doc) {
                    doc.save(`gravity-export-${pageFormat}.pdf`);
                    setLoading(false);
                    toast.success('PDF Hazır!');
                },
                x: 40,
                y: 40,
                width: orientation === 'p' ? 515 : 760, // Width adjustment based on format/orientation
                windowWidth: 1024
            });
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Hata oluştu');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Web → PDF Pro</h1>
                        <p className="text-slate-500 text-sm font-medium">Hızlı, özelleştirilebilir ve güçlü HTML'den PDF'e dönüşüm motoru.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tools Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/5 p-6 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Globe size={14} className="text-blue-500" /> URL'DEN İÇERİK ÇEK
                            </label>
                            <div className="flex gap-2">
                                <input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button onClick={fetchUrl} title="URL'den İçerik Çek" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                                    <Globe size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Settings size={14} className="text-amber-500" /> SAYFA AYARLARI
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    title="Sayfa Boyutu"
                                    value={pageFormat}
                                    onChange={(e) => setPageFormat(e.target.value as PageFormat)}
                                    className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs outline-none"
                                >
                                    <option value="a4">A4 Kağıdı</option>
                                    <option value="a3">A3 Kağıdı</option>
                                    <option value="letter">Letter (US)</option>
                                </select>
                                <select
                                    title="Yönlendirme"
                                    value={orientation}
                                    onChange={(e) => setOrientation(e.target.value as Orientation)}
                                    className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs outline-none"
                                >
                                    <option value="p">Dikey (Portrait)</option>
                                    <option value="l">Yatay (Landscape)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generatePdf}
                            disabled={loading}
                            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> {loading ? 'ÜRETİLİYOR...' : 'PDF OLARAK İNDİR'}
                        </button>
                    </div>

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center gap-4">
                        <FileBox className="text-emerald-500" size={24} />
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase">Vektörel Çıktı</p>
                            <p className="text-[10px] text-emerald-600/70 font-medium">Metinler PDF içerisinde seçilebilir ve aratılabilir kalır.</p>
                        </div>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <FileCode size={14} className="text-red-500" /> HTML / CSS KAYNAK KODU
                        </label>
                        <button onClick={() => setHtml('')} title="Temizle" className="p-1 text-slate-400 hover:text-red-500 transition-all font-bold text-[10px]">TEMİZLE</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 h-[600px]">
                        <textarea
                            value={html}
                            onChange={(e) => setHtml(e.target.value)}
                            title="HTML Editor"
                            className="w-full h-full bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-xs font-mono text-slate-700 dark:text-red-400/80 focus:border-red-500 outline-none custom-scrollbar leading-relaxed"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            {/* Hoca Köşesi Academy Section */}
            <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/academy">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/academy:scale-110 transition-transform"><BookOpen size={150} /></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20"><Sparkles className="w-8 h-8 text-indigo-200" /></div>
                    <div className="space-y-4 max-w-3xl">
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Bilgi Köşesi: PDF Üretmenin 'Client-Side' Yolu</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            Web teknolojilerindeki gelişmeler sayesinde artık PDF üretmek için sunucu taraflı kütüphanelere bağımlı kalmamıza gerek yok. Tarayıcı gücü bu işlem için fazlasıyla yeterli!
                            <span className="underline decoration-indigo-300">jsPDF</span> kütüphanesi ile istemci tarafında DOM öğelerini birebir yakalayıp vektörel bir PDF haline getirebiliyoruz.
                            Buradaki en kritik nokta, dijital tasarımların bir kağıt boyutu (A4, A3 vb.) sınırına sahip olmasıdır.
                            Bu nedenle, <span className="underline decoration-indigo-300">800-1000px</span> arası bir genişliği baz alarak mizanpaj oluşturmak, fiziksel çıktıların her zaman profesyonel ve hatasız görünmesini sağlar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

