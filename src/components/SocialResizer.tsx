import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Instagram, Facebook, Youtube, Twitter, Download, Monitor, Smartphone, Crop } from 'lucide-react';

interface SocialResizerProps {
    file: File;
    onBack: () => void;
}

const PRESETS = [
    { name: 'Instagram Story / Reels', w: 1080, h: 1920, ratio: 9 / 16, icon: <Instagram size={18} /> },
    { name: 'Instagram Post (Kare)', w: 1080, h: 1080, ratio: 1 / 1, icon: <Instagram size={18} /> },
    { name: 'Instagram Post (Dikey)', w: 1080, h: 1350, ratio: 4 / 5, icon: <Instagram size={18} /> },
    { name: 'Instagram Post (Yatay)', w: 1080, h: 566, ratio: 1.91 / 1, icon: <Instagram size={18} /> },
    { name: 'Twitter / X Header', w: 1500, h: 500, ratio: 3 / 1, icon: <Twitter size={18} /> },
    { name: 'YouTube Cover', w: 2560, h: 1440, ratio: 16 / 9, icon: <Youtube size={18} /> },
    { name: 'YouTube Thumbnail', w: 1280, h: 720, ratio: 16 / 9, icon: <Youtube size={18} /> },
    { name: 'Facebook Post', w: 1200, h: 630, ratio: 1.91 / 1, icon: <Facebook size={18} /> },
    { name: 'WhatsApp Status', w: 1080, h: 1920, ratio: 9 / 16, icon: <Smartphone size={18} /> },
    { name: 'Full HD Wallpaper', w: 1920, h: 1080, ratio: 16 / 9, icon: <Monitor size={18} /> },
];

export const SocialResizer: React.FC<SocialResizerProps> = ({ file, onBack }) => {
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!imageSrc || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            canvas.width = selectedPreset.w;
            canvas.height = selectedPreset.h;

            // "Cover" fit logic
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
    }, [imageSrc, selectedPreset]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        setIsProcessing(true);
        const link = document.createElement('a');
        link.download = `resized-${selectedPreset.name.replace(/\s/g, '-')}-${file.name}`;
        link.href = canvasRef.current.toDataURL('image/jpeg', 0.9);
        link.click();
        setTimeout(() => setIsProcessing(false), 500);
    };

    return (
        <div className="glass-panel max-w-[1000px] mx-auto p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-2xl font-bold m-0">Sosyal Medya Boyutlandırıcı</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Presets List */}
                <div className="w-full lg:w-1/3 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {PRESETS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedPreset(preset)}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selectedPreset.name === preset.name
                                    ? 'bg-violet-500/20 border-violet-500/50 text-white'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                                }`}
                        >
                            <div className="p-2 bg-white/10 rounded-md">{preset.icon}</div>
                            <div>
                                <div className="font-semibold text-sm">{preset.name}</div>
                                <div className="text-xs opacity-60">{preset.w} x {preset.h}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Preview Area */}
                <div className="w-full lg:w-2/3 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center border border-white/10">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-[400px] shadow-2xl border border-white/20 object-contain"
                    />
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleDownload}
                            disabled={isProcessing}
                            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={20} />
                            {isProcessing ? 'İşleniyor...' : `${selectedPreset.name} Olarak İndir`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
