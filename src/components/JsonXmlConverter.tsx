'use client';

import React, { useState, useCallback } from 'react';
import {
    ArrowLeft, ArrowRightLeft, Copy, Download, Trash2,
    FileJson, FileCode, Check, AlertCircle, Wand2, ChevronDown
} from 'lucide-react';
import { js2xml, xml2js } from 'xml-js';

type ConversionMode = 'json2xml' | 'xml2json' | 'js2json' | 'json2yaml' | 'yaml2json';

const MODE_CONFIG: Record<ConversionMode, { label: string; inputLabel: string; outputLabel: string; placeholder: string; color: string }> = {
    json2xml: {
        label: 'JSON → XML',
        inputLabel: 'JSON',
        outputLabel: 'XML',
        placeholder: '{\n  "root": {\n    "user": {\n      "name": "Ali",\n      "age": 30\n    }\n  }\n}',
        color: 'blue',
    },
    xml2json: {
        label: 'XML → JSON',
        inputLabel: 'XML',
        outputLabel: 'JSON',
        placeholder: '<root>\n  <user>\n    <name>Ali</name>\n    <age>30</age>\n  </user>\n</root>',
        color: 'orange',
    },
    js2json: {
        label: 'JS/TS → JSON',
        inputLabel: 'JS / TS Object',
        outputLabel: 'JSON',
        placeholder: 'const config = {\n  apiUrl: "https://api.example.com",\n  timeout: 5000,\n  features: [\'auth\', \'logging\'],\n  debug: true,\n}',
        color: 'yellow',
    },
    json2yaml: {
        label: 'JSON → YAML',
        inputLabel: 'JSON',
        outputLabel: 'YAML',
        placeholder: '{\n  "name": "Gravity Utils",\n  "version": "1.0.0",\n  "features": ["convert", "compress"]\n}',
        color: 'green',
    },
    yaml2json: {
        label: 'YAML → JSON',
        inputLabel: 'YAML',
        outputLabel: 'JSON',
        placeholder: 'name: Gravity Utils\nversion: 1.0.0\nfeatures:\n  - convert\n  - compress',
        color: 'purple',
    },
};

// Simple YAML serializer (JSON → YAML)
function jsonToYaml(obj: unknown, indent = 0): string {
    const pad = ' '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'number') return String(obj);
    if (typeof obj === 'string') {
        if (/[\n:#\[\]{},&*?|<>=!%@`]/.test(obj) || obj.includes('"')) return `"${obj.replace(/"/g, '\\"')}"`;
        return obj;
    }
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj.map(item => `${pad}- ${jsonToYaml(item, indent + 2)}`).join('\n');
    }
    if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj as Record<string, unknown>);
        if (entries.length === 0) return '{}';
        return entries.map(([k, v]) => {
            const valStr = jsonToYaml(v, indent + 2);
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                return `${pad}${k}:\n${valStr}`;
            }
            if (Array.isArray(v)) {
                return `${pad}${k}:\n${valStr}`;
            }
            return `${pad}${k}: ${valStr}`;
        }).join('\n');
    }
    return String(obj);
}

// Simple YAML parser (YAML → JSON)
function yamlToJson(yaml: string): unknown {
    // Very basic YAML parser for common patterns
    const lines = yaml.split('\n');

    function parseValue(val: string): unknown {
        const trimmed = val.trim();
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null' || trimmed === '~') return null;
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }
        return trimmed;
    }

    function parseLines(lines: string[], baseIndent: number): [unknown, number] {
        const result: Record<string, unknown> | unknown[] = {};
        let isArray = false;
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }

            const indent = line.search(/\S/);
            if (indent < baseIndent) break;
            if (indent > baseIndent && i === 0) { i++; continue; }

            const trimmed = line.trim();

            if (trimmed.startsWith('- ')) {
                if (!isArray) { isArray = true; (result as unknown[]).length = 0; }
                const val = trimmed.slice(2).trim();
                (result as unknown[]).push(parseValue(val));
                i++;
            } else if (trimmed.includes(':')) {
                const colonIdx = trimmed.indexOf(':');
                const key = trimmed.slice(0, colonIdx).trim();
                const rest = trimmed.slice(colonIdx + 1).trim();

                if (rest === '' && i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    const nextIndent = nextLine.search(/\S/);
                    if (nextIndent > indent) {
                        const [nested, consumed] = parseLines(lines.slice(i + 1), nextIndent);
                        (result as Record<string, unknown>)[key] = nested;
                        i += consumed + 1;
                        continue;
                    }
                }
                (result as Record<string, unknown>)[key] = parseValue(rest);
                i++;
            } else { i++; }
        }
        return [isArray ? result : result, i];
    }

    const [parsed] = parseLines(lines, 0);
    return parsed;
}

// JS/TS object literal → JSON converter
function jsObjectToJson(code: string): string {
    // Strip TS type annotations, const/let/var declarations, and trailing semicolons
    let cleaned = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .replace(/\/\/[^\n]*/g, '')        // line comments
        .replace(/^\s*(export\s+)?(const|let|var|type|interface)\s+\w+(\s*:\s*[\w<>\[\]{},\s|]+)?\s*=\s*/m, '') // declaration
        .replace(/\s*(?:as\s+\w+)?\s*;?\s*$/, '') // trailing 'as Type;'
        .trim();

    // Convert JS object to JSON:
    // 1. Quote unquoted keys
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)(\s*:)/g, '$1"$2"$3');
    // 2. Convert single quotes to double quotes (simple)
    cleaned = cleaned.replace(/'([^']*)'/g, '"$1"');
    // 3. Remove trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    // 4. Convert undefined to null
    cleaned = cleaned.replace(/:\s*undefined\b/g, ': null');

    return JSON.stringify(JSON.parse(cleaned), null, 2);
}

export function JsonXmlConverter({ onBack }: { onBack: () => void }) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<ConversionMode>('json2xml');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showModes, setShowModes] = useState(false);
    const [autoDetected, setAutoDetected] = useState<string | null>(null);

    const config = MODE_CONFIG[mode];

    const handleConvert = useCallback(() => {
        try {
            setError(null);
            if (!input.trim()) return;

            let result = '';

            if (mode === 'json2xml') {
                const jsonObj = JSON.parse(input);
                result = js2xml(jsonObj, { compact: true, spaces: 4 });
            } else if (mode === 'xml2json') {
                const jsonObj = xml2js(input, { compact: true });
                result = JSON.stringify(jsonObj, null, 2);
            } else if (mode === 'js2json') {
                result = jsObjectToJson(input);
            } else if (mode === 'json2yaml') {
                const jsonObj = JSON.parse(input);
                result = jsonToYaml(jsonObj);
            } else if (mode === 'yaml2json') {
                const parsed = yamlToJson(input);
                result = JSON.stringify(parsed, null, 2);
            }

            setOutput(result);
        } catch (err) {
            setError(`Dönüştürme hatası: ${err instanceof Error ? err.message : 'Geçersiz format'}`);
        }
    }, [input, mode]);

    const handleAutoDetect = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        let detected: ConversionMode | null = null;
        if (trimmed.startsWith('<')) {
            detected = 'xml2json';
            setAutoDetected('XML tespit edildi → JSON\'a çevriliyor');
        } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            // Try JSON
            try {
                JSON.parse(trimmed);
                detected = 'json2xml';
                setAutoDetected('JSON tespit edildi → XML\'e çevriliyor');
            } catch {
                detected = 'js2json';
                setAutoDetected('JS Object tespit edildi → JSON\'a çevriliyor');
            }
        } else if (/^\w[\w\s]*:/m.test(trimmed)) {
            detected = 'yaml2json';
            setAutoDetected('YAML tespit edildi → JSON\'a çevriliyor');
        } else if (/^(const|let|var|export)/.test(trimmed)) {
            detected = 'js2json';
            setAutoDetected('JS/TS ifadesi tespit edildi → JSON\'a çevriliyor');
        }

        if (detected) {
            setMode(detected);
            setTimeout(() => setAutoDetected(null), 3000);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const ext = mode === 'json2xml' ? 'xml' : mode.endsWith('yaml') || mode.startsWith('yaml') ? 'yaml' : 'json';
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSwap = () => {
        const swapMap: Partial<Record<ConversionMode, ConversionMode>> = {
            json2xml: 'xml2json',
            xml2json: 'json2xml',
            json2yaml: 'yaml2json',
            yaml2json: 'json2yaml',
        };
        const newMode = swapMap[mode];
        if (newMode) {
            setMode(newMode);
            setInput(output);
            setOutput(input);
            setError(null);
        }
    };

    const canSwap = ['json2xml', 'xml2json', 'json2yaml', 'yaml2json'].includes(mode);

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
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
                            <FileCode className="w-6 h-6 text-blue-500" />
                            Format Dönüştürücü
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            JSON, XML, YAML, JS/TS — her yönde dönüştür
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Auto-detect */}
                    <button
                        onClick={handleAutoDetect}
                        disabled={!input.trim()}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors text-sm font-medium disabled:opacity-40"
                        title="Formatı otomatik algıla"
                    >
                        <Wand2 size={16} />
                        Otomatik Algıla
                    </button>

                    {/* Mode selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowModes(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm"
                        >
                            {config.label}
                            <ChevronDown size={16} className={`transition-transform ${showModes ? 'rotate-180' : ''}`} />
                        </button>

                        {showModes && (
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden min-w-[180px]">
                                {Object.entries(MODE_CONFIG).map(([k, v]) => (
                                    <button
                                        key={k}
                                        onClick={() => { setMode(k as ConversionMode); setShowModes(false); setOutput(''); setError(null); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${mode === k
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Swap button */}
                    {canSwap && (
                        <button
                            onClick={handleSwap}
                            disabled={!output}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium disabled:opacity-40"
                            title="Girdi ve çıktıyı yer değiştir"
                        >
                            <ArrowRightLeft size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Auto-detect badge */}
            {autoDetected && (
                <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 text-sm font-medium animate-in slide-in-from-top-2">
                    <Wand2 size={14} />
                    {autoDetected}
                </div>
            )}

            {/* Main panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minHeight: '500px' }}>
                {/* Input */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Girdi
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">
                                {config.inputLabel}
                            </span>
                        </div>
                        <button
                            onClick={() => { setInput(''); setOutput(''); setError(null); }}
                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={12} /> Temizle
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={config.placeholder}
                        className="flex-1 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed"
                        style={{ minHeight: '400px' }}
                        spellCheck={false}
                    />
                    <button
                        onClick={handleConvert}
                        disabled={!input.trim()}
                        className="py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Dönüştür →
                    </button>
                </div>

                {/* Output */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Çıktı
                            </span>
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                                {config.outputLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleCopy}
                                disabled={!output}
                                className="p-1.5 text-slate-400 hover:text-blue-500 disabled:opacity-40 transition-colors"
                                title="Kopyala"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={!output}
                                className="p-1.5 text-slate-400 hover:text-green-500 disabled:opacity-40 transition-colors"
                                title="İndir"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative" style={{ minHeight: '400px' }}>
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Dönüştürülen çıktı burada görünecek..."
                            className="w-full h-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none font-mono text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed"
                            spellCheck={false}
                            style={{ minHeight: '400px' }}
                        />
                        {error && (
                            <div className="absolute inset-x-4 bottom-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-medium flex items-start gap-2 animate-in slide-in-from-bottom-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Char count */}
                    {output && (
                        <div className="flex justify-between text-[10px] text-slate-400 px-1">
                            <span>{output.split('\n').length} satır</span>
                            <span>{output.length.toLocaleString()} karakter</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { title: 'JSON ↔ XML', desc: 'Yapısal veri dönüşümü', color: 'blue' },
                    { title: 'JS/TS → JSON', desc: 'Object literal\'den JSON\'a', color: 'yellow' },
                    { title: 'JSON ↔ YAML', desc: 'Config dosyası çevirisi', color: 'green' },
                    { title: 'Otomatik Algıla', desc: 'Formatı kendisi belirler', color: 'amber' },
                ].map(tip => (
                    <div
                        key={tip.title}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    >
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{tip.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500">{tip.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
