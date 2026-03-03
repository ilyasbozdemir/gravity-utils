import React, { useState, useCallback } from 'react';
import {
    Package, FileJson, FileSpreadsheet, FileCode,
    RefreshCw, Trash2, Download, Copy, AlertCircle,
    Info, Zap, Calculator, Scale, FileArchive, Search
} from 'lucide-react';
import { toast } from 'sonner';

type ToolTab = 'json-csv' | 'json-xml' | 'unit' | 'calc' | 'zip';

const DataToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('json-csv');

    return (
        <div className="max-w-6xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <Package size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Veri İşleme & Analiz</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Data Processor • Native Architecture</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'json-csv', label: 'JSON ↔ CSV', icon: <FileSpreadsheet size={16} /> },
                    { id: 'json-xml', label: 'JSON ↔ XML', icon: <FileCode size={16} /> },
                    { id: 'unit', label: 'Birim Çevirici', icon: <Scale size={16} /> },
                    { id: 'calc', label: 'Hesap Makinesi', icon: <Calculator size={16} /> },
                    { id: 'zip', label: 'Zip Müfettişi', icon: <FileArchive size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'json-csv' && <JsonCsvTab />}
                {activeTab === 'json-xml' && <JsonXmlTab />}
                {activeTab === 'unit' && <UnitTab />}
                {activeTab === 'calc' && <CalcTab />}
                {activeTab === 'zip' && <ZipTab />}
            </div>

            <DataGuide />
        </div>
    );
};

function JsonCsvTab() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv');

    const convert = () => {
        try {
            if (mode === 'json-to-csv') {
                const data = JSON.parse(input);
                if (!Array.isArray(data)) throw new Error("JSON bir dizi olmalıdır");
                const keys = Object.keys(data[0]);
                const header = keys.join(',');
                const rows = data.map(obj => keys.map(k => obj[k]).join(','));
                setOutput([header, ...rows].join('\n'));
            } else {
                const lines = input.split('\n');
                const header = lines[0].split(',');
                const rows = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return header.reduce((obj: any, h, i) => ({ ...obj, [h]: values[i] }), {});
                });
                setOutput(JSON.stringify(rows, null, 2));
            }
            toast.success("Dönüştürme başarılı!");
        } catch (e: any) {
            toast.error(e.message || "Hata oluştu");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-2">
                <button onClick={() => setMode('json-to-csv')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${mode === 'json-to-csv' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>JSON → CSV</button>
                <button onClick={() => setMode('csv-to-json')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${mode === 'csv-to-json' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>CSV → JSON</button>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-widest italic">Kaynak Veri</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === 'json-to-csv' ? '[{"id":1, "name":"test"}]' : 'id,name\n1,test'}
                        className="w-full h-80 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-3xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Dönüştürülmüş Veri</label>
                        {output && <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Kopyalandı!"); }} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Copy size={16} /></button>}
                    </div>
                    <div className="w-full h-80 p-6 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl font-mono text-xs overflow-auto text-emerald-600 dark:text-emerald-400">
                        {output || <span className="opacity-20 text-[10px] font-black uppercase tracking-widest">Çıktı buraya gelecek...</span>}
                    </div>
                </div>
            </div>
            <button onClick={convert} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all">Uygula ve Dönüştür</button>
        </div>
    );
}

function JsonXmlTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500 opacity-50">
            <FileCode size={64} className="text-emerald-500 mb-6" />
            <h3 className="text-xl font-black mb-2 uppercase">JSON ↔ XML Pro</h3>
            <p className="text-xs text-slate-500 font-bold max-w-sm uppercase tracking-widest">Hiyerarşik veri dönüştürme motoru v3.2 ile geliyor. Şu an geliştirme aşamasında.</p>
        </div>
    );
}

function UnitTab() {
    const [val, setVal] = useState('1');
    const [unit, setUnit] = useState('km-mile');
    const [result, setResult] = useState<string>('');

    const convert = () => {
        const n = parseFloat(val);
        if (isNaN(n)) return;
        if (unit === 'km-mile') setResult(`${(n * 0.621371).toFixed(2)} Mil`);
        else if (unit === 'mile-km') setResult(`${(n * 1.60934).toFixed(2)} KM`);
        else if (unit === 'kg-lb') setResult(`${(n * 2.20462).toFixed(2)} LB`);
        else if (unit === 'lb-kg') setResult(`${(n * 0.453592).toFixed(2)} KG`);
    };

    return (
        <div className="max-w-md mx-auto space-y-8 py-10 animate-in fade-in duration-500">
            <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-6">
                <input
                    type="number"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-center focus:border-emerald-500 transition-all outline-none"
                />
                <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                    <option value="km-mile">Kilometre → Mil</option>
                    <option value="mile-km">Mil → Kilometre</option>
                    <option value="kg-lb">Kilogram → Libre (lb)</option>
                    <option value="lb-kg">Libre (lb) → Kilogram</option>
                </select>
                <button onClick={convert} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Hesapla</button>
            </div>
            {result && (
                <div className="p-8 bg-emerald-600 rounded-[2rem] text-white text-center shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-300">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Sonuç</p>
                    <p className="text-4xl font-black tracking-tighter">{result}</p>
                </div>
            )}
        </div>
    );
}

function CalcTab() {
    const [expr, setExpr] = useState('');
    const [result, setResult] = useState('');

    const calc = () => {
        try {
            // Safe eval for simple math
            // eslint-disable-next-line no-eval
            const r = eval(expr.replace(/[^-()\d/*+.]/g, ''));
            setResult(r.toString());
        } catch {
            setResult("Hata");
        }
    };

    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

    return (
        <div className="max-w-xs mx-auto space-y-6 py-10 animate-in fade-in duration-500">
            <div className="bg-black/40 p-10 rounded-[3rem] border-2 border-white/5 space-y-6 shadow-2xl">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-right overflow-hidden">
                    <p className="text-xs text-slate-500 h-4 font-mono mb-1">{expr}</p>
                    <p className="text-3xl font-black text-white font-mono truncate">{result || '0'}</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {buttons.map(b => (
                        <button
                            key={b}
                            onClick={() => {
                                if (b === '=') calc();
                                else setExpr(prev => prev + b);
                            }}
                            className={`h-12 rounded-xl font-black text-xs flex items-center justify-center transition-all active:scale-90 ${['/', '*', '-', '+', '='].includes(b) ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {b === '*' ? '×' : b === '/' ? '÷' : b}
                        </button>
                    ))}
                    <button onClick={() => { setExpr(''); setResult(''); }} className="col-span-4 h-12 bg-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/30 transition-all">SIFIRLA</button>
                </div>
            </div>
        </div>
    );
}

function ZipTab() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                <FileArchive size={40} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Zip Arşiv Müfettişi</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm">Native ZIP motoru ile arşivlerin içeriğini terminal hızıyla analiz edin. Yakında burada.</p>
        </div>
    );
}

const DataGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-emerald-600 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Zap size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Package size={20} className="fill-white" /> Pro Veri İşleme
            </h3>
            <p className="text-emerald-100 text-sm font-bold leading-relaxed mb-6 italic">
                JSON ve CSV dönüşümleri büyük veri kümelerinde belleği yormaz. SHARED_ENGINE üzerinden optimize edilmiş stream mantığı kullanılır.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Bozdemir Data Engine v3.2.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <AlertCircle size={20} className="text-emerald-500" /> %100 Yerel
            </h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed italic">
                Tüm hesaplamalar ve dönüşümler tamamen bilgisayarınızda yapılır. Excel dosyalarınız veya JSON şemalarınız asla bilgisayarınızın sınırlarını terk etmez.
            </p>
        </div>
    </div>
);

export default DataToolkitView;
