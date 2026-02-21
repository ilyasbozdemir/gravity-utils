'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Check, Upload, Wand2 } from 'lucide-react';

// ─── SVG Optimizer (client-side SVGO-lite logic) ───────────────────────────────
function optimizeSvg(input: string): { output: string; savings: number; original: number } {
    const originalSize = new Blob([input]).size;
    let out = input;

    // Remove XML declaration
    out = out.replace(/<\?xml[^?]*\?>\s*/gi, '');
    // Remove DOCTYPE
    out = out.replace(/<!DOCTYPE[^>]*>\s*/gi, '');
    // Remove comments
    out = out.replace(/<!--[\s\S]*?-->/g, '');
    // Remove metadata, title, desc elements (optional)
    out = out.replace(/<(metadata|sodipodi:[^>]*|inkscape:[^>]*)[\s\S]*?<\/\1>/gi, '');
    // Remove empty groups
    out = out.replace(/<g[^>]*>\s*<\/g>/gi, '');
    // Remove unused defs (simplified)
    out = out.replace(/\s+/g, ' ');
    // Remove unnecessary spaces inside tags
    out = out.replace(/\s*=\s*/g, '=');
    out = out.replace(/\s*\/>/g, '/>');
    out = out.replace(/>\s+</g, '><');
    // Remove fill="none" on elements that have no stroke
    // Collapse whitespace in path data
    out = out.replace(/d="([^"]+)"/g, (_, d) => `d="${d.replace(/\s+/g, ' ').trim()}"`);
    // Remove inkscape/sodipodi attributes
    out = out.replace(/\s*(?:inkscape|sodipodi):[^\s=]+="[^"]*"/gi, '');
    // Remove xml:space
    out = out.replace(/\s*xml:space="[^"]*"/gi, '');
    // Final trim
    out = out.trim();

    const newSize = new Blob([out]).size;
    const savings = Math.round(((originalSize - newSize) / originalSize) * 100);
    return { output: out, savings: Math.max(0, savings), original: originalSize };
}

function parseSvgInfo(svg: string): Record<string, string> {
    const info: Record<string, string> = {};
    const match = svg.match(/<svg[^>]+>/i);
    if (!match) return info;
    const tag = match[0];
    const attrs = ['width', 'height', 'viewBox', 'fill', 'xmlns'];
    attrs.forEach(attr => {
        const m = tag.match(new RegExp(`${attr}="([^"]+)"`));
        if (m) info[attr] = m[1];
    });
    // Count elements
    const elementCounts: Record<string, number> = {};
    const elemRe = /<(\w+)[\s/>]/g;
    let m: RegExpExecArray | null;
    while ((m = elemRe.exec(svg)) !== null) {
        const el = m[1].toLowerCase();
        if (!['svg', 'g', 'defs'].includes(el)) elementCounts[el] = (elementCounts[el] ?? 0) + 1;
    }
    const top3 = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    info['Elementler'] = top3.map(([k, v]) => `${k}(${v})`).join(', ');
    return info;
}

function toBase64DataUrl(svg: string): string {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function SvgOptimizer() {
    const handleBack = () => { window.location.hash = ''; };
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [savings, setSavings] = useState(0);
    const [originalSize, setOriginalSize] = useState(0);
    const [tab, setTab] = useState<'code' | 'preview' | 'base64' | 'react'>('code');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const optimize = useCallback(() => {
        setError('');
        if (!input.trim()) return;
        if (!input.includes('<svg')) { setError('Geçerli SVG kodu giriniz'); return; }
        const { output: opt, savings: s, original } = optimizeSvg(input);
        setOutput(opt);
        setSavings(s);
        setOriginalSize(original);
    }, [input]);

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { setInput(ev.target?.result as string); setOutput(''); };
        reader.readAsText(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { setInput(ev.target?.result as string); setOutput(''); };
        reader.readAsText(file);
    };

    const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
    const download = (content: string, name: string) => {
        const blob = new Blob([content], { type: 'image/svg+xml' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    };

    const newSize = output ? new Blob([output]).size : 0;
    const info = input ? parseSvgInfo(input) : {};
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previewRef.current && tab === 'preview') {
            previewRef.current.style.backgroundImage = 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%)';
            previewRef.current.style.backgroundSize = '20px 20px';
            previewRef.current.style.backgroundPosition = '0 0, 10px 10px';
        }
    }, [tab]);

    const toReact = (svg: string) => svg
        .replace(/class="/g, 'className="')
        .replace(/for="/g, 'htmlFor="')
        .replace(/(<svg[^>]+)>/, (_m, p) => `${p.replace(/xmlns:[a-z]+="[^"]*"/g, '')} {...props}>`)
        .replace(/^<svg/, 'export default function Icon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    <svg')
        .replace(/<\/svg>$/, '</svg>\n  );\n}');

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-pink-500" /> SVG Optimize & Dönüştür
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sıkıştır · önizle · Base64 · React component olarak çıkar</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold uppercase text-slate-500">SVG Girdi</p>
                        <label className="cursor-pointer flex items-center gap-1 text-xs text-slate-400 hover:text-pink-500 transition-colors">
                            <Upload size={13} /> SVG Yükle
                            <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={onFile}
                                title="SVG dosyası yükle" aria-label="SVG dosyası seç" />
                        </label>
                    </div>
                    <div onDrop={onDrop} onDragOver={e => e.preventDefault()}>
                        <textarea
                            value={input}
                            onChange={e => { setInput(e.target.value); setOutput(''); }}
                            placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <!-- SVG kodunuzu yapıştırın -->\n</svg>`}
                            spellCheck={false}
                            className="w-full h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/30 text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm"
                        />
                    </div>
                    {input && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(info).map(([k, v]) => (
                                <div key={k} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                                    <p className="text-slate-400 font-bold uppercase text-[9px]">{k}</p>
                                    <p className="font-mono text-slate-700 dark:text-slate-300 truncate">{v}</p>
                                </div>
                            ))}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                                <p className="text-slate-400 font-bold uppercase text-[9px]">Boyut</p>
                                <p className="font-mono text-slate-700 dark:text-slate-300">{(originalSize || new Blob([input]).size)} B</p>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-xs mt-2">⚠️ {error}</p>}
                    <button onClick={optimize} disabled={!input.trim()}
                        className="w-full mt-3 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <Wand2 size={18} /> Optimize Et
                    </button>
                </div>

                {/* Output */}
                <div>
                    {output ? (
                        <>
                            {/* Savings */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black text-green-600 dark:text-green-400">{savings}%</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Küçültme</p>
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                                    <p className="text-lg font-black text-slate-700 dark:text-slate-300 font-mono">{newSize} B</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Yeni boyut</p>
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                                    <p className="text-lg font-black text-slate-500 font-mono line-through">{originalSize} B</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Eski boyut</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 mb-3">
                                {([['code', 'SVG Kodu'], ['preview', 'Önizleme'], ['base64', 'Base64'], ['react', 'React']] as const).map(([id, label]) => (
                                    <button key={id} onClick={() => setTab(id)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === id ? 'bg-pink-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {tab === 'code' && (
                                <div className="relative">
                                    <pre className="w-full h-64 bg-slate-900 text-green-400 border border-slate-700 rounded-2xl p-4 font-mono text-xs overflow-auto leading-relaxed">
                                        {output}
                                    </pre>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button onClick={() => copy(output)} title="Kopyala" aria-label="Optimize edilmiş SVG'yi kopyala"
                                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
                                            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                                        </button>
                                        <button onClick={() => download(output, 'optimized.svg')} title="İndir" aria-label="Optimize edilmiş SVG'yi indir"
                                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
                                            <Download size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {tab === 'preview' && (
                                <div ref={previewRef} className="w-full h-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center p-6">
                                    <div dangerouslySetInnerHTML={{ __html: output }}
                                        className="max-w-full max-h-full [&_svg]:max-w-full [&_svg]:max-h-full" />
                                </div>
                            )}
                            {tab === 'base64' && (
                                <div className="relative">
                                    <div className="w-full h-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-600 dark:text-slate-400 break-all overflow-auto leading-relaxed">
                                        {toBase64DataUrl(output)}
                                    </div>
                                    <button onClick={() => copy(toBase64DataUrl(output))} title="Base64 kopyala" aria-label="Base64 data URL'yi kopyala"
                                        className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-pink-400 text-slate-400 hover:text-pink-500 rounded-lg transition-colors">
                                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            )}
                            {tab === 'react' && (
                                <div className="relative">
                                    <pre className="w-full h-64 bg-slate-900 text-blue-300 border border-slate-700 rounded-2xl p-4 font-mono text-xs overflow-auto leading-relaxed">
                                        {toReact(output)}
                                    </pre>
                                    <button onClick={() => copy(toReact(output))} title="React kodu kopyala" aria-label="React component kodunu kopyala"
                                        className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
                                        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <div className="text-center">
                                <Wand2 size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">SVG girin ve &quot;Optimize Et&quot; butonuna basın</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
