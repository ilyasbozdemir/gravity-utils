import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart } from 'lucide-react';

interface TextAnalyzerProps {
    file: File | null;
    onBack: () => void;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [stats, setStats] = useState<{ words: number; chars: number; lines: number; spaces: number } | null>(null);
    const [preview, setPreview] = useState<string>('');

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

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-violet-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-violet-500/10 rounded-full text-violet-400 group-hover:scale-110 transition-transform">
                        <BarChart size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">Analiz Etmek İçin Metin Dosyası Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">Kelime, karakter ve satır sayılarını anında görün</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".txt,.md,.js,.ts,.html,.css,.json"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <>
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
                        <div className="flex-center w-full" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="text-sm">Önizleme (İlk 1000 karakter):</label>
                            <button onClick={() => setFile(null)} className="text-xs text-slate-400 hover:text-white transition-colors">Başka Dosya Seç</button>
                        </div>
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
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                        }}>
                            {preview}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
