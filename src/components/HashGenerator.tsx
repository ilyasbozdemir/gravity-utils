import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react';

interface HashGeneratorProps {
    file: File;
    onBack: () => void;
}

export const HashGenerator: React.FC<HashGeneratorProps> = ({ file, onBack }) => {
    const [hashes, setHashes] = useState<{ sha1: string; sha256: string }>({ sha1: '', sha256: '' });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
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

            <div className="flex-col" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', width: '100%', borderRadius: '8px', textAlign: 'left', boxSizing: 'border-box' }}>
                    <span className="text-sm" style={{ display: 'block', marginBottom: '4px' }}>İncelenen Dosya:</span>
                    <strong>{file.name}</strong>
                </div>

                {loading ? (
                    <div className="flex-center" style={{ padding: '2rem' }}>
                        <RefreshCw size={32} className="spin" />
                        <span style={{ marginLeft: '10px' }}>Hesaplanıyor...</span>
                    </div>
                ) : (
                    <>
                        {/* SHA-1 */}
                        <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                            <label className="text-sm">SHA-1</label>
                            <div className="flex-center w-full" style={{ gap: '10px' }}>
                                <input readOnly value={hashes.sha1} style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    fontFamily: 'monospace'
                                }} />
                                <button className="glass-button" onClick={() => copyToClipboard(hashes.sha1, 'sha1')} title="Kopyala">
                                    {copied === 'sha1' ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* SHA-256 */}
                        <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                            <label className="text-sm">SHA-256</label>
                            <div className="flex-center w-full" style={{ gap: '10px' }}>
                                <input readOnly value={hashes.sha256} style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    fontFamily: 'monospace'
                                }} />
                                <button className="glass-button" onClick={() => copyToClipboard(hashes.sha256, 'sha256')} title="Kopyala">
                                    {copied === 'sha256' ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
