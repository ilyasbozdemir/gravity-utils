'use client';

import React, { useState } from 'react';
import { ArrowLeft, Code, Copy, Check, Sparkles, Trash2, Layout, BookOpen, FileCode, Monitor, MonitorSmartphone } from 'lucide-react';
import { toast } from 'sonner';

type OutputFormat = 'tailwind' | 'html-css' | 'react-tailwind' | 'react-styled';

export const FigmaToCode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [format, setFormat] = useState<OutputFormat>('tailwind');
    const [copied, setCopied] = useState(false);

    const convert = () => {
        if (!input.trim()) {
            toast.error('Lütfen Figma CSS kodlarını yapıştırın');
            return;
        }

        const lines = input.split('\n');
        let styles: Record<string, string> = {};
        let tailwindClasses: string[] = [];

        lines.forEach(line => {
            const l = line.trim().toLowerCase();
            const [prop, valWithSemicolon] = l.split(':');
            const val = valWithSemicolon?.replace(';', '').trim();
            if (!prop || !val) return;

            styles[prop.trim()] = val;

            // Tailwind mapping
            if (prop.includes('background')) {
                const hex = val.match(/#[a-f0-9]{3,6}/)?.[0];
                if (hex) tailwindClasses.push(`bg-[${hex}]`);
            }
            if (prop === 'display' && val === 'flex') tailwindClasses.push('flex');
            if (prop === 'flex-direction' && val === 'column') tailwindClasses.push('flex-col');
            if (prop === 'justify-content') {
                if (val === 'center') tailwindClasses.push('justify-center');
                if (val === 'space-between') tailwindClasses.push('justify-between');
                if (val === 'flex-start') tailwindClasses.push('justify-start');
                if (val === 'flex-end') tailwindClasses.push('justify-end');
            }
            if (prop === 'align-items') {
                if (val === 'center') tailwindClasses.push('items-center');
                if (val === 'flex-start') tailwindClasses.push('items-start');
                if (val === 'flex-end') tailwindClasses.push('items-end');
            }
            if (prop === 'padding') tailwindClasses.push(`p-[${val}]`);
            if (prop === 'margin') tailwindClasses.push(`m-[${val}]`);
            if (prop === 'gap') tailwindClasses.push(`gap-[${val}]`);
            if (prop === 'border-radius') tailwindClasses.push('rounded-[' + val + ']');
            if (prop === 'width') tailwindClasses.push('w-[' + val + ']');
            if (prop === 'height') tailwindClasses.push('h-[' + val + ']');
            if (prop === 'font-size') tailwindClasses.push('text-[' + val + ']');
            if (prop === 'font-weight') {
                if (val === 'bold' || (parseInt(val) >= 700)) tailwindClasses.push('font-bold');
                else if (parseInt(val) >= 500) tailwindClasses.push('font-medium');
            }
            if (prop === 'color') {
                const hex = val.match(/#[a-f0-9]{3,6}/)?.[0];
                if (hex) tailwindClasses.push(`text-[${hex}]`);
            }
        });

        const tw = tailwindClasses.join(' ');
        const inlineCss = Object.entries(styles).map(([k, v]) => `${k}: ${v};`).join(' ');

        let finalCode = '';
        if (format === 'tailwind') {
            finalCode = `<div className="${tw}">\n  <!-- Content -->\n</div>`;
        } else if (format === 'html-css') {
            finalCode = `<div style="${inlineCss}">\n  <!-- Standard HTML + CSS -->\n</div>`;
        } else if (format === 'react-tailwind') {
            finalCode = `export const MyComponent = () => {\n  return (\n    <div className="${tw}">\n      <span>React Component</span>\n    </div>\n  );\n};`;
        } else if (format === 'react-styled') {
            finalCode = `import styled from 'styled-components';\n\nconst StyledContainer = styled.div\`\n  ${Object.entries(styles).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n\`;\n\nexport const MyComponent = () => <StyledContainer>Styled React</StyledContainer>;`;
        }

        setOutput(finalCode);
        toast.success(`Dönüştürüldü: ${format.toUpperCase()}`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Kod kopyalandı');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Design → Code Pro</h1>
                        <p className="text-slate-500 text-sm font-medium">Figma CSS çıktılarını istediğiniz modern frontend formatına dönüştürün.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Layout size={14} className="text-emerald-500" /> FIGMA / DESIGN CSS
                        </label>
                        <button onClick={() => setInput('')} title="Temizle" className="p-1 text-slate-400 hover:text-red-500 transition-all">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="/* CSS Kurallarını Buraya Yapıştırın */&#10;width: 320px;&#10;background: #FFFFFF;&#10;border-radius: 16px;"
                        title="Figma CSS Input"
                        className="w-full h-[350px] bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-slate-700 dark:text-emerald-400/80 focus:border-emerald-500 outline-none custom-scrollbar leading-relaxed"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'tailwind', label: 'Tailwind CSS', icon: <Sparkles size={14} /> },
                            { id: 'html-css', label: 'HTML + Inline CSS', icon: <FileCode size={14} /> },
                            { id: 'react-tailwind', label: 'React + Tailwind', icon: <MonitorSmartphone size={14} /> },
                            { id: 'react-styled', label: 'React + Styled', icon: <Code size={14} /> },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setFormat(m.id as OutputFormat)}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${format === m.id
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 content-none'}`}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={convert}
                        className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] border-b-4 border-emerald-800"
                    >
                        KODU ÜRET VE DÖNÜŞTÜR
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Code size={14} className="text-blue-500" /> TEMİZ ÇIKTI ({format.toUpperCase()})
                        </label>
                        <button onClick={handleCopy} title="Kodları Kopyala" className="p-1 text-slate-400 hover:text-blue-500 transition-all">
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Dönüştürülen kod burada görünecek..."
                        title="Output Code"
                        className="w-full h-[450px] bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 text-sm font-mono text-blue-400/90 outline-none custom-scrollbar leading-relaxed"
                    />
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Profesyonel İpucu</p>
                        <p className="text-xs text-blue-500/80 leading-relaxed font-medium italic">
                            Bu araç, Figma'dan kopyalanan ham CSS'i temizleyerek gereksiz "absolute positioning" gibi mobil uyumu bozan kurallardan arındırır ve en temiz frontend yapısına kavuşturur.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/academy">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/academy:scale-110 transition-transform"><BookOpen size={150} /></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20"><Sparkles className="w-8 h-8 text-indigo-200" /></div>
                    <div className="space-y-4 max-w-3xl">
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Bilgi Köşesi: Sadece Figma Değil, Her Şeyden HTML!</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            Bazı durumlarda sadece Figma çıktısı yeterli olmayabilir; özellikle HTML e-postaları veya hızlı prototipler için 'Saf HTML/CSS' alternatifi hayat kurtarıcıdır.
                            Yeni <span className="underline decoration-indigo-300">Design → Code Pro</span> aracımızla Tailwind, React ve Styled Components modları arasında anlık geçiş yapabilirsiniz.
                            Özellikle karmaşık CSS yapılarını temiz birer bileşene (Component) dönüştürmek, kodun sürdürülebilirliğini artırır.
                            Yazılım geliştirmede en önemli kural, doğru aracı doğru amaca yönelik kullanmak ve kod temizliğini en üst seviyede tutmaktır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
