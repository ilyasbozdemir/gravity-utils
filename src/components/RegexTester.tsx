'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Copy, Check, AlertCircle, BookOpen } from 'lucide-react';

interface Match {
    value: string;
    index: number;
    groups: string[];
}

function escapeHtml(str: string) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHighlighted(text: string, matches: Match[]): string {
    if (!matches.length) return escapeHtml(text);
    let result = '';
    let last = 0;
    [...matches].sort((a, b) => a.index - b.index).forEach((m, i) => {
        result += escapeHtml(text.slice(last, m.index));
        result += `<mark class="bg-yellow-300 dark:bg-yellow-600 text-slate-900 dark:text-white rounded px-0.5" data-i="${i}">${escapeHtml(m.value)}</mark>`;
        last = m.index + m.value.length;
    });
    result += escapeHtml(text.slice(last));
    return result;
}

const PRESETS = [
    { label: 'E-posta', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
    { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)', flags: 'gi' },
    { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { label: 'Tarih (GG/AA/YYYY)', pattern: '\\b(0?[1-9]|[12]\\d|3[01])[\\/\\-](0?[1-9]|1[0-2])[\\/\\-](\\d{4})\\b', flags: 'g' },
    { label: 'Telefon (Turkey)', pattern: '(\\+90|0)\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}', flags: 'g' },
    { label: 'Hex Renk', pattern: '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b', flags: 'gi' },
    { label: 'Türk TCKN', pattern: '\\b[1-9]\\d{10}\\b', flags: 'g' },
    { label: 'Sadece Rakam', pattern: '\\d+', flags: 'g' },
    { label: 'HTML Etiketi', pattern: '<[^>]+>', flags: 'gi' },
    { label: 'JSON Anahtar', pattern: '"([^"]+)"\\s*:', flags: 'g' },
];

const SAMPLE_TEXT = `Merhaba! İletişim için info@example.com veya support@test.org adresine yazın.
Web sitemiz: https://www.example.com/about?q=regex&lang=tr
IPv4: 192.168.1.1 ve 10.0.0.254
Tarih: 15/04/2024 veya 01-12-2023
Tel: +90 532 123 45 67 veya 05421234567
Renk kodları: #FF5733 #abc veya #6366F1`;

export function RegexTester({ onBack }: { onBack: () => void }) {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('gi');
    const [text, setText] = useState(SAMPLE_TEXT);
    const [matches, setMatches] = useState<Match[]>([]);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeMatch, setActiveMatch] = useState<number | null>(null);

    const flagOptions = ['g', 'i', 'm', 's', 'u'];

    const toggleFlag = (f: string) => {
        setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);
    };

    const runRegex = useCallback(() => {
        setError('');
        setMatches([]);
        if (!pattern.trim()) return;
        try {
            const re = new RegExp(pattern, flags);
            const result: Match[] = [];
            let m: RegExpExecArray | null;
            const safeFlags = flags.includes('g') ? flags : flags + 'g';
            const re2 = new RegExp(pattern, safeFlags);
            while ((m = re2.exec(text)) !== null) {
                result.push({ value: m[0], index: m.index, groups: (m.slice(1) as string[]) });
                if (!flags.includes('g')) break;
            }
            setMatches(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Geçersiz regex');
        }
    }, [pattern, flags, text]);

    useEffect(() => { runRegex(); }, [runRegex]);

    const highlighted = buildHighlighted(text, matches);

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-orange-500" /> Regex Tester
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gerçek zamanlı regex eşleştirme · Grup desteği · Hazır kalıplar</p>
                </div>
            </div>

            {/* Pattern input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Regex Kalıbı</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl text-slate-400 font-mono">/</span>
                    <input
                        value={pattern}
                        onChange={e => setPattern(e.target.value)}
                        placeholder="örn: \d+ veya [a-z]+"
                        spellCheck={false}
                        className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-base focus:outline-none focus:ring-2 text-slate-800 dark:text-slate-200 transition-colors ${error ? 'border-red-400 focus:ring-red-500/30' : 'border-slate-200 dark:border-slate-700 focus:ring-orange-500/30'}`}
                    />
                    <span className="text-2xl text-slate-400 font-mono">/</span>
                    {/* Flags */}
                    <div className="flex gap-1">
                        {flagOptions.map(f => (
                            <button key={f} onClick={() => toggleFlag(f)}
                                title={`Flag: ${f}`} aria-label={`${f} flag'ini ${flags.includes(f) ? 'kaldır' : 'ekle'}`}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${flags.includes(f) ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {error}
                    </p>
                )}

                {/* Stats */}
                {!error && pattern && (
                    <div className="flex items-center gap-4 mt-3">
                        <span className={`text-sm font-bold ${matches.length > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>
                            {matches.length} eşleşme
                        </span>
                        {matches.length > 0 && (
                            <div className="flex gap-2 text-xs text-slate-400">
                                {matches[0]?.groups?.length > 0 && <span>{matches[0].groups.length} grup</span>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Presets */}
            <div className="mb-4">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                    <BookOpen size={12} /> Hazır Kalıplar
                </p>
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button key={p.label} onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 transition-all">
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Test text */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold uppercase text-slate-500">Test Metni</p>
                        <button onClick={() => setText('')}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                            Temizle
                        </button>
                    </div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        spellCheck={false}
                        className="w-full h-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-700 dark:text-slate-300"
                    />
                </div>

                {/* Highlighted output */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-500 mb-2">Eşleşmeler</p>
                    <div
                        className="w-full h-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: highlighted || '<span class="text-slate-300 dark:text-slate-700 italic">Eşleşmeler burada vurgulanacak...</span>' }}
                    />
                </div>
            </div>

            {/* Match detail list */}
            {matches.length > 0 && (
                <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold uppercase text-slate-500">{matches.length} Eşleşme Detayı</p>
                        <button
                            onClick={() => { navigator.clipboard.writeText(matches.map(m => m.value).join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-500 transition-colors">
                            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                            {copied ? 'Kopyalandı' : 'Tümünü kopyala'}
                        </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {matches.map((m, i) => (
                            <div key={i}
                                onMouseEnter={() => setActiveMatch(i)}
                                onMouseLeave={() => setActiveMatch(null)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-default transition-colors ${activeMatch === i ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <span className="text-[10px] text-slate-400 w-6 text-right">{i + 1}</span>
                                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">{m.value}</span>
                                <span className="text-[10px] text-slate-400">idx: {m.index}</span>
                                {m.groups.length > 0 && (
                                    <span className="text-[10px] text-slate-400 flex gap-1">
                                        {m.groups.map((g, gi) => g !== undefined && <span key={gi} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">g{gi + 1}: {g}</span>)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
