import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, Clipboard, Check, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrManagerProps {
    file: File | null;
    onBack: () => void;
}

export const QrManager: React.FC<QrManagerProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    useEffect(() => {
        if (!file) {
            setResult(null);
            setError(null);
            return;
        }

        const scan = async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                // Scan local file
                const res = await html5QrCode.scanFile(file, true);
                setResult(res);
            } catch (err) {
                console.error(err);
                setError("QR Kod bulunamadı veya okunamadı.");
            }
        };
        scan();
    }, [file]);

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="glass-panel max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2" title="Geri Dön"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <QrCode className="text-blue-400" />
                    QR Kod Okuyucu
                </h2>
            </div>

            {/* Hidden div for library requirement */}
            <div id="reader" className="hidden"></div>

            <div className="min-h-[300px]">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                            <QrCode size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">QR Kod Görseli Seçin</p>
                            <p className="text-sm text-slate-500 mt-1">Görseldeki QR kodu anında analiz edin ve içeriğini görün</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            title="QR Görseli Seç"
                        />
                    </div>
                ) : (
                    <>
                        <div className="mb-8 relative group">
                            <button
                                onClick={() => setFile(null)}
                                className="absolute -top-2 -right-2 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10"
                                title="Görseli Değiştir"
                            >
                                <RefreshCw size={14} className="text-blue-400" />
                            </button>
                            <img src={URL.createObjectURL(file as Blob)} alt="QR Source" className="max-h-[200px] mx-auto rounded-lg border border-white/10 opacity-60" />
                        </div>

                        {result ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl animate-[fadeSlideUp_0.3s_ease]">
                                <h3 className="text-emerald-400 font-bold mb-2">Başarıyla Okundu!</h3>
                                <div className="bg-black/30 p-4 rounded-lg break-all font-mono text-sm mb-4 border border-white/5">
                                    {result}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="glass-button flex items-center gap-2 mx-auto"
                                >
                                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                                    {copied ? 'Kopyalandı' : 'İçeriği Kopyala'}
                                </button>
                            </div>
                        ) : error ? (
                            <div className="text-red-400 bg-red-400/5 border border-red-400/20 p-8 rounded-xl">
                                {error}
                                <button
                                    onClick={() => setFile(null)}
                                    className="block mx-auto mt-4 text-sm underline opacity-70 hover:opacity-100"
                                >
                                    Başka bir görsel dene
                                </button>
                            </div>
                        ) : (
                            <div className="text-slate-400 animate-pulse py-8">
                                <QrCode className="mx-auto mb-4 opacity-20" size={48} />
                                QR Kod taranıyor...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
