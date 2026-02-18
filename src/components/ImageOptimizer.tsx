import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';
import { saveAs } from 'file-saver';

interface ImageOptimizerProps {
    file: File | null;
    onBack: () => void;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [quality, setQuality] = useState(80);
    const [width, setWidth] = useState<number | ''>('');
    const [format, setFormat] = useState('image/jpeg');
    const [isProcessing, setIsProcessing] = useState(false);
    const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);
    const [optimizedDimensions, setOptimizedDimensions] = useState<{ width: number, height: number } | null>(null);
    const [optimizedFileSize, setOptimizedFileSize] = useState<number | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = () => {
        if (!file) return;
        setIsProcessing(true);
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let targetWidth = img.width;
            let targetHeight = img.height;

            if (width && Number(width) < img.width) {
                targetWidth = Number(width);
                targetHeight = (Number(width) / img.width) * img.height;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
                        const name = file.name.substring(0, file.name.lastIndexOf('.')) + '_opt.' + ext;

                        setOptimizedImageUrl(URL.createObjectURL(blob));
                        setOptimizedDimensions({ width: targetWidth, height: targetHeight });
                        setOptimizedFileSize(blob.size);

                        saveAs(blob, name);
                    }
                    setIsProcessing(false);
                }, format, quality / 100);
            }
        };
        img.onerror = () => {
            alert("Görüntü yüklenemedi.");
            setIsProcessing(false);
        };
    };

    return (
        <div className="max-w-[900px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg hover:bg-blue-500/40 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">Görsel Optimizasyonu</h2>
                    <p className="text-sm text-blue-400 font-medium">Akıllı Sıkıştırma & Boyutlandırma</p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-8 leading-relaxed max-w-2xl">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyası için en uygun ayarları belirleyin. Önzileme üzerinden sonuçları karşılaştırabilirsiniz.
                    </>
                ) : (
                    'Görsellerinizi web için optimize edin. Kaliteyi koruyarak dosya boyutlarını %90\'a kadar azaltın.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-28 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-6 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                >
                    <div className="p-6 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <ImageIcon size={42} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-2xl mb-2 text-slate-200">Görsel Seçin</p>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto text-center">PNG, JPG veya WEBP dosyalarını sürükleyin veya seçin</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        title="Resim Seç"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Controls Column */}
                    <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="space-y-6 bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Çıktı Formatı</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'image/jpeg', label: 'JPG' },
                                        { id: 'image/png', label: 'PNG' },
                                        { id: 'image/webp', label: 'WEBP' }
                                    ].map(fmt => (
                                        <button
                                            key={fmt.id}
                                            onClick={() => setFormat(fmt.id)}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${format === fmt.id
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                            title={`${fmt.label} olarak ayarla`}
                                        >
                                            {fmt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {format !== 'image/png' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sıkıştırma Kalitesi</label>
                                        <span className="text-xs font-bold text-blue-400">{quality}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={quality}
                                        title="Kalite Ayarı"
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between px-1">
                                        <span className="text-[10px] text-slate-600 font-bold">MAX SIKIŞTIRMA</span>
                                        <span className="text-[10px] text-slate-600 font-bold">MAX KALİTE</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Yeni Genişlik (PX)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(Number(e.target.value) || '')}
                                        placeholder="Orijinal Boyutu Koru..."
                                        title="Yeniden Boyutlandırma Genişliği"
                                        className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600 font-mono"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 tracking-tighter">WIDTH</div>
                                </div>
                                <p className="text-[10px] text-slate-500 px-1 italic">Yükseklik otomatik olarak korunacaktır.</p>
                            </div>

                            <button
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border shadow-2xl ${!isProcessing
                                    ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 hover:-translate-y-0.5 active:scale-95'
                                    : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                                    }`}
                                disabled={isProcessing}
                                onClick={handleProcess}
                                title="İşlemi Başlat ve İndir"
                            >
                                {isProcessing ? <RefreshCw size={20} className="animate-spin text-blue-400" /> : <Download size={20} />}
                                <span>{isProcessing ? 'Görsel İşleniyor...' : 'Optimize Et ve İndir'}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => { setFile(null); setOptimizedImageUrl(null); }}
                            className="text-[10px] font-black text-slate-600 hover:text-red-400 uppercase tracking-[0.3em] transition-colors py-2"
                            title="Yeni Görsel Seç"
                        >
                            Farklı Bir Görsel Seç
                        </button>
                    </div>

                    {/* Preview Column */}
                    <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Canlı Önzileme</span>
                                </div>
                                {optimizedFileSize && (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        -%{Math.max(0, Math.round((1 - optimizedFileSize / file.size) * 100))} TASARRUF
                                    </span>
                                )}
                            </div>
                            <div className="p-8 flex items-center justify-center min-h-[350px]">
                                <img
                                    src={optimizedImageUrl || URL.createObjectURL(file)}
                                    alt="Result"
                                    className="max-h-[400px] w-auto object-contain rounded-lg shadow-2xl transition-all duration-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 border-t border-white/10">
                                <div className="p-4 border-r border-white/10 bg-white/2">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Orijinal</p>
                                    <p className="text-xs font-mono text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="p-4 bg-emerald-500/5">
                                    <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Optimize Edilmiş</p>
                                    <p className="text-xs font-mono text-emerald-400">
                                        {optimizedFileSize ? `${(optimizedFileSize / 1024).toFixed(1)} KB` : '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {optimizedDimensions && (
                            <div className="flex gap-4 items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl animate-[fadeIn_0.5s_ease]">
                                <div className="text-center">
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mb-0.5">YENİ GENİŞLİK</p>
                                    <p className="text-sm font-mono text-blue-400">{optimizedDimensions.width}px</p>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="text-center">
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mb-0.5">YENİ YÜKSEKLİK</p>
                                    <p className="text-sm font-mono text-blue-400">{Math.round(optimizedDimensions.height)}px</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
