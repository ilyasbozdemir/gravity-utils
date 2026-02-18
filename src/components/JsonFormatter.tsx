import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, FileJson } from 'lucide-react';
import { saveAs } from 'file-saver';

interface JsonFormatterProps {
    file: File | null;
    onBack: () => void;
}

export const JsonFormatter: React.FC<JsonFormatterProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [jsonContent, setJsonContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const obj = JSON.parse(text);
                setJsonContent(JSON.stringify(obj, null, 4));
                setError(null);
            } catch (err) {
                setError("Bu dosya geçerli bir JSON formatında değil.");
            }
        };
        reader.readAsText(file);
    }, [file]);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!file) return;
        const blob = new Blob([jsonContent], { type: 'application/json' });
        saveAs(blob, `formatted-${file.name}`);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} className="glass-button" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileJson size={24} /> JSON Formatlayıcı
                </h2>
            </div>

            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem', opacity: 0.7 }}>
                {file ? (
                    <>
                        <strong>{file.name}</strong> dosyası başarıyla ayrıştırıldı ve formatlandı.
                    </>
                ) : (
                    'Formatlamak istediğiniz JSON dosyasını seçin.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-yellow-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-yellow-500/10 rounded-full text-yellow-400 group-hover:scale-110 transition-transform">
                        <FileJson size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">Formatlamak İçin JSON Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">Okunabilirliği düşük JSON dosyalarını güzelleştirin</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <>
                    {error ? (
                        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', textAlign: 'left' }}>
                            <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>
                            <button onClick={() => setFile(null)} className="glass-button mt-4">Başka Dosya Seç</button>
                        </div>
                    ) : (
                        <div className="flex-col" style={{ gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="glass-button text-xs px-3" onClick={() => setFile(null)}>Değiştir</button>
                                <button className="glass-button" onClick={handleDownload}>İndir</button>
                                <button className="glass-button" style={{ display: 'flex', gap: '5px' }} onClick={handleCopy}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Kopyalandı' : 'Kopyala'}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={jsonContent}
                                title="Formatted JSON Output"
                                style={{
                                    width: '100%',
                                    height: '500px',
                                    background: '#0f172a',
                                    color: '#e2e8f0',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    fontFamily: 'monospace',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
