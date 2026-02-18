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
        }
    };

    useEffect(() => {
        if (!file) {
            setPreviews([]);
            return;
        }
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
        <div className="glass-panel max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2" title="Geri Dön"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <ImageIcon className="text-purple-400" />
                    Favicon Oluşturucu
                </h2>
            </div>

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
                                onClick={() => setFile(null)}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Görseli Değiştir
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {previews.map((item) => (
                                <div key={item.size} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-4 hover:bg-white/10 transition-colors">
                                    <div className="bg-white/10 p-2 rounded-lg w-full aspect-square flex items-center justify-center">
                                        <img src={item.url} alt={`${item.size}px`} className="image-pixelated shadow-lg" style={{ width: Math.min(item.size, 64), height: Math.min(item.size, 64) }} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-white">{item.size}x{item.size}</div>
                                        <span className="text-xs text-slate-400 uppercase">PNG</span>
                                    </div>
                                    <a
                                        href={item.url}
                                        download={`favicon-${item.size}x${item.size}.png`}
                                        className="bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 w-full py-2 rounded-lg text-sm font-medium transition-all"
                                    >
                                        İndir
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
