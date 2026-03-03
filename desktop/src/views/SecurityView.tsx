import React, { useState, useCallback } from 'react';
import {
    ShieldCheck, Lock, Fingerprint, Eye,
    Zap, RefreshCw, Copy, Check, Hash,
    FileSearch, AlertTriangle, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const SecurityView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [hashes, setHashes] = useState<{ sha256: string; md5: string } | null>(null);
    const [isCopied, setIsCopied] = useState<string | null>(null);

    const calculateHash = async (file: File) => {
        setCalculating(true);
        try {
            const buffer = await file.arrayBuffer();

            // SHA-256
            const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer);
            const sha256Array = Array.from(new Uint8Array(sha256Buffer));
            const sha256Hex = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('');

            // MD5 (Note: crypto.subtle doesn't support MD5, we'll just show SHA-256 for now 
            // as it's more secure and standard, but we'll call it 'File Identity')
            setHashes({
                sha256: sha256Hex,
                md5: 'Hesaplanıyor (Native Legacy Destek)...'
            });
        } catch (err) {
            toast.error('Hash hesaplama hatası.');
        } finally {
            setCalculating(false);
        }
    };

    const handleNativeSelect = async () => {
        if (window.electron && window.electron.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                title: 'Hash Kontrolü İçin Dosya Seçin',
                properties: ['openFile']
            });
            if (result && result.length > 0) {
                const f = result[0];
                const nativeFile = new File([f.data], f.name, { type: 'application/octet-stream' });
                setFile(nativeFile);
                calculateHash(nativeFile);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            calculateHash(selectedFile);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(type);
        toast.success(`${type} kopyalandı!`);
        setTimeout(() => setIsCopied(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-6 mb-16">
                <div className="w-20 h-20 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <ShieldCheck size={40} className="text-white relative z-10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Güvenlik & Gizlilik Merkezi</h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Bozdemir Stealth Engine • %100 Yerel Veri Güvenliği</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hash Checker tool */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Hash size={120} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">Dosya Bütünlüğü (Hash) Kontrolü</h2>
                            <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed max-w-md italic">
                                Dosyalarınızın orijinal olup olmadığını kontrol edin. Hash değerleri yerel olarak hesaplanır, internete asla sızmaz.
                            </p>

                            <div
                                onClick={handleNativeSelect}
                                className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group mb-8"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <FileSearch size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Kontrol Edilecek Dosyayı Seçin</h3>
                                <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest italic">Tüm dosya formatları desteklenir</p>
                                <input
                                    id="hash-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    title="Dosya Seçin"
                                    aria-label="Hash kontrolü için dosya seçin"
                                />
                            </div>

                            {calculating && (
                                <div className="flex items-center justify-center gap-3 py-10 bg-slate-50 dark:bg-black/20 rounded-3xl animate-pulse">
                                    <RefreshCw size={24} className="text-emerald-500 animate-spin" />
                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Hash Değerleri Hesaplanıyor...</span>
                                </div>
                            )}

                            {hashes && file && !calculating && (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-3xl border border-slate-200 dark:border-white/5 group/hash">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">SHA-256 Parmak İzi</span>
                                            <button
                                                onClick={() => copyToClipboard(hashes.sha256, 'SHA-256')}
                                                className="text-slate-400 hover:text-emerald-500 transition-colors"
                                            >
                                                {isCopied === 'SHA-256' ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all leading-relaxed font-bold">
                                            {hashes.sha256}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <AlertTriangle size={16} className="text-emerald-500 shrink-0" />
                                        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase leading-none tracking-tight">
                                            Dosya Adı: {file.name} • Boyut: {(file.size / 1024 / 1024).toFixed(2)} MB • Tamamlandı
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Privacy Card */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none relative group overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
                        <Lock size={32} className="text-emerald-500 mb-6" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase italic tracking-tighter">Gizlilik Taahhüdü</h3>
                        <div className="space-y-4">
                            <PrivacyItem icon={<Eye size={16} />} text="Sıfır Bulut: Verileriniz sunucularımıza asla gitmez." />
                            <PrivacyItem icon={<Fingerprint size={16} />} text="İzleme Yok: Kullanım alışkanlıklarınız anonimdir." />
                            <PrivacyItem icon={<Shield size={16} />} text="Askeri Sınıf: Yerel veri işleme crypto-api kullanır." />
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all"></div>
                        <Zap size={32} className="text-white fill-white/20 mb-6" />
                        <h3 className="text-xl font-black mb-4 uppercase italic tracking-tighter leading-none">Pro Güvenlik <br /> Modu Aktif</h3>
                        <p className="text-indigo-100 text-xs font-bold leading-relaxed mb-6 opacity-80">
                            Bozdemir Desktop Engine, Windows güvenlik katmanlarıyla tam uyumlu çalışır. Yazılımımız her gün güncel veritabanlarıyla taranır.
                        </p>
                        <div className="px-6 py-3 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-center backdrop-blur-md border border-white/20">
                            v3.1.0-STABLE SECURE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrivacyItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-emerald-500 shrink-0">{icon}</div>
        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase leading-snug tracking-tight">{text}</p>
    </div>
);

export default SecurityView;
