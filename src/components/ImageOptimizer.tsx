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
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg hover:bg-blue-500/40 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight">Resim Optimize Et</h2>
                    <p className="text-sm text-blue-400 font-medium">Boyut ve Kalite Ayarları</p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-6 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyası işlenmeye hazır. Aşağıdaki ayarlardan çıktı kalitesini ve boyutunu belirleyebilirsiniz.
                    </>
                ) : (
                    'Görsel kalitesinden ödün vermeden dosya boyutunu küçültün veya formatını değiştirin.'
                )}
            </p>

            {file && !file.type.startsWith('image/') ? (
                <div className="p-12 border-2 border-dashed border-red-500/20 rounded-2xl text-center bg-red-500/5">
                    <div className="text-red-400 font-medium mb-4 flex flex-col items-center gap-2">
                        <RefreshCw size={32} className="opacity-50" />
                        Sadece resim dosyaları desteklenir.
                    </div>
                    <button
                        onClick={() => setFile(null)}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
                    >
                        Başka Bir Dosya Seç
                    </button>
                </div>
            ) : !file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                >
                    <div className="p-5 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <ImageIcon size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1 text-slate-200">Resim Seçin</p>
                        <p className="text-sm text-slate-500">PNG, JPG, WEBP veya BMP</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left: Preview */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Önzileme</label>
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/5 group shadow-2xl">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Original"
                                className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-sm border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-300">{(file.size / 1024).toFixed(1)} KB</span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">{file.type.split('/')[1]}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                        >
                            Görseli Değiştir
                        </button>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Format</label>
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
                                    >
                                        {fmt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {format !== 'image/png' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kalite</label>
                                    <span className="text-xs font-bold text-blue-400">{quality}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Genişlik (Opsiyonel)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value) || '')}
                                    placeholder="Orjinal boyutu koru..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600 font-mono"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">PX</span>
                            </div>
                        </div>

                        <button
                            className={`w-full mt-2 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border shadow-lg ${!isProcessing
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 hover:bg-emerald-500/30 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                            disabled={isProcessing}
                            onClick={handleProcess}
                        >
                            {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                            <span>{isProcessing ? 'İşleniyor...' : 'Dönüştür ve İndir'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
