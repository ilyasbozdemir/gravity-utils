import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart } from 'lucide-react';

interface TextAnalyzerProps {
    file: File;
    onBack: () => void;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ file, onBack }) => {
    const [stats, setStats] = useState<{ words: number; chars: number; lines: number; spaces: number } | null>(null);
    const [preview, setPreview] = useState<string>('');

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setPreview(text.slice(0, 1000) + (text.length > 1000 ? '...' : ''));

            setStats({
                words: text.trim().split(/\s+/).filter(w => w.length > 0).length,
                chars: text.length,
                lines: text.split(/\r\n|\r|\n/).length,
                spaces: text.split(' ').length - 1
            });
        };
        reader.readAsText(file);
    }, [file]);

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} className="glass-button" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart size={24} /> Metin Analizi
                </h2>
            </div>

            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{stats.words}</div>
                        <div className="text-sm">Kelime</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f472b6' }}>{stats.chars}</div>
                        <div className="text-sm">Karakter</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399' }}>{stats.lines}</div>
                        <div className="text-sm">Satır</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats.spaces}</div>
                        <div className="text-sm">Boşluk</div>
                    </div>
                </div>
            )}

            <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                <label className="text-sm" style={{ marginBottom: '0.5rem' }}>Önizleme (İlk 1000 karakter):</label>
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace'
                }}>
                    {preview}
                </div>
            </div>
        </div>
    );
};
