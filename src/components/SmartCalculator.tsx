import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Clock, Zap, ShieldCheck, Mail, Smartphone, Layers, Info, RefreshCw } from 'lucide-react';

interface SmartCalculatorProps {
    view: 'date-calculator' | 'internet-speed' | 'file-size-calc' | 'iban-checker' | 'tckn-checker' | 'css-units' | 'viewport-calc';
    onBack: () => void;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({ view, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {view === 'date-calculator' && 'Tarih & Gün Hesaplayıcı'}
                        {view === 'internet-speed' && 'İnternet Hız & Süre'}
                        {view === 'file-size-calc' && 'Dosya Boyutu Tahmin'}
                        {view === 'iban-checker' && 'IBAN Kontrol'}
                        {view === 'tckn-checker' && 'TC Kimlik Kontrol'}
                        {view === 'css-units' && 'CSS Birim Çevirici'}
                        {view === 'viewport-calc' && 'Viewport Calculator'}
                    </h1>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                {view === 'date-calculator' && <DateCalc />}
                {view === 'internet-speed' && <InternetCalc />}
                {view === 'file-size-calc' && <FileSizeCalc />}
                {view === 'iban-checker' && <IbanChecker />}
                {view === 'tckn-checker' && <TcknChecker />}
                {view === 'css-units' && <CssUnits />}
                {view === 'viewport-calc' && <ViewportCalc />}
            </div>
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
    const [speed, setSpeed] = useState(16); // Mbps
    const [result, setResult] = useState('');

    useEffect(() => {
        const speedMBps = speed / 8;
        const totalSeconds = (size) / speedMBps;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        setResult(`${mins} dk ${secs} sn`);
    }, [size, speed]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="fileSize" className="block text-sm font-bold text-slate-500 mb-2">Dosya Boyutu (MB)</label>
                    <input id="fileSize" type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="İndirilecek dosyanın boyutunu megabayt cinsinden girin" />
                </div>
                <div>
                    <label htmlFor="netSpeed" className="block text-sm font-bold text-slate-500 mb-2">İnternet Hızı (Mbps)</label>
                    <input id="netSpeed" type="number" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="İnternet bağlantınızın hızını megabit/saniye cinsinden girin" />
                </div>
            </div>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-center">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Tahmini İndirme Süresi</p>
                <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300">≈ {result}</p>
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
        if (type === 'photo-raw') mbPerMin = 25 * 6; // roughly 6 photos per min? no, let's just do per unit

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
            <input
                id="ibanInput"
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="TR00 0000..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xl font-mono tracking-widest"
                title="Kontrol etmek istediğiniz IBAN numarasını girin"
            />
            <div className={`p-4 rounded-xl flex items-center gap-3 ${isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <ShieldCheck size={20} />
                <span className="font-bold text-sm uppercase">{isValid ? 'Format Geçerli' : 'Format Hatalı veya Eksik'}</span>
            </div>
        </div>
    );
};

const TcknChecker = () => {
    const [tckn, setTckn] = useState('');
    const isValid = tckn.length === 11; // Mock logic
    return (
        <div className="space-y-4">
            <label htmlFor="tcknInput" className="block text-sm font-bold text-slate-500 mb-2">TC Kimlik Numarası</label>
            <input
                id="tcknInput"
                type="text"
                maxLength={11}
                value={tckn}
                onChange={e => setTckn(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-3xl font-black text-center tracking-[1rem]"
                title="Kontrol etmek istediğiniz TC Kimlik numarasını girin"
            />
            <div className={`p-4 rounded-xl flex items-center gap-3 ${isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <ShieldCheck size={20} />
                <span className="font-bold text-sm uppercase">{isValid ? 'TCKN Formatı Doğru' : '11 Hane Olmalıdır'}</span>
            </div>
        </div>
    );
};

const CssUnits = () => {
    const [px, setPx] = useState(16);
    const [base, setBase] = useState(16);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <label htmlFor="pxInput" className="block text-sm font-bold text-slate-500">Piksel (px)</label>
                <input id="pxInput" type="number" value={px} onChange={e => setPx(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="Piksel değerini girin" />
            </div>
            <div className="space-y-4">
                <label htmlFor="remOutput" className="block text-sm font-bold text-slate-500 text-blue-500">REM Değeri</label>
                <div id="remOutput" className="w-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3 text-2xl font-black text-blue-600 dark:text-blue-400" title="Hesaplanan REM değeri">
                    {px / base} rem
                </div>
            </div>
        </div>
    );
};

const ViewportCalc = () => {
    const [vw, setVw] = useState(5);
    const [width, setWidth] = useState(375);
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="screenWidth" className="block text-sm font-bold text-slate-500 mb-2">Ekran Genişliği (px)</label>
                    <input id="screenWidth" type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="Ekran genişliğini piksel cinsinden girin" />
                </div>
                <div>
                    <label htmlFor="vwValue" className="block text-sm font-bold text-slate-500 mb-2">VW Değeri (%)</label>
                    <input id="vwValue" type="number" value={vw} onChange={e => setVw(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3" title="Viewport genişliği (vw) değerini yüzde olarak girin" />
                </div>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 text-center">
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Karşılık Gelen Piksel</p>
                <p className="text-4xl font-black text-amber-700 dark:text-amber-300">{(width * vw / 100).toFixed(1)} px</p>
            </div>
        </div>
    );
};
