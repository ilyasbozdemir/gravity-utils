import React, { useState, useCallback } from 'react';
import {
    ArrowLeft, Copy, Check, Globe, Code2, Hash,
    Link2, RefreshCw, Trash2, ChevronRight, AlertCircle, Monitor, Zap, Info,
    FileCode, Settings, FileJson, FileType, Braces, Globe2
} from 'lucide-react';
import { toast } from 'sonner';

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
        toast.success("Kopyalandı!");
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

const WebToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('url');

    const colorClass: Record<string, string> = {
        blue: 'bg-blue-600 text-white shadow-blue-500/20',
        orange: 'bg-orange-500 text-white shadow-orange-500/20',
        purple: 'bg-purple-600 text-white shadow-purple-500/20',
        green: 'bg-green-600 text-white shadow-green-500/20',
        pink: 'bg-pink-600 text-white shadow-pink-500/20',
    };

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Globe2 size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Web & Developer Araçları</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Web Processing Toolkit • Native Mode</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? colorClass[tab.color]
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'url' && <UrlTab />}
                {activeTab === 'html' && <HtmlTab />}
                {activeTab === 'base64-text' && <Base64TextTab />}
                {activeTab === 'url-parse' && <UrlParseTab />}
                {activeTab === 'user-agent' && <UserAgentTab />}
            </div>

            <WebToolkitGuide activeTab={activeTab} />
        </div>
    );
};

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
        } catch (e: any) {
            setError(e?.message || 'Geçersiz karakter dizisi');
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap gap-2">
                {modes.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 -mt-2 px-1">{modes.find(m => m.id === mode)?.desc}</p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Girdi</label>
                        <button onClick={() => { setInput(''); setOutput(''); }} className="text-[10px] font-black text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); }}
                        placeholder="https://example.com/search?q=merhaba dünya"
                        className="w-full h-48 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl resize-none font-mono text-sm focus:outline-none focus:border-blue-500/50 text-slate-800 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className={`w-full h-48 p-6 rounded-2xl font-mono text-sm break-all leading-relaxed overflow-auto border ${error
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                        : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 text-blue-600 dark:text-blue-400'
                        }`}>
                        {error ? <div className="flex items-center gap-2"><AlertCircle size={14} />{error}</div> : (output || <span className="text-slate-300 dark:text-slate-700 italic opacity-50 font-bold uppercase tracking-widest text-[10px]">Çıktı bekleniyor...</span>)}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            >
                {mode.includes('encode') ? '🔒 Kodla (Encode)' : '🔓 Çöz (Decode)'}
            </button>
        </div>
    );
}

function HtmlTab() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [output, setOutput] = useState('');

    const process = useCallback(() => {
        if (!input.trim()) return setOutput('');
        setOutput(mode === 'encode' ? htmlEncode(input) : htmlDecode(input));
    }, [input, mode]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-2">
                {(['encode', 'decode'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === m
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        {m === 'encode' ? '🔒 HTML Encode' : '🔓 HTML Decode'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Girdi</label>
                        <button onClick={() => { setInput(''); setOutput(''); }} className="text-[10px] font-black text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); }}
                        className="w-full h-48 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl resize-none font-mono text-sm focus:outline-none focus:border-orange-500/50 text-slate-800 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className="w-full h-48 p-6 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-sm text-orange-600 dark:text-orange-400 break-all leading-relaxed overflow-auto">
                        {output || <span className="text-slate-300 dark:text-slate-700 italic opacity-50 font-bold uppercase tracking-widest text-[10px]">Çıktı bekleniyor...</span>}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]"
            >
                Uygula
            </button>
        </div>
    );
}

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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-2">
                {(['encode', 'decode'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === m
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        {m === 'encode' ? '🔒 Metin → Base64' : '🔓 Base64 → Metin'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Girdi</label>
                        <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-[10px] font-black text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors">
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => { setInput(e.target.value); setOutput(''); setError(''); }}
                        className="w-full h-48 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl resize-none font-mono text-sm focus:outline-none focus:border-purple-500/50 text-slate-800 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Çıktı</label>
                        {output && <CopyButton text={output} />}
                    </div>
                    <div className={`w-full h-48 p-6 rounded-2xl font-mono text-sm break-all leading-relaxed overflow-auto border ${error
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                        : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 text-purple-600 dark:text-purple-400'
                        }`}>
                        {error ? <div className="flex items-center gap-2"><AlertCircle size={14} />{error}</div> : (output || <span className="text-slate-300 dark:text-slate-700 italic opacity-50 font-bold uppercase tracking-widest text-[10px]">Çıktı bekleniyor...</span>)}
                    </div>
                </div>
            </div>

            <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98]"
            >
                Dönüştür
            </button>
        </div>
    );
}

function UrlParseTab() {
    const [input, setInput] = useState('');
    const [parsed, setParsed] = useState<ParsedUrl | null>(null);
    const [error, setError] = useState('');

    const parse = () => {
        setError('');
        const result = parseUrl(input.trim());
        if (result) setParsed(result);
        else { setParsed(null); setError('Geçerli bir URL girin (https:// ile başlayan)'); }
    };

    const Field = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => (
        <div className="flex items-start gap-4 py-4 border-b border-slate-100 dark:border-white/5 last:border-0 group">
            <span className="text-[9px] font-black uppercase text-slate-400 w-24 shrink-0 pt-0.5 tracking-widest">{label}</span>
            <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                <span className={`text-sm text-slate-700 dark:text-slate-200 break-all ${mono ? 'font-mono' : 'font-bold'}`}>
                    {value || <span className="text-slate-300 dark:text-slate-700 italic opacity-50">—</span>}
                </span>
                {value && <CopyButton text={value} />}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-4">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && parse()}
                    placeholder="https://api.example.com/search?q=test"
                    className="flex-1 px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-sm focus:outline-none focus:border-green-500/50 text-slate-800 dark:text-white"
                />
                <button onClick={parse} className="px-8 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                    Ayrıştır
                </button>
            </div>
            {error && <p className="text-xs text-red-500 flex items-center gap-1 font-bold uppercase tracking-widest"><AlertCircle size={12} />{error}</p>}

            {parsed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div className="bg-slate-50 dark:bg-black/20 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Temel Veriler</h3>
                        <div className="space-y-1">
                            <Field label="Protokol" value={parsed.protocol} />
                            <Field label="Host" value={parsed.host} />
                            <Field label="Yol (Path)" value={parsed.pathname} />
                            <Field label="Origin" value={parsed.origin} />
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-black/20 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Sorgu Parametreleri ({parsed.params.length})</h3>
                        <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                            {parsed.params.map((p, i) => (
                                <div key={i} className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{p.key}</p>
                                        <p className="text-xs font-mono text-green-500 truncate">{decodeURIComponent(p.value)}</p>
                                    </div>
                                    <CopyButton text={p.value} />
                                </div>
                            ))}
                            {parsed.params.length === 0 && <p className="text-xs text-slate-400 italic">Parametre bulunamadı.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UserAgentTab() {
    const [input, setInput] = useState(navigator.userAgent);
    const [parsed, setParsed] = useState<any>(null);

    const parseUA = () => {
        const ua = input.trim();
        const browser = ua.includes('Firefox/') ? 'Firefox' : ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : 'Bilinmiyor';
        const os = ua.includes('Windows') ? 'Windows' : ua.includes('Macintosh') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Bilinmiyor';
        setParsed({ browser, os, raw: ua });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-32 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-xs focus:outline-none focus:border-pink-500/50 text-slate-800 dark:text-white"
                />
                <div className="flex gap-4">
                    <button onClick={parseUA} className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-pink-500/20">Ayrıştır</button>
                    <button onClick={() => setInput(navigator.userAgent)} className="px-8 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Sistem UA Kullan</button>
                </div>
            </div>

            {parsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2rem] text-center group transition-all hover:bg-white/[0.04]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tarayıcı</p>
                        <p className="text-3xl font-black text-pink-500 uppercase">{parsed.browser}</p>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2rem] text-center group transition-all hover:bg-white/[0.04]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">İşletim Sistemi</p>
                        <p className="text-3xl font-black text-indigo-500 uppercase">{parsed.os}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const WebToolkitGuide = ({ activeTab }: { activeTab: ToolTab }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
            <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Info size={80} /></div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                    <Info size={20} className="text-blue-500" /> Geliştirici Rehberi
                </h3>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-bold leading-relaxed italic">
                        Bozdemir Engine Web Toolkit, tüm işlemlerini tamamen yerel (local) olarak gerçekleştirir. Girdiğiniz veriler asla bir sunucuya gönderilmez.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Zap size={14} className="text-blue-500" /> Güvenli Kodlama
                        </li>
                        <li className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Zap size={14} className="text-orange-500" /> Native Performans
                        </li>
                    </ul>
                </div>
            </div>

            <div className="p-10 bg-blue-600 rounded-[3rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                    <Zap size={20} className="fill-white" /> Pro İpucu
                </h3>
                <p className="text-blue-100 text-sm font-bold leading-relaxed mb-8 italic">
                    Base64 kodlama, verinin güvenliğini sağlamaz; sadece taşınabilirliğini artırır. Hassas veriler için SecurityView altındaki şifreleme araçlarını kullanın.
                </p>
                <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    Masaüstü Modu Aktif • v3.1.0
                </div>
            </div>
        </div>
    );
};

export default WebToolkitView;
