import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface ImageOptimizerProps {
    file: File;
    onBack: () => void;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({ file, onBack }) => {
    const [quality, setQuality] = useState(80);
    const [width, setWidth] = useState<number | ''>('');
    const [format, setFormat] = useState('image/jpeg');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = () => {
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

    if (!file.type.startsWith('image/')) {
        return (
            <div className="glass-panel p-4">
                <div style={{ color: '#f87171' }}>Bu araç sadece resim dosyaları içindir.</div>
                <button onClick={onBack} className="glass-button mt-4">Geri Dön</button>
            </div>
        )
    }

    return (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} className="glass-button" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Resim Optimize Et</h2>
            </div>

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

                <button
                    className="glass-button w-full mt-4 flex-center"
                    style={{
                        justifyContent: 'center',
                        gap: '10px',
                        background: 'rgba(59, 130, 246, 0.3)',
                        padding: '1.2rem'
                    }}
                    disabled={isProcessing}
                    onClick={handleProcess}
                >
                    {isProcessing ? <RefreshCw size={18} className="spin" /> : <Download size={18} />}
                    <span>{isProcessing ? 'İşleniyor...' : 'Optimize Et ve İndir'}</span>
                </button>
            </div>
        </div>
    );
};
