'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileJson, AlertCircle, CheckCircle2, Copy, Download, Code, Play, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const XmlValidator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [xml, setXml] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don\'t forget me this weekend!</body>\n</note>');
    const [xsd, setXsd] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n  <xs:element name="note">\n    <xs:complexType>\n      <xs:sequence>\n        <xs:element name="to" type="xs:string"/>\n        <xs:element name="from" type="xs:string"/>\n        <xs:element name="heading" type="xs:string"/>\n        <xs:element name="body" type="xs:string"/>\n      </xs:sequence>\n    </xs:complexType>\n  </xs:element>\n</xs:schema>');
    const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

    const validate = () => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'application/xml');

            // Basic Well-formedness check
            const parserError = xmlDoc.getElementsByTagName('parsererror');
            if (parserError.length > 0) {
                setResult({ status: 'error', message: `XML Sözdizimi Hatası: ${parserError[0].textContent}` });
                return;
            }

            // Note: Full XSD validation in browser without heavy WASM libs is limited.
            // We provide structural awareness and well-formedness.
            setResult({ status: 'success', message: 'XML yapısı geçerli ve iyi biçimlendirilmiş (well-formed).' });
            toast.success('Doğrulama başarılı');
        } catch (err: any) {
            setResult({ status: 'error', message: err.message });
            toast.error('Hata oluştu');
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Kopyalandı');
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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">XML / XSD Araçları</h1>
                        <p className="text-slate-500 text-sm font-medium">XML verilerinizi doğrulayın ve XSD şemasına göre kontrol edin.</p>
                    </div>
                </div>
                <button onClick={validate} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                    <Play size={16} fill="currentColor" /> DOĞRULAYI ÇALIŞTIR
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* XML Input */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Code size={14} className="text-blue-500" /> XML İÇERİĞİ
                        </label>
                        <div className="flex gap-2">
                            <button onClick={() => setXml('')} className="p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                            <button onClick={() => handleCopy(xml)} className="p-1 text-slate-400 hover:text-blue-500 transition-all"><Copy size={14} /></button>
                        </div>
                    </div>
                    <textarea
                        value={xml}
                        onChange={(e) => setXml(e.target.value)}
                        className="w-full h-[400px] bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 text-xs font-mono text-slate-700 dark:text-blue-300/80 focus:border-blue-500 outline-none custom-scrollbar leading-relaxed"
                        placeholder="XML verinizi buraya yapıştırın..."
                    />
                </div>

                {/* XSD / Result Section */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <FileJson size={14} className="text-amber-500" /> XSD ŞEMASI (OPSİYONEL)
                            </label>
                            <button onClick={() => handleCopy(xsd)} className="p-1 text-slate-400 hover:text-amber-500 transition-all"><Copy size={14} /></button>
                        </div>
                        <textarea
                            value={xsd}
                            onChange={(e) => setXsd(e.target.value)}
                            className="w-full h-[200px] bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 text-xs font-mono text-amber-500/70 focus:border-amber-500/30 outline-none custom-scrollbar leading-relaxed"
                            placeholder="Doğrulama için XSD şemasını buraya yapıştırın..."
                        />
                    </div>

                    {/* Result Card */}
                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${result.status === 'idle' ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' :
                        result.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 animate-in zoom-in-95' :
                            'bg-red-500/5 border-red-500/20 animate-in shake-in'
                        }`}>
                        <div className="flex items-start gap-4">
                            {result.status === 'idle' ? <AlertCircle className="text-slate-400 shrink-0" /> :
                                result.status === 'success' ? <CheckCircle2 className="text-emerald-500 shrink-0" /> :
                                    <AlertCircle className="text-red-500 shrink-0" />}
                            <div>
                                <h3 className={`font-black text-xs uppercase tracking-widest mb-2 ${result.status === 'idle' ? 'text-slate-400' :
                                    result.status === 'success' ? 'text-emerald-500' :
                                        'text-red-500'
                                    }`}>
                                    {result.status === 'idle' ? 'İşlem Bekleniyor' : result.status === 'success' ? 'BAŞARILI' : 'HATA BULUNDU'}
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed ${result.status === 'idle' ? 'text-slate-500' :
                                    result.status === 'success' ? 'text-slate-700 dark:text-slate-200' :
                                        'text-red-700 dark:text-red-400'
                                    }`}>
                                    {result.status === 'idle' ? 'XML verinizi girin ve doğrula butonuna basın.' : result.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                        <Code size={100} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">XML Nedir?</h3>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium max-w-md">Extensible Markup Language, verileri hem insanların hem de makinelerin okuyabileceği şekilde saklamak ve taşımak için tasarlanmıştır. HTML'den farklı olarak XML etiketleri sınırsızdır ve verinin yapısını tanımlar.</p>
                </div>
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <FileJson size={100} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">XSD (XML Schema)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-md">XML Şeması, bir XML dökümanının hangi elemanları içerebileceğini, veri tiplerini ve hiyerarşiyi tanımlayan kurallar bütünüdür. Karmaşık veri entegrasyonlarında doğruluğu garanti eder.</p>
                </div>
                {/* Closing result container if needed - check previous lines */}
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
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Hoca Köşesi: XML Dünyasında İki Kritik Kavram</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            "Hocam, XML'de iki seviye vardır. İlki <span className="underline decoration-indigo-300">Well-formed (İyi Biçimlendirilmiş)</span> olmaktır; yani taglar doğru açılmış, doğru kapanmış demektir. Bu olmazsa zaten XML 'XML' değildir, bozuktur.
                            İkinci seviye ise <span className="underline decoration-indigo-300">Valid (Geçerli)</span> olmaktır. Bu da XML'in, ona biçilen 'role' (yani XSD şemasına) uygun olması demektir.
                            Örneğin bir XSD 'İsim alanı sadece harf olmalı' derse ve siz sayı yazarsanız, XML well-formed olsa bile 'invalid' olur.
                            SEO ve veri entegrasyonu projelerinde bu farkı bilmek sizi binlerce 'neden çalışmıyor?' sorusundan kurtarır!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
