import React, { useState } from 'react';
import { ArrowLeft, Copy, RefreshCw, FileCode, Check, AlertCircle } from 'lucide-react';
import yaml from 'js-yaml';

interface YamlConverterProps {
    onBack: () => void;
}

export const YamlConverter: React.FC<YamlConverterProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'jsonToYaml' | 'yamlToJson'>('jsonToYaml');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const convert = () => {
        setError(null);
        if (!input.trim()) {
            setOutput('');
            return;
        }

        try {
            if (mode === 'jsonToYaml') {
                const jsonObj = JSON.parse(input);
                setOutput(yaml.dump(jsonObj));
            } else {
                const yamlObj = yaml.load(input);
                setOutput(JSON.stringify(yamlObj, null, 2));
            }
        } catch (err: unknown) {
            let message = 'Dönüştürme sırasında hata oluştu.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            setOutput('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const switchMode = () => {
        setMode(mode === 'jsonToYaml' ? 'yamlToJson' : 'jsonToYaml');
        setInput(output);
        setOutput('');
        setError(null);
    };

    return (
        <div className="max-w-[1000px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-amber-500/20 border border-amber-500/40 text-slate-700 dark:text-white rounded-lg hover:bg-amber-500/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">YAML / JSON Çevirici</h2>
                    <p className="text-sm text-amber-400 font-medium tracking-wide">Formatlar Arası Akıllı Dönüşüm</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                            {mode === 'jsonToYaml' ? 'JSON Girişi' : 'YAML Girişi'}
                        </label>
                        <button
                            onClick={switchMode}
                            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-tighter flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw size={10} /> Yön Değiştir
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'jsonToYaml' ? '{"key": "value"}' : 'key: value'}
                        className="w-full h-[400px] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:border-amber-500/50 outline-none transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                            {mode === 'jsonToYaml' ? 'YAML Çıktısı' : 'JSON Çıktısı'}
                        </label>
                        <div className="flex gap-2">
                            {output && (
                                <button
                                    onClick={copyToClipboard}
                                    className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
                                    title="Kopyala"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="w-full h-[400px] bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-sm font-mono text-amber-700 dark:text-amber-200 overflow-auto whitespace-pre custom-scrollbar">
                            {output || (error ? <span className="text-red-400/70 italic">{error}</span> : <span className="text-slate-700 italic">Dönüşüm sonucunu burada görün...</span>)}
                        </div>
                        {error && (
                            <div className="absolute top-4 right-4 text-red-400 animate-pulse">
                                <AlertCircle size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={convert}
                    disabled={!input.trim()}
                    className={`px-12 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-xl ${input.trim() ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 active:scale-95' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 opacity-50 cursor-not-allowed'}`}
                >
                    <FileCode size={24} />
                    Dönüştürmeyi Başlat
                </button>
            </div>
        </div>
    );
};
