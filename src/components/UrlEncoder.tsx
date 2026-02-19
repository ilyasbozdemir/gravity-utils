import React, { useState } from 'react';
import { ArrowLeft, Copy, Globe, Check } from 'lucide-react';

interface UrlEncoderProps {
    onBack: () => void;
}

export const UrlEncoder: React.FC<UrlEncoderProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleAction = (type: 'encode' | 'decode') => {
        try {
            if (type === 'encode') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
        } catch {
            setOutput('Hata: Geçersiz karakter dizisi.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-sky-500/20 border border-sky-500/40 text-slate-700 dark:text-white rounded-lg hover:bg-sky-500/40 transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">URL Encoder / Decoder</h2>
                    <p className="text-sm text-sky-400 font-medium tracking-wide">Web Adresleri için Akıllı Kodlayıcı</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Giriş Metni veya URL</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="https://example.com/search?q=merhaba dünya"
                        className="w-full h-[150px] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:border-sky-500/50 outline-none transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => handleAction('encode')}
                        className="flex-1 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20"
                    >
                        URL Kodla (Encode)
                    </button>
                    <button
                        onClick={() => handleAction('decode')}
                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-2xl font-bold border border-slate-300 dark:border-white/10 flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        URL Çöz (Decode)
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Çıktı</label>
                        {output && (
                            <button onClick={copyToClipboard} className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 font-bold">
                                {copied ? <><Check size={12} /> Kopyalandı</> : <><Copy size={12} /> Kopyala</>}
                            </button>
                        )}
                    </div>
                    <div className="w-full min-h-[100px] bg-black/60 border border-white/5 rounded-2xl p-6 text-sm font-mono text-sky-300 break-all leading-relaxed shadow-inner">
                        {output || <span className="opacity-20 italic">Sonuç burada görünecek...</span>}
                    </div>
                </div>

                <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-3">
                    <Globe size={18} className="text-sky-500 opacity-60" />
                    <p className="text-[11px] text-slate-500 font-medium italic">
                        Web tarayıcılarında sorunsuz çalışması için özel karakterler (%20, %3D) otomatik olarak işlenir.
                    </p>
                </div>
            </div>
        </div>
    );
};
