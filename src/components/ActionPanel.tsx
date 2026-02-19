import React from 'react';
import {
    FileType, Archive, X, FileCode2, Binary, Image as ImageIcon,
    Hash, FileJson, FileText, Smartphone, Shield, QrCode, Crop, FileDiff, Calculator,
    ArrowRight, Star
} from 'lucide-react';
import { getAvailableFormats } from '../utils/formats';

interface ActionPanelProps {
    file: File;
    onClear: () => void;
    onAction: (action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'imagetopdf' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'case' | 'string') => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ file, onClear, onAction }) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.json');
    const isOffice = file.name.match(/\.(docx|xlsx|pptx)$/i);
    const isArchive = /\.(zip|rar|7z|tar|gz|apk|jar|war)$/i.test(file.name);
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const getRecommendedActions = () => {
        const actions: ('convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'imagetopdf' | 'case' | 'string')[] = [];
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'webp' || ext === 'avif') actions.push('convert');
        if (isJson) actions.push('json');
        if (isOffice || isArchive) actions.push('inspect');
        if (isImage && !['webp', 'avif', 'svg'].includes(ext || '')) actions.push('optimize');
        if (isImage) {
            actions.push('social');
            actions.push('exif');
            actions.push('imagetopdf');
        }
        if (isText && !isJson) {
            actions.push('text');
            actions.push('case');
            actions.push('string');
        }
        if (isPdf) actions.push('pdf');

        // Always recommend units if it looks like a CAD file or just generally
        if (['dwg', 'dxf', 'kmz', 'kml'].includes(ext || '')) actions.push('units');

        // Always recommend encryption for typically sensitive files
        if (isOffice || isPdf || isArchive || isText) actions.push('encrypt');

        return actions;
    };

    const recommended = getRecommendedActions();
    const availableFormats = getAvailableFormats(file);

    // Filter "Popular" conversions to highlight
    const popularKeys = ['pdf', 'docx', 'jpg', 'png', 'webp'];
    const popularConversions = availableFormats.filter(f => popularKeys.includes(f.ext));
    const otherConversions = availableFormats.filter(f => !popularKeys.includes(f.ext));

    const renderButton = (
        action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'imagetopdf' | 'uuid' | 'yaml' | 'jwt' | 'url' | 'case' | 'string',
        icon: React.ReactNode,
        title: string,
        desc: string,
        primary: boolean = false
    ) => (
        <button
            onClick={() => onAction(action)}
            className={`group relative overflow-hidden p-6 text-left rounded-2xl border transition-all duration-300 w-full hover:-translate-y-1 hover:shadow-xl
                ${primary
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
        >
            <div className="flex items-start justify-between mb-2 relative z-10">
                <div className={`p-3 rounded-xl ${primary ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                    {icon}
                </div>
                {!primary && <ArrowRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />}
            </div>

            <h3 className={`text-lg font-bold mb-1 relative z-10 ${primary ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                {title}
            </h3>
            <p className={`text-sm leading-relaxed relative z-10 ${primary ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {desc}
            </p>
        </button>
    );

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
            {/* File Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

                <div className="flex items-center gap-6 w-full">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 shadow-inner">
                        <FileText size={40} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white truncate mb-1" title={file.name}>
                            {file.name}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
                                {file.name.split('.').pop()}
                            </span>
                            <span>•</span>
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClear}
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shrink-0 flex items-center gap-2 font-bold"
                >
                    <X size={20} />
                    <span className="hidden sm:inline">Kaldır</span>
                </button>
            </div>

            <div className="flex flex-col gap-10">

                {/* POPULAR CONVERSIONS & FEATURED */}
                {(popularConversions.length > 0 || isPdf) && (
                    <div className="text-left space-y-6">
                        <h3 className="text-slate-800 dark:text-slate-200 text-lg font-black flex items-center gap-3">
                            <Star size={20} className="fill-amber-400 text-amber-400" />
                            Öne Çıkan İşlemler
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {isPdf && (
                                <button
                                    onClick={() => onAction('pdf')}
                                    className="flex items-center justify-between p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl hover:brightness-110 transition-all group shadow-lg shadow-red-500/30 text-white w-full"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs text-red-100 font-bold uppercase tracking-widest mb-2 opacity-80">PDF Araçları</span>
                                        <span className="text-xl font-black">PDF Yönetimi</span>
                                        <span className="text-sm text-red-100 mt-1 opacity-90">Birleştir, Ayır, Sıkıştır</span>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <ArrowRight size={24} className="text-white" />
                                    </div>
                                </button>
                            )}
                            {popularConversions.map((fmt) => (
                                <button
                                    key={fmt.ext}
                                    onClick={() => onAction('convert')}
                                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                                            {file.name.split('.').pop()?.toUpperCase()} &#8594; {fmt.ext.toUpperCase()}
                                        </span>
                                        <span className="text-lg font-black text-slate-800 dark:text-white">{fmt.label}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all text-blue-500 dark:text-blue-400 relative z-10">
                                        <ArrowRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* OTHER FORMATS */}
                {otherConversions.length > 0 && (
                    <div className="text-left space-y-6">
                        <h3 className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 pl-1">
                            Diğer Dönüştürme Seçenekleri
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {otherConversions.map((fmt) => (
                                <button
                                    key={fmt.ext}
                                    onClick={() => onAction('convert')}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left"
                                >
                                    <div className="text-slate-300 dark:text-slate-600">
                                        <ArrowRight size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt.label}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{fmt.ext} Formatına</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Section (Conditional) */}
                {recommended.length > 0 && (
                    <div className="text-left space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-slate-800 dark:text-slate-200 text-lg font-black">
                            Bu Dosya İçin Diğer Araçlar
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recommended.includes('convert') && !isPdf && renderButton('convert', <FileType size={28} className="text-amber-400" />, 'Dönüştür', 'Format Değiştir', true)}
                            {recommended.includes('json') && renderButton('json', <FileJson size={28} className="text-cyan-400" />, 'JSON Formatla', 'Okunabilir Yap', true)}
                            {recommended.includes('inspect') && renderButton('inspect', <Archive size={28} className="text-pink-400" />, 'İçeriği İncele', isOffice ? 'Belge Detayları' : 'Arşiv Analizi', true)}
                            {recommended.includes('optimize') && renderButton('optimize', <ImageIcon size={28} className="text-emerald-400" />, 'Sıkıştır', 'Boyutu Düşür', true)}
                            {recommended.includes('text') && renderButton('text', <FileText size={28} className="text-violet-400" />, 'Metni Analiz Et', 'İstatistikler', true)}
                            {recommended.includes('case') && renderButton('case', <FileType size={28} className="text-pink-400" />, 'Harf Çevirici', 'Büyük / Küçük', true)}
                            {recommended.includes('string') && renderButton('string', <FileCode2 size={28} className="text-cyan-400" />, 'Metin Müfettişi', 'Detaylı İnceleme', true)}
                            {recommended.includes('social') && renderButton('social', <Crop size={28} className="text-fuchsia-400" />, 'Sosyal Medya', 'Boyutlandır', true)}
                            {recommended.includes('exif') && renderButton('exif', <Shield size={28} className="text-emerald-500" />, 'Güvenli Paylaş', 'Exif Sil', true)}
                            {recommended.includes('imagetopdf') && renderButton('imagetopdf', <FileText size={28} className="text-rose-500" />, 'PDF Oluştur', 'Resimleri Birleştir', true)}
                            {recommended.includes('units') && renderButton('units', <Calculator size={28} className="text-orange-500" />, 'Birim Çevirici', 'Boyutlar / Ölçek', true)}
                            {recommended.includes('encrypt') && renderButton('encrypt', <Shield size={28} className="text-emerald-500" />, 'Şifrele / AES', 'Dosyayı Koru', true)}
                        </div>
                    </div>
                )}

                {/* Category: Görsel İşlemleri */}
                {isImage && (
                    <div className="text-left">
                        <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">Görsel İşlemleri</h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                            {renderButton('social', <Smartphone size={28} className="text-fuchsia-400" />, 'Boyutlandır', 'Story / Post')}
                            {renderButton('exif', <Shield size={28} className="text-emerald-500" />, 'Exif Temizle', 'Gizlilik Koruması')}
                            {renderButton('optimize', <ImageIcon size={28} className="text-emerald-400" />, 'Optimize Et', 'Resim Sıkıştırma')}
                            {renderButton('qr', <QrCode size={28} className="text-blue-500" />, 'QR Oku', 'Barkod Tara')}
                            {renderButton('favicon', <ImageIcon size={28} className="text-violet-500" />, 'Favicon Yap', 'İkon Seti')}
                            {renderButton('imagetopdf', <FileText size={28} className="text-rose-500" />, 'PDF Yap', 'Görselleri Birleştir')}
                        </div>
                    </div>
                )}

                {/* Category: Dosya İşlemleri */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">Genel İşlemler</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('convert', <FileType size={28} className="text-blue-400" />, 'Çevir / Adlandır', 'Format ve Uzantı')}
                        {renderButton(
                            'inspect',
                            <Archive size={28} className="text-pink-400" />,
                            isOffice ? 'Belgeyi İncele' : 'İçini İncele',
                            isOffice ? 'Word/Excel İçeriği' : (isArchive ? 'Arşiv/Paket Analizi' : 'Dosya Yapısı')
                        )}
                        {isPdf && renderButton('pdf', <FileDiff size={28} className="text-red-400" />, 'PDF Araçları', 'Böl / Düzenle')}
                        {renderButton('encrypt', <Shield size={28} className="text-emerald-500" />, 'Şifrele / Çöz', 'AES-256 Güvenlik')}
                    </div>
                </div>

                {/* Category: Mühendislik Araçları */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">Mühendislik Araçları</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('units', <Calculator size={28} className="text-orange-500" />, 'Hesaplama Seti', 'Ölçek, Tarih, Alan')}
                    </div>
                </div>

                {/* Category: Analiz & Görüntüleme */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">Analiz ve Veri</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('hash', <Hash size={28} className="text-amber-400" />, 'Hash (İmza)', 'MD5, SHA1, SHA256')}
                        {isText && renderButton('text', <FileText size={28} className="text-violet-400" />, 'Metin Analizi', 'Kelime/Satır Sayacı')}
                        {isJson && renderButton('json', <FileJson size={28} className="text-cyan-400" />, 'JSON Format', 'Pretty Print')}
                    </div>
                </div>

                {/* Category: Geliştirici */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">Geliştirici</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('base64', <Binary size={28} className="text-fuchsia-400" />, 'Base64 Çevirici', 'Veriyi Kodla')}
                    </div>
                </div>

            </div>
        </div>
    );
};
