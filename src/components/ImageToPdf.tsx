import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    FileImage,
    Download,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Settings,
    Layout,
    Maximize,
    Eye,
    X,
    Grid,
    RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ImageToPdfProps {
    file: File | null;
    onBack: () => void;
}

interface SelectedImage {
    id: string;
    file: File;
    preview: string;
    name: string;
    size: number;
}

export const ImageToPdf: React.FC<ImageToPdfProps> = ({ file: initialFile, onBack }) => {
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
    const [orientation, setOrientation] = useState<'p' | 'l' | 'auto'>('auto');
    const [margin, setMargin] = useState<number>(10);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial file load
    useEffect(() => {
        if (initialFile && initialFile.type.startsWith('image/')) {
            addImage(initialFile);
        }
    }, [initialFile]);

    const addImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const newImage: SelectedImage = {
                id: Math.random().toString(36).substring(2, 9),
                file,
                preview: reader.result as string,
                name: file.name,
                size: file.size
            };
            setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(f => {
                if (f.type.startsWith('image/')) {
                    addImage(f);
                }
            });
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newImages.length) return;

        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        setImages(newImages);
    };

    const handleConvert = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);

        try {
            const doc = new jsPDF({
                orientation: orientation === 'auto' ? 'p' : (orientation as 'p' | 'l'),
                unit: 'mm',
                format: pageSize === 'a4' ? 'a4' : [210, 297]
            });

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const imgData = img.preview;

                // Get Image Properties
                const props = doc.getImageProperties(imgData);

                let finalOrientation: 'p' | 'l' = props.width > props.height ? 'l' : 'p';
                if (orientation !== 'auto') finalOrientation = orientation as 'p' | 'l';

                const pageWidth = pageSize === 'fit' ? (props.width * 0.264583) + (margin * 2) : (finalOrientation === 'p' ? 210 : 297);
                const pageHeight = pageSize === 'fit' ? (props.height * 0.264583) + (margin * 2) : (finalOrientation === 'p' ? 297 : 210);

                if (i > 0) {
                    doc.addPage([pageWidth, pageHeight], finalOrientation);
                } else {
                    // Adjust first page
                    const internalDoc = doc as jsPDF & { internal: { pageSize: { width: number; height: number; }; }; };
                    internalDoc.internal.pageSize.width = pageWidth;
                    internalDoc.internal.pageSize.height = pageHeight;
                }

                const printableWidth = pageWidth - (margin * 2);
                const printableHeight = pageHeight - (margin * 2);

                const pxToMm = 0.264583;
                let drawWidth = props.width * pxToMm;
                let drawHeight = props.height * pxToMm;

                // Scale to fit printable area if needed
                const scale = Math.min(1, printableWidth / drawWidth, printableHeight / drawHeight);
                drawWidth *= scale;
                drawHeight *= scale;

                const x = (pageWidth - drawWidth) / 2;
                const y = (pageHeight - drawHeight) / 2;

                doc.addImage(imgData, 'JPEG', x, y, drawWidth, drawHeight);
            }

            doc.save(`images - to - pdf - ${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert("PDF oluşturulurken bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto p-4 md:p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={onBack}
                            className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group shadow-xl"
                            title="Geri Dön"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="text-left">
                            <h2 className="text-3xl font-black tracking-tight text-white mb-1">Resimleri PDF Yap</h2>
                            <p className="text-sm text-blue-400 font-bold uppercase tracking-widest pl-0.5">Profesyonel Döküman Oluşturucu</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-black/40 px-4 py-2.5 rounded-2xl border border-white/5 flex items-center gap-3">
                            <Grid size={16} className="text-slate-500" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{images.length} GÖRSEL SEÇİLDİ</span>
                        </div>
                    </div>
                </div>

                {images.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-40 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-6 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group shadow-inner bg-black/20"
                    >
                        <div className="p-8 bg-blue-500/10 rounded-[2rem] text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                            <FileImage size={56} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Görselleri Buraya Sürükleyin</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Birden fazla görsel seçerek dökümanınızı oluşturmaya başlayın</p>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            title="Görsel Seç"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Edit Area / List */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Dosya Sıralaması</h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus size={14} /> Daha Fazla Ekle
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    title="Görsel Seç"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className="group relative bg-black/40 border border-white/5 rounded-3xl p-4 flex gap-4 items-center hover:border-white/20 transition-all hover:translate-y-[-2px] shadow-xl"
                                    >
                                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-black/60 border border-white/5 shrink-0 relative">
                                            <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setPreviewImage(img.preview)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                                                title="Önzile"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-white border border-white/10">
                                                PAGE {index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-10">
                                            <p className="text-sm font-bold text-white truncate mb-1">{img.name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase font-bold">
                                                {(img.size / 1024).toFixed(1)} KB • IMG
                                            </p>
                                        </div>

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                            <button
                                                onClick={() => moveImage(index, 'up')}
                                                disabled={index === 0}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg disabled:opacity-0 transition-colors"
                                                title="Yukarı Taşı"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveImage(index, 'down')}
                                                disabled={index === images.length - 1}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg disabled:opacity-0 transition-colors"
                                                title="Aşağı Taşı"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                                title="Kaldır"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Settings & Final Action */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-black/40 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/10 transition-colors duration-500">
                                    <Settings size={80} />
                                </div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                    <Settings size={14} /> PDF Ayarları
                                </h3>

                                <div className="space-y-8">
                                    {/* Page Size */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">Kağıt Boyutu</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setPageSize('a4')}
                                                className={`py-3 px-2 rounded-2xl text-[10px] font-black transition-all border ${pageSize === 'a4' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                            >
                                                STANDART A4
                                            </button>
                                            <button
                                                onClick={() => setPageSize('fit')}
                                                className={`py-3 px-2 rounded-2xl text-[10px] font-black transition-all border ${pageSize === 'fit' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                            >
                                                GÖRSELE GÖRE
                                            </button>
                                        </div>
                                    </div>

                                    {/* Orientation */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">Yönlendirme</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'auto', label: 'OTOMATİK', icon: Layout },
                                                { id: 'p', label: 'DİKEY', icon: Maximize },
                                                { id: 'l', label: 'YATAY', icon: Layout }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setOrientation(opt.id as 'p' | 'l' | 'auto')}
                                                    className={`py-3 rounded-2xl text-[10px] font-black transition-all border flex flex-col items-center gap-1.5 ${orientation === opt.id ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                                >
                                                    <opt.icon size={12} className={opt.id === 'l' ? 'rotate-90' : ''} />
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Margins */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kenar Boşluğu</label>
                                            <span className="text-[10px] font-black text-blue-400">{margin} MM</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="5"
                                            value={margin}
                                            title="Kenar Boşluğu"
                                            onChange={(e) => setMargin(Number(e.target.value))}
                                            className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className={`w-full py-5 rounded-[2rem] font-black text-white transition-all border flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/btn ${!isProcessing ? 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95' : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'}`}
                                title="İşlemi Başlat ve İndir"
                            >
                                {!isProcessing && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                )}
                                {isProcessing ? <RefreshCw size={24} className="animate-spin text-emerald-400" /> : <Download size={24} />}
                                <span className="tracking-tighter text-lg">{isProcessing ? 'PDF OLUŞTURULUYOR...' : 'PDF OLARAK İNDİR'}</span>
                            </button>

                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                                Görseller dökümana güvenli bir şekilde aktarıldıktan sonra PDF paketi olarak cihazınıza indirilecektir.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-[fadeIn_0.3s_ease]"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                        }}
                        title="Kapat"
                    >
                        <X size={24} />
                    </button>
                    <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                </div>
            )}
        </div>
    );
};
