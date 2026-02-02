import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, FileText } from 'lucide-react';

interface Base64ViewerProps {
    file: File;
    onBack: () => void;
}

export const Base64Viewer: React.FC<Base64ViewerProps> = ({ file, onBack }) => {
    const [base64, setBase64] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [includeScheme, setIncludeScheme] = useState(true);

    useEffect(() => {
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
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={onBack} className="glass-button" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Base64 Dönüştürücü</h2>
            </div>

            {loading ? (
                <div className="p-4">Kodlanıyor...</div>
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

                    <div className="text-sm" style={{ alignSelf: 'flex-start', opacity: 0.7 }}>
                        <FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        Karakter Sayısı: {previewText?.length.toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
};
