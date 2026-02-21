'use client';

import React, { useState, useCallback } from 'react';
import {
    ArrowLeft, Copy, Check, Globe, Code2, Hash,
    Link2, RefreshCw, Trash2, ChevronRight, AlertCircle, Monitor, Zap, Info
} from 'lucide-react';

type ToolTab = 'url' | 'html' | 'base64-text' | 'url-parse' | 'user-agent';

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
    { id: 'user-agent', label: 'User Agent', icon: <Monitor size={16} />, color: 'pink' },
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
                        title="URL'yi ayrıştır"
                        aria-label="URL'yi ayrıştır"
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

// ─── User Agent Tab ───────────────────────────────────────────────────────────
function UserAgentTab() {
    const [input, setInput] = useState(typeof navigator !== 'undefined' ? navigator.userAgent : '');
    const [parsed, setParsed] = useState<any>(null);

    const parseUA = () => {
        const ua = input.trim();
        const browser = ua.includes('Firefox/') ? 'Firefox' : ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : 'Bilinmiyor';
        const os = ua.includes('Windows') ? 'Windows' : ua.includes('Macintosh') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : ua.includes('Linux') ? 'Linux' : 'Bilinmiyor';
        const isMobile = /Mobile|Android|iP(hone|od|ad)/.test(ua);

        setParsed({ browser, os, isMobile, raw: ua });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="ua-input" className="text-xs font-bold uppercase text-slate-500 px-1">User Agent Dizisi</label>
                <div className="flex gap-2">
                    <textarea id="ua-input" value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Mozilla/5.0..." title="User Agent"
                        className="flex-1 h-24 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/40 text-slate-800 dark:text-slate-200" />
                </div>
                <div className="flex gap-2">
                    <button onClick={parseUA} className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20">
                        Ayrıştır (Parse)
                    </button>
                    <button onClick={() => setInput(navigator.userAgent)} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-all">
                        Benimkini Kullan
                    </button>
                </div>
            </div>

            {parsed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tarayıcı</p>
                        <p className="text-xl font-black text-pink-500">{parsed.browser}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">İşletim Sistemi</p>
                        <p className="text-xl font-black text-indigo-500">{parsed.os}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cihaz Tipi</p>
                        <p className="text-xl font-black text-emerald-500">{parsed.isMobile ? 'Mobil' : 'Desktop'}</p>
                    </div>
                </div>
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
        'user-agent': 'pink',
    };

    const activeColor = tabColorMap[activeTab];

    const colorClass: Record<string, string> = {
        blue: 'bg-blue-600 text-white shadow-blue-500/20',
        orange: 'bg-orange-500 text-white shadow-orange-500/20',
        purple: 'bg-purple-600 text-white shadow-purple-500/20',
        green: 'bg-green-600 text-white shadow-green-500/20',
        pink: 'bg-pink-600 text-white shadow-pink-500/20',
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
                {activeTab === 'user-agent' && <UserAgentTab />}
            </div>

            {/* Contextual Guide */}
            <WebToolkitGuide activeTab={activeTab} />
        </div>
    );
}

const WebToolkitGuide = ({ activeTab }: { activeTab: ToolTab }) => {
    const guides = {
        url: {
            faq: [
                { q: 'Hangi karakterler encode edilmeli?', a: 'URL içindeki özel anlam taşıyan (space, ?, #, &, =) veya ASCII olmayan tüm karakterler encode edilmelidir.' },
                { q: 'Encode ve EncodeComponent farkı?', a: 'URIComponent, / ve : gibi karakterleri de kodlayarak veriyi bir parametre içine güvenle gömmenizi sağlar.' }
            ],
            tip: 'Tarayıcılar boşlukları bazen + bazen %20 olarak kodlar. Modern API\'lar genelde %20 bekler.'
        },
        html: {
            faq: [
                { q: 'Neden HTML escape kullanılır?', a: 'Kullanıcıdan alınan veriyi ekrana basarken XSS (Cross Site Scripting) saldırılarını engellemek için <, > gibi karakterler temizlenmelidir.' },
                { q: 'Named entity nedir?', a: '&nbsp; veya &amp; gibi isimli tanımlardır. Her karakterin karşılığı olmayabilir.' }
            ],
            tip: 'Tüm metni değil, sadece kullanıcı girdilerini escape etmeniz güvenli ve yeterlidir.'
        },
        'base64-text': {
            faq: [
                { q: 'Base64 bir şifreleme mi?', a: 'HAYIR. Base64 bir kodlama (encoding) yöntemidir, şifreleme (encryption) değildir. Verinin formunun değişmesi onu gizli kılmaz.' },
                { q: 'Neden dosya boyutu artıyor?', a: 'Base64, her 3 byte veriyi 4 karaktere dönüştürür. Bu da dosya boyutunda %33\'lük bir artışa neden olur.' }
            ],
            tip: 'Base64 verisinin sonundaki == ekleri dolgu (padding) amaçlıdır ve verinin boyutuna göre değişir.'
        },
        'url-parse': {
            faq: [
                { q: 'Origin ve Host farkı nedir?', a: 'Host sadece api.example.com iken, Origin protokolü ve portu da içerir (https://api.example.com:443).' },
                { q: 'Fragment (#) sunucuya gider mi?', a: 'Hayır, # karakterinden sonrası tarayıcı tarafında kalır ve HTTP isteğiyle sunucuya gönderilmez.' }
            ],
            tip: 'Single Page Application (SPA) yönlendirmeleri genelde Pathname veya Hash üzerinden yapılır.'
        },
        'user-agent': {
            faq: [
                { q: 'User Agent neden bu kadar karışık?', a: 'Tarayıcıların birbirini taklit etme geçmişinden dolayı (compatibility) tüm diziler "Mozilla/5.0" ile başlar.' },
                { q: 'UA dizisi güvenilir mi?', a: 'Tam olarak değil. Kullanıcılar veya botlar UA dizilerini kolayca değiştirebilir (UA spoofing).' }
            ],
            tip: 'Modern web geliştirmede UA parsing yerine Feature Detection (yakın zamanda User-Agent Client Hints) önerilir.'
        }
    };

    const g = guides[activeTab];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10 border-t border-slate-100 dark:border-white/5 pt-10">
            <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none text-left">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Info size={20} className="text-blue-600 dark:text-blue-400" /> Web Mühendisliği Rehberi
                </h3>
                <div className="space-y-4">
                    {g.faq.map((item, i) => (
                        <details key={i} className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors uppercase tracking-tight text-[11px]">
                                {item.q}
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                {item.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-blue-600 dark:bg-blue-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                </div>
                <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                    <Zap size={20} /> Pro İpucu
                </h3>
                <p className="text-blue-50 text-sm leading-relaxed relative z-10">
                    {g.tip}
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg"><Info size={16} /></div>
                    <p className="text-[11px] font-bold">Web geliştiriciler için temel araçlar.</p>
                </div>
            </div>
        </div>
    );
};
