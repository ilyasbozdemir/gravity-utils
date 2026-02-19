'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ArrowLeft, Download, Monitor, RefreshCw, ZoomIn, RotateCcw } from 'lucide-react';
import { getCroppedImg } from '../utils/cropImage';

// Define Point and Area types locally if not exported from react-easy-crop
type Point = { x: number; y: number };
type Area = { width: number; height: number; x: number; y: number };

interface SocialResizerProps {
    file: File | null;
    onBack: () => void;
}

const PRESETS = [
    { name: 'Instagram Story / Reels', w: 1080, h: 1920, ratio: 9 / 16, icon: '📱' },
    { name: 'Instagram Post (Kare)', w: 1080, h: 1080, ratio: 1 / 1, icon: '📷' },
    { name: 'Instagram Post (Dikey)', w: 1080, h: 1350, ratio: 4 / 5, icon: '📸' },
    { name: 'Instagram Post (Yatay)', w: 1080, h: 566, ratio: 1.91 / 1, icon: '🖼️' },
    { name: 'Twitter / X Header', w: 1500, h: 500, ratio: 3 / 1, icon: '🐦' },
    { name: 'YouTube Cover', w: 2560, h: 1440, ratio: 16 / 9, icon: '▶️' },
    { name: 'YouTube Thumbnail', w: 1280, h: 720, ratio: 16 / 9, icon: '🎬' },
    { name: 'Facebook Post', w: 1200, h: 630, ratio: 1.91 / 1, icon: '📘' },
    { name: 'LinkedIn Cover', w: 1584, h: 396, ratio: 4 / 1, icon: '💼' },
    { name: 'TikTok', w: 1080, h: 1920, ratio: 9 / 16, icon: '🎵' },
];

export const SocialResizer: React.FC<SocialResizerProps> = ({ file: initialFile, onBack }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial file load
    React.useEffect(() => {
        if (initialFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
            reader.readAsDataURL(initialFile);
        }
    }, [initialFile]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setIsProcessing(true);
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                selectedPreset.w,
                selectedPreset.h
            );

            if (!croppedImage) throw new Error('Crop failed');

            const link = document.createElement('a');
            link.download = `social-resize-${selectedPreset.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
            link.href = croppedImage;
            link.click();
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Monitor className="w-6 h-6 text-pink-500" />
                        Sosyal Medya Boyutlandırıcı
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Görsellerinizi sosyal medya platformları için mükemmel boyutlara kırpın
                    </p>
                </div>
            </div>

            {!imageSrc ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput')?.click()}>
                    <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Monitor size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Görsel Yükle</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Düzenlemek istediğiniz görseli seçin</p>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        aria-label="Görsel Yükle"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
                    {/* Controls Sidebar */}
                    <div className="w-full lg:w-80 flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Format Seçimi</h3>
                            <button
                                onClick={() => setImageSrc(null)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                                Görseli Değiştir
                            </button>
                        </div>

                        <div className="space-y-2">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all border ${selectedPreset.name === preset.name
                                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500 text-pink-600 dark:text-pink-400'
                                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    <span className="text-lg">{preset.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{preset.name}</div>
                                        <div className="text-xs opacity-60">{preset.w} x {preset.h}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                                    <ZoomIn size={14} /> Yakınlaştır
                                </label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-label="Yakınlaştır"
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                                    <RotateCcw size={14} /> Döndür
                                </label>
                                <input
                                    type="range"
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    step={1}
                                    aria-label="Döndür"
                                    aria-labelledby="Rotation"
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={isProcessing}
                                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                {isProcessing ? 'İşleniyor...' : 'Kırp ve İndir'}
                            </button>
                        </div>
                    </div>

                    {/* Cropper Area */}
                    <div className="flex-1 bg-slate-100 dark:bg-black rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={selectedPreset.ratio}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            classes={{
                                containerClassName: "w-full h-full",
                                cropAreaClassName: "border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                            }}
                        />
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                            {selectedPreset.w} x {selectedPreset.h}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
