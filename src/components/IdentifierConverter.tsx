'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Type, RefreshCw, Code, Terminal, Hash } from 'lucide-react';

export const IdentifierConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [input, setInput] = useState('Ürün Adı 2026');
    const [outputs, setOutputs] = useState<Record<string, string>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const convert = (str: string) => {
        // Clean Turkish characters for programming identifiers
        const trMap: Record<string, string> = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
        };
        const cleaned = str.replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m] || m)
            .replace(/[^a-zA-Z0-9\s-_]/g, '');

        const words = cleaned.split(/[\s-_]+/).filter(Boolean);

        const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        const snake = words.map(w => w.toLowerCase()).join('_');
        const kebab = words.map(w => w.toLowerCase()).join('-');
        const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        const constant = words.map(w => w.toUpperCase()).join('_');
        const dot = words.map(w => w.toLowerCase()).join('.');

        setOutputs({
            'camelCase': camel,
            'snake_case': snake,
            'kebab-case': kebab,
            'PascalCase / ClassName': pascal,
            'CONSTANT_CASE': constant,
            'dot.case': dot,
            'Enum Value': constant
        });
    };

    useEffect(() => {
        convert(input);
    }, [input]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Akıllı İsim Dönüştürücü</h1>
                    <p className="text-slate-500 text-sm font-medium">Değişken, sınıf ve dosya isimlerini standartlara uygun hale getirin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block px-2">Girdi (Herhangi bir metin)</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Örn: Ürün Adı 2026"
                            className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                        />
                        <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                            <RefreshCw size={16} className="animate-spin-slow" />
                            <p className="text-xs font-medium">Türkçe karakterler ve semboller otomatik olarak temizlenir.</p>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Dönüştürülen Formatlar</p>
                    <div className="grid gap-3">
                        {Object.entries(outputs).map(([key, val]) => (
                            <div key={key} className="bg-white dark:bg-[#0b101b] border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{key}</p>
                                    <code className="text-sm font-bold text-slate-800 dark:text-blue-400">{val}</code>
                                </div>
                                <button
                                    onClick={() => handleCopy(val, key)}
                                    className={`p-2.5 rounded-lg transition-all ${copiedKey === key ? 'bg-green-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500'}`}
                                >
                                    {copiedKey === key ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mini Guide / FAQ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Terminal size={20} className="text-blue-500" /> Sıkça Sorulan Sorular
                    </h3>
                    <div className="space-y-4 text-left">
                        <details className="group border-b border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                Değişken isminde neden Türkçe karakter kullanılmaz?
                                <span className="group-open:rotate-180 transition-transform">↓</span>
                            </summary>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                Çoğu programlama dili (JS, Python, C++) standart olarak ASCII karakter setini baz alır. Türkçe karakterler "encoding" hatalarına yol açabilir ve ekip çalışmasında (özellikle global projelerde) büyük sorunlar yaratır.
                            </p>
                        </details>
                        <details className="group border-b border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-400 transition-colors">
                                camelCase mi snake_case mi seçmeliyim?
                                <span className="group-open:rotate-180 transition-transform">↓</span>
                            </summary>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                Bu tamamen kullandığınız dile ve projenizin "style guide"ına bağlıdır. JavaScript/TS ekosisteminde camelCase standarttır, ancak Python veya SQL tarafında snake_case tercih edilir.
                            </p>
                        </details>
                    </div>
                </div>

                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-500/20">
                    <h3 className="text-lg font-black flex items-center gap-2">
                        <Code size={20} /> Geliştirici İpucu
                    </h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        Kod tabanınızda tutarlılık (consistency) hızı artırır. Bu aracı kullanarak ekipçe belirlediğiniz standartlara sadık kalabilir, Clean Code prensiplerini uygulayabilirsiniz.
                    </p>
                    <div className="pt-4 border-t border-white/10 italic text-[11px] text-blue-200">
                        * İsimlendirme kuralları projenizin sürdürülebilirliği için en kritik yatırımdır.
                    </div>
                </div>
            </div>

            {/* Guide Section */}
            <div className="bg-blue-50 dark:bg-blue-500/5 border-2 border-blue-100 dark:border-blue-500/20 rounded-[2.5rem] p-8 mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <Terminal className="text-blue-600" size={24} />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Hangi Standardı Seçmeli?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Frontend Standartları</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                            <li><strong>camelCase:</strong> JavaScript değişkenleri, React props ve fonksiyonlar için.</li>
                            <li><strong>PascalCase:</strong> React component isimleri ve TypeScript Type/Interface tanımları.</li>
                            <li><strong>kebab-case:</strong> CSS class isimleri, dosya isimleri ve URL path'leri.</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Backend Standartları</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                            <li><strong>snake_case:</strong> Veritabanı sütun isimleri ve Python/Ruby değişkenleri.</li>
                            <li><strong>CONSTANT_CASE:</strong> Ortam değişkenleri (env) ve değişmez (static) değerler.</li>
                            <li><strong>dot.case:</strong> Log anahtarları ve i18n çeviri keyleri.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
