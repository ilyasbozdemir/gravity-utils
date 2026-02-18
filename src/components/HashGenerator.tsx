import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check, Fingerprint } from 'lucide-react';

interface HashGeneratorProps {
    file: File | null;
    onBack: () => void;
}

export const HashGenerator: React.FC<HashGeneratorProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [hashes, setHashes] = useState<{ sha1: string; sha256: string }>({ sha1: '', sha256: '' });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!file) return;
        const generateHashes = async () => {
            setLoading(true);
            try {
                const arrayBuffer = await file.arrayBuffer();

                // SHA-1
                const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
                const sha1Array = Array.from(new Uint8Array(sha1Buffer));
                const sha1Hex = sha1Array.map(b => b.toString(16).padStart(2, '0')).join('');

                // SHA-256
                const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                const sha256Array = Array.from(new Uint8Array(sha256Buffer));
                const sha256Hex = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('');

                setHashes({ sha1: sha1Hex, sha256: sha256Hex });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        generateHashes();
    }, [file]);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} className="glass-button" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Dosya İmzası (Hash)</h2>
            </div>

            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem', opacity: 0.7 }}>
                {file ? (
                    <>
                        <strong>{file.name}</strong> dosyası için benzersiz imzalar oluşturuldu.
                    </>
                ) : (
                    'İmzasını (hash) hesaplamak istediğiniz dosyayı seçin.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 group-hover:scale-110 transition-transform">
                        <Fingerprint size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">Hash Hesaplamak İçin Dosya Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">Dosya içeriği asla sunucuya yüklenmez</p>
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
                <div className="flex-col" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
                    {loading ? (
                        <div className="flex-center flex-col" style={{ padding: '3rem', gap: '1rem' }}>
                            <RefreshCw size={32} className="animate-spin text-emerald-400" />
                            <span>İmzalar Hesaplanıyor...</span>
                        </div>
                    ) : (
                        <>
                            {/* SHA-1 */}
                            <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                                <label className="text-sm opacity-60 mb-1">SHA-1</label>
                                <div className="flex-center w-full" style={{ gap: '10px' }}>
                                    <input readOnly value={hashes.sha1} title="SHA-1 Hash" style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem'
                                    }} />
                                    <button className="glass-button" style={{ padding: '12px' }} onClick={() => copyToClipboard(hashes.sha1, 'sha1')} title="Kopyala">
                                        {copied === 'sha1' ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* SHA-256 */}
                            <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                                <label className="text-sm opacity-60 mb-1">SHA-256</label>
                                <div className="flex-center w-full" style={{ gap: '10px' }}>
                                    <input readOnly value={hashes.sha256} title="SHA-256 Hash" style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem'
                                    }} />
                                    <button className="glass-button" style={{ padding: '12px' }} onClick={() => copyToClipboard(hashes.sha256, 'sha256')} title="Kopyala">
                                        {copied === 'sha256' ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => { setFile(null); setHashes({ sha1: '', sha256: '' }); }}
                                className="text-sm text-slate-500 hover:text-white transition-colors mt-4"
                            >
                                Başka Bir Dosya Seç
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
