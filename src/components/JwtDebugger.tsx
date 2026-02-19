import React, { useState } from 'react';
import { ArrowLeft, Copy, Eye, AlertCircle, ShieldCheck } from 'lucide-react';

interface JwtDebuggerProps {
    onBack: () => void;
}

export const JwtDebugger: React.FC<JwtDebuggerProps> = ({ onBack }) => {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const decodePart = (part: string) => {
        try {
            // Base64URL to Base64
            const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
            const jsonStr = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonStr);
        } catch {
            return null;
        }
    };

    const handleDecode = () => {
        setError(null);
        setHeader(null);
        setPayload(null);

        if (!token.trim()) return;

        const parts = token.split('.');
        if (parts.length !== 3) {
            setError('JWT geçersiz formatta (3 parça olmalı).');
            return;
        }

        const h = decodePart(parts[0]);
        const p = decodePart(parts[1]);

        if (!h || !p) {
            setError('JWT kısımları decode edilemedi.');
            return;
        }

        setHeader(h);
        setPayload(p);
    };

    const copyPart = (data: any, key: string) => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-[1200px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-white rounded-lg hover:bg-emerald-500/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">JWT Debugger</h2>
                    <p className="text-sm text-emerald-400 font-medium tracking-wide">JSON Web Token Analiz ve Cozumleme</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-5 space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 block">Encoded Token</label>
                    <textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full h-[500px] bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-mono text-emerald-300 focus:border-emerald-500/50 outline-none transition-all resize-none shadow-inner break-all"
                    />
                    <button
                        onClick={handleDecode}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Eye size={20} />
                        Decode Token
                    </button>
                </div>

                {/* Decode Result Section */}
                <div className="lg:col-span-1 flex items-center justify-center">
                    <div className="w-px h-full bg-white/5 hidden lg:block"></div>
                </div>

                <div className="lg:col-span-6 space-y-8">
                    {error ? (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 animate-pulse">
                            <AlertCircle size={24} />
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">HEADER (ALGORITHM & TOKEN TYPE)</label>
                                    {header && (
                                        <button onClick={() => copyPart(header, 'header')} className="text-xs text-slate-500 hover:text-white transition-colors">
                                            {copied === 'header' ? 'Kopyalandı!' : <Copy size={14} />}
                                        </button>
                                    )}
                                </div>
                                <pre className="bg-black/60 border border-white/5 rounded-2xl p-6 text-sm font-mono text-pink-400 overflow-auto max-h-[200px] custom-scrollbar">
                                    {header ? JSON.stringify(header, null, 2) : <span className="opacity-20 italic">Token decode edildiğinde görünecek...</span>}
                                </pre>
                            </div>

                            {/* Payload */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">PAYLOAD (DATA)</label>
                                    {payload && (
                                        <button onClick={() => copyPart(payload, 'payload')} className="text-xs text-slate-500 hover:text-white transition-colors">
                                            {copied === 'payload' ? 'Kopyalandı!' : <Copy size={14} />}
                                        </button>
                                    )}
                                </div>
                                <pre className="bg-black/60 border border-white/5 rounded-2xl p-6 text-sm font-mono text-sky-400 overflow-auto max-h-[300px] custom-scrollbar">
                                    {payload ? JSON.stringify(payload, null, 2) : <span className="opacity-20 italic">Token decode edildiğinde görünecek...</span>}
                                </pre>
                            </div>

                            {/* Footer/Info */}
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                                <ShieldCheck size={18} className="text-emerald-500 opacity-60" />
                                <p className="text-[11px] text-slate-500 font-medium italic">
                                    Gravity Utils JWT araçları verilerinizi hiçbir yere göndermez, tüm işlemler yereldir.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
