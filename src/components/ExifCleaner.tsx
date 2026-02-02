
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Download, Camera, MapPin, Calendar, Info, AlertTriangle, Eye, Lock } from 'lucide-react';
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
    const [riskLevel, setRiskLevel] = useState<'high' | 'medium' | 'low' | 'safe'>('safe');

    useEffect(() => {
        const analyze = async () => {
            try {
                // Parse comprehensive metadata
                const data = await exifr.parse(file, { gps: true, xmp: true, icc: false, tiff: true, exif: true });
                setMetadata(data);

                // Determine Risk Level
                if (data) {
                    if (data.latitude || data.GPSLatitude || data.gps?.latitude) {
                        setRiskLevel('high');
                    } else if (data.Make || data.Model || data.Software || data.CreateDate || data.DateTimeOriginal) {
                        setRiskLevel('medium');
                    } else {
                        setRiskLevel('low');
                    }
                } else {
                    setRiskLevel('safe');
                }
            } catch (e) {
                console.error("Metadata reading failed", e);
                setRiskLevel('safe');
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
        <div className="glass-panel max-w-[1000px] mx-auto p-6 md:p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <div className="text-left">
                    <h2 className="text-2xl font-bold m-0 flex items-center gap-3">
                        <Shield className={cleaned ? "text-emerald-400" : "text-amber-400"} size={28} />
                        Exif & Gizlilik Analizi
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Dosyalarınızın başkalarına neler söylediğini öğrenin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: Analysis Report */}
                <div className="flex flex-col gap-6">
                    {/* Security Alert Banner */}
                    {!cleaned && riskLevel !== 'safe' && (
                        <div className={`p - 4 rounded - xl border flex gap - 4 ${riskLevel === 'high' ? 'bg-red-500/10 border-red-500/30' :
                            riskLevel === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                                'bg-blue-500/10 border-blue-500/30'
                            } `}>
                            <div className={`p - 2 rounded - full h - fit ${riskLevel === 'high' ? 'bg-red-500/20 text-red-500' :
                                riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                                    'bg-blue-500/20 text-blue-500'
                                } `}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className={`font - bold text - lg ${riskLevel === 'high' ? 'text-red-400' :
                                    riskLevel === 'medium' ? 'text-amber-400' :
                                        'text-blue-400'
                                    } `}>
                                    {riskLevel === 'high' ? 'KRİTİK GİZLİLİK RİSKİ!' :
                                        riskLevel === 'medium' ? 'Kişisel Veri Tespit Edildi' : 'Metadata Bulundu'}
                                </h3>
                                <p className="text-sm opacity-80 mt-1">
                                    {riskLevel === 'high'
                                        ? "Bu fotoğraf tam konumunuzu (ev adresi, iş yeri vb.) içeriyor. Paylaşmadan önce MUTLAKA temizlemelisiniz."
                                        : "Bu fotoğraf ne zaman ve hangi cihazla çekildiği bilgisini içeriyor."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Detailed Data List */}
                    <div className="text-left bg-white/5 p-6 rounded-xl border border-white/10 flex-1">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                            <Eye size={18} className="text-violet-400" />
                            Fotoğrafın İfşa Ettiği Bilgiler
                        </h3>

                        {loading && !cleaned ? (
                            <div className="text-slate-400 animate-pulse">Analiz ediliyor...</div>
                        ) : metadata && Object.keys(metadata).length > 0 ? (
                            <div className="flex flex-col gap-4 text-sm">

                                {/* GPS Data - THE CRITICAL ONE */}
                                {(metadata.latitude || metadata.GPSLatitude) && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg animate-pulse">
                                        <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                                            <MapPin size={18} />
                                            <span>KONUM BİLGİSİ (GPS)</span>
                                        </div>
                                        <p className="text-slate-300 text-xs">
                                            Koordinatlar: {metadata.latitude || metadata.GPSLatitude}, {metadata.longitude || metadata.GPSLongitude}
                                        </p>
                                        <p className="text-red-300 text-xs mt-2 font-semibold">
                                            ⚠️ Bu koordinatlar haritada evinizin veya bulunduğunuz yerin tam noktasını gösterir!
                                        </p>
                                    </div>
                                )}

                                {/* Date & Time */}
                                {(metadata.CreateDate || metadata.DateTimeOriginal) && (
                                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                        <Calendar size={18} className="text-blue-400 mt-1" />
                                        <div>
                                            <span className="font-bold block text-blue-200">Zaman Damgası</span>
                                            <span className="opacity-70 text-xs">
                                                {metaDateToString(metadata.CreateDate || metadata.DateTimeOriginal)}
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Saat ve tarih, nerede olduğunuzu doğrulayabilir.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Device Info */}
                                {(metadata.Make || metadata.Model) && (
                                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                        <Camera size={18} className="text-emerald-400 mt-1" />
                                        <div>
                                            <span className="font-bold block text-emerald-200">Cihaz Bilgisi</span>
                                            <span className="opacity-70 text-xs">{metadata.Make} {metadata.Model}</span>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Hangi telefon veya kamerayı kullandığınız bellidir.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Software Info */}
                                {metadata.Software && (
                                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                        <Info size={18} className="text-slate-400 mt-1" />
                                        <div>
                                            <span className="font-bold block text-slate-300">Yazılım / Düzenleme</span>
                                            <span className="opacity-70 text-xs">{metadata.Software}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-emerald-400 flex flex-col items-center py-8 opacity-90">
                                <Shield size={48} className="mb-4" />
                                <p className="font-bold text-lg">Tertemiz!</p>
                                <p className="text-sm opacity-70">Bu dosyada hiç metadata bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Action & Result */}
                <div className="flex flex-col gap-6 ">
                    <div className="bg-black/40 p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center flex-1 min-h-[400px]">
                        <div className="mb-6 relative group">
                            <img
                                src={cleaned && processedUrl ? processedUrl : URL.createObjectURL(file)}
                                alt="Preview"
                                className="max-h-[300px] object-contain rounded shadow-lg transition-opacity duration-300"
                            />
                            {cleaned && (
                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Temizlenmiş Hali</span>
                                </div>
                            )}
                        </div>

                        {!cleaned ? (
                            <div className="w-full">
                                <p className="text-slate-400 text-sm mb-4 text-center italic">
                                    "Bir görüntüyü internete yüklemeden önce <br />içinde ne sakladığını bir kez daha düşünün."
                                </p>
                                <button
                                    onClick={handleClean}
                                    disabled={loading || (!metadata && riskLevel === 'safe')}
                                    className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                >
                                    <Shield size={24} />
                                    {loading ? 'Analiz Ediliyor...' : 'BU BİLGİLERİ SİL'}
                                </button>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col gap-4 animate-[fadeSlideUp_0.5s_ease]">
                                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-lg text-center">
                                    <div className="font-bold text-lg flex justify-center items-center gap-2 mb-1">
                                        <Lock size={20} />
                                        GİZLİLİK SAĞLANDI
                                    </div>
                                    <p className="text-sm opacity-80">
                                        Konum, tarih ve cihaz bilgileri tamamen silindi. <br />Görüntü kalitesi %95 (JPG) olarak korundu.
                                    </p>
                                </div>
                                <a
                                    href={processedUrl!}
                                    download={`safe_${file.name.split('.')[0]}.jpg`}
                                    className="bg-white text-emerald-900 hover:bg-slate-200 w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <Download size={24} />
                                    Güvenli Dosyayı İndir
                                </a>
                                <button
                                    onClick={() => { setCleaned(false); setProcessedUrl(null); }}
                                    className="text-slate-400 text-sm hover:text-white underline"
                                >
                                    Orijinale Dön
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper for date formatting
const metaDateToString = (dateInfo: any): string => {
    if (!dateInfo) return 'Bilinmiyor';
    try {
        if (dateInfo instanceof Date) return dateInfo.toLocaleString('tr-TR');
        return String(dateInfo);
    } catch {
        return 'Okunamadı';
    }
}

