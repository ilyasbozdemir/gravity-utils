'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check, Palette, RefreshCw, Shuffle, Sun, Moon, Info } from 'lucide-react';

// ─── Color Math ───────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
    const clean = hex.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    const n = parseInt(clean, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
            case gn: h = ((bn - rn) / d + 2) / 6; break;
            case bn: h = ((rn - gn) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const hn = h / 360, sn = s / 100, ln = l / 100;
    if (sn === 0) { const v = Math.round(ln * 255); return [v, v, v]; }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [
        Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
        Math.round(hue2rgb(p, q, hn) * 255),
        Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
    ];
}
function relativeLuminance(r: number, g: number, b: number): number {
    const toLinear = (c: number) => { const n = c / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
function contrastRatio(l1: number, l2: number): number {
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}
function randomHex(): string {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
}
function generateShades(hex: string): string[] {
    const rgb = hexToRgb(hex); if (!rgb) return [];
    const [h, s] = rgbToHsl(...rgb);
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(l => {
        const [r, g, b] = hslToRgb(h, s, l);
        return rgbToHex(r, g, b);
    });
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            title="Kopyala" aria-label="Kopyala"
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors rounded">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ColorToolkit({ onBack }: { onBack: () => void }) {
    const [hex, setHex] = useState('#6366F1');
    const [hexInput, setHexInput] = useState('#6366F1');
    const [r, setR] = useState(99); const [g, setG] = useState(102); const [b, setB] = useState(241);
    const [h, setH] = useState(239); const [s, setS] = useState(84); const [l, setL] = useState(67);
    const [fg, setFg] = useState('#FFFFFF');
    const [tab, setTab] = useState<'convert' | 'shades' | 'contrast' | 'gradient'>('convert');
    const [gradAngle, setGradAngle] = useState(135);
    const [gradColor2, setGradColor2] = useState('#EC4899');

    const syncFromRgb = useCallback((r: number, g: number, b: number) => {
        const newHex = rgbToHex(r, g, b);
        setHex(newHex); setHexInput(newHex);
        const [nh, ns, nl] = rgbToHsl(r, g, b);
        setH(nh); setS(ns); setL(nl);
    }, []);
    const syncFromHsl = useCallback((h: number, s: number, l: number) => {
        const [nr, ng, nb] = hslToRgb(h, s, l);
        setR(nr); setG(ng); setB(nb);
        const newHex = rgbToHex(nr, ng, nb);
        setHex(newHex); setHexInput(newHex);
    }, []);
    const applyHex = (v: string) => {
        const rgb = hexToRgb(v);
        if (!rgb) return;
        setR(rgb[0]); setG(rgb[1]); setB(rgb[2]); setHex(v.toUpperCase());
        const [nh, ns, nl] = rgbToHsl(...rgb);
        setH(nh); setS(ns); setL(nl);
    };

    const lum = relativeLuminance(r, g, b);
    const lumFg = relativeLuminance(...(hexToRgb(fg) ?? [255, 255, 255]));
    const ratio = contrastRatio(lum, lumFg);
    const wcagAA = ratio >= 4.5, wcagAAA = ratio >= 7, wcagLarge = ratio >= 3;
    const shades = generateShades(hex);
    const gradCss = `linear-gradient(${gradAngle}deg, ${hex}, ${gradColor2})`;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Palette className="w-6 h-6 text-purple-500" /> Renk Araç Seti
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">HEX · RGB · HSL dönüşümü, palet, kontrast, gradyan</p>
                </div>
            </div>

            {/* Color preview + hex input */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
                    style={{ backgroundColor: hex }} />
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <input value={hexInput} onChange={e => { setHexInput(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) applyHex(e.target.value); }}
                            onBlur={() => applyHex(hexInput)}
                            placeholder="#6366F1"
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-slate-200 uppercase" />
                        <input type="color" value={hex} onChange={e => applyHex(e.target.value)}
                            title="Renk seçici" aria-label="Renk seçici"
                            className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent p-1" />
                        <button onClick={() => applyHex(randomHex())} title="Rastgele renk" aria-label="Rastgele renk üret"
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors">
                            <Shuffle size={18} className="text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 px-1">rgb({r}, {g}, {b}) · hsl({h}°, {s}%, {l}%)</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {([['convert', 'Dönüştür'], ['shades', 'Tonlar'], ['contrast', 'Kontrast'], ['gradient', 'Gradyan']] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                {/* Convert Tab */}
                {tab === 'convert' && (
                    <div className="space-y-6">
                        {/* RGB */}
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3">RGB</p>
                            {([
                                ['R', r, setR] as [string, number, (v: number) => void],
                                ['G', g, setG] as [string, number, (v: number) => void],
                                ['B', b, setB] as [string, number, (v: number) => void],
                            ]).map(([label, val, setter]) => (
                                <div key={label} className="flex items-center gap-3 mb-2">
                                    <span className="w-4 text-xs font-bold text-slate-500">{label}</span>
                                    <input type="range" min={0} max={255} value={val}
                                        onChange={e => { const n = parseInt(e.target.value); setter(n); const nr = label === 'R' ? n : r, ng = label === 'G' ? n : g, nb = label === 'B' ? n : b; syncFromRgb(nr, ng, nb); }}
                                        title={`${label} kanalı`} aria-label={`${label} renk kanalı`}
                                        className="flex-1 h-3 rounded-full cursor-pointer accent-purple-500" />
                                    <span className="w-8 text-right text-sm font-mono text-slate-700 dark:text-slate-300">{val}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 mt-2">
                                <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">rgb({r}, {g}, {b})</code>
                                <CopyBtn text={`rgb(${r}, ${g}, ${b})`} />
                            </div>
                        </div>
                        {/* HSL */}
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3">HSL</p>
                            {([
                                ['H', h, setH, 360, '°'] as [string, number, (v: number) => void, number, string],
                                ['S', s, setS, 100, '%'] as [string, number, (v: number) => void, number, string],
                                ['L', l, setL, 100, '%'] as [string, number, (v: number) => void, number, string],
                            ]).map(([label, val, setter, max, unit]) => (
                                <div key={label} className="flex items-center gap-3 mb-2">
                                    <span className="w-4 text-xs font-bold text-slate-500">{label}</span>
                                    <input type="range" min={0} max={max} value={val}
                                        onChange={e => { const n = parseInt(e.target.value); setter(n); const nh = label === 'H' ? n : h, ns = label === 'S' ? n : s, nl = label === 'L' ? n : l; syncFromHsl(nh, ns, nl); }}
                                        title={`${label} değeri`} aria-label={`HSL ${label} değeri`}
                                        className="flex-1 h-3 rounded-full cursor-pointer accent-purple-500" />
                                    <span className="w-12 text-right text-sm font-mono text-slate-700 dark:text-slate-300">{val}{unit}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 mt-2">
                                <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">hsl({h}, {s}%, {l}%)</code>
                                <CopyBtn text={`hsl(${h}, ${s}%, ${l}%)`} />
                            </div>
                        </div>
                        {/* Outputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                ['HEX', hex],
                                ['RGB', `rgb(${r}, ${g}, ${b})`],
                                ['HSL', `hsl(${h}, ${s}%, ${l}%)`],
                            ].map(([label, value]) => (
                                <div key={label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
                                    <div className="flex items-center gap-1">
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1 break-all">{value}</code>
                                        <CopyBtn text={value} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shades Tab */}
                {tab === 'shades' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Seçili rengin 9 ton aralığı (HSL parlaklık: 10%–90%)</p>
                        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                            {shades.map((shade, i) => (
                                <button key={shade} onClick={() => applyHex(shade)}
                                    title={shade} aria-label={`${shade} tonunu seç`}
                                    className="group flex flex-col items-center gap-1">
                                    <div className="w-full aspect-square rounded-xl border-2 border-transparent group-hover:border-white transition-all shadow-sm"
                                        style={{ backgroundColor: shade }} />
                                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">{(i + 1) * 100}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {shades.map((shade, i) => {
                                const rgb = hexToRgb(shade)!;
                                return (
                                    <div key={shade} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: shade }} />
                                        <span className="text-xs text-slate-500 w-8">{(i + 1) * 100}</span>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1">{shade}</code>
                                        <code className="text-xs font-mono text-slate-400 hidden sm:block">rgb({rgb[0]}, {rgb[1]}, {rgb[2]})</code>
                                        <CopyBtn text={shade} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Contrast Tab */}
                {tab === 'contrast' && (
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Arka Plan</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: hex }} />
                                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{hex}</code>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Ön Plan (yazı)</p>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={fg} onChange={e => setFg(e.target.value)}
                                        title="Ön plan rengi" aria-label="Ön plan rengi seç"
                                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5" />
                                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{fg.toUpperCase()}</code>
                                    <button onClick={() => setFg('#000000')} title="Siyah" aria-label="Siyah seç" className="p-1 bg-black rounded border border-slate-300" />
                                    <button onClick={() => setFg('#FFFFFF')} title="Beyaz" aria-label="Beyaz seç" className="p-1 bg-white rounded border border-slate-300" />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="rounded-xl p-6 text-center" style={{ backgroundColor: hex }}>
                            <p className="text-2xl font-bold mb-1" style={{ color: fg }}>Örnek Metin Aa Bb</p>
                            <p className="text-sm" style={{ color: fg }}>Bu metin kontrast önizlemesidir. 123 ABC xyz</p>
                        </div>

                        {/* Ratio */}
                        <div className="text-center">
                            <p className="text-5xl font-black text-slate-800 dark:text-white">{ratio.toFixed(2)}<span className="text-xl font-bold text-slate-400">:1</span></p>
                            <p className="text-sm text-slate-500 mt-1">Kontrast oranı</p>
                        </div>

                        {/* WCAG badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'WCAG AA', desc: 'Normal metin (≥4.5:1)', pass: wcagAA },
                                { label: 'WCAG AAA', desc: 'Gelişmiş (≥7:1)', pass: wcagAAA },
                                { label: 'AA Büyük', desc: 'Büyük metin (≥3:1)', pass: wcagLarge },
                            ].map(b => (
                                <div key={b.label} className={`p-4 rounded-xl border text-center ${b.pass ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                                    <p className={`text-lg font-black ${b.pass ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{b.pass ? '✓ Geçti' : '✗ Kaldı'}</p>
                                    <p className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">{b.label}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick suggestions */}
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Hızlı öneriler</p>
                            <div className="flex gap-2">
                                {['#000000', '#FFFFFF', '#1E293B', '#F8FAFC'].map(c => {
                                    const rgb = hexToRgb(c)!;
                                    const r = contrastRatio(lum, relativeLuminance(...rgb));
                                    return (
                                        <button key={c} onClick={() => setFg(c)}
                                            title={`${c} (${r.toFixed(1)}:1)`} aria-label={`${c} rengi seç`}
                                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700" style={{ backgroundColor: c }} />
                                            <span className="text-[9px] text-slate-400">{r.toFixed(1)}:1</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Gradient Tab */}
                {tab === 'gradient' && (
                    <div className="space-y-6">
                        <div className="h-32 rounded-2xl shadow-inner" style={{ background: gradCss }} />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Renk 1</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: hex }} />
                                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{hex}</code>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Renk 2</p>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={gradColor2} onChange={e => setGradColor2(e.target.value.toUpperCase())}
                                        title="İkinci gradyan rengi" aria-label="İkinci gradyan rengini seç"
                                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent p-0.5" />
                                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{gradColor2}</code>
                                    <button onClick={() => setGradColor2(randomHex())} title="Rastgele" aria-label="Rastgele ikinci renk"
                                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                                        <Shuffle size={14} className="text-slate-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Açı: {gradAngle}°</p>
                            <input type="range" min={0} max={360} value={gradAngle} onChange={e => setGradAngle(parseInt(e.target.value))}
                                title={`Gradyan açısı: ${gradAngle}°`} aria-label="Gradyan açısı"
                                className="w-full accent-purple-500 cursor-pointer" />
                            <div className="flex justify-between mt-2">
                                {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                                    <button key={a} onClick={() => setGradAngle(a)}
                                        title={`${a}°`} aria-label={`Açıyı ${a} derece yap`}
                                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${gradAngle === a ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                        {a}°
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                ['CSS Background', `background: ${gradCss};`],
                                ['Tailwind (yaklaşık)', `bg-gradient-to-br from-[${hex}] to-[${gradColor2}]`],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{value}</code>
                                    </div>
                                    <CopyBtn text={value} />
                                </div>
                            ))}
                        </div>
                        {/* Preset gradients */}
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3">Hazır gradyanlar</p>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {[
                                    ['#6366F1', '#EC4899'], ['#06B6D4', '#3B82F6'], ['#F59E0B', '#EF4444'],
                                    ['#10B981', '#06B6D4'], ['#8B5CF6', '#6366F1'], ['#F97316', '#F59E0B'],
                                    ['#EC4899', '#8B5CF6'], ['#0F172A', '#1E293B'],
                                ].map(([c1, c2]) => (
                                    <button key={c1 + c2} onClick={() => { applyHex(c1); setGradColor2(c2); }}
                                        title={`${c1} → ${c2}`} aria-label={`Gradyan: ${c1} den ${c2} ye`}
                                        className="w-full aspect-square rounded-xl hover:scale-110 transition-transform shadow-sm"
                                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ColorGuide />
        </div>
    );
}

const ColorGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10">
        <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none text-left">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Info size={20} className="text-purple-600 dark:text-purple-400" /> Renk Rehberi & FAQ
            </h3>
            <div className="space-y-4">
                <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                    <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-purple-600 dark:group-open:text-purple-400 transition-colors">
                        Kontrast oranı (WCAG) nedir?
                        <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                    </summary>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        Web Erişilebilirlik Kılavuzu (WCAG), metin ile arka plan arasındaki zıtlığın en az 4.5:1 (AA) olmasını önerir. Bu, görme zorluğu çeken kişilerin içeriği okuyabilmesi için kritiktir.
                    </p>
                </details>
                <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                    <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-purple-600 dark:group-open:text-purple-400 transition-colors">
                        RGB ve HSL arasındaki fark nedir?
                        <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                    </summary>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        RGB (Kırmızı, Yeşil, Mavi) ışığın karışımını temsil ederken; HSL (Hue, Saturation, Lightness) rengi bir insan gibi tanımlar: Hangi renk? Ne kadar canlı? Ne kadar parlak? HSL ile bir rengin tonlarını üretmek çok daha kolaydır.
                    </p>
                </details>
                <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                    <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-purple-600 dark:group-open:text-purple-400 transition-colors">
                        Luminance (Parlaklık) değeri ne işe yarar?
                        <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                    </summary>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        Relative Luminance, bir rengin insan gözü tarafından ne kadar parlak algılandığını ölçer. Kontrast hesaplamalarının temelidir. Yeşil renk her zaman aynı değerdeki maviye göre daha "parlak" algılanır.
                    </p>
                </details>
            </div>
        </div>

        <div className="p-8 bg-purple-600 dark:bg-purple-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-purple-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Palette size={24} />
            </div>
            <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                <Palette size={20} /> Tasarım İpucu
            </h3>
            <p className="text-purple-50 text-sm leading-relaxed relative z-10">
                Bir arayüz tasarlarken <b>60-30-10</b> kuralını uygulayın: %60 ana renk (genelde beyaz/gri), %30 ikincil renk ve %10 vurgu (accent) rengi. Bu denge gözü yormayan profesyonel bir görünüm sağlar.
            </p>
            <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-lg"><Sun size={16} /></div>
                <p className="text-[11px] font-bold">Gradyanlarda birbirine yakın renkler kullanarak (Analog) daha yumuşak geçişler elde edebilirsiniz.</p>
            </div>
        </div>
    </div>
);
