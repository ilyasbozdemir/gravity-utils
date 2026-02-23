'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Code2, Terminal, FileJson, Layers, RefreshCw } from 'lucide-react';

type Language = 'typescript' | 'typescript-type' | 'go' | 'json-schema' | 'java';

export const JsonToCode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [jsonInput, setJsonInput] = useState('{\n  "id": 1,\n  "name": "Leanne Graham",\n  "username": "Bret",\n  "email": "Sincere@april.biz",\n  "address": {\n    "street": "Kulas Light",\n    "suite": "Apt. 556",\n    "city": "Gwenborough",\n    "zipcode": "92998-3874",\n    "geo": {\n      "lat": "-37.3159",\n      "lng": "81.1496"\n    }\n  }\n}');
    const [lang, setLang] = useState<Language>('typescript');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateCode = (input: string, selection: Language) => {
        try {
            const data = JSON.parse(input);
            setError(null);

            if (selection === 'typescript' || selection === 'typescript-type') {
                setOutput(jsonToTypescript(data, 'RootObject', selection === 'typescript' ? 'interface' : 'type'));
            } else if (selection === 'go') {
                setOutput(jsonToGo(data, 'RootObject'));
            } else if (selection === 'json-schema') {
                setOutput(JSON.stringify(generateJsonSchema(data), null, 4));
            } else if (selection === 'java') {
                setOutput(jsonToJava(data, 'RootObject'));
            }
        } catch (e) {
            setError('Geçersiz JSON formatı.');
            setOutput('');
        }
    };

    const jsonToTypescript = (obj: any, rootName: string, keyword: 'interface' | 'type'): string => {
        const interfaces: string[] = [];
        const seenNames = new Set<string>();

        const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

        const generate = (val: any, name: string): string => {
            if (Array.isArray(val)) {
                if (val.length === 0) return 'any[]';
                const type = generate(val[0], name.endsWith('s') ? name.slice(0, -1) : name);
                return `${type}[]`;
            } else if (val !== null && typeof val === 'object') {
                const interfaceName = toPascalCase(name);
                if (seenNames.has(interfaceName)) return interfaceName;
                seenNames.add(interfaceName);

                const props = Object.entries(val).map(([k, v]) => {
                    const type = generate(v, k);
                    return `    ${k}: ${type};`;
                }).join('\n');

                interfaces.push(`${keyword} ${interfaceName} {\n${props}\n}`);
                return interfaceName;
            } else if (typeof val === 'string') {
                return 'string';
            } else if (typeof val === 'number') {
                return 'number';
            } else if (typeof val === 'boolean') {
                return 'boolean';
            } else {
                return 'any';
            }
        };

        generate(obj, rootName);
        return interfaces.reverse().join('\n\n');
    };

    const jsonToGo = (obj: any, rootName: string): string => {
        const structs: string[] = [];
        const seenNames = new Set<string>();

        const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

        const generate = (val: any, name: string): string => {
            if (Array.isArray(val)) {
                if (val.length === 0) return '[]interface{}';
                const type = generate(val[0], name.endsWith('s') ? name.slice(0, -1) : name);
                return `[]${type}`;
            } else if (val !== null && typeof val === 'object') {
                const structName = toPascalCase(name);
                if (seenNames.has(structName)) return structName;
                seenNames.add(structName);

                const fields = Object.entries(val).map(([k, v]) => {
                    const type = generate(v, k);
                    const goName = k.split(/_|-|\s/).map(toPascalCase).join('');
                    return `    ${goName} ${type} \`json:"${k}"\``;
                }).join('\n');

                structs.push(`type ${structName} struct {\n${fields}\n}`);
                return structName;
            } else if (typeof val === 'string') return 'string';
            else if (typeof val === 'number') return 'float64';
            else if (typeof val === 'boolean') return 'bool';
            else return 'interface{}';
        };

        generate(obj, rootName);
        return structs.reverse().join('\n\n');
    };

    const jsonToJava = (obj: any, rootName: string): string => {
        const classes: string[] = [];
        const seenNames = new Set<string>();
        const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

        const generate = (val: any, name: string): string => {
            if (Array.isArray(val)) {
                if (val.length === 0) return 'List<Object>';
                const type = generate(val[0], name.endsWith('s') ? name.slice(0, -1) : name);
                return `List<${type}>`;
            } else if (val !== null && typeof val === 'object') {
                const className = toPascalCase(name);
                if (seenNames.has(className)) return className;
                seenNames.add(className);

                const fields = Object.entries(val).map(([k, v]) => {
                    const type = generate(v, k);
                    return `    private ${type} ${k};`;
                }).join('\n');

                classes.push(`public class ${className} {\n${fields}\n}`);
                return className;
            } else if (typeof val === 'string') return 'String';
            else if (typeof val === 'number') return val % 1 === 0 ? 'Integer' : 'Double';
            else if (typeof val === 'boolean') return 'Boolean';
            else return 'Object';
        };

        generate(obj, rootName);
        return classes.reverse().join('\n\n');
    };

    const generateJsonSchema = (val: any): any => {
        const type = Array.isArray(val) ? 'array' : val === null ? 'null' : typeof val;

        if (type === 'array') {
            return {
                type: 'array',
                items: val.length > 0 ? generateJsonSchema(val[0]) : {}
            };
        } else if (type === 'object' && val !== null) {
            const properties: any = {};
            const required: string[] = [];
            Object.entries(val).forEach(([k, v]) => {
                properties[k] = generateJsonSchema(v);
                required.push(k);
            });
            return {
                type: 'object',
                properties,
                required
            };
        } else {
            return { type };
        }
    };

    useEffect(() => {
        generateCode(jsonInput, lang);
    }, [jsonInput, lang]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">JSON ↔ Code Generator</h1>
                    <p className="text-slate-500 text-sm font-medium">JSON verilerinizi anında profesyonel veri modellerine dönüştürün.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <FileJson size={14} className="text-amber-500" /> JSON Input
                        </label>
                        {error && <span className="text-[10px] text-red-500 font-black animate-pulse uppercase tracking-widest">{error}</span>}
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 font-mono text-[13px] text-slate-700 dark:text-blue-200 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-sm custom-scrollbar"
                        placeholder='{"data": "Enter JSON here..."}'
                        spellCheck={false}
                        title="JSON Girdi"
                    />
                </div>

                {/* Output Area */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'typescript', label: 'TS Interface' },
                            { id: 'typescript-type', label: 'TS Type' },
                            { id: 'go', label: 'Go Struct' },
                            { id: 'java', label: 'Java Class' },
                            { id: 'json-schema', label: 'JSON Schema' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setLang(btn.id as Language)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${lang === btn.id
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative group flex-1">
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                            <button
                                onClick={handleCopy}
                                className={`p-3 rounded-2xl border transition-all ${copied
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-indigo-500 hover:border-indigo-500 shadow-xl'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                        <pre className="w-full h-full bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 font-mono text-[13px] text-indigo-100 overflow-auto custom-scrollbar border-2 border-indigo-500/10 active:scale-[0.99] transition-transform">
                            <code>{output}</code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Guide Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                    <h4 className="font-black text-slate-800 dark:text-white uppercase italic text-sm flex items-center gap-2">
                        <Terminal size={16} className="text-indigo-500" /> Neden Kullanmalıyım?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        API yanıtlarını manuel olarak modellemek hatalara açıktır. JSON'u buraya yapıştırarak saniyeler içinde hatasız veri modelleri oluşturun.
                    </p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                    <h4 className="font-black text-slate-800 dark:text-white uppercase italic text-sm flex items-center gap-2">
                        <Code2 size={16} className="text-emerald-500" /> Derinleme Analiz
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Algoritmamız iç içe geçmiş (nested) objeleri ve dizileri otomatik olarak tespit eder, her biri için bağımsız sınıflar/interfaceler üretir.
                    </p>
                </div>
                <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-2 group shadow-xl shadow-indigo-500/20 overflow-hidden relative">
                    <Layers size={80} className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black uppercase italic text-sm flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin-slow" /> Gelecek Güncelleme
                    </h4>
                    <p className="text-xs text-indigo-50 font-medium leading-relaxed relative z-10">
                        Yakında: Zod Schema generator ve MobX-State-Tree model desteği eklenerek "full-stack" güç merkezi haline gelecek.
                    </p>
                </div>
            </div>
        </div>
    );
};
