import React, { useState } from 'react';
import { ArrowLeft, Trash2, Copy, Check, Type, RefreshCw, CaseSensitive, Info } from 'lucide-react';

interface TextToolkitProps {
    view: 'text-cleaner' | 'case-converter-pro';
    onBack: () => void;
}

export const TextToolkit: React.FC<TextToolkitProps> = ({ view, onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const processLocal = (action: string, params: any = {}) => {
        setProcessing(true);
        // Simulate a tiny delay for UX feel, though not strictly necessary
        setTimeout(() => {
            let result = input;

            switch (action) {
                case 'clean-spaces':
                    result = input.replace(/\s+/g, ' ').trim();
                    break;
                case 'clean-lines':
                    result = input.split('\n').map(line => line.trim()).filter(line => line).join('\n');
                    break;
                case 'remove-emojis':
                    result = input.replace(/[\u1000-\uFFFF]/g, ''); // Basic emoji/symbol removal
                    break;
                case 'normalize-tr':
                    const trMap: Record<string, string> = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U' };
                    result = input.replace(/[çÇğĞıİöÖşŞüÜ]/g, match => trMap[match] || match);
                    break;
                case 'show-hidden':
                    result = input.replace(/ /g, '·').replace(/\n/g, '↵\n').replace(/\t/g, '→\t');
                    break;
                case 'limit':
                    result = input.substring(0, params.limit || 2200);
                    break;
                case 'case':
                    if (params.to === 'upper') result = input.toLocaleUpperCase('tr-TR');
                    else if (params.to === 'lower') result = input.toLocaleLowerCase('tr-TR');
                    else if (params.to === 'title') {
                        result = input.toLocaleLowerCase('tr-TR').split(' ').map(s => s.charAt(0).toLocaleUpperCase('tr-TR') + s.substring(1)).join(' ');
                    } else if (params.to === 'camel') {
                        result = input.toLocaleLowerCase('tr-TR').replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toLocaleUpperCase('tr-TR')).replace(/[^a-zA-Z0-9]/g, '');
                    } else if (params.to === 'snake') {
                        result = input.toLocaleLowerCase('tr-TR').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    } else if (params.to === 'kebab') {
                        result = input.toLocaleLowerCase('tr-TR').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    }
                    break;
            }

            setOutput(result);
            setProcessing(false);
        }, 100);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        title="Geri Dön"
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                    >
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {view === 'text-cleaner' ? 'Metin Temizleyici Pro' : 'Case Converter Pro'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {view === 'text-cleaner' ? 'Gereksiz karakterleri ve boşlukları temizleyin.' : 'Metin formatını profesyonelce değiştirin.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Giriş Metni
                        </label>
                        <button
                            onClick={() => setInput('')}
                            title="Metni Temizle"
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Buraya yapıştırın..."
                        className="w-full h-80 bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm shadow-xl shadow-slate-200/50 dark:shadow-none"
                    />
                </div>

                {/* Output & Tools */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">İşlemler & Sonuç</label>
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 min-h-[16rem] h-[20rem] overflow-auto shadow-xl shadow-slate-200/50 dark:shadow-none">
                        {processing ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="animate-spin text-blue-500" size={32} />
                                <span className="text-sm font-bold text-slate-500 animate-pulse">Sunucuda işleniyor...</span>
                            </div>
                        ) : output ? (
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">{output}</pre>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">Henüz bir işlem yapılmadı.</div>
                        )}
                    </div>

                    {/* Quick Tools Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {view === 'text-cleaner' ? (
                            <>
                                <ToolButton title="Boşlukları Temizle" icon={<RefreshCw size={14} />} onClick={() => processLocal('clean-spaces')} />
                                <ToolButton title="Satırları Düzenle" icon={<RefreshCw size={14} />} onClick={() => processLocal('clean-lines')} />
                                <ToolButton title="Emojileri Sil" icon={<RefreshCw size={14} />} onClick={() => processLocal('remove-emojis')} />
                                <ToolButton title="TR Karakter Düzelt" icon={<RefreshCw size={14} />} onClick={() => processLocal('normalize-tr')} />
                                <ToolButton title="Gizli Karakter Göster" icon={<RefreshCw size={14} />} onClick={() => processLocal('show-hidden')} />
                                <ToolButton title="Instagram Limit (2200)" icon={<Type size={14} />} onClick={() => processLocal('limit', { limit: 2200 })} />
                            </>
                        ) : (
                            <>
                                <ToolButton title="UPPERCASE" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'upper' })} />
                                <ToolButton title="lowercase" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'lower' })} />
                                <ToolButton title="Title Case" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'title' })} />
                                <ToolButton title="camelCase" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'camel' })} />
                                <ToolButton title="snake_case" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'snake' })} />
                                <ToolButton title="kebab-case" icon={<CaseSensitive size={14} />} onClick={() => processLocal('case', { to: 'kebab' })} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolButton = ({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-left"
    >
        {icon}
        {title}
    </button>
);
