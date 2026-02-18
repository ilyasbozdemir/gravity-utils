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
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={onBack} className="glass-button" title="Geri" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Resim Optimize Et</h2>
            </div>

            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem', opacity: 0.7 }}>
                {file ? (
                    <>
                        <strong>{file.name}</strong> dosyası optimize edilmeye hazır.
                    </>
                ) : (
                    'Optimize etmek istediğiniz resmi seçin.'
                )}
            </p>

            {file && !file.type.startsWith('image/') ? (
                <div className="p-8 border-2 border-dashed border-red-500/20 rounded-2xl text-center">
                    <div style={{ color: '#f87171', marginBottom: '1rem' }}>Sadece resim dosyaları desteklenir.</div>
                    <button onClick={() => setFile(null)} className="glass-button">Başka Bir Dosya Seç</button>
                </div>
            ) : !file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">Optimize Etmek İçin Resim Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP desteklenir</p>
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
                <div className="flex-col" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div className="w-full" style={{ textAlign: 'left' }}>
                        <label className="text-sm block mb-2">Çıktı Formatı</label>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                            {['image/jpeg', 'image/png', 'image/webp'].map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    className={`glass-button ${format === fmt ? 'active' : ''}`}
                                    style={{
                                        background: format === fmt ? 'rgba(96, 165, 250, 0.6)' : undefined,
                                        borderColor: format === fmt ? '#60a5fa' : undefined,
                                        minWidth: '80px'
                                    }}
                                >
                                    {fmt.split('/')[1].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {format !== 'image/png' && (
                        <div className="w-full" style={{ textAlign: 'left' }}>
                            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="text-sm">Kalite (%)</label>
                                <span style={{ fontWeight: 600, color: '#60a5fa' }}>{quality}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>
                    )}

                    <div className="w-full" style={{ textAlign: 'left' }}>
                        <label className="text-sm block mb-2">Genişlik (Opsiyonel - px)</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value) || '')}
                            placeholder={`Orjinal genişlik korunur`}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                width: '100%',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div className="w-full flex gap-3 mt-4">
                        <button
                            className="glass-button flex-1 flex-center"
                            style={{
                                justifyContent: 'center',
                                gap: '10px',
                                background: 'rgba(59, 130, 246, 0.3)',
                                padding: '1.2rem'
                            }}
                            disabled={isProcessing}
                            onClick={handleProcess}
                        >
                            {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                            <span>{isProcessing ? 'İşleniyor...' : 'Optimize Et ve İndir'}</span>
                        </button>
                        <button
                            onClick={() => setFile(null)}
                            className="glass-button px-4"
                            title="Değiştir"
                        >
                            Değiştir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
