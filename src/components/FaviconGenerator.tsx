import React, { useEffect, useState } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface FaviconGeneratorProps {
    file: File;
    onBack: () => void;
}

export const FaviconGenerator: React.FC<FaviconGeneratorProps> = ({ file, onBack }) => {
    const [previews, setPreviews] = useState<{ size: number, url: string }[]>([]);

    useEffect(() => {
        const generate = async () => {
            const sizes = [16, 32, 192, 512]; // Common favicon/app icon sizes
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve) => (img.onload = resolve));

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
        };
        generate();
    }, [file]);

    return (
        <div className="glass-panel max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <ImageIcon className="text-purple-400" />
                    Favicon Oluşturucu
                </h2>
            </div>

            <p className="text-slate-300 mb-8">
                Logonuz tüm platformlar için optimize edildi. İhtiyacınız olan boyutları indirin.
            </p>

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
        </div>
    );
};
