'use client';

import React, { useState, useCallback } from 'react';
import {
    ArrowLeft, Copy, Check, Globe, Code2, Hash,
    Link2, RefreshCw, Trash2, ChevronRight, AlertCircle
} from 'lucide-react';

type ToolTab = 'url' | 'html' | 'base64-text' | 'url-parse';

interface TabConfig {
    id: ToolTab;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const TABS: TabConfig[] = [
    { id: 'url', label: 'URL Encode/Decode', icon: <Globe size={16} />, color: 'blue' },
    { id: 'html', label: 'HTML Encode/Decode', icon: <Code2 size={16} />, color: 'orange' },
    { id: 'base64-text', label: 'Base64 Metin', icon: <Hash size={16} />, color: 'purple' },
    { id: 'url-parse', label: 'URL Ayrıştırıcı', icon: <Link2 size={16} />, color: 'green' },
];

// HTML entity encode/decode maps
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;', '/': '&#47;',
    '`': '&#96;', '=': '&#61;',
};

const HTML_DECODE_MAP: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&#39;': "'", '&#47;': '/',
    '&#96;': '`', '&#61;': '=', '&nbsp;': ' ',
    '&copy;': '©', '&reg;': '®', '&trade;': '™',
    '&euro;': '€', '&pound;': '£', '&yen;': '¥',
    '&deg;': '°', '&plusmn;': '±', '&times;': '×',
    '&divide;': '÷', '&laquo;': '«', '&raquo;': '»',
    '&ndash;': '–', '&mdash;': '—', '&lsquo;': '\u2018',
    '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
};

function htmlEncode(str: string): string {
    return str.replace(/[&<>"'`=/]/g, (ch) => HTML_ENTITIES[ch] || ch);
}

function htmlDecode(str: string): string {
    return str
        .replace(/&[a-zA-Z]+;/g, (entity) => HTML_DECODE_MAP[entity] ?? entity)
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Parsed URL parts
interface ParsedUrl {
    protocol: string;
    host: string;
    pathname: string;
    hash: string;
    params: Array<{ key: string; value: string }>;
    origin: string;
    port: string;
    username: string;
    password: string;
}

function parseUrl(raw: string): ParsedUrl | null {
    try {
        const url = new URL(raw);
        const params: Array<{ key: string; value: string }> = [];
        url.searchParams.forEach((val, key) => params.push({ key, value: val }));
        return {
            protocol: url.protocol,
            host: url.hostname,
            port: url.port,
            pathname: url.pathname,
            hash: url.hash,
            origin: url.origin,
            username: url.username,
            password: url.password,
            params,
        };
    } catch {
        return null;
    }
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button
            onClick={handle}
            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded"
            title="Kopyala"
        >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );
}

// ─── URL Tab ──────────────────────────────────────────────────────────────────
function UrlTab() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode' | 'full-encode' | 'full-decode'>('encode');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const process = useCallback(() => {
        setError('');
        try {
            if (!input.trim()) return setOutput('');
            if (mode === 'encode') setOutput(encodeURIComponent(input));
            else if (mode === 'decode') setOutput(decodeURIComponent(input));
            else if (mode === 'full-encode') setOutput(encodeURI(input));
            else setOutput(decodeURI(input));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Geçersiz karakter dizisi');
            setOutput('');
        }
    }, [input, mode]);

    const modes = [
        { id: 'encode', label: 'Encode (Parça)', desc: 'encodeURIComponent — her karakteri kodlar' },
        { id: 'decode', label: 'Decode (Parça)', desc: 'decodeURIComponent — tam kodu çözer' },
        { id: 'full-encode', label: 'Encode (Tam URL)', desc: 'encodeURI — URL yapısını korur' },
        { id: 'full-decode', label: 'Decode (Tam URL)', desc: 'decodeURI — tam URL\'yi çözer' },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Mode tabs */}
            <div className="flex flex-wrap gap-2">
                {modes.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2 px-1">
                {modes.find(m => m.id === mode)?.desc}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Girdi</label>
                        <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); }}
                        placeholder="https://example.com/search?q=merhaba dünya&lang=tr"
                        className="w-full h-40 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-slate-200"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className={`w-full h-40 p-4 rounded-xl font-mono text-sm break-all leading-relaxed overflow-auto border ${error
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                        {error ? <><AlertCircle size={14} className="inline mr-1" />{error}</> : (output || <span className="text-slate-300 dark:text-slate-700 italic">Çıktı...</span>)}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
            >
                {mode.includes('encode') ? '🔒 Kodla (Encode)' : '🔓 Çöz (Decode)'}
            </button>

            {/* Quick reference */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                    [' ', '%20'], ['&', '%26'], ['=', '%3D'],
                    ['?', '%3F'], ['#', '%23'], ['+', '%2B'],
                ].map(([ch, enc]) => (
                    <div key={ch} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center">
                        <code className="text-xs font-bold text-slate-800 dark:text-slate-200">{ch}</code>
                        <div className="text-[10px] text-slate-400 mt-1">→ <code className="text-blue-500">{enc}</code></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── HTML Tab ─────────────────────────────────────────────────────────────────
function HtmlTab() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [output, setOutput] = useState('');

    const process = useCallback(() => {
        if (!input.trim()) return setOutput('');
        setOutput(mode === 'encode' ? htmlEncode(input) : htmlDecode(input));
    }, [input, mode]);

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {(['encode', 'decode'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === m
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {m === 'encode' ? '🔒 HTML Encode' : '🔓 HTML Decode'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Girdi</label>
                        <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); }}
                        placeholder={mode === 'encode' ? '<h1>Merhaba & Günaydın!</h1>' : '&lt;h1&gt;Merhaba &amp; G&#252;nayd&#305;n!&lt;/h1&gt;'}
                        className="w-full h-48 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-800 dark:text-slate-200"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 break-all leading-relaxed overflow-auto">
                        {output || <span className="text-slate-300 dark:text-slate-700 italic">Çıktı...</span>}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
            >
                {mode === 'encode' ? '🔒 HTML Encode Uygula' : '🔓 HTML Decode Uygula'}
            </button>

            {/* Entity reference */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Yaygın HTML Varlıkları</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(HTML_DECODE_MAP).slice(0, 12).map(([entity, char]) => (
                        <div
                            key={entity}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                            <code className="text-xs text-orange-500 font-bold">{entity}</code>
                            <ChevronRight size={10} className="text-slate-400" />
                            <code className="text-xs text-slate-700 dark:text-slate-300 font-bold">{char}</code>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Base64 Text Tab ──────────────────────────────────────────────────────────
function Base64TextTab() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const process = useCallback(() => {
        setError('');
        try {
            if (!input.trim()) return setOutput('');
            if (mode === 'encode') {
                setOutput(btoa(unescape(encodeURIComponent(input))));
            } else {
                setOutput(decodeURIComponent(escape(atob(input.trim()))));
            }
        } catch {
            setError('Geçersiz Base64 verisi');
            setOutput('');
        }
    }, [input, mode]);

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {(['encode', 'decode'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === m
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {m === 'encode' ? '🔒 Text → Base64' : '🔓 Base64 → Text'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">
                            {mode === 'encode' ? 'Düz Metin' : 'Base64 Verisi'}
                        </label>
                        <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); setError(''); }}
                        placeholder={mode === 'encode' ? 'Kodlanacak metni girin...' : 'SGVsbG8gV29ybGQ='}
                        className="w-full h-40 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-slate-200"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className={`w-full h-40 p-4 rounded-xl font-mono text-sm break-all leading-relaxed overflow-auto border ${error
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                        {error ? <><AlertCircle size={14} className="inline mr-1" />{error}</> : (output || <span className="text-slate-300 dark:text-slate-700 italic">Çıktı...</span>)}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
            >
                {mode === 'encode' ? '🔒 Base64\'e Çevir' : '🔓 Metne Çevir'}
            </button>

            {output && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-xl">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Girdi: <strong className="text-slate-700 dark:text-slate-200">{input.length} karakter</strong></span>
                        <span>Çıktı: <strong className="text-slate-700 dark:text-slate-200">{output.length} karakter</strong></span>
                        <span>Oran: <strong className="text-purple-600 dark:text-purple-400">×{(output.length / Math.max(input.length, 1)).toFixed(2)}</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── URL Parser Tab ───────────────────────────────────────────────────────────
function UrlParseTab() {
    const [input, setInput] = useState('');
    const [parsed, setParsed] = useState<ParsedUrl | null>(null);
    const [error, setError] = useState('');

    const parse = () => {
        setError('');
        const result = parseUrl(input.trim());
        if (result) {
            setParsed(result);
        } else {
            setParsed(null);
            setError('Geçerli bir URL girin (https:// ile başlayan)');
        }
    };

    const Field = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 w-20 shrink-0 pt-0.5">{label}</span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className={`text-sm text-slate-700 dark:text-slate-200 break-all ${mono ? 'font-mono' : ''}`}>
                    {value || <span className="text-slate-300 dark:text-slate-700 italic">—</span>}
                </span>
                {value && <CopyButton text={value} />}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && parse()}
                        placeholder="https://user:pass@api.example.com:8080/search?q=test&lang=tr#results"
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 text-slate-800 dark:text-slate-200"
                    />
                    <button
                        onClick={parse}
                        className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 px-1 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            </div>

            {parsed && (
                <>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase">URL Bileşenleri</p>
                        </div>
                        <div className="px-4">
                            <Field label="Protokol" value={parsed.protocol} />
                            <Field label="Host" value={parsed.host} />
                            {parsed.port && <Field label="Port" value={parsed.port} />}
                            {parsed.username && <Field label="Kullanıcı" value={parsed.username} />}
                            {parsed.password && <Field label="Şifre" value={parsed.password} />}
                            <Field label="Yol" value={parsed.pathname} />
                            {parsed.hash && <Field label="Hash" value={parsed.hash} />}
                            <Field label="Origin" value={parsed.origin} />
                        </div>
                    </div>

                    {parsed.params.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-500 uppercase">Query Parameters</p>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-bold">{parsed.params.length} adet</span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {parsed.params.map((p, i) => (
                                    <div key={i} className="px-4 py-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Key</p>
                                            <code className="text-sm text-blue-600 dark:text-blue-400 font-bold">{p.key}</code>
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Value</p>
                                                <code className="text-sm text-slate-700 dark:text-slate-200">{decodeURIComponent(p.value)}</code>
                                            </div>
                                            <CopyButton text={p.value} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function WebToolkit({ onBack }: { onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<ToolTab>('url');

    const tabColorMap: Record<ToolTab, string> = {
        url: 'blue',
        html: 'orange',
        'base64-text': 'purple',
        'url-parse': 'green',
    };

    const activeColor = tabColorMap[activeTab];

    const colorClass: Record<string, string> = {
        blue: 'bg-blue-600 text-white shadow-blue-500/20',
        orange: 'bg-orange-500 text-white shadow-orange-500/20',
        purple: 'bg-purple-600 text-white shadow-purple-500/20',
        green: 'bg-green-600 text-white shadow-green-500/20',
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-500" />
                        Web Araç Seti
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        URL, HTML, Base64, URL Parser — tüm web encode/decode işlemleri
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? `${colorClass[tab.color]} shadow-lg`
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                {activeTab === 'url' && <UrlTab />}
                {activeTab === 'html' && <HtmlTab />}
                {activeTab === 'base64-text' && <Base64TextTab />}
                {activeTab === 'url-parse' && <UrlParseTab />}
            </div>
        </div>
    );
}
