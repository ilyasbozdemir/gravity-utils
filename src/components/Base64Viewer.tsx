import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, FileText } from 'lucide-react';

interface Base64ViewerProps {
    file: File | null;
    onBack: () => void;
}

export const Base64Viewer: React.FC<Base64ViewerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [base64, setBase64] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [includeScheme, setIncludeScheme] = useState(true);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setBase64(e.target.result as string);
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    }, [file]);

    const handleCopy = () => {
        const textToCopy = includeScheme ? base64 : base64.split(',')[1];
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const previewText = includeScheme ? base64 : base64.split(',')[1];

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem', opacity: 0.7 }}>
                {file ? (
                    <>
                        <strong>{file.name}</strong> dosyası Base64 formatına dönüştürüldü.
                    </>
                ) : (
                    'Base64 formatına dönüştürmek istediğiniz dosyayı seçin.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-violet-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-violet-500/10 rounded-full text-violet-400 group-hover:scale-110 transition-transform">
                        <Share2 size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">Dönüştürmek için Dosya Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">Resim, metin veya herhangi bir binary dosya</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="p-4 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                            <span>Kodlanıyor...</span>
                        </div>
                    ) : (
                        <div className="flex-col" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                            <div className="flex-center" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div className="flex-center" style={{ gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        id="scheme"
                                        checked={includeScheme}
                                        onChange={(e) => setIncludeScheme(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="scheme" style={{ cursor: 'pointer', userSelect: 'none' }}>Data URI Şemasını Dahil Et (data:image/...)</label>
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className="glass-button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: copied ? 'rgba(16, 185, 129, 0.2)' : undefined,
                                        borderColor: copied ? 'rgba(16, 185, 129, 0.5)' : undefined
                                    }}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                                </button>
                            </div>

                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '300px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden'
                            }}>
                                <textarea
                                    value={previewText}
                                    readOnly
                                    title="Base64 Output"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        border: 'none',
                                        padding: '1rem',
                                        resize: 'none',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div className="text-sm flex items-center justify-between w-full opacity-60">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} />
                                    <span>Karakter Sayısı: {previewText?.length.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => { setFile(null); setBase64(''); }}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Dosyayı Temizle
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
