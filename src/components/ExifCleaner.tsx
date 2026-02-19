
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
        <div className="max-w-[1100px] mx-auto p-4 lg:p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl hover:bg-amber-500/20 transition-all shadow-sm"
                    title="Geri Dön"
                    aria-label="Geri Dön"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                        <Shield className={cleaned ? 'text-emerald-500' : 'text-amber-500'} size={28} />
                        Exif &amp; Gizlilik Analizi
                    </h2>
                    <p className="text-sm text-amber-600 dark:text-amber-500/60 font-bold uppercase tracking-widest">Dijital Ayak İzlerini Temizle</p>
                </div>
            </div>

            {/* Description Area */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-6 mb-8">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed max-w-3xl">
                    {file ? (
                        <>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{file.name}</span> dosyası analiz edildi. Aşağıdaki veriler dosyanın içinde gömülü olarak bulundu. Bu bilgiler konumunuzu ve cihazınızı ifşa edebilir.
                        </>
                    ) : (
                        'Fotoğraflarınızın içinde gizli kalan GPS konumları, çekim tarihleri ve cihaz seri numaraları gibi hassas verileri bulun ve tek tıkla kalıcı olarak silin.'
                    )}
                </p>
            </div>

            <div className="min-h-[450px]">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-28 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-6 hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                    >
                        <div className="p-7 bg-amber-500/10 rounded-full text-amber-500 group-hover:scale-110 transition-transform shadow-xl shadow-amber-500/5">
                            <Shield size={48} />
                        </div>
                        <div className="text-center px-4">
                            <p className="font-black text-2xl mb-2 text-slate-800 dark:text-slate-200 uppercase tracking-tight">Analiz Başlat</p>
                            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">Gizli verileri tespit etmek ve temizlemek için bir fotoğraf seçin</p>
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
                                <div className={`p-6 rounded-3xl border flex gap-4 animate-pulse ${riskLevel === 'high'
                                    ? 'bg-red-500/5 border-red-500/20'
                                    : riskLevel === 'medium'
                                        ? 'bg-amber-500/5 border-amber-500/20'
                                        : 'bg-blue-500/5 border-blue-500/20'}`}>
                                    <AlertTriangle
                                        className={`shrink-0 ${riskLevel === 'high' ? 'text-red-500' : riskLevel === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}
                                        size={28}
                                    />
                                    <div className="text-left">
                                        <h3 className={`font-black text-base uppercase tracking-wider ${riskLevel === 'high' ? 'text-red-600 dark:text-red-400' : riskLevel === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {riskLevel === 'high' ? 'KRİTİK VERİ İFŞASI' : riskLevel === 'medium' ? 'KİŞİSEL VERİ TESPİTİ' : 'METADATA BULUNDU'}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                                            {riskLevel === 'high'
                                                ? 'Bu fotoğraf tam GPS koordinatlarını içeriyor. Paylaşmanız durumunda tam konumunuz (ev, iş vb.) herkes tarafından görülebilir.'
                                                : 'Bu fotoğraf çekim zamanı ve teknik cihaz bilgileri içeriyor.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Report Card */}
                            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
                                <div className="p-5 bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Eye size={18} className="text-amber-500" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">İçerik Analiz Raporu</span>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-bold text-slate-500">
                                        {loading ? 'Tarama yapılıyor...' : cleaned ? '0 Metadata' : `${Object.keys(metadata || {}).length} Katman`}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {loading && !cleaned ? (
                                        <div className="flex flex-col items-center py-16 gap-4 text-slate-500">
                                            <div className="relative">
                                                <RefreshCw size={40} className="animate-spin text-amber-500" />
                                                <div className="absolute inset-0 blur-xl bg-amber-500/20 animate-pulse"></div>
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Metadata Katmanları Taranıyor...</p>
                                        </div>
                                    ) : metadata && Object.keys(metadata).length > 0 && !cleaned ? (
                                        <div className="space-y-3">
                                            {/* GPS */}
                                            {(metadata.latitude || metadata.GPSLatitude) && (
                                                <div className="p-4 bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl group hover:bg-red-500/10 transition-colors text-left">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <MapPin size={18} className="text-red-500" />
                                                        <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Tam Konum (GPS)</span>
                                                    </div>
                                                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-black/40 p-3 rounded-xl border border-red-100 dark:border-white/5 shadow-inner">
                                                        LAT: {metadata.latitude || metadata.GPSLatitude} <br /> LNG: {metadata.longitude || metadata.GPSLongitude}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* Date/Time */}
                                                {(metadata.CreateDate || metadata.DateTimeOriginal) && (
                                                    <div className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-start gap-4 text-left shadow-sm">
                                                        <Calendar size={18} className="text-blue-500 mt-0.5" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-widest">Zaman Damgası</span>
                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metaDateToString(metadata.CreateDate || metadata.DateTimeOriginal)}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Camera Info */}
                                                {(metadata.Make || metadata.Model) && (
                                                    <div className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-start gap-4 text-left shadow-sm">
                                                        <Camera size={18} className="text-emerald-500 mt-0.5" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-widest">Cihaz Kimliği</span>
                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metadata.Make} {metadata.Model}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Software */}
                                            {metadata.Software && (
                                                <div className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-start gap-4 text-left shadow-sm">
                                                    <Info size={18} className="text-slate-500 mt-0.5" />
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-widest">Yazılım Bilgisi</span>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{metadata.Software}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-16 flex flex-col items-center gap-4">
                                            <div className="p-6 bg-emerald-500/10 rounded-full text-emerald-500 dark:text-emerald-400 shadow-inner">
                                                <Shield size={48} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-tight">TEMİZ BİLGİ</p>
                                                <p className="text-xs text-slate-500 font-medium">Bu görsel gizlilik açısından güvenli görünüyor.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Column */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 flex flex-col items-center shadow-2xl relative min-h-[420px]">
                                <button
                                    onClick={() => setFile(null)}
                                    className="absolute top-4 right-4 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-200 dark:border-white/10 z-20 shadow-sm"
                                    title="Görseli Değiştir"
                                >
                                    <RefreshCw size={16} />
                                </button>

                                <div className="relative mb-8 w-full flex justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cleaned && processedUrl ? processedUrl : URL.createObjectURL(file as Blob)}
                                        alt="Privacy Scan Result"
                                        className="max-h-[300px] w-auto object-contain rounded-xl shadow-2xl transition-all duration-500"
                                    />
                                    {cleaned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 backdrop-blur-[4px] rounded-2xl animate-[fadeIn_0.5s_ease]">
                                            <div className="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl border border-emerald-400/50 scale-110">TEMİZLENDİ</div>
                                        </div>
                                    )}
                                </div>

                                {!cleaned ? (
                                    <div className="w-full space-y-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">GİZLİ VERİ KATMANLARI SİLİNECEK</p>
                                        </div>
                                        <button
                                            onClick={handleClean}
                                            disabled={loading}
                                            className="w-full py-5 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-amber-500 hover:text-white hover:shadow-xl hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                                            title="Verileri Temizle"
                                        >
                                            <Lock size={20} />
                                            {loading ? 'TEMİZLENİYOR...' : 'METADATA BİLGİLERİNİ SİL'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col gap-4 animate-[fadeSlideUp_0.5s_ease]">
                                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                                            <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-1">GİZLİLİK ONAYLANDI</div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">Parmak izleri başarıyla silindi. Paylaşıma hazır!</p>
                                        </div>
                                        <a
                                            href={processedUrl!}
                                            download={`safe_${file.name.split('.')[0]}.jpg`}
                                            className="w-full py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:scale-95 text-sm"
                                            title="Güvenli Dosyayı İndir"
                                        >
                                            <Download size={22} />
                                            GÜVENLİ DOSYAYI İNDİR
                                        </a>
                                        <button
                                            onClick={() => { setCleaned(false); setProcessedUrl(null); }}
                                            className="text-[10px] font-black text-slate-400 hover:text-slate-800 dark:hover:text-white uppercase tracking-[0.2em] transition-colors py-2"
                                        >
                                            ORİJİNAL ANALİZE DÖN
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] opacity-40">Privacy Guard Engine v4.2</p>
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
