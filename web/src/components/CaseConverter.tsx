import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Type, CaseSensitive } from 'lucide-react';

interface CaseConverterProps {
    onBack: () => void;
}

export const CaseConverter: React.FC<CaseConverterProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);

    const transform = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
        let result = input;
        switch (type) {
            case 'upper':
                result = input.toLocaleUpperCase('tr-TR');
                break;
            case 'lower':
                result = input.toLocaleLowerCase('tr-TR');
                break;
            case 'title':
                result = input.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
                    .join(' ');
                break;
            case 'sentence':
                result = input.charAt(0).toLocaleUpperCase('tr-TR') + input.slice(1).toLocaleLowerCase('tr-TR');
                break;
        }
        setInput(result);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
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
                        <CaseSensitive className="w-6 h-6 text-pink-500" />
                        Büyük/Küçük Harf Çevirici
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Metinlerinizin harf boyutlarını hızlıca dönüştürün
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Text Area */}
                <div className="relative group">
                    <div className="absolute top-0 right-0 p-2 flex items-center gap-2">
                        {input && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(input);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Dönüştürmek istediğiniz metni buraya yapıştırın veya yazın..."
                        className="w-full h-64 p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm leading-relaxed"
                    />
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => transform('upper')}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all group flex flex-col items-center gap-2"
                    >
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 uppercase">ABC</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BÜYÜK HARF</span>
                    </button>

                    <button
                        onClick={() => transform('lower')}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all group flex flex-col items-center gap-2"
                    >
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 lowercase">abc</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">küçük harf</span>
                    </button>

                    <button
                        onClick={() => transform('title')}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all group flex flex-col items-center gap-2"
                    >
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 capitalize">Abc Def</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Başlık Düzeni</span>
                    </button>

                    <button
                        onClick={() => transform('sentence')}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all group flex flex-col items-center gap-2"
                    >
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400">Abc def.</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cümle Düzeni</span>
                    </button>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                        <Type size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Türkçe Karakter Desteği</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Bu araç Türkçe'ye özgü karakterleri (İ, ı, Ğ, ğ, Ş, ş) doğru şekilde işler. Standart dönüşümlerin aksine "i" harfi büyütüldüğünde "İ", "I" harfi küçültüldüğünde "ı" olur.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

