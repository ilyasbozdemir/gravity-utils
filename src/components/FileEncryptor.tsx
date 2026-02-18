import React, { useState } from 'react';
import { ArrowLeft, Lock, Unlock, Key, Download, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface FileEncryptorProps {
    file: File | null;
    onBack: () => void;
}

export const FileEncryptor: React.FC<FileEncryptorProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const deriveKey = async (password: string, salt: Uint8Array) => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    };

    const handleProcess = async () => {
        if (!file || !password) {
            setError(!password ? 'Lütfen bir şifre girin.' : 'Lütfen bir dosya seçin.');
            return;
        }
        setProcessing(true);
        setError(null);

        try {
            const fileData = await file.arrayBuffer();

            if (mode === 'encrypt') {
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const key = await deriveKey(password, salt);

                const encryptedContent = await window.crypto.subtle.encrypt(
                    {
                        name: "AES-GCM",
                        iv: iv
                    },
                    key,
                    fileData
                );

                // Format: Salt (16) + IV (12) + Content
                const result = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
                result.set(salt, 0);
                result.set(iv, salt.byteLength);
                result.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

                downloadFile(result, `${file.name}.enc`);
            } else {
                // Decrypt
                const salt = new Uint8Array(fileData.slice(0, 16));
                const iv = new Uint8Array(fileData.slice(16, 28));
                const data = fileData.slice(28);

                const key = await deriveKey(password, salt);

                try {
                    const decryptedContent = await window.crypto.subtle.decrypt(
                        {
                            name: "AES-GCM",
                            iv: iv
                        },
                        key,
                        data
                    );

                    // Remove .enc extension if present
                    const originalName = file.name.replace(/\.enc$/, '');
                    downloadFile(new Uint8Array(decryptedContent), originalName);
                } catch (_) {
                    throw new Error('Şifre yanlış veya dosya bozuk.');
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu.';
            console.error(err);
            setError(message);
        } finally {
            setProcessing(false);
        }
    };

    const downloadFile = (data: Uint8Array, filename: string) => {
        const blob = new Blob([data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-8">
                <button
                    onClick={onBack}
                    className={`p-2 border rounded-lg transition-all shadow-lg ${mode === 'encrypt'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 hover:bg-emerald-500/30'
                        : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-100 hover:bg-indigo-500/30'
                        }`}
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-white">Güvenli Şifreleme</h2>
                    <p className={`text-sm font-medium tracking-wide ${mode === 'encrypt' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {mode === 'encrypt' ? 'Askeri Düzey AES-256 Koruma' : 'Güvenli Veri Erişimi'}
                    </p>
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-8 leading-relaxed">
                Dosyalarınızı tamamen tarayıcınızda şifreleyin. Şifreniz veya verileriniz asla sunucularımıza ulaşmaz.
                <span className="block mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <ShieldCheck className="inline-block mr-1 mb-0.5" size={12} /> Yerel ve Güvenli İşlem
                </span>
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer group shadow-inner"
                >
                    <div className="p-5 bg-emerald-500/10 rounded-full text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <Lock size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1 text-slate-200">Dosya Seçin</p>
                        <p className="text-sm text-slate-500">Şifrelemek veya çözmek istediğiniz dosyayı seçin</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        title="Dosya Seç"
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="p-6 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-4 text-left">
                            <div className={`p-3 rounded-xl ${mode === 'encrypt' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                <Lock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono tracking-tighter capitalize">
                                    {file.type || 'unknown type'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFile(null); setPassword(''); }}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Dosyayı Kaldır"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setMode('encrypt')}
                            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'encrypt'
                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                            title="Şifreleme Modu"
                        >
                            <Lock size={14} /> Şifrele
                        </button>
                        <button
                            onClick={() => setMode('decrypt')}
                            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'decrypt'
                                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                            title="Şifre Çözme Modu"
                        >
                            <Unlock size={14} /> Şifre Çöz
                        </button>
                    </div>

                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Anahtar Şifre</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                    <Key size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={mode === 'encrypt' ? "Güçlü bir şifre belirleyin" : "Dosya şifresini girin"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    title="Şifre"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-all font-mono"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Gizle" : "Göster"}
                                    className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium animate-[fadeIn_0.3s_ease]">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleProcess}
                            disabled={processing || !password}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-xl ${processing
                                ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                : mode === 'encrypt'
                                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/10 active:scale-95'
                                    : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/10 active:scale-95'
                                }`}
                            title={mode === 'encrypt' ? 'Şifrele ve İndir' : 'Çöz ve İndir'}
                        >
                            {processing ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                            <span>{processing ? 'İşleniyor...' : (mode === 'encrypt' ? 'Şifrele ve İndir' : 'Çöz ve İndir')}</span>
                        </button>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-3">
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed max-w-[300px]">
                            <span className="font-bold text-red-400/60 uppercase">DİKKAT:</span> Şifrenizi unutursanız verilere asla erişemezsiniz. Kurtarma seçeneği yoktur.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
