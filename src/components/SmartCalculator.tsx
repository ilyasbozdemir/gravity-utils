'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Clock, Zap, ShieldCheck, Mail, Smartphone, Layers, Info, RefreshCw, Type, Maximize2, Move, Layout, Box, Ruler, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, HelpCircle, Terminal, Code2, Rocket } from 'lucide-react';

interface SmartCalculatorProps {
    view: 'date-calculator' | 'internet-speed' | 'file-size-calc' | 'iban-checker' | 'tckn-checker' | 'css-units' | 'viewport-calc';
    onBack: () => void;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({ view, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        {view === 'date-calculator' && <><Clock className="text-blue-500" /> Tarih & Gün</>}
                        {view === 'internet-speed' && <><Zap className="text-amber-500" /> İnternet Hız</>}
                        {view === 'file-size-calc' && <><Box className="text-indigo-500" /> Dosya Boyutu</>}
                        {view === 'iban-checker' && <><ShieldCheck className="text-emerald-500" /> IBAN Kontrol</>}
                        {view === 'tckn-checker' && <><ShieldCheck className="text-rose-500" /> TC Kimlik</>}
                        {view === 'css-units' && <><Type className="text-indigo-500" /> CSS Studio</>}
                        {view === 'viewport-calc' && <><Maximize2 className="text-amber-500" /> Viewport Calc</>}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider uppercase opacity-70">
                        {view === 'css-units' ? 'Pixel, REM, EM ve Tailwind Profesyonel Çevirici' : 'Akıllı Hesaplama ve Doğrulama Araçları'}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                    {view === 'date-calculator' && <DateCalc />}
                    {view === 'internet-speed' && <InternetCalc />}
                    {view === 'file-size-calc' && <FileSizeCalc />}
                    {view === 'iban-checker' && <IbanChecker />}
                    {view === 'tckn-checker' && <TcknChecker />}
                    {view === 'css-units' && <CssUnits />}
                    {view === 'viewport-calc' && <ViewportCalc />}
                </div>
            </div>

            <CalculatorGuide view={view} />
        </div>
    );
};

// --- Sub-Components ---

const DateCalc = () => {
    const [date1, setDate1] = useState('');
    const [date2, setDate2] = useState('');
    const [days, setDays] = useState<number | null>(null);

    useEffect(() => {
        if (date1 && date2) {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diff = Math.abs(d2.getTime() - d1.getTime());
            setDays(Math.ceil(diff / (1000 * 3600 * 24)));
        }
    }, [date1, date2]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="date1" className="block text-sm font-bold text-slate-500 mb-2">Başlangıç Tarihi</label>
                    <input id="date1" type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500" title="Başlangıç tarihini seçin" />
                </div>
                <div>
                    <label htmlFor="date2" className="block text-sm font-bold text-slate-500 mb-2">Bitiş Tarihi</label>
                    <input id="date2" type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500" title="Bitiş tarihini seçin" />
                </div>
            </div>
            {days !== null && (
                <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 text-center">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Toplam Gün Sayısı</p>
                    <p className="text-4xl font-black text-blue-700 dark:text-blue-300">{days} Gün</p>
                </div>
            )}
        </div>
    );
};

const InternetCalc = () => {
    const [size, setSize] = useState(100); // MB
    const [unit, setUnit] = useState<'MB' | 'GB'>('MB');
    const [speed, setSpeed] = useState(16); // Mbps
    const [mode, setMode] = useState<'download' | 'upload'>('download');
    const [ping, setPing] = useState(20);
    const [jitter, setJitter] = useState(2);

    const calculateTime = () => {
        const sizeInMB = unit === 'GB' ? size * 1024 : size;
        const speedMBps = speed / 8;
        const totalSeconds = sizeInMB / speedMBps;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = Math.floor(totalSeconds % 60);
        if (hours > 0) return `${hours} sa ${mins} dk ${secs} sn`;
        return `${mins} dk ${secs} sn`;
    };

    const getQualityLabel = () => {
        if (ping < 30 && jitter < 5) return { label: 'Mükemmel', color: 'text-emerald-500', desc: 'Oyun ve yayın için ideal.' };
        if (ping < 60 && jitter < 15) return { label: 'İyi', color: 'text-blue-500', desc: 'Standart kullanım için sorunsuz.' };
        if (ping < 100 && jitter < 30) return { label: 'Orta', color: 'text-amber-500', desc: 'Gecikmeler hissedilebilir.' };
        return { label: 'Kötü', color: 'text-rose-500', desc: 'Bağlantıda kopmalar/donmalar olabilir.' };
    };

    const quality = getQualityLabel();

    return (
        <div className="space-y-8">
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit mx-auto">
                <button onClick={() => setMode('download')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'download' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>İndirme (Download)</button>
                <button onClick={() => setMode('upload')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'upload' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Yükleme (Upload)</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label htmlFor="fileSizeInput" className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Dosya Boyutu</label>
                    <div className="flex gap-2">
                        <input id="fileSizeInput" title="Dosya Boyutu" placeholder="100" type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500" />
                        <select id="sizeUnitSelect" title="Boyut Birimi" value={unit} onChange={e => setUnit(e.target.value as any)} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold">
                            <option value="MB">MB</option>
                            <option value="GB">GB</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <label htmlFor="speedInput" className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Hız (Mbps)</label>
                    <input id="speedInput" title="İnternet Hızı (Mbps)" placeholder="16" type="number" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500" />
                </div>
            </div>
            <div className="p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 text-center">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Tahmini {mode === 'download' ? 'İndirme' : 'Yükleme'} Süresi</p>
                <p className="text-5xl font-black text-emerald-700 dark:text-emerald-300">≈ {calculateTime()}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" /> Gecikme Analizi (Ping & Jitter)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="pingInput" className="text-[10px] font-bold text-slate-500 uppercase">Ping (ms)</label>
                            <input id="pingInput" title="Ping Değeri (ms)" placeholder="20" type="number" value={ping} onChange={e => setPing(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="jitterInput" className="text-[10px] font-bold text-slate-500 uppercase">Jitter (ms)</label>
                            <input id="jitterInput" title="Jitter Değeri (ms)" placeholder="2" type="number" value={jitter} onChange={e => setJitter(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col justify-center border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">Durum:</span>
                        <span className={`text-sm font-black ${quality.color} uppercase`}>{quality.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{quality.desc}</p>
                </div>
            </div>
        </div>
    );
};

const FileSizeCalc = () => {
    const [type, setType] = useState('video-4k');
    const [duration, setDuration] = useState(10); // dk
    const [result, setResult] = useState('');
    useEffect(() => {
        let mbPerMin = 0;
        if (type === 'video-4k') mbPerMin = 350;
        if (type === 'video-1080p') mbPerMin = 130;
        if (type === 'audio-high') mbPerMin = 2;
        const total = mbPerMin * duration;
        setResult(total > 1024 ? `${(total / 1024).toFixed(2)} GB` : `${total} MB`);
    }, [type, duration]);
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="contentType" className="block text-sm font-bold text-slate-500 mb-2">İçerik Tipi</label>
                    <select id="contentType" value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="Hesaplanacak içeriğin tipini seçin">
                        <option value="video-4k">Video (4K)</option>
                        <option value="video-1080p">Video (1080p)</option>
                        <option value="audio-high">Ses (Yüksek Kalite)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="minDuration" className="block text-sm font-bold text-slate-500 mb-2">Süre (Dakika)</label>
                    <input id="minDuration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="İçeriğin süresini dakika cinsinden girin" />
                </div>
            </div>
            <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-center">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Tahmini Dosya Boyutu</p>
                <p className="text-4xl font-black text-indigo-700 dark:text-indigo-300">≈ {result}</p>
                <p className="mt-2 text-[10px] text-slate-400 italic">Gmail limiti (25MB) için {Number(result.split(' ')[0]) > 25 ? 'UYGUN DEĞİL' : 'UYGUN'}</p>
            </div>
        </div>
    );
};

const IbanChecker = () => {
    const [iban, setIban] = useState('');
    const isValid = iban.replace(/\s/g, '').length >= 15; // Mock logic
    return (
        <div className="space-y-4">
            <label htmlFor="ibanInput" className="block text-sm font-bold text-slate-500 mb-2">IBAN Numarası</label>
            <input id="ibanInput" type="text" value={iban} onChange={e => setIban(e.target.value)} placeholder="TR00 0000..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xl font-mono tracking-widest" title="IBAN girin" />
            <div className={`p-4 rounded-xl flex items-center gap-3 ${isValid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                <ShieldCheck size={20} />
                <span className="font-bold text-sm uppercase">{isValid ? 'Format Geçerli' : 'Format Hatalı veya Eksik'}</span>
            </div>
        </div>
    );
};

const TcknChecker = () => {
    const [tckn, setTckn] = useState('');
    const [status, setStatus] = useState<{ isValid: boolean; message: string; steps?: any }>({ isValid: false, message: '11 hane girmelisiniz' });
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (tckn.length === 11) {
            const digits = tckn.split('').map(Number);
            const steps: any = {};

            if (digits[0] === 0) {
                setStatus({ isValid: false, message: 'İlk hane 0 olamaz' });
                return;
            }

            const oddDigits = [digits[0], digits[2], digits[4], digits[6], digits[8]];
            const evenDigits = [digits[1], digits[3], digits[5], digits[7]];

            const oddSum = oddDigits.reduce((a, b) => a + b, 0);
            const evenSum = evenDigits.reduce((a, b) => a + b, 0);

            let tenthDigit = ((oddSum * 7) - evenSum) % 10;
            if (tenthDigit < 0) tenthDigit += 10;

            steps.oddSum = oddSum;
            steps.oddDigits = oddDigits;
            steps.evenSum = evenSum;
            steps.evenDigits = evenDigits;
            steps.calculatedTenth = tenthDigit;
            steps.actualTenth = digits[9];

            if (tenthDigit !== digits[9]) {
                setStatus({ isValid: false, message: '10. Hane Algoritma Hatası', steps });
                return;
            }

            const firstTenSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
            const calculatedEleventh = firstTenSum % 10;

            steps.firstTenSum = firstTenSum;
            steps.calculatedEleventh = calculatedEleventh;
            steps.actualEleventh = digits[10];

            if (calculatedEleventh !== digits[10]) {
                setStatus({ isValid: false, message: '11. Hane Algoritma Hatası', steps });
                return;
            }

            setStatus({ isValid: true, message: 'TCKN Algoritması Doğrulandı', steps });
        } else {
            setStatus({ isValid: false, message: '11 hane girmelisiniz' });
        }
    }, [tckn]);

    return (
        <div className="space-y-8 text-left">
            <div className="space-y-4">
                <div className="relative group">
                    <input
                        id="tcknInput"
                        type="text"
                        maxLength={11}
                        value={tckn}
                        onChange={e => setTckn(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 text-5xl font-black text-center tracking-[1rem] outline-none focus:border-rose-500/50 transition-all font-mono placeholder:opacity-20 translate-z-0"
                        title="TCKN girin"
                        placeholder="00000000000"
                    />
                    <div className="absolute -bottom-2 right-8 px-4 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity">
                        Secure Client-Side Analysis
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${status.isValid
                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200/50 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${status.isValid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse'}`}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <span className="font-black text-lg uppercase tracking-tight block leading-none mb-1">{status.isValid ? 'Doğrulama Başarılı' : 'Bekleniyor'}</span>
                            <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest leading-none">{status.message}</span>
                        </div>
                    </div>
                    {tckn.length === 11 && (
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${showAdvanced
                                ? 'bg-slate-900 text-white scale-95'
                                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg'}`}
                        >
                            {showAdvanced ? 'Gizle' : 'Algoritmayı Gör'}
                        </button>
                    )}
                </div>
            </div>

            {showAdvanced && status.steps && (
                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Terminal size={120} />
                    </div>

                    <div className="relative z-10">
                        <h4 className="text-[11px] font-black uppercase text-rose-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Code2 size={16} /> Teknik Doğrulama Adımları
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Step 1: 10th Digit */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px]">1</span>
                                    10. Hane Analizi
                                </div>
                                <div className="p-5 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-slate-500">Tek Haneler (1,3,5,7,9)</span>
                                            <span className="text-rose-500 font-black">{status.steps.oddSum}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {status.steps.oddDigits.map((d: number, i: number) => (
                                                <div key={i} className="flex-1 h-6 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[10px] font-black text-rose-600">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-slate-500">Çift Haneler (2,4,6,8)</span>
                                            <span className="text-indigo-500 font-black">{status.steps.evenSum}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {status.steps.evenDigits.map((d: number, i: number) => (
                                                <div key={i} className="flex-1 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                    {d}
                                                </div>
                                            ))}
                                            <div className="flex-1 h-6 rounded-md bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                -
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-mono text-slate-400 mb-1">Formül: ((Tek × 7) - Çift) % 10</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black">
                                                ({status.steps.oddSum} × 7) - {status.steps.evenSum} =
                                                <span className={status.steps.calculatedTenth === status.steps.actualTenth ? 'text-emerald-500' : 'text-rose-500'}> {status.steps.calculatedTenth}</span>
                                            </p>
                                            {status.steps.calculatedTenth === status.steps.actualTenth && (
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black animate-bounce">Match!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: 11th Digit */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px]">2</span>
                                    11. Hane Analizi
                                </div>
                                <div className="p-5 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 text-left">
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-500">İlk 10 Hane Toplamı:</span>
                                        <span className="text-rose-500">{status.steps.firstTenSum}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-mono text-slate-400 mb-1">Formül: (Toplam) % 10</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black">
                                                {status.steps.firstTenSum} % 10 =
                                                <span className={status.steps.calculatedEleventh === status.steps.actualEleventh ? 'text-emerald-500' : 'text-rose-500'}> {status.steps.calculatedEleventh}</span>
                                            </p>
                                            {status.steps.calculatedEleventh === status.steps.actualEleventh && (
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black animate-bounce">Match!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Digit Map */}
                        <div className="mt-8 space-y-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Layers size={14} /> Canlı Hane Haritası
                            </h5>
                            <div className="flex flex-nowrap gap-1 overflow-x-auto pb-4 no-scrollbar">
                                {tckn.split('').map((digit, i) => {
                                    const isOdd = (i + 1) % 2 !== 0 && i < 9;
                                    const isEven = (i + 1) % 2 === 0 && i < 9;
                                    const isTenth = i === 9;
                                    const isEleventh = i === 10;

                                    return (
                                        <div key={i} className="flex-1 min-w-[32px] space-y-2 group">
                                            <div className="text-center text-[9px] font-bold text-slate-400 group-hover:text-rose-500 transition-colors">
                                                {i + 1}.
                                            </div>
                                            <div className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${isOdd ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 ring-4 ring-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                    isEven ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 ring-4 ring-indigo-500/5 shadow-[0_0_10px_rgba(99,102,241,0.1)]' :
                                                        isTenth ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' :
                                                            isEleventh ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' :
                                                                'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                                                }`}>
                                                {digit}
                                            </div>
                                            <div className="text-center h-4 flex flex-col items-center">
                                                {isOdd && <span className="text-[8px] font-black text-rose-500/60 uppercase">TEK</span>}
                                                {isEven && <span className="text-[8px] font-black text-indigo-500/60 uppercase">ÇİFT</span>}
                                                {isTenth && <span className="text-[8px] font-black text-emerald-500 uppercase">10.</span>}
                                                {isEleventh && <span className="text-[8px] font-black text-amber-500 uppercase">11.</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
                            <Info size={16} className="text-indigo-500 mt-1 shrink-0" />
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                "Bu doğrulama süreci tamamen matematikseldir. Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü standart algoritması baz alınarak <strong>%100 güvenli ve anonim</strong> olarak cihazınızda gerçekleştirilmiştir."
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- CSS STUDIO (Master Units) ---

const CssUnits = () => {
    // Bases
    const [rootBase, setRootBase] = useState(16); // rem foundation
    const [parentBase, setParentBase] = useState(16); // em foundation

    // Values
    const [px, setPx] = useState<string>('16');
    const [rem, setRem] = useState<string>('1');
    const [em, setEm] = useState<string>('1');
    const [tw, setTw] = useState<string>('4');
    const [pt, setPt] = useState<string>('12');

    const [lastSource, setLastSource] = useState<'px' | 'rem' | 'em' | 'tw' | 'pt'>('px');

    const format = (num: number) => {
        if (isNaN(num)) return '';
        return parseFloat(num.toFixed(4)).toString();
    };

    // 1 pt = 1.333 px (usually on 96dpi)
    const PT_FACTOR = 1.3333;

    const updateAll = (val: number, source: 'px' | 'rem' | 'em' | 'tw' | 'pt', rB: number, pB: number) => {
        let pixels = 0;

        // Step 1: Normalize everything to pixels
        if (source === 'px') pixels = val;
        if (source === 'rem') pixels = val * rB;
        if (source === 'em') pixels = val * pB;
        if (source === 'tw') pixels = val * (rB / 4);
        if (source === 'pt') pixels = val * PT_FACTOR;

        // Step 2: Update all states except the source
        if (source !== 'px') setPx(format(pixels));
        if (source !== 'rem') setRem(format(pixels / rB));
        if (source !== 'em') setEm(format(pixels / pB));
        if (source !== 'tw') setTw(format(pixels / (rB / 4)));
        if (source !== 'pt') setPt(format(pixels / PT_FACTOR));

        setLastSource(source);
    };

    const handleRootBaseChange = (newBase: number) => {
        const b = Math.max(1, newBase);
        setRootBase(b);
        // Anchor calculation to the last source or px
        const currentPx = lastSource === 'px' ? Number(px) :
            lastSource === 'rem' ? Number(rem) * rootBase :
                lastSource === 'em' ? Number(em) * parentBase :
                    lastSource === 'pt' ? Number(pt) * PT_FACTOR :
                        Number(tw) * (rootBase / 4);
        updateAll(currentPx, 'px', b, parentBase);
    };

    const handleParentBaseChange = (newBase: number) => {
        const b = Math.max(1, newBase);
        setParentBase(b);
        const currentPx = lastSource === 'px' ? Number(px) :
            lastSource === 'rem' ? Number(rem) * rootBase :
                lastSource === 'em' ? Number(em) * parentBase :
                    lastSource === 'pt' ? Number(pt) * PT_FACTOR :
                        Number(tw) * (rootBase / 4);
        updateAll(currentPx, 'px', rootBase, b);
    };

    return (
        <div className="space-y-10">
            {/* Base Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 transition-all hover:border-indigo-500/30">
                    <div className="p-3 bg-white dark:bg-black/20 rounded-2xl text-indigo-500 shadow-sm"><Info size={20} /></div>
                    <div className="flex-1 text-left">
                        <label htmlFor="rootBase" className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-0.5">Root Font Size (REM)</label>
                        <div className="flex items-center gap-2">
                            <input id="rootBase" type="number" value={rootBase} onChange={e => handleRootBaseChange(Number(e.target.value))} className="bg-transparent font-black text-2xl text-slate-800 dark:text-white focus:outline-none w-20" title="Root Base" />
                            <span className="text-sm font-bold text-slate-400">px</span>
                        </div>
                    </div>
                </div>

                <div className="group flex items-center gap-4 p-4 bg-sky-50 dark:bg-sky-500/5 rounded-3xl border border-sky-100 dark:border-sky-500/10 transition-all hover:border-sky-500/30">
                    <div className="p-3 bg-white dark:bg-black/20 rounded-2xl text-sky-500 shadow-sm"><Layers size={20} /></div>
                    <div className="flex-1 text-left">
                        <label htmlFor="parentBase" className="text-[10px] font-black uppercase text-sky-400 tracking-widest block mb-0.5">Parent Font Size (EM)</label>
                        <div className="flex items-center gap-2">
                            <input id="parentBase" type="number" value={parentBase} onChange={e => handleParentBaseChange(Number(e.target.value))} className="bg-transparent font-black text-2xl text-slate-800 dark:text-white focus:outline-none w-20" title="Parent Base" />
                            <span className="text-sm font-bold text-slate-400">px</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Converter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <UnitBox label="Pixels" value={px} unit="px" color="indigo" icon={<Move size={18} />} onChange={v => { setPx(v); updateAll(Number(v), 'px', rootBase, parentBase); }} />
                <UnitBox label="Root EM" value={rem} unit="rem" color="purple" icon={<Type size={18} />} onChange={v => { setRem(v); updateAll(Number(v), 'rem', rootBase, parentBase); }} />
                <UnitBox label="Element EM" value={em} unit="em" color="sky" icon={<Box size={18} />} onChange={v => { setEm(v); updateAll(Number(v), 'em', rootBase, parentBase); }} />
                <UnitBox label="Tailwind" value={tw} unit="tw" color="cyan" icon={<Terminal size={18} />} prefix="w-" onChange={v => { setTw(v); updateAll(Number(v), 'tw', rootBase, parentBase); }} />
                <UnitBox label="Points" value={pt} unit="pt" color="amber" icon={<Ruler size={18} />} onChange={v => { setPt(v); updateAll(Number(v), 'pt', rootBase, parentBase); }} />

                {/* Visual Preview */}
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Görsel Önizleme</p>
                    <div className="flex-1 flex items-center justify-center w-full">
                        <div
                            style={{ width: `${Math.min(200, Number(px))}px`, height: `${Math.min(100, Number(px))}px` }}
                            className="bg-indigo-500/20 border-2 border-indigo-500 rounded-xl transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-indigo-500"
                        >
                            {Math.round(Number(px))}px
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 italic">Boyut: {px}px x {px}px</p>
                </div>
            </div>

            {/* Smart Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 text-left relative group">
                    <Rocket className="absolute top-4 right-4 text-indigo-500/20 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white mb-3">Masterclass: REM vs EM</h4>
                    <ul className="space-y-2">
                        <li className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span><strong>REM:</strong> Root HTML font size\'ına bağlıdır. Responsive genel fontlar için en sağlıklısıdır.</span>
                        </li>
                        <li className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-sky-500 font-bold">•</span>
                            <span><strong>EM:</strong> Bulunduğu elementin parent font size\'ına bağlıdır. Padding ve margin için lokal ölçekleme sağlar.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 text-left relative group">
                    <Code2 className="absolute top-4 right-4 text-emerald-500/20 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white mb-3">Tailwind Notu</h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "Tailwind spacing sistemi standart olarak <strong>1 birim = 4px</strong> (0.25rem) kuralına dayanır. CSS\'e dökerken <code>w-{tw}</code> yazdığınızda tarayıcı bunu <code>{px}px</code> olarak yorumlar."
                    </p>
                </div>
            </div>
        </div>
    );
};

const UnitBox = ({ label, value, unit, color, icon, prefix, onChange }: {
    label: string, value: string, unit: string, color: string, icon: React.ReactNode, prefix?: string, onChange: (v: string) => void
}) => {
    return (
        <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">{label}</label>
            <div className={`flex flex-col p-6 rounded-[2rem] bg-white dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 transition-all focus-within:border-${color}-500/50 shadow-sm hover:shadow-md h-full`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500`}>{icon}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{unit}</span>
                </div>
                <div className="flex items-baseline gap-1">
                    {prefix && <span className="text-2xl font-black text-slate-300 dark:text-slate-600">{prefix}</span>}
                    <input
                        type="number"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-transparent text-3xl font-black text-slate-800 dark:text-white focus:outline-none"
                        title={label}
                    />
                </div>
            </div>
        </div>
    );
};

const ViewportCalc = () => {
    const [vw, setVw] = useState<string>('5');
    const [width, setWidth] = useState<string>('375');
    const [px, setPx] = useState<string>('18.8');
    const [lastSource, setLastSource] = useState<'vw' | 'px'>('vw');
    const format = (num: number) => { if (isNaN(num)) return ''; return parseFloat(num.toFixed(2)).toString(); };
    const updateAll = (val: number, source: 'vw' | 'px', w: number) => {
        if (source === 'vw') setPx(format((w * val) / 100));
        else setVw(format((val / w) * 100));
        setLastSource(source);
    };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left">
                    <label htmlFor="screenWidth" className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Ekran Genişliği (px)</label>
                    <input id="screenWidth" type="number" value={width} onChange={e => { const w = Number(e.target.value); setWidth(e.target.value); if (lastSource === 'vw') updateAll(Number(vw), 'vw', w); else updateAll(Number(px), 'px', w); }} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="Ekran" />
                </div>
                <div className="text-left">
                    <label htmlFor="vwValue" className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">VW Değeri (%)</label>
                    <div className="relative">
                        <input id="vwValue" type="number" value={vw} onChange={e => { setVw(e.target.value); updateAll(Number(e.target.value), 'vw', Number(width)); }} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="VW" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                </div>
            </div>
            <div className="p-8 bg-amber-50 dark:bg-amber-500/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-500/20 text-center relative overflow-hidden group">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Piksel Karşılığı</p>
                <div className="flex items-center justify-center gap-2">
                    <input type="number" value={px} onChange={e => { setPx(e.target.value); updateAll(Number(e.target.value), 'px', Number(width)); }} className="bg-transparent text-5xl font-black text-amber-700 dark:text-amber-300 w-48 text-center outline-none" title="Piksel" />
                    <span className="text-2xl font-black text-amber-600/50">px</span>
                </div>
            </div>
        </div>
    );
};

const CalculatorGuide = ({ view }: { view: SmartCalculatorProps['view'] }) => {
    const guides: any = {
        'css-units': {
            title: 'CSS Studio & Birim Rehberi',
            content: [
                { q: 'REM ve EM arasındaki fark nedir?', a: 'REM (Root EM) sadece ana font büyüklüğüne bağlıyken, EM bulunduğu kabın font büyüklüğüne göre ölçeklenir.' },
                { q: 'Tailwind spacing nasıl çalışır?', a: 'Tailwind varsayılan olarak her 1 birim için 0.25rem (4px) kuralını kullanır. w-4 demek 16px demektir.' }
            ],
            tip: 'Responsive projelerde REM kullanmak, kullanıcı tarayıcı fontunu büyüttüğünde tasarımın düzgün ölçeklenmesini sağlar.',
            tipIcon: <Type size={20} />
        },
        'viewport-calc': {
            title: 'Viewport Rehberi',
            content: [
                { q: 'VW neden kullanılır?', a: 'Tipografinin veya bir görselin daima ekrana göre % oranında kalmasını sağlar.' },
                { q: 'Pikselden VW\'ye geçiş?', a: 'Tasarımınız 375px iken bir butonu 37.5px yaptıysanız, VW karşılığı %10 olacaktır.' }
            ],
            tip: 'Genellikle 100vw, scrollbar dahil genişliği kapsar. Tasarımlarda taşma olmamasına dikkat edin.',
            tipIcon: <Smartphone size={20} />
        }
    };
    const guide = guides[view] || { title: 'Hesaplayıcı Rehberi', content: [], tip: '', tipIcon: <Info size={20} /> };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 pb-10">
            <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2"><Info size={20} className="text-blue-600 dark:text-blue-400" /> {guide.title}</h3>
                <div className="space-y-4 text-left">
                    {guide.content.map((item: any, i: number) => (
                        <details key={i} className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400">{item.q}<span>↓</span></summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">{guide.tipIcon}</div>
                <h3 className="text-lg font-black flex items-center gap-2"><Zap size={20} /> Uzman İpucu</h3>
                <p className="text-indigo-50 text-sm leading-relaxed">{guide.tip}</p>
            </div>
        </div>
    );
};
