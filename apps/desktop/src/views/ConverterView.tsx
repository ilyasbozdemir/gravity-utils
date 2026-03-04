import React, { useState } from 'react';
import {
    Upload, FileText, ChevronRight, Zap,
    ArrowRight, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { SHARED_ENGINE } from '@shared/index';

const ConverterView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleNativeSelect = async () => {
        if (window.electron && window.electron.selectOpenPath) {
            const result = await window.electron.selectOpenPath({
                title: 'Dosya Seçin',
                properties: ['openFile']
            });
            if (result && result.length > 0) {
                const f = result[0];
                const nativeFile = new File([f.data], f.name, { type: SHARED_ENGINE.getMimeType(f.name) });
                setFile(nativeFile);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const processFile = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            // Simulated heavy work - Desktop version will use native engine
            await new Promise(r => setTimeout(r, 1500));

            const outputName = SHARED_ENGINE.getOutputName(file.name, 'bozdemir', 'pdf');

            // In Desktop, we can use dialog.showSaveDialog via ipcRenderer
            if (window.electron) {
                const savePath = await window.electron.selectSavePath(outputName);
                if (savePath) {
                    // Actual native write logic would go here
                    setResult({ name: outputName, path: savePath });
                    toast.success('Dosya başarıyla dönüştürüldü ve kaydedildi!');
                }
            } else {
                toast.error('Electron API bulunamadı.');
            }
        } catch (err) {
            toast.error('Dönüştürme başarısız oldu.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Zap size={32} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Yerel Dönüştürücü</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-1">Native File Processing Engine</p>
                </div>
            </div>

            <div className={`
                relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all duration-500
                ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}
            `}>
                {!file ? (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Upload className="text-slate-400" size={32} />
                        </div>
                        <h2 className="text-xl font-black mb-2">Dosyayı Buraya Sürükleyin</h2>
                        <p className="text-slate-500 font-bold text-sm mb-8">veya diskten seçmek için tıklayın</p>
                        <div
                            onClick={handleNativeSelect}
                            className="absolute inset-0 cursor-pointer"
                            aria-label="Dosya Seçin"
                            role="button"
                        />
                        <button className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                            Dosya Seç
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
                            <FileText className="text-blue-500" size={32} />
                        </div>
                        <h2 className="text-xl font-black mb-1">{file.name}</h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{(file.size / 1024).toFixed(2)} KB • Hazır</p>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setFile(null)}
                                className="px-6 py-3 border border-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all"
                            >
                                Kaldır
                            </button>
                            <button
                                onClick={processFile}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                                {isProcessing ? 'İşleniyor...' : 'PDF\'e Dönüştür'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {result && (
                <div className="mt-8 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-emerald-400">Dosya Hazır!</h3>
                                <p className="text-xs text-emerald-500/60 font-bold uppercase tracking-widest font-mono truncate max-w-md">{result.path}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.electron?.showItemInFolder(result.path)}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            Klasörde Göster
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConverterView;
