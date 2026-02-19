import React, { useState, useCallback } from 'react';
import { ArrowLeft, Copy, RefreshCw, Check } from 'lucide-react'; // Removed Hash as it's unused

interface UuidGeneratorProps {
    onBack: () => void;
}

export const UuidGenerator: React.FC<UuidGeneratorProps> = ({ onBack }) => {
    const [count, setCount] = useState(5);
    const [uuids, setUuids] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generateUuids = useCallback(() => {
        const newUuids = Array.from({ length: count }, () => {
            if (typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
            }
            // Fallback for older browsers
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        });
        setUuids(newUuids);
        setCopiedIndex(null);
    }, [count]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(uuids.join('\n'));
        setCopiedIndex(-1); // Use -1 to indicate "all copied"
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Initial generate
    React.useEffect(() => {
        generateUuids();
    }, [generateUuids]); // Added generateUuids to dependency array

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-indigo-500/20 border border-indigo-500/40 text-white rounded-lg hover:bg-indigo-500/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    title="Geri Dön"
                    aria-label="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">UUID Oluşturucu</h2>
                    <p className="text-sm text-indigo-400 font-medium tracking-wide">Benzersiz Kimlik (v4) Üretimi</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end bg-black/20 p-6 rounded-2xl border border-white/5">
                    <div className="flex-1 space-y-2 w-full">
                        <label htmlFor="uuid-count" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Oluşturulacak Miktar</label>
                        <input
                            id="uuid-count"
                            type="number"
                            min="1"
                            max="100"
                            value={count}
                            title="Oluşturulacak UUID miktarı"
                            placeholder="5"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500/50 outline-none transition-all"
                            aria-label="Oluşturulacak UUID miktarı"
                        />
                    </div>
                    <button
                        onClick={generateUuids}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
                        aria-label="UUID'leri Yenile"
                    >
                        <RefreshCw size={18} />
                        Yenile
                    </button>
                    <button
                        onClick={copyAll}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all whitespace-nowrap"
                        aria-label={copiedIndex === -1 ? "Tümü Kopyalandı" : "Tüm UUID'leri Kopyala"}
                    >
                        {copiedIndex === -1 ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        Tümünü Kopyala
                    </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" role="list" aria-label="Oluşturulan UUID'ler">
                    {uuids.map((uuid, index) => (
                        <div
                            key={index}
                            className="group flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-black/60"
                            role="listitem"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <span className="text-[10px] font-mono text-slate-600 font-bold w-4 text-right" aria-hidden="true">{index + 1}</span>
                                <code className="text-sm font-mono text-indigo-300 truncate" aria-label={`UUID ${index + 1}: ${uuid} `}>{uuid}</code>
                            </div>
                            <button
                                onClick={() => copyToClipboard(uuid, index)}
                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                title="Kopyala"
                                aria-label={copiedIndex === index ? `UUID ${index + 1} Kopyalandı` : `UUID ${index + 1} 'i Kopyala`}
                            >
                                {copiedIndex === index ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button >
                        </div >
                    ))}
                </div >

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl" role="note">
                    <p className="text-[11px] text-slate-500 leading-relaxed text-center font-medium italic">
                        UUID v4 (Universally Unique Identifier), teorik olarak çakışma olasılığı neredeyse imkansız olan 128 bitlik bir sayıdır.
                    </p>
                </div>
            </div >
        </div >
    );
};
