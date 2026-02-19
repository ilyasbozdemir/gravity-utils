'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { ArrowLeft, Download, Monitor, ZoomIn, RotateCcw, Maximize, GripHorizontal, Sliders } from 'lucide-react';
import { getCroppedImg, getFittedImg, getMultiPartImg, estimateJpegSize, formatBytes } from '@/utils/cropImage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [quality, setQuality] = useState(0.92);

    // Modes
    const [fitMode, setFitMode] = useState(false);
    const [carouselMode, setCarouselMode] = useState(false);
    const [carouselParts, setCarouselParts] = useState(0);

    // Initial file load
    React.useEffect(() => {
        if (initialFile) {
            loadFile(initialFile);
        }
    }, [initialFile]);

    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const result = reader.result?.toString() || null;
            setImageSrc(result);
            if (result) {
                const img = new Image();
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                };
                img.src = result;
            }
        });
        reader.readAsDataURL(file);
    };

    // Calculate potential carousel parts when preset or image changes
    useEffect(() => {
        if (!imageDimensions || !selectedPreset) {
            setCarouselParts(0);
            return;
        }

        // Calculate aspect ratio of the source image
        const imgRatio = imageDimensions.width / imageDimensions.height;
        // Aspect ratio of one slide (preset)
        const targetRatio = selectedPreset.ratio;

        // If image is significantly wider than target ratio
        if (imgRatio > targetRatio * 1.5) {
            // Calculate how many slides fit
            // We adjust so that height matches. 
            // width needed for 1 slide = height * targetRatio
            // total slides = width / (height * targetRatio)
            const parts = Math.ceil(imageDimensions.width / (imageDimensions.height * targetRatio));
            setCarouselParts(parts > 1 ? parts : 0);
        } else {
            setCarouselParts(0);
            setCarouselMode(false);
        }
    }, [imageDimensions, selectedPreset]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            loadFile(e.target.files[0]);
        }
    };

    const handleDownload = async () => {
        if (!imageSrc) return;

        try {
            setIsProcessing(true);

            if (fitMode) {
                const fittedImage = await getFittedImg(
                    imageSrc,
                    selectedPreset.w,
                    selectedPreset.h,
                    quality
                );
                if (!fittedImage) throw new Error('Fit failed');
                saveAs(fittedImage, `social-fit-${selectedPreset.name.replace(/\s+/g, '-').toLowerCase()}.jpg`);

            } else if (carouselMode && carouselParts > 1) {
                const parts = await getMultiPartImg(
                    imageSrc,
                    selectedPreset.ratio,
                    selectedPreset.w,
                    selectedPreset.h,
                    quality
                );
                if (!parts || parts.length === 0) throw new Error('Carousel failed');

                const zip = new JSZip();
                parts.forEach((dataUrl: string, i: number) => {
                    const base64Data = dataUrl.split(',')[1];
                    zip.file(`${i + 1}.jpg`, base64Data, { base64: true });
                });
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `social-carousel-${selectedPreset.name.replace(/\s+/g, '-').toLowerCase()}.zip`);

            } else {
                if (!croppedAreaPixels) return;
                const croppedImage = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels,
                    rotation,
                    selectedPreset.w,
                    selectedPreset.h,
                    quality
                );
                if (!croppedImage) throw new Error('Crop failed');
                saveAs(croppedImage, `social-crop-${selectedPreset.name.replace(/\s+/g, '-').toLowerCase()}.jpg`);
            }

        } catch (e) {
            console.error(e);
            alert('İşlem sırasında bir hata oluştu.');
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
                                    onClick={() => {
                                        setSelectedPreset(preset);
                                        // Reset special modes when preset changes if they are invalid?
                                        // Effect will handle carousel parts
                                    }}
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
                            {/* Quality Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <Sliders size={13} /> Kalite
                                    </label>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(quality * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={quality}
                                    min={0.5}
                                    max={1.0}
                                    step={0.01}
                                    aria-label="Çıktı kalitesi"
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                {/* Estimated file size */}
                                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Tahmini boyut:</span>
                                    <span className="font-bold text-pink-500 dark:text-pink-400">
                                        {(() => {
                                            const outW = carouselMode
                                                ? selectedPreset.w
                                                : selectedPreset.w;
                                            const outH = selectedPreset.h;
                                            const estBytes = estimateJpegSize(outW, outH, quality);
                                            return formatBytes(carouselMode && carouselParts > 1
                                                ? estBytes * carouselParts
                                                : estBytes);
                                        })()}
                                        {carouselMode && carouselParts > 1 && <span className="text-slate-400 ml-1">(toplam)</span>}
                                    </span>
                                </div>
                            </div>

                            {/* Special Modes */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setFitMode(!fitMode);
                                        if (!fitMode) setCarouselMode(false);
                                    }}
                                    className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${fitMode
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    <Maximize size={16} />
                                    Sığdır (Fit)
                                </button>

                                {carouselParts > 1 && (
                                    <button
                                        onClick={() => {
                                            setCarouselMode(!carouselMode);
                                            if (!carouselMode) setFitMode(false);
                                        }}
                                        className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${carouselMode
                                            ? 'bg-purple-500 text-white border-purple-500'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        <GripHorizontal size={16} />
                                        Carousel ({carouselParts})
                                    </button>
                                )}
                            </div>

                            {!fitMode && !carouselMode && (
                                <>
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
                                            onChange={(e) => setRotation(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                </>
                            )}

                            {fitMode && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                    Görsel kırpılmadan bütünüyle sığdırılacak. Arkaplan bulanıklaştırılacak.
                                </div>
                            )}

                            {carouselMode && (
                                <div className="text-xs text-purple-600 dark:text-purple-400 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    Görsel {carouselParts} parça halinde otomatik bölünecek ve ZIP olarak indirilecek.
                                </div>
                            )}

                            <button
                                onClick={handleDownload}
                                disabled={isProcessing}
                                className={`w-full py-3 text-white rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${carouselMode
                                    ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'
                                    : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20'
                                    }`}
                            >
                                <Download size={18} />
                                {isProcessing ? 'İşleniyor...' : carouselMode ? 'Tümünü İndir (ZIP)' : 'İndir'}
                            </button>
                        </div>
                    </div>

                    {/* Cropper Area */}
                    <div className="flex-1 bg-slate-100 dark:bg-black rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner group">
                        {fitMode ? (
                            // Fit Mode Preview
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-black">
                                {/* Blurred Background */}
                                <img
                                    src={imageSrc}
                                    className="absolute w-full h-full object-cover blur-xl opacity-50 scale-110"
                                    alt="Background"
                                />
                                <div className="absolute inset-0 bg-black/30" />

                                {/* Image Preview with aspect ratio constraint */}
                                <div
                                    style={{
                                        aspectRatio: `${selectedPreset.ratio}`,
                                        maxHeight: '90%',
                                        maxWidth: '90%'
                                    }}
                                    className="relative z-10 shadow-2xl"
                                >
                                    <img
                                        src={imageSrc}
                                        className="w-full h-full object-contain bg-black"
                                        alt="Preview"
                                    />
                                </div>
                            </div>
                        ) : carouselMode ? (
                            // Carousel Mode Preview
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-900 p-8">
                                <div className="flex gap-2 w-full h-full items-center overflow-x-auto custom-scrollbar">
                                    {Array.from({ length: carouselParts }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                aspectRatio: `${selectedPreset.ratio}`,
                                                height: '60%',
                                                flexShrink: 0
                                            }}
                                            className="relative border-2 border-purple-500/50 rounded-lg overflow-hidden bg-black"
                                        >
                                            <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow z-10">
                                                {i + 1}
                                            </div>
                                            {/* Simulate the slice */}
                                            <div
                                                className="w-full h-full relative"
                                                style={{
                                                    backgroundImage: `url(${imageSrc})`,
                                                    backgroundSize: `${carouselParts * 100}% 100%`,
                                                    backgroundPosition: `${(i / (carouselParts - 1 || 1)) * 100}% center` // Approximation for preview
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Standard Cropper
                            <>
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
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full pointer-events-none z-20">
                                    {selectedPreset.w} x {selectedPreset.h}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
