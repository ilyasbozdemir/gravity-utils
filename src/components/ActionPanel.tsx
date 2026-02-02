
import React from 'react';
import {
    FileType, Archive, X, FileCode2, Binary, Image as ImageIcon,
    Hash, FileJson, FileText
} from 'lucide-react';

interface ActionPanelProps {
    file: File;
    onClear: () => void;
    onAction: (action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text') => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ file, onClear, onAction }) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.json');
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    const isOffice = /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name);
    const isArchive = /\.(zip|rar|7z|tar|gz|apk|jar|war)$/i.test(file.name);

    const renderButton = (
        action: 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text',
        icon: React.ReactNode,
        title: string,
        desc: string,
        colorClass: string
    ) => (
        <button
            className="flex flex-col items-center justify-start text-center w-full h-full p-5 gap-2 bg-blue-500/20 border border-blue-500/40 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-200"
            onClick={() => onAction(action)}
        >
            <div style={{ color: colorClass }} className="mb-1">{icon}</div>
            <div className="text-base font-semibold">{title}</div>
            <div className="text-xs opacity-80">{desc}</div>
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

                {/* Category: Dosya İşlemleri */}
                <div className="text-left">
                    <h3 className="mb-4 opacity-70 text-sm uppercase tracking-wider font-medium">Temel İşlemler</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {renderButton('convert', <FileType size={28} />, 'Çevir / Adlandır', 'Format ve Uzantı', '#60a5fa')}
                        {isImage && renderButton('optimize', <ImageIcon size={28} />, 'Optimize Et', 'Resim Sıkıştırma', '#34d399')}
                        {renderButton(
                            'inspect',
                            <Archive size={28} />,
                            isOffice ? 'Belgeyi İncele' : 'İçini İncele',
                            isOffice ? 'Word/Excel İçeriği' : (isArchive ? 'Arşiv/Paket Analizi' : 'Dosya Yapısı'),
                            '#f472b6'
                        )}
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
