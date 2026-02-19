import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart } from 'lucide-react';

interface TextAnalyzerProps {
    file: File | null;
    onBack: () => void;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [stats, setStats] = useState<{ words: number; chars: number; lines: number; spaces: number } | null>(null);
    const [preview, setPreview] = useState<string>('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setPreview(text.slice(0, 1000) + (text.length > 1000 ? '...' : ''));

            setStats({
                words: text.trim().split(/\s+/).filter(w => w.length > 0).length,
                chars: text.length,
                lines: text.split(/\r\n|\r|\n/).length,
                spaces: text.split(' ').length - 1
            });
        };
        reader.readAsText(file);
    }, [file]);

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-pink-500/20 border border-pink-500/40 text-slate-700 dark:text-white rounded-lg hover:bg-pink-500/40 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Metin Analizi</h2>
                    <p className="text-sm text-pink-400 font-medium tracking-wide">İstatistikler ve İçerik Kontrolü</p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-8 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyası analiz edildi. Aşağıda dosya içeriğine dair detaylı istatistikleri görebilirsiniz.
                    </>
                ) : (
                    'Metin belgenizin kelime, karakter, satır ve boşluk sayılarını analiz edin. Dosyanızı seçerek başlayın.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-pink-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                >
                    <div className="p-5 bg-pink-500/10 rounded-full text-pink-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                        <BarChart size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1 text-slate-200">Analiz İçin Belge Seçin</p>
                        <p className="text-sm text-slate-500">TXT, MD, PDF veya Kod dosyaları</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".txt,.md,.js,.ts,.html,.css,.json"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Kelime', value: stats.words, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'Karakter', value: stats.chars, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                                { label: 'Satır', value: stats.lines, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Boşluk', value: stats.spaces, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((item, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl border border-slate-100 dark:border-white/5 ${item.bg} backdrop-blur-sm flex flex-col items-center justify-center gap-1 shadow-lg group hover:scale-[1.02] transition-transform`}>
                                    <div className={`text-2xl font-black ${item.color} leading-none`}>{item.value.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest group flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                Önizleme <span className="text-[10px] opacity-50 lowercase font-normal">(İlk 1000 karakter)</span>
                            </label>
                            <button
                                onClick={() => setFile(null)}
                                className="text-[10px] font-bold text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors py-1 px-2"
                            >
                                Dosyayı Değiştir
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 max-h-[400px] overflow-y-auto custom-scrollbar text-left shadow-inner select-text">
                                {preview || <span className="italic opacity-30">İçerik yüklenemedi...</span>}
                            </div>
                            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Analiz Tamamlandı</span>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{file.type || 'text/plain'}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
