import React, { useState } from 'react';
import { ArrowLeft, Lock, Unlock, Key, Download, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface FileEncryptorProps {
    file: File;
    onBack: () => void;
}

export const FileEncryptor: React.FC<FileEncryptorProps> = ({ file, onBack }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                salt: salt as any,
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
        if (!password) {
            setError('Lütfen bir şifre girin.');
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
                } catch (e) {
                    throw new Error('Şifre yanlış veya dosya bozuk.');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'İşlem sırasında bir hata oluştu.');
        } finally {
            setProcessing(false);
        }
    };

    const downloadFile = (data: Uint8Array, filename: string) => {
        const blob = new Blob([data as any]);
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
        <div className="glass-panel max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" />
                    Güvenli Dosya Şifreleme
                </h2>
            </div>

            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-lg font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setMode('encrypt')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${mode === 'encrypt' ? 'bg-emerald-500/80 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                >
                    <Lock size={18} /> Şifrele
                </button>
                <button
                    onClick={() => setMode('decrypt')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${mode === 'decrypt' ? 'bg-indigo-500/80 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                >
                    <Unlock size={18} /> Şifre Çöz
                </button>
            </div>

            <div className="max-w-xs mx-auto space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <Key size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === 'encrypt' ? "Şifre Belirle" : "Dosya Şifresi"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:border-emerald-500/50 transition-colors text-center"
                    />
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {error && (
                    <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleProcess}
                    disabled={processing || !password}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${processing ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'
                        } ${mode === 'encrypt' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                >
                    {processing ? (
                        <RefreshCw className="animate-spin" size={20} />
                    ) : (
                        <Download size={20} />
                    )}
                    {processing ? 'İşleniyor...' : (mode === 'encrypt' ? 'Şifrele ve İndir' : 'Çöz ve İndir')}
                </button>
            </div>

            <p className="mt-6 text-xs text-slate-400/60 max-w-sm mx-auto">
                <Lock size={12} className="inline mr-1" />
                Bu işlem tamamen tarayıcınızda gerçekleşir (AES-GCM 256-bit). Şifrenizi unutursanız dosyanızı kurtaraMAzsınız.
            </p>
        </div>
    );
};
