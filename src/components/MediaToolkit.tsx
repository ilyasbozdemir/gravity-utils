import React, { useState } from 'react';
import { ArrowLeft, ImageIcon, Search, Type, Download, Trash2, Info, Share2, Camera } from 'lucide-react';

interface MediaToolkitProps {
    view: 'exif-viewer' | 'bulk-rename' | 'social';
    onBack: () => void;
}

export const MediaToolkit: React.FC<MediaToolkitProps> = ({ view, onBack }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [exifData, setExifData] = useState<any>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            if (view === 'exif-viewer' && e.target.files[0]) {
                // Mock EXIF data for demonstration
                setExifData({
                    Model: 'iPhone 15 Pro',
                    DateTime: '2026:02:20 12:45:00',
                    Exposure: '1/125s',
                    ISO: '100',
                    FocalLength: '24mm',
                    Location: '41.0082° N, 28.9784° E (İstanbul)'
                });
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {view === 'exif-viewer' && 'EXIF Görüntüleyici'}
                            {view === 'bulk-rename' && 'Toplu İsimlendir'}
                            {view === 'social' && 'Sosyal Medya Presetleri'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Görsel dosyalarınızı profesyonelce yönetin.</p>
                    </div>
                </div>
            </div>

            {view === 'social' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SocialCard platform="Instagram" sizes={['Post: 1080x1080', 'Story: 1080x1920', 'Reels: 1080x1920']} color="rose" />
                    <SocialCard platform="Twitter / X" sizes={['Banner: 1500x500', 'Post: 1200x675', 'Profile: 400x400']} color="slate" />
                    <SocialCard platform="YouTube" sizes={['Thumbnail: 1280x720', 'Banner: 2560x1440', 'Avatar: 800x800']} color="red" />
                    <SocialCard platform="LinkedIn" sizes={['Post: 1200x627', 'Banner: 1584x396', 'Profile: 400x400']} color="blue" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer relative overflow-hidden group"
                            onClick={() => document.getElementById('media-upload')?.click()}
                            title="Dosya Seçmek İçin Tıklayın"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <ImageIcon size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-800 dark:text-white">Dosyaları Seç</p>
                                <p className="text-sm text-slate-500 font-medium">veya buraya sürükle bırak</p>
                            </div>
                            <label htmlFor="media-upload" className="sr-only">Dosya Seçin</label>
                            <input id="media-upload" type="file" multiple className="hidden" onChange={handleFileSelect} title="Dosya Seçin" />
                        </div>

                        {files.length > 0 && (
                            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-4 space-y-2">
                                <p className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Yüklenenler ({files.length})</p>
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500"><ImageIcon size={14} /></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{f.name}</span>
                                        </div>
                                        <button
                                            onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                            title="Dosyayı Kaldır"
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="space-y-6">
                        {view === 'exif-viewer' ? (
                            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                                {exifData ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Camera /></div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Çekim Bilgileri</h3>
                                        </div>
                                        {Object.entries(exifData).map(([key, val]: [string, any]) => (
                                            <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-white/5 last:border-0">
                                                <span className="text-sm font-bold text-slate-400 capitalize">{key}</span>
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-4 py-20">
                                        <Search size={48} className="opacity-20 translate-y-4" />
                                        <p className="text-sm italic">Analiz etmek için bir fotoğraf seçin.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <Type className="text-blue-500" /> İsimlendirme Formatı
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="prefixRename" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ön Ek (Prefix)</label>
                                            <input id="prefixRename" type="text" placeholder="urun-adi-" title="Dosyalara eklenecek ön ek" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 mt-1" />
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                                            <Info size={16} className="text-amber-600" />
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-snug">Boşluklar otomatik olarak tireye (-) dönüşecek ve Türkçe karakterler temizlenecektir.</p>
                                        </div>
                                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                            İSİMLENDİR VE İNDİR (.zip)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SocialCard = ({ platform, sizes, color }: { platform: string, sizes: string[], color: string }) => (
    <div className={`p-6 rounded-[2.5rem] border-2 transition-all hover:-translate-y-2
        ${color === 'rose' ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20' : ''}
        ${color === 'slate' ? 'bg-slate-50/50 dark:bg-slate-500/5 border-slate-100 dark:border-slate-500/20' : ''}
        ${color === 'red' ? 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20' : ''}
        ${color === 'blue' ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' : ''}
    `}>
        <h3 className="text-xl font-black mb-4 flex items-center justify-between">
            {platform}
            <Share2 size={20} className="opacity-40" />
        </h3>
        <div className="space-y-3">
            {sizes.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/50 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s}</span>
                    <button onClick={() => navigator.clipboard.writeText(s.split(': ')[1])} title="Kopyala" className="text-blue-500 hover:scale-110 active:scale-90 transition-transform">
                        <CopyIcon size={14} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const CopyIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);
