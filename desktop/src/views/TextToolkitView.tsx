import React, { useState, useCallback } from 'react';
import {
    FileText, Type, List, FileCode, Check, Copy,
    Trash2, Info, Zap, AlertCircle, Search, Edit3,
    Eye, Layout, Activity, Feather
} from 'lucide-react';
import { toast } from 'sonner';

type ToolTab = 'case' | 'lorem' | 'markdown' | 'mermaid' | 'diff';

const TextToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('case');

    return (
        <div className="max-w-6xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/20">
                    <Feather size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Metin & İçerik Uzmanı</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Text Processor • Creative Suite</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'case', label: 'Vaka Çevirici', icon: <Type size={16} /> },
                    { id: 'lorem', label: 'Lorem Ipsum', icon: <List size={16} /> },
                    { id: 'markdown', label: 'Markdown Editor', icon: <Edit3 size={16} /> },
                    { id: 'mermaid', label: 'Mermaid Editor', icon: <Activity size={16} /> },
                    { id: 'diff', label: 'Text Diff', icon: <Layout size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'case' && <CaseTab />}
                {activeTab === 'lorem' && <LoremTab />}
                {activeTab === 'markdown' && <MarkdownTab />}
                {activeTab === 'mermaid' && <MermaidTab />}
                {activeTab === 'diff' && <DiffTab />}
            </div>

            <TextGuide />
        </div>
    );
};

function CaseTab() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const convert = (type: string) => {
        if (!input) return;
        let res = '';
        if (type === 'upper') res = input.toUpperCase();
        else if (type === 'lower') res = input.toLowerCase();
        else if (type === 'title') res = input.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        else if (type === 'sentence') res = input.toLowerCase().charAt(0).toUpperCase() + input.slice(1).toLowerCase();
        setOutput(res);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Girdi Metni</label>
                        <button onClick={() => setInput('')} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="w-full h-80 p-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] focus:ring-2 focus:ring-amber-500/50 outline-none text-sm font-bold leading-relaxed resize-none shadow-inner"
                        placeholder="Metni buraya girin..."
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Çıktı</label>
                        {output && <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Kopyalandı!"); }} className="text-amber-500 hover:bg-amber-500/10 p-2 rounded-xl transition-all"><Copy size={16} /></button>}
                    </div>
                    <div className="w-full h-80 p-8 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-[2.5rem] text-sm font-black leading-relaxed text-amber-600 dark:text-amber-400 overflow-auto whitespace-pre-wrap">
                        {output || <span className="opacity-20 text-[10px] uppercase tracking-widest italic">Çıktı bekleniyor...</span>}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => convert('upper')} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">BÜYÜK HARF</button>
                <button onClick={() => convert('lower')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">küçük harf</button>
                <button onClick={() => convert('title')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Başlık Düzeni</button>
                <button onClick={() => convert('sentence')} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cümle Düzeni</button>
            </div>
        </div>
    );
}

function LoremTab() {
    const [count, setCount] = useState(3);
    const [output, setOutput] = useState('');

    const generate = () => {
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";
        setOutput(Array(count).fill(text).join('\n\n'));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in duration-500">
            <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 text-center space-y-6">
                <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Paragraf Sayısı: {count}</label>
                    <input type="range" min={1} max={10} value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-64 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>
                <button onClick={generate} className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">Metin Oluştur</button>
            </div>
            {output && (
                <div className="relative group animate-in slide-in-from-top-4 duration-500">
                    <div className="p-10 bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-[3rem] font-bold text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                        {output}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Kopyalandı!"); }} className="absolute top-6 right-6 p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"><Copy size={20} /></button>
                </div>
            )}
        </div>
    );
}

function MarkdownTab() {
    const [input, setInput] = useState('# Merhaba Dünya\n\nBu bir **Markdown** örneğidir.');

    return (
        <div className="grid lg:grid-cols-2 gap-8 h-[500px] animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Markdown Editörü</label>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] font-mono text-sm focus:ring-2 focus:ring-amber-500/50 outline-none resize-none shadow-inner"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Önizleme</label>
                <div className="flex-1 p-8 bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-auto prose dark:prose-invert max-w-none prose-sm font-bold">
                    {/* Basic MD render mockup */}
                    {input.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MermaidTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Activity size={40} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Mermaid Diagram Pro</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">Diyagram ve akış şeması vizüalizasyon motoru v3.3 ile masaüstüne geliyor. Çok yakında.</p>
        </div>
    );
}

function DiffTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
            <Layout size={64} className="text-amber-500 mb-6" />
            <h3 className="text-xl font-black uppercase mb-2">Text Diff Engine</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">İki metin arasındaki farkları piksel hassasiyetinde analiz eden algoritma optimize ediliyor.</p>
        </div>
    );
}

const TextGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-amber-500 rounded-[3rem] text-white shadow-2xl shadow-amber-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><FileText size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Zap size={20} className="fill-white" /> Pro Metin İpucu
            </h3>
            <p className="text-amber-50 text-sm font-bold leading-relaxed mb-6 italic">
                Başlık Düzeni (Title Case), makale ve blog yazarken okuma oranını artırır. Vaka çeviriciyi her dilde güvenle kullanabilirsiniz.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Bozdemir Text Engine v3.1.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <Edit3 size={20} className="text-amber-500" /> Yerel Güvenlik
            </h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed italic">
                Dosyalarınız hiçbir zaman bilgisayarınızdan çıkmaz. Markdown veya Mermaid diyagramlarınız sadece RAM üzerinde işlenir.
            </p>
        </div>
    </div>
);

export default TextToolkitView;
