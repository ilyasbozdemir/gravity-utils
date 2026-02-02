import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, Clipboard, Check } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrManagerProps {
    file: File;
    onBack: () => void;
}

export const QrManager: React.FC<QrManagerProps> = ({ file, onBack }) => {
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const scan = async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                const imageFile = file;
                // Scan local file
                const res = await html5QrCode.scanFile(imageFile, true);
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
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <QrCode className="text-blue-400" />
                    QR Kod Okuyucu
                </h2>
            </div>

            {/* Hidden div for library requirement */}
            <div id="reader" className="hidden"></div>

            <div className="mb-8">
                <img src={URL.createObjectURL(file)} alt="QR Source" className="max-h-[200px] mx-auto rounded-lg border border-white/10 opacity-60" />
            </div>

            {result ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
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
                <div className="text-slate-400 bg-white/5 p-8 rounded-xl">
                    {error}
                </div>
            ) : (
                <div className="text-slate-400 animate-pulse">
                    QR Kod taranıyor...
                </div>
            )}
        </div>
    );
};
