'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Download, Copy, Check, MousePointer2, Code2, Image as ImageIcon, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import mermaid from 'mermaid';
import { useTheme } from '../context/ThemeContext';

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
    {
        label: 'Flowchart',
        icon: '📊',
        content: `graph TD
    A[Başlangıç] --> B{Karar}
    B -- Evet --> C[İşlem 1]
    B -- Hayır --> D[İşlem 2]
    C --> E[Sonuç]
    D --> E`
    },
    {
        label: 'Sequence',
        icon: '↔️',
        content: `sequenceDiagram
    Katılımcı->>Sunucu: İstek Gönder
    Sunucu-->>Katılımcı: Yanıt Dön
    Katılımcı->>DB: Veri Kaydet`
    },
    {
        label: 'Class',
        icon: '📁',
        content: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()`
    },
    {
        label: 'State',
        icon: '🔄',
        content: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
    },
    {
        label: 'ER Diagram',
        icon: '🗄️',
        content: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`
    },
    {
        label: 'Gantt',
        icon: '📅',
        content: `gantt
    title Proje Planı
    dateFormat  YYYY-MM-DD
    section Tasarım
    Arayüz Tasarımı     :a1, 2024-01-01, 30d
    section Geliştirme
    Frontend Geliştirme :after a1, 20d
    Backend Geliştirme  :2024-02-15, 12d`
    }
];

export function MermaidEditor({ onBack }: { onBack: () => void }) {
    const { theme } = useTheme();
    const [code, setCode] = useState(TEMPLATES[0].content);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');
    const renderCount = useRef(0);
    const previewRef = useRef<HTMLDivElement>(null);

    const renderDiagram = useCallback(async (mermaidCode: string) => {
        if (!mermaidCode.trim()) {
            setSvg('');
            setError(null);
            return;
        }

        try {
            renderCount.current++;
            const id = `mermaid-chart-${renderCount.current}`;

            // Re-initialize for theme change
            mermaid.initialize({
                startOnLoad: false,
                theme: theme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose',
                fontFamily: 'inherit',
            });

            const { svg: renderedSvg } = await mermaid.render(id, mermaidCode);
            setSvg(renderedSvg);
            setError(null);
        } catch (err) {
            console.error('Mermaid Render Error:', err);
            // Don't clear preview on typo, just show error
            setError(err instanceof Error ? err.message : 'Diyagram oluşturulurken hata oluştu');
        }
    }, [theme]);

    useEffect(() => {
        const timer = setTimeout(() => {
            renderDiagram(code);
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [code, renderDiagram]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadSvg = () => {
        if (!svg) return;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPng = () => {
        if (!svg) return;
        const canvas = document.createElement('canvas');
        const img = new Image();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = img.width * 2; // Better resolution
            canvas.height = img.height * 2;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = theme === 'dark' ? '#0b101b' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = 'diagram.png';
                a.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all group">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-blue-500" /> Mermaid Diyagram Editörü
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Metin tabanlı diyagramlar oluşturun, düzenleyin ve dışa aktarın.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                        {([['edit', 'Kod'], ['split', 'Ayrık'], ['preview', 'Grafik']] as const).map(([v, label]) => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === v ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

                    <div className="flex gap-2">
                        <button onClick={handleCopy}
                            className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all shadow-sm"
                            title="Kodları Kopyala">
                            {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                        </button>
                        <button onClick={downloadSvg}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            title="SVG İndir">
                            <Download size={16} /> SVG
                        </button>
                        <button onClick={downloadPng}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white/20 transition-all shadow-lg shadow-black/10 active:scale-95 border border-white/5"
                            title="PNG İndir">
                            <ImageIcon size={16} /> PNG
                        </button>
                    </div>
                </div>
            </div>

            {/* Templates Toolbar */}
            <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar no-scrollbar-buttons">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Hızlı Şablonlar:</span>
                {TEMPLATES.map(t => (
                    <button
                        key={t.label}
                        onClick={() => setCode(t.content)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shrink-0 shadow-sm"
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Main Area */}
            <div className={`grid gap-6 h-[70vh] ${view === 'split' ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
                {/* Editor */}
                {(view === 'edit' || view === 'split') && (
                    <div className={`${view === 'split' ? 'lg:col-span-2' : ''} flex flex-col h-full`}>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Code2 size={12} /> Mermaid Sözdizimi
                            </span>
                            {error && (
                                <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                                    <RefreshCw size={10} className="animate-spin" /> Yazım Hatası Mevcut...
                                </span>
                            )}
                        </div>
                        <div className="relative flex-1 group">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                                className="w-full h-full bg-white dark:bg-[#0b101b] border-2 border-slate-200 dark:border-white/10 rounded-[2rem] p-6 font-mono text-sm focus:outline-none focus:border-blue-500 transition-all resize-none shadow-inner dark:text-blue-300 custom-scrollbar"
                                placeholder="graph TD\n  A --> B"
                            />
                            {error && (
                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/90 dark:bg-red-900/90 backdrop-blur-md text-white dark:text-red-100 text-[10px] font-mono rounded-xl border border-red-400/50 max-h-24 overflow-auto custom-scrollbar">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Preview */}
                {(view === 'preview' || view === 'split') && (
                    <div className={`${view === 'split' ? 'lg:col-span-3' : ''} h-full`}>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MousePointer2 size={12} /> Görsel Önizleme
                            </span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}
                                        className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md text-slate-500 transition-all"
                                        title="Küçült"
                                        aria-label="Küçült"
                                    >
                                        <ZoomOut size={14} />
                                    </button>
                                    <span className="text-[10px] font-black w-10 text-center text-slate-400">{Math.round(zoom * 100)}%</span>
                                    <button
                                        onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                                        className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md text-slate-500 transition-all"
                                        title="Büyüt"
                                        aria-label="Büyüt"
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                </div>
                                <button onClick={() => setZoom(1)} className="text-[10px] font-black text-blue-500 hover:underline">SIFIRLA</button>
                            </div>
                        </div>
                        <div className="relative w-full h-full bg-slate-100 dark:bg-[#06070a] rounded-[2rem] border-2 border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center group shadow-inner">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                            <div
                                className="w-full h-full overflow-auto flex items-center justify-center p-8 custom-scrollbar scroll-smooth"
                                ref={previewRef}
                            >
                                {svg ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: svg }}
                                        className="flex items-center justify-center transition-transform duration-300 ease-out"
                                        style={{
                                            transform: `scale(${zoom})`,
                                            transformOrigin: 'center center'
                                        }}
                                    />
                                ) : !error && (
                                    <div className="flex flex-col items-center gap-4 text-slate-400">
                                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-300 dark:border-white/10 animate-spin" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Çiziliyor...</p>
                                    </div>
                                )}

                                {error && !svg && (
                                    <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md">
                                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shrink-0">
                                            <Code2 size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Çizim Hatası</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                                Girdiğiniz Mermaid kodlarında bir yazım hatası var. Lütfen kodları kontrol edin.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Floating Toolbar for Preview */}
                            <div className="absolute bottom-6 right-6 flex flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                                <button
                                    onClick={() => setView('preview')}
                                    className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 hover:text-blue-500 transition-all"
                                    title="Tam Ekran Önizleme"
                                    aria-label="Tam Ekran Önizleme"
                                >
                                    <Maximize2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Help */}
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <div className="p-2 bg-blue-500 text-white rounded-xl">
                    <Sparkles size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight mb-1">Diyagram İpucu</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-500/80 leading-relaxed">
                        Mermaid.js kullanarak sadece metin yazarak profesyonel diyagramlar oluşturabilirsiniz.
                        <b> Görüntüyü büyütmek</b> için farenizin tekerleğini veya sağ üstteki zoom butonlarını kullanabilirsiniz.
                        Taslak bittiğinde <b>SVG</b> formatında indirerek dökümanlarınıza kalite kaybı olmadan ekleyebilirsiniz.
                    </p>
                    <div className="flex gap-4 mt-3">
                        <a href="https://mermaid.js.org/intro/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline">RESMİ DÖKÜMANTASYON</a>
                        <a href="https://mermaid.live/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline">LIVE EDITOR</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
