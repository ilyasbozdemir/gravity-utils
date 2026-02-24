'use client';

import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Search, Globe, FileCode, CheckCircle2, Plus, Trash2, Download, BookOpen, Sparkles, ListPlus, Link2, Code2 } from 'lucide-react';
import { toast } from 'sonner';

type CreationMode = 'manual' | 'bulk' | 'paths' | 'extractor';

export const SitemapGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [urls, setUrls] = useState<string[]>([]);
    const [baseUrl, setBaseUrl] = useState('https://ilyasbozdemir.com');
    const [manualUrl, setManualUrl] = useState('');
    const [bulkInput, setBulkInput] = useState('');
    const [mode, setMode] = useState<CreationMode>('paths');
    const [priority, setPriority] = useState('0.8');
    const [changefreq, setChangefreq] = useState('weekly');
    const [copied, setCopied] = useState(false);
    const [sitemapType, setSitemapType] = useState<'xml' | 'txt' | 'html'>('xml');

    const addManualUrl = () => {
        if (!manualUrl) return;
        let formatted = manualUrl.trim();
        if (!formatted.startsWith('http')) formatted = 'https://' + formatted;
        if (!urls.includes(formatted)) {
            setUrls([...urls, formatted]);
            setManualUrl('');
            toast.success('URL eklendi');
        } else {
            toast.error('Bu URL zaten listede');
        }
    };

    const processBulk = () => {
        const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        const newUrls = lines.map(l => l.startsWith('http') ? l : 'https://' + l);
        const unique = Array.from(new Set([...urls, ...newUrls]));
        setUrls(unique);
        setBulkInput('');
        toast.success(`${newUrls.length} URL işlendi`);
    };

    const processPaths = () => {
        const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const base = baseUrl.replace(/\/$/, '');
        const newUrls = lines.map(p => {
            const cleanPath = p.startsWith('/') ? p : '/' + p;
            return base + cleanPath;
        });
        const unique = Array.from(new Set([...urls, ...newUrls]));
        setUrls(unique);
        setBulkInput('');
        toast.success(`${newUrls.length} yol birleştirildi`);
    };

    const processExtractor = () => {
        const regex = /href="([^"]*)"/g;
        let match;
        const extracted: string[] = [];
        while ((match = regex.exec(bulkInput)) !== null) {
            let link = match[1];
            if (link.startsWith('/') && !link.startsWith('//')) {
                link = baseUrl.replace(/\/$/, '') + link;
            }
            if (link.startsWith('http')) {
                extracted.push(link);
            }
        }
        const unique = Array.from(new Set([...urls, ...extracted]));
        setUrls(unique);
        setBulkInput('');
        toast.success(`${extracted.length} link ayıklandı`);
    };

    const removeUrl = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setUrls([]);
        toast.success('Liste temizlendi');
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
        const urlObj = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlObj;
        link.download = sitemapType === 'xml' ? 'sitemap.xml' : sitemapType === 'txt' ? 'sitemap.txt' : 'sitemap.html';
        link.click();
        toast.success('Dosya hazır');
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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Sitemap Generator Pro</h1>
                        <p className="text-slate-500 text-sm font-medium">Akıllı yollar ve ayıklama yöntemleri ile profesyonel site haritası oluşturun.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopy} title="Kopyala" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all">
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={downloadSitemap} className="p-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                        <Download size={16} /> İNDİR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-12">
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
                        {[
                            { id: 'paths', label: 'Yol Oluşturucu', icon: <Link2 size={14} /> },
                            { id: 'bulk', label: 'Toplu Liste', icon: <ListPlus size={14} /> },
                            { id: 'extractor', label: 'Koddan Ayıkla', icon: <Code2 size={14} /> },
                            { id: 'manual', label: 'Manuel Ekle', icon: <Plus size={14} /> },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id as CreationMode)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === m.id ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        {(mode === 'paths' || mode === 'extractor') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ana URL (Project Root)</label>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder="https://mysite.com"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-bold text-blue-500 outline-none"
                                />
                            </div>
                        )}

                        {mode === 'manual' ? (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tekli URL Ekle</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addManualUrl()}
                                        placeholder="https://mysite.com/contact"
                                        className="flex-1 bg-slate-100 dark:bg-white/5 border-none rounded-xl p-4 text-xs font-bold outline-none"
                                    />
                                    <button onClick={addManualUrl} title="URL Ekle" className="p-4 bg-blue-600 text-white rounded-xl"><Plus size={18} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                    {mode === 'paths' ? 'Sadece Uzantıları Girin (Örn: /blog)' : mode === 'bulk' ? 'Tam URL Listesini Yapıştırın' : 'HTML Kaynak Kodunu Yapıştırın'}
                                </label>
                                <textarea
                                    value={bulkInput}
                                    onChange={(e) => setBulkInput(e.target.value)}
                                    placeholder={mode === 'paths' ? '/\n/hizmetler\n/ekibimiz' : mode === 'bulk' ? 'https://a.com\nhttps://b.com' : '<a href="...">...</a>'}
                                    className="w-full h-40 bg-slate-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs font-mono outline-none custom-scrollbar"
                                />
                                <button
                                    onClick={mode === 'paths' ? processPaths : mode === 'bulk' ? processBulk : processExtractor}
                                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    LİSTEYE ENTEGRE ET
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Öncelik</label>
                                <select value={priority} title="Öncelik" onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-xs font-bold outline-none">
                                    <option value="1.0">1.0 (Kritik)</option>
                                    <option value="0.8">0.8 (Yüksek)</option>
                                    <option value="0.5">0.5 (Normal)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sıklık</label>
                                <select value={changefreq} title="Değişim" onChange={(e) => setChangefreq(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-xs font-bold outline-none">
                                    <option value="daily">Günlük</option>
                                    <option value="weekly">Haftalık</option>
                                    <option value="monthly">Aylık</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Output */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl">
                        <div className="p-6 bg-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                {(['xml', 'txt', 'html'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSitemapType(t)}
                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sitemapType === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{urls.length} URL HAZIR</span>
                                <button onClick={clearAll} title="Listeyi Temizle" className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-8 flex-1">
                            <pre className="text-[11px] font-mono text-blue-400/80 h-[350px] overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                                {urls.length > 0 ? generateSitemap() : 'Henüz URL eklenmedi. Sol taraftan seçim yaparak başlayın.'}
                            </pre>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2">Google İpucu</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Public klasörüne attığınız sitemap.xml, robots.txt içerisinde belirtilmelidir.</p>
                        </div>
                        <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                            <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-2">Vektörel Yapı</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Tüm arama motorları Sitemaps.org protokolünü standart kabul eder.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academy Section */}
            <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/academy">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/academy:scale-110 transition-transform"><BookOpen size={150} /></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20"><Sparkles className="w-8 h-8 text-indigo-200" /></div>
                    <div className="space-y-4 max-w-3xl">
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Bilgi Köşesi: Sitemap Neden Hayatidir?</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            Büyük web projeleri uçsuz bucaksız birer deryaya benzer; arama motoru botları (crawler) ise bu deryada yolunu bulmaya çalışan rehberlerdir.
                            Sitemap, onlara sunduğunuz en net yol haritasıdır. Hangi sayfaların öncelikli olduğunu ve ne sıklıkla güncellendiğini bu sayede bildirirsiniz.
                            Gelişmiş <span className="underline decoration-indigo-300">Generator Pro</span> aracımızla linkleri ayıklayabilir veya proje dizin yapınıza uygun profesyonel haritalar oluşturabilirsiniz.
                            Doğru yapılandırılmış bir site haritası, indeksleme hızınızı ve SEO performansınızı doğrudan artırır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

