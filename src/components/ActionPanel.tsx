
import React from 'react';
import {
    FileType, Archive, X, FileCode2, Binary, Image as ImageIcon,
    Hash, FileJson, FileText, Smartphone, Shield, QrCode, Crop, FileDiff
} from 'lucide-react';

interface ActionPanelProps {
    file: File;
    onClear: () => void;
    onAction: (action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon') => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ file, onClear, onAction }) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.json');
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    const isOffice = /\.(docx|xlsx|pptx|odt|ods|odp|doc|xls|ppt)$/i.test(file.name);
    const isArchive = /\.(zip|rar|7z|tar|gz|apk|jar|war)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const getRecommendedActions = () => {
        const actions: ('convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon')[] = [];
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'webp' || ext === 'avif') actions.push('convert');
        if (isJson) actions.push('json');
        if (isArchive || isOffice) actions.push('inspect');
        if (isImage && !['webp', 'avif', 'svg'].includes(ext || '')) actions.push('optimize');
        if (isImage) {
            actions.push('social');
            actions.push('exif');
        }
        if (isText && !isJson) actions.push('text');
        if (isPdf) actions.push('pdf');

        return actions;
    };

    const recommended = getRecommendedActions();

    const renderButton = (
        action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon',
        icon: React.ReactNode,
        title: string,
        desc: string,
        colorClass: string,
        highlight: boolean = false
    ) => (
        <button
            className={`flex flex - col items - center justify - start text - center w - full min - h - [140px] p - 5 gap - 2 border text - white rounded - lg font - medium cursor - pointer transition - all duration - 200 group relative overflow - hidden
                ${highlight
                    ? 'bg-violet-500/20 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:bg-violet-500/30'
                    : 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                } `}
            onClick={() => onAction(action)}
        >
            {highlight && (
                <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                    ÖNERİLEN
                </div>
            )}
            <div style={{ color: colorClass }} className="mb-1 transform group-hover:scale-110 transition-transform duration-200">{icon}</div>
            <div className="text-base font-semibold">{title}</div>
            <div className={`text - xs ${highlight ? 'text-violet-200' : 'opacity-80'} `}>{desc}</div>
        </button>
    );

    return (
        <div className="max-w-[900px] mx-auto p-8 animate-[fadeIn_0.5s_ease] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
            {/* Header / File Info */}
            <div className="flex items-center justify-between mb-8 bg-black/20 p-4 rounded-xl flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                    <div className="bg-violet-400/20 p-3 rounded-xl">
                        <FileCode2 size={28} className="text-violet-400" />
                    </div>
                    <div className="text-left overflow-hidden">
                        <div className="font-bold text-lg truncate max-w-[300px]" title={file.name}>{file.name}</div>
                        <div className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB • {file.type || 'Bilinmeyen Tür'}</div>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    className="bg-transparent border border-white/10 cursor-pointer text-slate-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors"
                    title="Dosyayı Kaldır"
                >
                    <X size={18} />
                    <span className="hidden sm:inline">Dosyayı Değiştir</span>
                </button>
            </div>

            <div className="flex flex-col gap-8">

                {/* Recommended Section (Conditional) */}
                {recommended.length > 0 && (
                    <div className="text-left">
                        <h3 className="mb-4 text-violet-300 text-sm uppercase tracking-wider font-bold flex items-center gap-2">
                            ✨ Sizin İçin Önerilenler
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                            {recommended.includes('convert') && renderButton('convert', <FileType size={28} />, 'Dönüştür', 'WebP -> PNG / JPG', '#fbbf24', true)}
                            {recommended.includes('json') && renderButton('json', <FileJson size={28} />, 'JSON Formatla', 'Okunabilir Yap', '#22d3ee', true)}
                            {recommended.includes('inspect') && renderButton('inspect', <Archive size={28} />, 'İçeriği İncele', isOffice ? 'Belge Detayları' : 'Arşiv Dosyaları', '#f472b6', true)}
                            {recommended.includes('optimize') && renderButton('optimize', <ImageIcon size={28} />, 'Sıkıştır', 'Dosya Boyutunu Düşür', '#34d399', true)}
                            {recommended.includes('text') && renderButton('text', <FileText size={28} />, 'Metni Analiz Et', 'İstatistikler', '#a78bfa', true)}
                            {recommended.includes('pdf') && renderButton('pdf', <FileDiff size={28} />, 'PDF İşlemleri', 'Ayır / Birleştir', '#ef4444', true)}
                            {recommended.includes('social') && renderButton('social', <Crop size={28} />, 'Sosyal Medya', 'Boyutlandır', '#e879f9', true)}
                            {recommended.includes('exif') && renderButton('exif', <Shield size={28} />, 'Güvenli Paylaş', 'Exif Sil', '#10b981', true)}
                        </div>
                    </div>
                )}

                {/* Category: Görsel İşlemleri */}
                {isImage && (
                    <div className="text-left">
                        <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium">Görsel İşlemleri</h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                            {renderButton('social', <Smartphone size={28} />, 'Boyutlandır', 'Story / Post', '#e879f9')}
                            {renderButton('exif', <Shield size={28} />, 'Exif Temizle', 'Gizlilik Koruması', '#10b981')}
                            {renderButton('optimize', <ImageIcon size={28} />, 'Optimize Et', 'Resim Sıkıştırma', '#34d399')}
                            {renderButton('qr', <QrCode size={28} />, 'QR Oku', 'Barkod Tara', '#3b82f6')}
                            {renderButton('favicon', <ImageIcon size={28} />, 'Favicon Yap', 'İkon Seti', '#8b5cf6')}
                        </div>
                    </div>
                )}

                {/* Category: Dosya İşlemleri */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium">Genel İşlemler</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('convert', <FileType size={28} />, 'Çevir / Adlandır', 'Format ve Uzantı', '#60a5fa')}
                        {renderButton(
                            'inspect',
                            <Archive size={28} />,
                            isOffice ? 'Belgeyi İncele' : 'İçini İncele',
                            isOffice ? 'Word/Excel İçeriği' : (isArchive ? 'Arşiv/Paket Analizi' : 'Dosya Yapısı'),
                            '#f472b6'
                        )}
                        {isPdf && renderButton('pdf', <FileDiff size={28} />, 'PDF Araçları', 'Böl / Düzenle', '#ef4444')}
                    </div>
                </div>

                {/* Category: Analiz & Görüntüleme */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium">Analiz ve Veri</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('hash', <Hash size={28} />, 'Hash (İmza)', 'MD5, SHA1, SHA256', '#fbbf24')}
                        {isText && renderButton('text', <FileText size={28} />, 'Metin Analizi', 'Kelime/Satır Sayacı', '#a78bfa')}
                        {isJson && renderButton('json', <FileJson size={28} />, 'JSON Format', 'Pretty Print', '#22d3ee')}
                    </div>
                </div>

                {/* Category: Geliştirici */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium">Geliştirici</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('base64', <Binary size={28} />, 'Base64 Çevirici', 'Veriyi Kodla', '#e879f9')}
                    </div>
                </div>

            </div>
        </div>
    );
};
