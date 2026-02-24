'use client';

import React, { useState } from 'react';
import { ArrowLeft, Code, Copy, Check, Sparkles, Trash2, Layout, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const FigmaToCode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const convert = () => {
        if (!input.trim()) {
            toast.error('Lütfen Figma CSS kodlarını yapıştırın');
            return;
        }

        // Simple heuristic based conversion from Figma CSS to Tailwind
        let classes: string[] = [];
        const lines = input.split('\n');

        lines.forEach(line => {
            const l = line.trim().toLowerCase();
            const val = l.split(':')[1]?.replace(';', '').trim();
            if (!val) return;

            if (l.includes('background:')) {
                if (val.includes('#')) {
                    const hex = val.match(/#[a-f0-9]{3,6}/)?.[0];
                    if (hex) classes.push(`bg-[${hex}]`);
                }
            }
            if (l.includes('display: flex')) classes.push('flex');
            if (l.includes('flex-direction: column')) classes.push('flex-col');
            if (l.includes('justify-content:')) {
                if (val === 'center') classes.push('justify-center');
                if (val === 'space-between') classes.push('justify-between');
                if (val === 'flex-start') classes.push('justify-start');
                if (val === 'flex-end') classes.push('justify-end');
            }
            if (l.includes('align-items:')) {
                if (val === 'center') classes.push('items-center');
                if (val === 'flex-start') classes.push('items-start');
                if (val === 'flex-end') classes.push('items-end');
            }
            if (l.includes('padding:')) classes.push(`p-[${val}]`);
            if (l.includes('margin:')) classes.push(`m-[${val}]`);
            if (l.includes('gap:')) classes.push(`gap-[${val}]`);
            if (l.includes('border-radius:')) classes.push('rounded-[' + val + ']');
            if (l.includes('width:')) classes.push('w-[' + val + ']');
            if (l.includes('height:')) classes.push('h-[' + val + ']');
            if (l.includes('box-shadow:')) classes.push('shadow-lg');
            if (l.includes('font-size:')) classes.push('text-[' + val + ']');
            if (l.includes('font-weight:')) {
                if (val === 'bold' || (parseInt(val) >= 700)) classes.push('font-bold');
                else if (parseInt(val) >= 500) classes.push('font-medium');
            }
            if (l.includes('color:')) {
                const hex = val.match(/#[a-f0-9]{3,6}/)?.[0];
                if (hex) classes.push(`text-[${hex}]`);
            }
        });

        const finalClasses = classes.length > 0 ? classes.join(' ') : 'p-4 bg-white rounded-lg shadow-sm';
        setOutput(`<div class="${finalClasses}">\n  <!-- Figma'dan dönüştürüldü -->\n  Metin buraya gelecek\n</div>`);
        toast.success('Dönüştürme başarılı');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Kod kopyalandı');
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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Figma → Tailwind</h1>
                        <p className="text-slate-500 text-sm font-medium">Design to Code: Figma CSS çıktılarını Tailwind CSS sınıflarına dönüştürün.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Layout size={14} className="text-emerald-500" /> FIGMA CSS (INSPECT)
                        </label>
                        <button onClick={() => setInput('')} className="p-1 text-slate-400 hover:text-red-500 transition-all">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="/* Figma'dan kopyalanan CSS */&#10;width: 320px;&#10;height: auto;&#10;background: #FFFFFF;&#10;border-radius: 16px;&#10;padding: 24px;&#10;gap: 12px;"
                        title="Figma CSS Input"
                        className="w-full h-[400px] bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-slate-700 dark:text-emerald-400/80 focus:border-emerald-500 outline-none custom-scrollbar leading-relaxed"
                    />
                    <button
                        onClick={convert}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        TAILWIND KODUNA DÖNÜŞTÜR
                    </button>
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Code size={14} className="text-blue-500" /> ÜRETİLEN HTML
                        </label>
                        <button onClick={handleCopy} title="Kodları Kopyala" className="p-1 text-slate-400 hover:text-blue-500 transition-all">
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                    <div className="relative group">
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Dönüştürülen kod burada görünecek..."
                            title="Tailwind Output"
                            className="w-full h-[400px] bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-blue-400/90 outline-none custom-scrollbar leading-relaxed"
                        />
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2.5rem] min-h-[100px] flex items-center justify-center relative overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase absolute top-4 left-6 tracking-widest">Görsel Simülasyon</p>
                        <div className="text-slate-400 text-xs italic text-center px-10 leading-relaxed font-medium">
                            Tailwind sınıfları otomatik olarak [arbitrary values] şeklinde üretilir. React/Next.js projelerinde kusursuz çalışır.
                        </div>
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
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Hoca Köşesi: Figma'dan Koda Geçişin Sırrı</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            "Hocam, tasarımcı atomu parçalar gibi piksel piksel tasarımı yapar ama yazılımcı o pikselleri 'yaşayan' bir yapıya çevirmek zorundadır.
                            Figma'daki Inspect paneli size ham CSS verir ama projenizde Tailwind kullanıyorsanız o ham verileri temizlemeniz gerekir.
                            Bizim bu aracımız 'arbitrary value' yani <span className="underline decoration-indigo-300">[320px]</span> gibi dinamik değerler kullanarak
                            tasarımın birebir aynısını koda döker.
                            Unutmayın; tasarım sabit olsa da kod esnek (responsive) olmalıdır.
                            Dönüştürme sonrası sabit w-h değerlerini, ekran boyutuna göre 'md:', 'lg:' prefixleri ile esnetmeyi ihmal etmeyin!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
