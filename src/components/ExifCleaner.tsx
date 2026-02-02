
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Download, Camera, MapPin, Calendar, Info } from 'lucide-react';
import exifr from 'exifr';

interface ExifCleanerProps {
    file: File;
    onBack: () => void;
}

export const ExifCleaner: React.FC<ExifCleanerProps> = ({ file, onBack }) => {
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [cleaned, setCleaned] = useState(false);

    useEffect(() => {
        const analyze = async () => {
            try {
                const data = await exifr.parse(file, { gps: true, xmp: true, icc: false });
                setMetadata(data);
            } catch (e) {
                console.error("Metadata reading failed", e);
            }
            setLoading(false);
        };
        analyze();
    }, [file]);

    const handleClean = async () => {
        setLoading(true);
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    setProcessedUrl(URL.createObjectURL(blob));
                    setCleaned(true);
                }
                setLoading(false);
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <div className="glass-panel max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <div className="text-left">
                    <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                        <Shield className="text-emerald-400" />
                        Exif & Metadata Yöneticisi
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Dosyalarınızın kimliğini görün ve güvenle temizleyin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metadata Display Section */}
                <div className="text-left bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info size={18} className="text-blue-400" />
                        Tespit Edilen Veriler
                    </h3>

                    {loading && !cleaned ? (
                        <div className="text-slate-400 animate-pulse">Analiz ediliyor...</div>
                    ) : metadata && Object.keys(metadata).length > 0 ? (
                        <div className="flex flex-col gap-3 text-sm">
                            {metadata.Make && (
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                                    <Camera size={16} className="text-slate-400" />
                                    <span>{metadata.Make} {metadata.Model}</span>
                                </div>
                            )}
                            {metadata.CreateDate && (
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>{new Date(metadata.CreateDate).toLocaleString()}</span>
                                </div>
                            )}
                            {(metadata.latitude || metadata.GPSLatitude) && (
                                <div className="flex items-center gap-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-200">
                                    <MapPin size={16} className="text-red-400" />
                                    <span>Konum Verisi Tespit Edildi!</span>
                                </div>
                            )}
                            {metadata.Software && (
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                                    <span className="text-slate-400">Yazılım:</span>
                                    <span>{metadata.Software}</span>
                                </div>
                            )}
                            <div className="mt-2 text-xs text-slate-500 font-mono break-all max-h-[150px] overflow-y-auto">
                                {JSON.stringify(metadata, null, 2)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center py-8 opacity-70">
                            <Shield size={48} className="mb-2" />
                            <p>Bu dosyada gizli veri bulunamadı.</p>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <div className="mb-6">
                        <img src={cleaned && processedUrl ? processedUrl : URL.createObjectURL(file)} alt="Preview" className="max-h-[200px] object-contain rounded shadow-lg" />
                    </div>

                    {!cleaned ? (
                        <button
                            onClick={handleClean}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
                        >
                            <Shield size={20} />
                            {loading ? 'İşleniyor...' : 'Tüm Verileri Temizle'}
                        </button>
                    ) : (
                        <div className="w-full flex flex-col gap-4 animate-[fadeIn_0.5s_ease]">
                            <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-lg text-sm font-medium">
                                ✨ Başarıyla Temizlendi!
                            </div>
                            <a
                                href={processedUrl!}
                                download={`safe - ${file.name} `}
                                className="bg-white text-emerald-900 hover:bg-slate-200 w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download size={20} />
                                Güvenli Dosyayı İndir
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

