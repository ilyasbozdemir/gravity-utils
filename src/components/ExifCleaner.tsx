import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Download, Trash2 } from 'lucide-react';

interface ExifCleanerProps {
    file: File;
    onBack: () => void;
}

export const ExifCleaner: React.FC<ExifCleanerProps> = ({ file, onBack }) => {
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [isCleaning, setIsCleaning] = useState(true);

    useEffect(() => {
        const cleanExif = async () => {
            setIsCleaning(true);
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve) => (img.onload = resolve));

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Drawing to canvas strips metadata
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newUrl = URL.createObjectURL(blob);
                        setProcessedUrl(newUrl);
                    }
                    setIsCleaning(false);
                }, 'image/jpeg', 0.95);
            }
        };

        cleanExif();
    }, [file]);

    return (
        <div className="glass-panel max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <Shield className="text-emerald-400" />
                    Exif & Metadata Temizleyici
                </h2>
            </div>

            <p className="text-slate-300 mb-8">
                Fotoğrafınızdaki gizli konum (GPS), kamera bilgisi ve tarih verileri temizlendi.
                Artık güvenle paylaşabilirsiniz.
            </p>

            {isCleaning ? (
                <div className="p-12 text-slate-400">Temizleniyor...</div>
            ) : processedUrl ? (
                <div className="flex flex-col items-center gap-6">
                    <img src={processedUrl} alt="Cleaned" className="max-h-[300px] rounded-lg border border-white/10 shadow-lg" />
                    <a
                        href={processedUrl}
                        download={`clean-${file.name}`}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Download size={20} />
                        Güvenli Versiyonu İndir
                    </a>
                </div>
            ) : (
                <div className="text-red-400">Bir hata oluştu.</div>
            )}
        </div>
    );
};
