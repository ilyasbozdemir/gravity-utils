import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Type } from 'lucide-react';

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
                result = input.split(' ')
                    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR'))
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
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-pink-500/20 border border-pink-500/40 text-white rounded-lg hover:bg-pink-500/40 transition-all"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">Büyük/Küçük Harf Çevirici</h2>
                    <p className="text-sm text-pink-400 font-medium tracking-wide">Metin Formatlama Araçları</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metin Girişi</label>
                        {input && (
                            <button onClick={copyToClipboard} className="text-xs text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 font-bold">
                                {copied ? <><Check size={12} /> Kopyalandı</> : <><Copy size={12} /> Kopyala</>}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Dönüştürmek istediğiniz metni buraya yapıştırın..."
                        className="w-full h-[250px] bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-slate-200 focus:border-pink-500/50 outline-none transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onClick={() => transform('upper')} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-all active:scale-95 uppercase tracking-tighter">BÜYÜK HARF</button>
                    <button onClick={() => transform('lower')} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-all active:scale-95 lowercase tracking-tighter">küçük harf</button>
                    <button onClick={() => transform('title')} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-all active:scale-95 tracking-tighter">Başlık Düzeni</button>
                    <button onClick={() => transform('sentence')} className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-all active:scale-95 tracking-tighter">Cümle Düzeni</button>
                </div>

                <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl flex items-center gap-3">
                    <Type size={18} className="text-pink-500 opacity-60" />
                    <p className="text-[11px] text-slate-500 font-medium italic">
                        Türkçe karakter duyarlı (İ, ı, Ğ, ğ) dönüşüm desteği ile hatasız çeviri yapar.
                    </p>
                </div>
            </div>
        </div>
    );
};
