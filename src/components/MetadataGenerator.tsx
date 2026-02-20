'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Globe, Share2, Twitter, Search, Code, Smartphone } from 'lucide-react';

export const MetadataGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [title, setTitle] = useState('Gravity Utils – Akıllı Araçlar');
    const [desc, setDesc] = useState('Günlük hayatta ve geliştirme sürecinde işini hızlandıran ücretsiz araçlar.');
    const [url, setUrl] = useState('https://gravityutils.dev');
    const [outputs, setOutputs] = useState<Record<string, string>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const generate = () => {
        // Character counts and warnings
        const titleLen = title.length;
        const descLen = desc.length;

        const nextMetadata = `export const metadata = {\n  title: "${title}",\n  description: "${desc}",\n  openGraph: {\n    title: "${title}",\n    description: "${desc}",\n    url: "${url}",\n    siteName: "Gravity Utils",\n    type: "website",\n  },\n  twitter: {\n    card: "summary_large_image",\n    title: "${title}",\n    description: "${desc}",\n  }\n};`;

        const htmlMeta = `<title>${title}</title>\n<meta name="description" content="${desc}">\n\n<!-- Open Graph -->\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:url" content="${url}">\n<meta property="og:type" content="website">\n\n<!-- Twitter -->\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${desc}">`;

        const jsonLd = `{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${title}",\n  "url": "${url}",\n  "description": "${desc}"\n}`;

        setOutputs({
            'React / Next.js (App Router)': nextMetadata,
            'Standard HTML Tags': htmlMeta,
            'JSON-LD (SEO Schema)': jsonLd
        });
    };

    useEffect(() => {
        generate();
    }, [title, desc, url]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Meta Etiketi Oluşturucu</h1>
                    <p className="text-slate-500 text-sm font-medium">SEO, WhatsApp, Twitter ve LinkedIn için metadata üretin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div>
                            <div className="flex justify-between mb-2 px-1">
                                <label htmlFor="metaTitle" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Başlık (Title)</label>
                                <span className={`text-[10px] font-bold ${title.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>{title.length}/60</span>
                            </div>
                            <input
                                id="metaTitle"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Sayfa başlığını girin"
                                title="Sayfa Başlığı"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 px-1">
                                <label htmlFor="metaDesc" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Açıklama (Description)</label>
                                <span className={`text-[10px] font-bold ${desc.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{desc.length}/160</span>
                            </div>
                            <textarea
                                id="metaDesc"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Sayfa açıklamasını buraya yazın..."
                                title="Sayfa Açıklaması"
                                className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="metaUrl" className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block px-1">Site URL</label>
                            <input
                                id="metaUrl"
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                title="Site URL"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Live Preview (Simulated) */}
                    <div className="bg-white dark:bg-[#0b101b] border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Google Önizleme</p>
                        <div className="space-y-1">
                            <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer truncate">{title}</p>
                            <p className="text-[#006621] dark:text-[#34a853] text-[14px] truncate">{url}</p>
                            <p className="text-[#4d5156] dark:text-slate-400 text-sm line-clamp-2">{desc}</p>
                        </div>
                    </div>

                    {/* FAQ / Mini Guide */}
                    <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Search className="text-blue-500" /> Sıkça Sorulan Sorular
                        </h3>
                        <div className="space-y-4">
                            <details className="group border-b border-white/5 pb-4">
                                <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                    Meta Description ne kadar uzun olmalı?
                                    <span className="group-open:rotate-180 transition-transform">↓</span>
                                </summary>
                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                    Google genellikle 155-160 karakteri görüntüler. Daha uzun açıklamalar arama sonuçlarında kesilir. Mobil cihazlar için 120 karakterin altında kalmak daha güvenlidir.
                                </p>
                            </details>
                            <details className="group border-b border-white/5 pb-4">
                                <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                    Open Graph (og:) neden önemlidir?
                                    <span className="group-open:rotate-180 transition-transform">↓</span>
                                </summary>
                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                    WhatsApp veya Facebook üzerinden bir link paylaştığınızda, o linkin "kart" şeklinde (resim + başlık) görünmesini og: etiketleri sağlar. Tıklanma oranını %250'ye kadar artırabilir.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Code Outputs */}
                <div className="space-y-4">
                    {Object.entries(outputs).map(([key, val]) => (
                        <div key={key} className="bg-white dark:bg-[#0b101b] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                                <button
                                    onClick={() => handleCopy(val, key)}
                                    className={`p-2 rounded-lg transition-all ${copiedKey === key ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-blue-500'}`}
                                >
                                    {copiedKey === key ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre">
                                    {val}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Cards Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-rose-50 dark:bg-rose-500/5 rounded-[2rem] border border-rose-100 dark:border-rose-500/20">
                    <Share2 className="text-rose-600 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">WhatsApp / Open Graph</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Facebook ve WhatsApp, paylaşılan linkin görsel ve açıklamasını og: etiketlerinden çeker. Doğru yapılandırılmazsa link düz metin görünür.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <Twitter className="text-blue-400 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">X (Twitter) Cards</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">X üzerinde paylaşımların "summary_large_image" formatında görünmesi için özel twitter: etiketleri gereklidir.</p>
                </div>
                <div className="p-6 bg-amber-50 dark:bg-amber-500/5 rounded-[2rem] border border-amber-100 dark:border-amber-500/20">
                    <Search className="text-amber-600 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">JSON-LD & Google</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Google Botları, sayfa içeriğini anlamak için en çok yapılandırılmış veriye (JSON-LD) güvenir. SEO için kritik öneme sahiptir.</p>
                </div>
            </div>
        </div>
    );
};
