import React, { useEffect, useState } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface FaviconGeneratorProps {
    file: File | null;
    onBack: () => void;
}

export const FaviconGenerator: React.FC<FaviconGeneratorProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [previews, setPreviews] = useState<{ size: number, url: string }[]>([]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
            setPreviews([]);
        }
    };

    useEffect(() => {
        if (!file) return;
        const generate = async () => {
            const sizes = [16, 32, 192, 512]; // Common favicon/app icon sizes
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const newPreviews = await Promise.all(sizes.map(async (size) => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return { size, url: '' };

                // Better quality resizing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, size, size);

                return new Promise<{ size: number, url: string }>((resolve) => {
                    canvas.toBlob((blob) => {
                        if (blob) resolve({ size, url: URL.createObjectURL(blob) });
                    }, 'image/png');
                });
            }));

            setPreviews(newPreviews);
            URL.revokeObjectURL(objectUrl);
        };
        generate();
    }, [file]);

    return (
        <div className="max-w-[850px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-purple-500/20 border border-purple-500/40 text-white rounded-lg hover:bg-purple-500/40 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    title="Geri Dön"
                    id="back-button"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ImageIcon className="text-purple-400" size={28} />
                        Favicon Oluşturucu
                    </h2>
                    <p className="text-sm text-purple-400/80 font-medium tracking-wide">Multi-Platform Simge Paketi</p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-8 leading-relaxed max-w-2xl">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyası tüm standart favicon boyutlarına dönüştürüldü.
                    </>
                ) : (
                    'Yüklediğiniz tek bir görselden web, Android ve iOS için gerekli tüm favicon boyutlarını otomatik olarak oluşturun.'
                )}
            </p>

            <div className="min-h-[300px]">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <div className="p-4 bg-purple-500/10 rounded-full text-purple-400 group-hover:scale-110 transition-transform">
                            <ImageIcon size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">Favicon İçin Görsel Seçin</p>
                            <p className="text-sm text-slate-500 mt-1">Tek bir görselden tüm platformlar için icon paketini oluşturun</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            title="Görsel Seç"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-white truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreviews([]);
                                }}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Görseli Değiştir
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {previews.map((item) => (
                                <div key={item.size} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-4 hover:bg-white/10 transition-all group shadow-lg">
                                    <div className="bg-black/40 p-4 rounded-xl w-full aspect-square flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-colors">
                                        <img
                                            src={item.url}
                                            alt={`${item.size}px icon`}
                                            className="image-pixelated shadow-2xl transition-transform group-hover:scale-110 w-full h-full max-w-[64px] max-h-[64px]"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-black text-lg text-white leading-none mb-1">{item.size}×{item.size}</div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PNG Paket</span>
                                    </div>
                                    <a
                                        href={item.url}
                                        download={`favicon-${item.size}x${item.size}.png`}
                                        className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-200 hover:text-white border border-purple-500/20 text-xs font-bold transition-all text-center"
                                        title={`${item.size}px indir`}
                                    >
                                        İNDİR
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Icon Engine v2.0</p>
            </div>
        </div>
    );
};
