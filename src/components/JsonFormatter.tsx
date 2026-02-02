import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, FileJson } from 'lucide-react';
import { saveAs } from 'file-saver';

interface JsonFormatterProps {
    file: File;
    onBack: () => void;
}

export const JsonFormatter: React.FC<JsonFormatterProps> = ({ file, onBack }) => {
    const [jsonContent, setJsonContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
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

            {error ? (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    {error}
                </div>
            ) : (
                <div className="flex-col" style={{ gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="glass-button" onClick={handleDownload}>İndir</button>
                        <button className="glass-button" style={{ display: 'flex', gap: '5px' }} onClick={handleCopy}>
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={jsonContent}
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
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            )}
        </div>
    );
};
