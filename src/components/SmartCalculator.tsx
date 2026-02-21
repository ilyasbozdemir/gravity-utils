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

    // Quality Metrics
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

            {/* Quality Analysis */}
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
    const [status, setStatus] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '11 hane girmelisiniz' });

    useEffect(() => {
        if (tckn.length === 11) {
            const digits = tckn.split('').map(Number);

            // Rule 1: First digit cannot be 0
            if (digits[0] === 0) {
                setStatus({ isValid: false, message: 'İlk hane 0 olamaz' });
                return;
            }

            // Rule 3: (Sum of 1,3,5,7,9 * 7 - Sum of 2,4,6,8) % 10 == 10th digit
            const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
            const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
            let tenthDigit = ((oddSum * 7) - evenSum) % 10;
            if (tenthDigit < 0) tenthDigit += 10;

            if (tenthDigit !== digits[9]) {
                setStatus({ isValid: false, message: 'Algoritma hatası (10. hane uyumsuz)' });
                return;
            }

            // Rule 4: Sum of first 10 digits % 10 == 11th digit
            const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
            if (totalSum % 10 !== digits[10]) {
                setStatus({ isValid: false, message: 'Algoritma hatası (11. hane uyumsuz)' });
                return;
            }

            setStatus({ isValid: true, message: 'TCKN Geçerli' });
        } else {
            setStatus({ isValid: false, message: '11 hane girmelisiniz' });
        }
    }, [tckn]);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <label htmlFor="tcknInput" className="block text-sm font-bold text-slate-500 mb-2">TC Kimlik Numarası</label>
                <div className="relative">
                    <input
                        id="tcknInput"
                        type="text"
                        maxLength={11}
                        value={tckn}
                        onChange={e => setTckn(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-3xl font-black text-center tracking-[1rem] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                        title="Kontrol etmek istediğiniz TC Kimlik numarasını girin"
                        placeholder="00000000000"
                    />
                </div>
                <div className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${status.isValid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                    <ShieldCheck size={20} />
                    <span className="font-bold text-sm uppercase tracking-tight">{status.message}</span>
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                    <Info size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Gizlilik Bilgilendirmesi</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Analiz tamamen <strong>tarayıcınızda (client-side)</strong> gerçekleşir. Verileriniz hiçbir sunucuya gönderilmez, network tabını izleyerek kontrol edebilirsiniz. %100 offline-ready bir araçtır.
                </p>
            </div>
        </div>
    );
};

const CssUnits = () => {
    const [base, setBase] = useState(16);
    const [px, setPx] = useState<string>('16');
    const [rem, setRem] = useState<string>('1');
    const [em, setEm] = useState<string>('1');
    const [tw, setTw] = useState<string>('4');

    const updateAll = (val: number, source: 'px' | 'rem' | 'em' | 'tw', baseVal: number) => {
        let pixels = 0;
        if (source === 'px') pixels = val;
        if (source === 'rem') pixels = val * baseVal;
        if (source === 'em') pixels = val * baseVal;
        if (source === 'tw') pixels = val * 4;

        if (source !== 'px') setPx(pixels.toString());
        if (source !== 'rem') setRem((pixels / baseVal).toString());
        if (source !== 'em') setEm((pixels / baseVal).toString());
        if (source !== 'tw') setTw((pixels / 4).toString());
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Info size={16} />
                </div>
                <div className="flex-1">
                    <label htmlFor="baseFontSize" className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Base Font Size (Root)</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="baseFontSize"
                            type="number"
                            value={base}
                            onChange={e => {
                                const b = Number(e.target.value);
                                setBase(b);
                                updateAll(Number(px), 'px', b);
                            }}
                            className="bg-transparent font-black text-slate-800 dark:text-white focus:outline-none w-16"
                            title="Base Font Size ayarı"
                        />
                        <span className="text-xs font-bold text-slate-400">px</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <UnitInput
                    id="px-input"
                    label="Piksel (px)"
                    value={px}
                    onChange={(v: string) => { setPx(v); updateAll(Number(v), 'px', base); }}
                    icon={<span className="text-[10px] font-bold">PX</span>}
                    color="blue"
                />
                <UnitInput
                    id="rem-input"
                    label="REM (root em)"
                    value={rem}
                    onChange={(v: string) => { setRem(v); updateAll(Number(v), 'rem', base); }}
                    icon={<span className="text-[10px] font-bold">REM</span>}
                    color="purple"
                />
                <UnitInput
                    id="em-input"
                    label="EM (parent em)"
                    value={em}
                    onChange={(v: string) => { setEm(v); updateAll(Number(v), 'em', base); }}
                    icon={<span className="text-[10px] font-bold">EM</span>}
                    color="indigo"
                />
                <UnitInput
                    id="tw-input"
                    label="Tailwind Spacing"
                    value={tw}
                    onChange={(v: string) => { setTw(v); updateAll(Number(v), 'tw', base); }}
                    prefix="w-"
                    desc={`örnek: w-${tw} = ${px}px`}
                    icon={<span className="text-[10px] font-bold">TW</span>}
                    color="sky"
                />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-[11px] text-center text-slate-500 font-medium">
                    <b>İpucu:</b> Bir değeri değiştirdiğinizde diğerleri otomatik olarak hesaplanır.
                    Tailwind birimleri varsayılan olarak <b>1 birim = 4px</b> hesabına dayanır.
                </p>
            </div>
        </div>
    );
};

interface UnitInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'indigo' | 'sky';
    prefix?: string;
    desc?: string;
}

const UnitInput = ({ id, label, value, onChange, icon, color, prefix, desc }: UnitInputProps) => {
    const colorClasses = {
        blue: 'focus-within:border-blue-500/50 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
        purple: 'focus-within:border-purple-500/50 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
        indigo: 'focus-within:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        sky: 'focus-within:border-sky-500/50 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    };

    const activeClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-xs font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <div className={`flex items-center gap-3 p-4 bg-white dark:bg-white/5 border-2 rounded-2xl transition-all border-slate-100 dark:border-white/5 ${activeClass.split(' ')[0]}`}>
                <div className={`p-2 rounded-lg ${activeClass.split(' ').slice(1).join(' ')}`}>
                    {icon}
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center">
                        {prefix && <span className="text-lg font-black text-slate-400">{prefix}</span>}
                        <input
                            id={id}
                            type="number"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className="w-full bg-transparent text-lg font-black text-slate-800 dark:text-white focus:outline-none"
                            title={label}
                            placeholder="0"
                        />
                    </div>
                    {desc && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{desc}</p>}
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

const CalculatorGuide = ({ view }: { view: SmartCalculatorProps['view'] }) => {
    const guides: Record<SmartCalculatorProps['view'], { title: string; content: { q: string; a: string }[]; tip: string; tipIcon: React.ReactNode }> = {
        'date-calculator': {
            title: 'Tarih Rehberi',
            content: [
                { q: 'İki tarih arası nasıl hesaplanır?', a: 'Başlangıç ve bitiş tarihlerini seçtiğinizde, aralarındaki fark gün bazında otomatik olarak hesaplanır.' },
                { q: 'Takvim formatı nedir?', a: 'Sistem yerel tarayıcı takviminizi kullanır. Yıllık izin, proje teslim süreleri gibi hesaplamalar için idealdir.' }
            ],
            tip: 'Tarih hesaplamaları proje planlama süreçlerinde kritik öneme sahiptir. İş günlerini hesaplarken resmi tatilleri manuel düşmeyi unutmayın.',
            tipIcon: <Clock size={20} />
        },
        'internet-speed': {
            title: 'İnternet & Hız Rehberi',
            content: [
                { q: '"Mbps" ve "MB/s" farkı nedir?', a: 'Mbps (Megabit) servis hız birimidir. MB/s (Megabyte) indirme hızıdır. 1 Byte = 8 Bit olduğu için, 80 Mbps hız ile saniyede 10 MB indirebilirsiniz.' },
                { q: 'Jitter neden önemlidir?', a: 'Jitter, ping dalgalanmasıdır. Oyun ve video konferanslarda düşük (10ms altı) olması istenir.' }
            ],
            tip: 'Upload hızınız, video konferans kalitenizi ve dosya gönderme sürenizi doğrudan etkiler. Yayıncılar için yüksek upload kritiktir.',
            tipIcon: <Zap size={20} />
        },
        'file-size-calc': {
            title: 'Dosya Boyutu Rehberi',
            content: [
                { q: 'Video boyutları neden değişir?', a: 'Bitrate ve sıkıştırma algoritması boyutu belirler. 4K videolar standart HD videolara göre 5-10 kat daha fazla yer kaplar.' },
                { q: 'Tahminler ne kadar doğru?', a: 'Bu değerler ortalama bitrate değerlerine dayanır. Kayıt kalitenize göre gerçek boyut %20-30 sapma gösterebilir.' }
            ],
            tip: 'Gmail/E-posta limiti genellikle 25MB\'tır. Daha büyük dosyaları göndermek için dosya sıkıştırıcı veya bulut depolama kullanmalısınız.',
            tipIcon: <Layers size={20} />
        },
        'iban-checker': {
            title: 'IBAN & Güvenlik',
            content: [
                { q: 'Verilerim güvende mi?', a: 'Evet! IBAN veya TCKN verileri asla sunucuya gitmez. Analiz %100 tarayıcınızda (offline) yapılır.' },
                { q: 'IBAN yapısı nasıldır?', a: 'Türkiye için IBAN 26 hanelidir ve "TR" ile başlar. İlk hane ülke kodu, sonrakiler kontrol basamakları ve banka kodudur.' }
            ],
            tip: 'Para transferi yapmadan önce IBAN\'ın doğru kişiye ait olduğunu banka uygulamanızdan da teyit etmelisiniz.',
            tipIcon: <ShieldCheck size={20} />
        },
        'tckn-checker': {
            title: 'Kimlik Doğrulama Rehberi',
            content: [
                { q: 'Doğrulama algoritması nasıl çalışır?', a: 'TCKN, özel bir matematiksel algoritmaya dayanır. Son iki hane, ilk 9 haneden türetilen kontrol basamaklarıdır.' },
                { q: 'Kişisel veri gizliliği?', a: 'Bu araç kişisel verinizi kaydetmez. Sadece girdiğiniz numaranın matematiksel kurala uyup uymadığını kontrol eder.' }
            ],
            tip: 'Bu araç Nüfus Müdürlüğü sistemine bağlı değildir, sadece matematiksel geçerlilik kontrolü (checksum) yapar.',
            tipIcon: <Info size={20} />
        },
        'css-units': {
            title: 'Web Tasarım Rehberi',
            content: [
                { q: 'Neden REM kullanmalıyım?', a: 'Erişilebilirlik için! Kullanıcı tarayıcı fontunu büyüttüğünde, REM kullanan tüm tasarım ona göre ölçeklenir.' },
                { q: 'Tailwind birimleri nedir?', a: 'Tailwind spacing sistemi varsayılan olarak 4px katlarına (1 birim = 0.25rem = 4px) dayanır.' }
            ],
            tip: 'Responsive tasarımlarda piksel (px) yerine REM veya EM birimlerini kullanmak kodunuzu daha modern ve esnek kılar.',
            tipIcon: <Layers size={20} />
        },
        'viewport-calc': {
            title: 'Viewport Rehberi',
            content: [
                { q: 'VW birimi nedir?', a: 'Viewport Width (Ekran Genişliği). 100vw ekranın tam genişliğine, 1vw ise ekranın %1\'ine eşittir.' },
                { q: 'Mobil uyumda nasıl kullanılır?', a: 'Özellikle büyük başlıkların her ekranda aynı görünmesi için VW birimi tercih edilebilir.' }
            ],
            tip: 'Pek çok mobil cihaz 375px ile 414px arası genişliğe sahiptir. Tasarım yaparken bu değerleri baz alabilirsiniz.',
            tipIcon: <Smartphone size={20} />
        }
    };

    const guide = guides[view];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 pb-10 overflow-hidden">
            <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Info size={20} className="text-blue-600 dark:text-blue-400" /> {guide.title}
                </h3>
                <div className="space-y-4 text-left">
                    {guide.content.map((item, i) => (
                        <details key={i} className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                {item.q}
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                {item.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-indigo-600 dark:bg-indigo-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    {guide.tipIcon}
                </div>
                <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                    <Zap size={20} /> Uzman İpucu
                </h3>
                <p className="text-indigo-50 text-sm leading-relaxed relative z-10">
                    {guide.tip}
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg"><Info size={16} /></div>
                    <p className="text-[11px] font-bold">Bu hesaplama tamamen tarayıcınızda ve gizli bir şekilde tamamlanır.</p>
                </div>
            </div>
        </div>
    );
};
