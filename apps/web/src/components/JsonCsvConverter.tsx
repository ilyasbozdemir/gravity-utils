'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileJson, FileSpreadsheet, Download, Copy, Trash2, AlertCircle } from 'lucide-react';

export function JsonCsvConverter({ onBack }: { onBack: () => void }) {
    const [json, setJson] = useState('');
    const [csv, setCsv] = useState('');
    const [error, setError] = useState<string | null>(null);

    const convertToCsv = () => {
        try {
            setError(null);
            if (!json.trim()) return;
            const data = JSON.parse(json);
            if (!Array.isArray(data)) {
                setError('JSON bir dizi (array) olmalıdır. Örn: [{"id":1, "name":"test"}]');
                return;
            }

            if (data.length === 0) {
                setCsv('');
                return;
            }

            const keys = Object.keys(data[0]);
            const header = keys.join(',');
            const rows = data.map(obj =>
                keys.map(key => {
                    let val = obj[key];
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                    return val;
                }).join(',')
            );

            setCsv([header, ...rows].join('\n'));
        } catch (e) {
            setError('Geçersiz JSON formatı.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(csv);
    };

    const downloadCsv = () => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        a.click();
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <FileJson className="w-6 h-6 text-yellow-500" /> JSON ↔ CSV Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Verilerinizi JSON ve CSV formatları arasında kolayca dönüştürün</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* JSON Input */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="json-input" className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">JSON Girişi</label>
                        <button onClick={() => setJson('')} title="Temizle" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <textarea id="json-input" value={json} onChange={e => setJson(e.target.value)} placeholder='[{"id": 1, "name": "Admin"}, ...]'
                        title="JSON Girişi"
                        className="w-full h-[400px] p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl font-mono text-sm outline-none focus:ring-2 focus:ring-yellow-500/30 transition-all resize-none shadow-inner" />

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <button onClick={convertToCsv} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-black shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98]">
                        CSV'ye Dönüştür
                    </button>
                </div>

                {/* CSV Output */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="csv-output" className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">CSV Çıktısı</label>
                        <div className="flex gap-1">
                            <button onClick={copyToClipboard} title="Kopyala" className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">
                                <Copy size={16} />
                            </button>
                            <button onClick={downloadCsv} title="İndir" className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                    <textarea id="csv-output" readOnly value={csv} title="CSV Çıktısı" placeholder="CSV çıktısı burada görünecek..."
                        className="w-full h-[400px] p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-3xl font-mono text-sm outline-none resize-none shadow-inner" />

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-xl">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div className="text-xs">
                            <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">Dönüşüm Notu</span>
                            <span className="text-slate-500 dark:text-slate-400 leading-relaxed">JSON dizisindeki ilk obje, CSV kolon başlıklarını belirler. İç içe geçmiş objeler henüz desteklenmemektedir.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
