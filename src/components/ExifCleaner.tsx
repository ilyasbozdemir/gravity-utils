
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Download, Camera, MapPin, Calendar, Info, AlertTriangle, Eye, Lock, RefreshCw } from 'lucide-react';
import exifr from 'exifr';

interface ExifCleanerProps {
    file: File | null;
    onBack: () => void;
}

export const ExifCleaner: React.FC<ExifCleanerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);
    const [cleaned, setCleaned] = useState(false);
    const [riskLevel, setRiskLevel] = useState<'high' | 'medium' | 'low' | 'safe'>('safe');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setCleaned(false);
            setProcessedUrl(null);
            setMetadata(null);
        }
    };

    useEffect(() => {
        if (!file) {
            setMetadata(null);
            setRiskLevel('safe');
            setLoading(false);
            return;
        }

        const analyze = async () => {
            setLoading(true);
            try {
                const data = await exifr.parse(file, { gps: true, xmp: true, icc: false, tiff: true, exif: true });
                setMetadata(data);

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
                console.error('Metadata reading failed', e);
                setRiskLevel('safe');
            }
            setLoading(false);
        };
        analyze();
    }, [file]);

    const handleClean = async () => {
        if (!file) return;
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
        <div className="max-w-[1100px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-amber-500/20 border border-amber-500/40 text-slate-700 dark:text-white rounded-lg hover:bg-amber-500/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    title="Geri Dön"
                    aria-label="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                        <Shield className={cleaned ? 'text-emerald-400' : 'text-amber-400'} size={28} />
                        Exif &amp; Gizlilik Analizi
                    </h2>
                    <p className="text-sm text-amber-500 dark:text-amber-400 font-medium tracking-wide">Dijital Ayak İzlerini Temizleyin</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 text-left mb-8 leading-relaxed max-w-2xl">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{file.name}</span> dosyası analiz edildi. Aşağıdaki veriler dosyanın içinde gömülü olarak bulundu. Bu bilgiler konumunuzu ve cihazınızı ifşa edebilir.
                    </>
                ) : (
                    'Fotoğraflarınızın içinde gizli kalan GPS konumları, çekim tarihleri ve cihaz seri numaraları gibi hassas verileri bulun ve tek tıkla kalıcı olarak silin.'
                )}
            </p>

            <div className="min-h-[450px]">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-28 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-6 hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                    >
                        <div className="p-6 bg-amber-500/10 rounded-full text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                            <Shield size={42} />
                        </div>
                        <div className="text-center px-4">
                            <p className="font-bold text-2xl mb-2 text-slate-700 dark:text-slate-200">Görsel Analizini Başlat</p>
                            <p className="text-sm text-slate-500 max-w-md mx-auto">Gizli verileri tespit etmek ve temizlemek için bir fotoğraf sürükleyin veya seçin</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Analysis Report */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Security Status Banner */}
                            {!cleaned && riskLevel !== 'safe' && (
                                <div className={`p-5 rounded-2xl border flex gap-4 animate-pulse ${riskLevel === 'high'
                                    ? 'bg-red-500/10 border-red-500/20'
                                    : riskLevel === 'medium'
                                        ? 'bg-amber-500/10 border-amber-500/20'
                                        : 'bg-blue-500/10 border-blue-500/20'}`}>
                                    <AlertTriangle
                                        className={`shrink-0 ${riskLevel === 'high' ? 'text-red-500' : riskLevel === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}
                                        size={24}
                                    />
                                    <div className="text-left">
                                        <h3 className={`font-bold text-base ${riskLevel === 'high' ? 'text-red-500 dark:text-red-400' : riskLevel === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {riskLevel === 'high' ? 'KRİTİK VERİ İFŞASI' : riskLevel === 'medium' ? 'KİŞİSEL VERİ TESPİTİ' : 'METADATA BULUNDU'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            {riskLevel === 'high'
                                                ? 'Bu fotoğraf tam GPS koordinatlarını içeriyor. Paylaşmanız durumunda tam konumunuz (ev, iş vb.) herkes tarafından görülebilir.'
                                                : 'Bu fotoğraf çekim zamanı ve teknik cihaz bilgileri içeriyor.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Report Card */}
                            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-4 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                                    <Eye size={18} className="text-amber-500 dark:text-amber-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">İçerik Analiz Raporu</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    {loading && !cleaned ? (
                                        <div className="flex flex-col items-center py-12 gap-3 text-slate-500">
                                            <RefreshCw size={32} className="animate-spin" />
                                            <p className="text-xs font-medium uppercase tracking-widest">Metadata Katmanları Taranıyor...</p>
                                        </div>
                                    ) : metadata && Object.keys(metadata).length > 0 ? (
                                        <div className="space-y-3">
                                            {/* GPS */}
                                            {(metadata.latitude || metadata.GPSLatitude) && (
                                                <div className="p-4 bg-red-500/5 border border-red-200 dark:border-red-500/10 rounded-xl group hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <MapPin size={18} className="text-red-500" />
                                                        <span className="text-xs font-bold text-red-600 dark:text-red-300">Tam Konum (GPS)</span>
                                                    </div>
                                                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-black/40 p-2 rounded border border-slate-200 dark:border-white/5">
                                                        LAT: {metadata.latitude || metadata.GPSLatitude} | LNG: {metadata.longitude || metadata.GPSLongitude}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Date/Time */}
                                            {(metadata.CreateDate || metadata.DateTimeOriginal) && (
                                                <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl flex items-start gap-4 text-left">
                                                    <Calendar size={18} className="text-blue-500 dark:text-blue-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1 uppercase tracking-wide">Zaman Damgası</span>
                                                        <span className="text-[11px] font-mono text-blue-600 dark:text-blue-300">{metaDateToString(metadata.CreateDate || metadata.DateTimeOriginal)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Camera Info */}
                                            {(metadata.Make || metadata.Model) && (
                                                <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl flex items-start gap-4 text-left">
                                                    <Camera size={18} className="text-emerald-500 dark:text-emerald-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1 uppercase tracking-wide">Cihaz Kimliği</span>
                                                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-300">{metadata.Make} {metadata.Model}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Software */}
                                            {metadata.Software && (
                                                <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl flex items-start gap-4 text-left">
                                                    <Info size={18} className="text-slate-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1 uppercase tracking-wide">Yazılım Bilgisi</span>
                                                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{metadata.Software}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center gap-4">
                                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 dark:text-emerald-400">
                                                <Shield size={40} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-1">Cihaz Verisi Bulunamadı</p>
                                                <p className="text-xs text-slate-500">Bu görsel gizlilik açısından temiz görünüyor.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview & Action Column */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-xl relative group min-h-[400px]">
                                <button
                                    onClick={() => setFile(null)}
                                    className="absolute top-4 right-4 p-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-slate-200 dark:border-white/10 z-20 hover:scale-110"
                                    title="Görseli Değiştir"
                                    aria-label="Görseli Değiştir"
                                >
                                    <RefreshCw size={18} />
                                </button>

                                <div className="relative mb-8 w-full flex justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cleaned && processedUrl ? processedUrl : URL.createObjectURL(file as Blob)}
                                        alt="Privacy Scan Result"
                                        className="max-h-[280px] w-auto object-contain rounded-xl shadow-2xl transition-all duration-500 border border-slate-200 dark:border-white/5"
                                    />
                                    {cleaned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 backdrop-blur-[2px] rounded-xl animate-[fadeIn_0.5s_ease]">
                                            <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">TEMİZLENDİ</div>
                                        </div>
                                    )}
                                </div>

                                {!cleaned ? (
                                    <div className="w-full space-y-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Gizli Veri Katmanları Silinecek</p>
                                        </div>
                                        <button
                                            onClick={handleClean}
                                            disabled={loading}
                                            className="w-full py-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-100 font-bold flex items-center justify-center gap-3 transition-all hover:bg-amber-500/30 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                            title="Verileri Temizle"
                                        >
                                            <Lock size={20} />
                                            {loading ? 'İşleniyor...' : 'Tüm Metadata Bilgilerini Sil'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col gap-4 animate-[fadeSlideUp_0.5s_ease]">
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                            <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-1">GİZLİLİK ONAYLANDI</div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">Tüm dijital parmak izleri başarıyla temizlendi. Artık güvenle paylaşabilirsiniz.</p>
                                        </div>
                                        <a
                                            href={processedUrl!}
                                            download={`safe_${file.name.split('.')[0]}.jpg`}
                                            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 hover:-translate-y-0.5 shadow-xl shadow-emerald-500/20"
                                            title="Güvenli Dosyayı İndir"
                                        >
                                            <Download size={22} />
                                            Güvenli Dosyayı İndir
                                        </a>
                                        <button
                                            onClick={() => { setCleaned(false); setProcessedUrl(null); }}
                                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors py-2"
                                            title="Analize Dön"
                                        >
                                            Orijinal Analize Dön
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Privacy-First Guard v4.1</p>
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
};
