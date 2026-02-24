'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, Globe, FileCode, CheckCircle2, RefreshCw, Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export const SitemapGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [urls, setUrls] = useState<string[]>(['https://example.com/']);
    const [newUrl, setNewUrl] = useState('');
    const [priority, setPriority] = useState('0.8');
    const [changefreq, setChangefreq] = useState('weekly');
    const [copied, setCopied] = useState(false);
    const [sitemapType, setSitemapType] = useState<'xml' | 'txt' | 'html'>('xml');

    const addUrl = () => {
        if (!newUrl) return;
        let formatted = newUrl;
        if (!newUrl.startsWith('http')) formatted = 'https://' + newUrl;
        setUrls([...urls, formatted]);
        setNewUrl('');
        toast.success('URL eklendi');
    };

    const removeUrl = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    const generateSitemap = () => {
        const today = new Date().toISOString().split('T')[0];

        if (sitemapType === 'xml') {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
            urls.forEach(u => {
                xml += `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
            });
            xml += `</urlset>`;
            return xml;
        } else if (sitemapType === 'txt') {
            return urls.join('\n');
        } else {
            let html = `<ul>\n`;
            urls.forEach(u => html += `  <li><a href="${u}">${u}</a></li>\n`);
            html += `</ul>`;
            return html;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateSitemap());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Pano kopyalandı');
    };

    const downloadSitemap = () => {
        const content = generateSitemap();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = sitemapType === 'xml' ? 'sitemap.xml' : sitemapType === 'txt' ? 'sitemap.txt' : 'sitemap.html';
        link.click();
        toast.success('Dosya indiriliyor');
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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Sitemap Oluşturucu</h1>
                        <p className="text-slate-500 text-sm font-medium">Google ve diğer arama motorları için profesyonel site haritası hazırlayın.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all">
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={downloadSitemap} className="p-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                        <Download size={16} /> İNDİR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manager Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Hızlı URL Ekle</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                                    placeholder="https://example.com/blog..."
                                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                                <button onClick={addUrl} className="px-6 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
                                    EKLE
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Öncelik (Priority)</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none">
                                    <option value="1.0">1.0 (Anasayfa)</option>
                                    <option value="0.8">0.8 (Kategori)</option>
                                    <option value="0.6">0.6 (Makale)</option>
                                    <option value="0.5">0.5 (Kurumsal/İletişim)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Değişim Sıklığı</label>
                                <select value={changefreq} onChange={(e) => setChangefreq(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none">
                                    <option value="always">Her Zaman</option>
                                    <option value="hourly">Saatlik</option>
                                    <option value="daily">Günlük</option>
                                    <option value="weekly">Haftalık</option>
                                    <option value="monthly">Aylık</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Link Listesi ({urls.length})</label>
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {urls.map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 group">
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[300px]">{u}</span>
                                        <button onClick={() => removeUrl(i)} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Output */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                                {(['xml', 'txt', 'html'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSitemapType(t)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sitemapType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Çıktı Önizleme</span>
                        </div>
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-hidden">
                            <pre className="text-[11px] font-mono text-blue-400/80 whitespace-pre-wrap h-[300px] overflow-y-auto custom-scrollbar leading-relaxed">
                                {generateSitemap()}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2.5rem] border border-blue-100 dark:border-blue-500/20">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <Search size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Google Bot Dostu</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Site haritası, Google botlarına sitenizdeki tüm sayfaların nerede olduğunu ve ne sıklıkla değiştiğini söyler. SEO için hayati önem taşır.</p>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-4 border border-white/10">
                        <Globe size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Geniş Destek</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Sadece Google değil; Bing, Yandex ve DuckDuckGo da standart sitemap.xml protokolünü kullanarak sitenizi hızla dizine ekler.</p>
                </div>
                <div className="p-8 bg-emerald-50 dark:bg-emerald-500/5 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Kolay Kurulum</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Oluşturduğunuz sitemap.xml dosyasını sitenizin kök dizinine (public) atın ve Search Console üzerinden Google'a bildirin.</p>
                </div>
            </div>
        </div>
    );
};
