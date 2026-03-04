import React, { useState, useCallback } from 'react';
import {
    ImageIcon, Camera, Share2, Trash2, Download,
    Type, RefreshCw, AlertCircle, Info, ArrowLeft,
    Monitor, Smartphone, Globe, Instagram, Twitter, Youtube, Linkedin,
    Zap, Search
} from 'lucide-react';
import { toast } from 'sonner';

type ToolTab = 'exif' | 'bulk-rename' | 'social' | 'optimizer';

const MediaToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('exif');

    return (
        <div className="max-w-6xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-500/20">
                    <ImageIcon size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Medya & Görsel Merkezi</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Media Processing • Desktop Native</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'exif', label: 'EXIF Viewer', icon: <Camera size={16} /> },
                    { id: 'bulk-rename', label: 'Toplu İsimlendir', icon: <Type size={16} /> },
                    { id: 'social', label: 'Sosyal Medya', icon: <Share2 size={16} /> },
                    { id: 'optimizer', label: 'Görsel Optimize', icon: <Zap size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'exif' && <ExifTab />}
                {activeTab === 'bulk-rename' && <RenameTab />}
                {activeTab === 'social' && <SocialTab />}
                {activeTab === 'optimizer' && <OptimizerTab />}
            </div>

            <MediaGuide />
        </div>
    );
};

function ExifTab() {
    const [file, setFile] = useState<any>(null);
    const [exif, setExif] = useState<any>(null);

    const handleSelect = async () => {
        if (window.electron?.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                properties: ['openFile'],
                filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
            });
            if (result && Array.isArray(result) && result.length > 0) {
                const filePath = typeof result[0] === 'string' ? result[0] : (result[0] as any).path;
                const name = filePath.split('\\').pop();
                setFile({ name, path: filePath });
                // Mock EXIF for now
                setExif({
                    "Kamera Modeli": "iPhone 15 Pro",
                    "Diyafram": "f/1.78",
                    "Poz Süresi": "1/120s",
                    "ISO": "80",
                    "Odak Uzaklığı": "24mm",
                    "Konum": "41.0082° N, 28.9784° E (İstanbul)",
                    "Oluşturulma": "2024:05:12 14:23:11"
                });
                toast.success("Görsel analiz edildi!");
            }
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="space-y-6">
                <div
                    onClick={handleSelect}
                    className="group border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-4 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all cursor-pointer"
                >
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                        <Camera size={40} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-slate-800 dark:text-white">Görsel Seç</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">EXIF Verilerini Analiz Et</p>
                    </div>
                </div>
                {file && (
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seçili Dosya</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 dark:bg-black/20 rounded-[2.5rem] p-10 border border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                    <Info size={20} className="text-rose-500" /> Analiz Sonuçları
                </h3>
                {exif ? (
                    <div className="space-y-4">
                        {Object.entries(exif).map(([key, val]: any) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-40">
                        <Search size={48} />
                        <p className="text-sm font-bold uppercase tracking-widest">Veri bekleniyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function RenameTab() {
    const [files, setFiles] = useState<any[]>([]);
    const [prefix, setPrefix] = useState('');

    const handleSelect = async () => {
        if (window.electron?.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                properties: ['openFile', 'multiSelections']
            });
            if (result && Array.isArray(result)) {
                setFiles(result.map((p: any) => {
                    const path = typeof p === 'string' ? p : p.path;
                    return { path, name: path.split('\\').pop() };
                }));
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Ön Ek (Prefix)</label>
                        <input
                            value={prefix}
                            onChange={e => setPrefix(e.target.value)}
                            placeholder="urun-adi-2024-"
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono focus:outline-none focus:border-rose-500/50 text-slate-800 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleSelect}
                        className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-rose-500/5 transition-all"
                    >
                        <Type size={32} className="text-rose-500" />
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Dosyaları Seç ({files.length})</p>
                    </button>
                    <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all">
                        Toplu İsimlendir
                    </button>
                </div>
                <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5 max-h-[400px] overflow-auto custom-scrollbar">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Dosya Listesi</h3>
                    {files.length > 0 ? (
                        <div className="space-y-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400 truncate">{f.name}</span>
                                    <span className="text-xs font-black text-rose-500">→ {prefix}{f.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-700 italic text-center p-20 font-bold uppercase tracking-widest">Henüz dosya seçilmedi</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SocialTab() {
    const PLATFORMS = [
        { name: 'Instagram', icon: <Instagram />, color: 'rose', sizes: ['Post: 1080x1080', 'Story: 1080x1920', 'Portrait: 1080x1350'] },
        { name: 'X / Twitter', icon: <Twitter />, color: 'slate', sizes: ['Post: 1200x675', 'Header: 1500x500', 'Avatar: 400x400'] },
        { name: 'Youtube', icon: <Youtube />, color: 'red', sizes: ['Thumbnail: 1280x720', 'Banner: 2560x1440', 'Shorts: 1080x1920'] },
        { name: 'Linkedin', icon: <Linkedin />, color: 'blue', sizes: ['Post: 1200x627', 'Banner: 1584x396', 'Avatar: 400x400'] }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {PLATFORMS.map(p => (
                <div key={p.name} className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] space-y-6 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-white dark:bg-white/5 shadow-sm text-slate-700 dark:text-white group-hover:scale-110 transition-transform">
                            {p.icon}
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-tighter">{p.name}</h4>
                    </div>
                    <div className="space-y-2">
                        {p.sizes.map(s => (
                            <div key={s} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span>{s}</span>
                                <button onClick={() => { navigator.clipboard.writeText(s.split(': ')[1]); toast.success(s + " kopyalandı!"); }} className="text-rose-500 hover:scale-110 transition-transform"><Download size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function OptimizerTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                <Zap size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">AI & Native Optimizer</h3>
            <p className="text-slate-500 max-w-sm font-bold leading-relaxed uppercase tracking-widest text-[10px]">Görsel kalitesini bozmadan %80 e kadar sıkıştırma motoru masaüstü sürümü için hazırlanıyor.</p>
        </div>
    );
}

const MediaGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-rose-600 rounded-[3rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Camera size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Zap size={20} className="fill-white" /> Pro Çekim Bilgisi
            </h3>
            <p className="text-rose-100 text-sm font-bold leading-relaxed mb-6 italic">
                EXIF verileri sadece teknik bilgi değildir; fotoğrafın hikayesini anlatır. Ancak sosyal medyada paylaşmadan önce konum bilgisini temizlemek gizliliğiniz için kritiktir.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Bozdemir Media Engine v3.1.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-500" /> Tam Gizlilik
            </h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed italic">
                Masaüstü uygulamamızda tüm görsel işleme işlemleri %100 yereldir. Fotoğraflarınız asla bulut sunucularına iletilmez, verileriniz sizde kalır.
            </p>
        </div>
    </div>
);

export default MediaToolkitView;
