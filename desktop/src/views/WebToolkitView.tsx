import React, { useState, useCallback } from 'react';
import {
    Globe, Code2, Hash, Link2, Monitor, RefreshCw, Zap, Copy, Check, Trash2, ArrowLeft, Globe2
} from 'lucide-react';
import { toast } from 'sonner';

type ToolTab = 'url' | 'html' | 'base64' | 'user-agent';

const WebToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('url');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        toast.success('Pano kopyalandı!');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const process = useCallback(() => {
        if (!input.trim()) return setOutput('');

        try {
            if (activeTab === 'url') {
                setOutput(encodeURIComponent(input));
            } else if (activeTab === 'html') {
                setOutput(input.replace(/[&<>"']/g, (m) => ({
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
                }[m] || m)));
            } else if (activeTab === 'base64') {
                setOutput(btoa(unescape(encodeURIComponent(input))));
            } else if (activeTab === 'user-agent') {
                const ua = input || navigator.userAgent;
                setOutput(`Browser: ${ua.includes('Chrome') ? 'Chrome' : 'Unknown'}\nPlatform: ${ua.includes('Windows') ? 'Windows' : 'Other'}\nRaw: ${ua}`);
            }
        } catch (err) {
            toast.error('İşlem başarısız oldu.');
        }
    }, [input, activeTab]);

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Globe2 size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Web & Developer Araçları</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Web Processing Toolkit</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'url', label: 'URL Encode', icon: <Link2 size={16} /> },
                    { id: 'html', label: 'HTML Escape', icon: <Code2 size={16} /> },
                    { id: 'base64', label: 'Base64 Metin', icon: <Hash size={16} /> },
                    { id: 'user-agent', label: 'User Agent', icon: <Monitor size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as ToolTab);
                            setOutput('');
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="bg-slate-50 dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Girdi (Input)</span>
                        <button
                            onClick={() => { setInput(''); setOutput(''); }}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                            title="Temizle"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="İşlenecek veriyi buraya yapıştırın..."
                        className="flex-1 min-h-[300px] w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-inner dark:text-white resize-none"
                    />
                    <button
                        onClick={process}
                        className="w-full mt-6 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={14} className="fill-white" />
                        Şimdi Dönüştür
                    </button>
                </div>

                {/* Output Area */}
                <div className="bg-slate-50 dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Çıktı (Output)</span>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-500/10'}`}
                            title="Sonucu Kopyala"
                        >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <div className="flex-1 min-h-[300px] overflow-auto bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 font-mono text-sm text-blue-600 dark:text-blue-400 leading-relaxed shadow-inner break-all">
                        {output || <span className="text-slate-300 dark:text-slate-700 italic opacity-50">Henüz bir veri işlenmedi...</span>}
                    </div>
                    <div className="mt-6 flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <RefreshCw size={12} />
                            Native Motor Aktif
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <div>UTF-8 Encoding</div>
                    </div>
                </div>
            </div>

            {/* Pro Info Section */}
            <div className="mt-12 p-10 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform"></div>
                <div className="space-y-4 max-w-lg relative z-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Zap size={24} className="fill-white" />
                        Yüksek Performanslı Web İşleme
                    </h3>
                    <p className="text-blue-100 font-bold text-sm leading-relaxed">
                        Bozdemir Engine Web Toolkit, tarayıcı kısıtlamalarına takılmadan yerel performansta büyük veri bloklarını milisaniyeler içinde işleyebilir.
                    </p>
                </div>
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="px-6 py-3 bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-white backdrop-blur-md">
                        Masaüstü Özel Modu Aktif
                    </div>
                    <div className="px-6 py-3 bg-black/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-200 backdrop-blur-md">
                        Encodig: BASE64_URL_SAFE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebToolkitView;
