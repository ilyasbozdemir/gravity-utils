import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calculator, Ruler, Box, Map, Calendar, Clock, Globe, Navigation, Coins, Delete, X, WifiOff } from 'lucide-react';

interface UnitConverterProps {
    file?: File | null;
    onBack: () => void;
}

type TabType = 'units' | 'date' | 'map' | 'finance' | 'coords';
type UnitCategory = 'area' | 'length' | 'volume';

// --- SHARED COMPONENTS ---

const VirtualNumpad = ({ onInput, onClose, onClear, onBackspace }: { onInput: (val: string) => void, onClose: () => void, onClear: () => void, onBackspace: () => void }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

    return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800 border border-white/20 rounded-xl shadow-2xl p-4 w-[240px] animate-[fadeIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Sanal Klavye</span>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {keys.map(k => (
                    <button
                        key={k}
                        onClick={() => onInput(k)}
                        className="bg-white/5 hover:bg-white/10 active:bg-orange-500 active:text-white transition-colors p-3 rounded-lg font-mono text-lg font-bold border border-white/5"
                    >
                        {k}
                    </button>
                ))}
                <button onClick={onBackspace} className="bg-white/5 hover:bg-red-500/20 text-red-300 transition-colors p-3 rounded-lg flex items-center justify-center">
                    <Delete size={20} />
                </button>
                <button onClick={onClear} className="col-span-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wider mt-2">
                    Temizle
                </button>
            </div>
        </div>
    );
};

const NumpadInput = ({ value, onChange, label, placeholder, type = "number" }: { value: string | number, onChange: (val: string) => void, label?: string, placeholder?: string, type?: string }) => {
    const [showPad, setShowPad] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPad(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = (val: string) => {
        const currentVal = value.toString();
        // Prevent multiple dots
        if (val === '.' && currentVal.includes('.')) return;
        onChange(currentVal === '0' && val !== '.' ? val : currentVal + val);
    };

    const handleBackspace = () => {
        const str = value.toString();
        onChange(str.length > 1 ? str.slice(0, -1) : '');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">{label}</label>}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setShowPad(true)}
                    className="glass-input w-full pr-10"
                    placeholder={placeholder}
                />
                <button
                    onClick={() => setShowPad(!showPad)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${showPad ? 'text-orange-400 bg-orange-400/10' : 'text-slate-400 hover:text-white'}`}
                >
                    <Calculator size={16} />
                </button>
            </div>

            {showPad && (
                <VirtualNumpad
                    onInput={handleInput}
                    onClose={() => setShowPad(false)}
                    onClear={() => onChange('')}
                    onBackspace={handleBackspace}
                />
            )}
        </div>
    );
};

// --- SUB-COMPONENTS ---

/* 1. Unit Converter Component */
const UnitTool = () => {
    const UNITS: Record<UnitCategory, { name: string; factor: number; label: string }[]> = {
        area: [
            { name: 'm2', factor: 1, label: 'Metrekare (m²)' },
            { name: 'donum', factor: 1000, label: 'Dönüm / Dekar' },
            { name: 'hektar', factor: 10000, label: 'Hektar' },
            { name: 'ar', factor: 100, label: 'Ar' },
            { name: 'km2', factor: 1000000, label: 'Kilometrekare (km²)' }
        ],
        length: [
            { name: 'm', factor: 1, label: 'Metre (m)' },
            { name: 'cm', factor: 0.01, label: 'Santimetre (cm)' },
            { name: 'mm', factor: 0.001, label: 'Milimetre (mm)' },
            { name: 'km', factor: 1000, label: 'Kilometre (km)' }
        ],
        volume: [
            { name: 'm3', factor: 1, label: 'Metreküp (m³)' },
            { name: 'l', factor: 0.001, label: 'Litre (L)' }
        ]
    };

    const [category, setCategory] = useState<UnitCategory>('area');
    const [amount, setAmount] = useState<string>("1");
    const [fromUnit, setFromUnit] = useState(UNITS.area[0]);
    const [toUnit, setToUnit] = useState(UNITS.area[1]);

    const handleCategoryChange = (cat: UnitCategory) => {
        setCategory(cat);
        setFromUnit(UNITS[cat][0]);
        setToUnit(UNITS[cat][1] || UNITS[cat][0]);
    };

    const convert = () => {
        const val = parseFloat(amount || "0");
        const baseValue = val * fromUnit.factor;
        const result = baseValue / toUnit.factor;
        return result.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                <button
                    onClick={() => handleCategoryChange('area')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'area' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Map size={18} /> Alan
                </button>
                <button
                    onClick={() => handleCategoryChange('length')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'length' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Ruler size={18} /> Uzunluk
                </button>
                <button
                    onClick={() => handleCategoryChange('volume')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'volume' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Box size={18} /> Hacim
                </button>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <div>
                    <NumpadInput
                        label="Miktar"
                        value={amount}
                        onChange={setAmount}
                    />
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Buradan</label>
                        <select
                            value={fromUnit.name}
                            onChange={(e) => setFromUnit(UNITS[category].find(u => u.name === e.target.value) || fromUnit)}
                            className="glass-input w-full"
                        >
                            {UNITS[category].map(u => (
                                <option key={u.name} value={u.name} className="bg-slate-800">{u.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pb-3 text-slate-50 self-center">=</div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Buraya</label>
                        <select
                            value={toUnit.name}
                            onChange={(e) => setToUnit(UNITS[category].find(u => u.name === e.target.value) || toUnit)}
                            className="glass-input w-full"
                        >
                            {UNITS[category].map(u => (
                                <option key={u.name} value={u.name} className="bg-slate-800">{u.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 pt-6 border-t border-white/10 text-center">
                    <div className="text-4xl font-bold text-orange-400 font-mono tracking-tight">
                        {convert()} <span className="text-lg text-slate-400 font-sans font-normal">{toUnit.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* 2. Date Calculator Component */
const DateTool = () => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [addDays, setAddDays] = useState<string>("0");
    const [mode, setMode] = useState<'diff' | 'add'>('diff');

    const calculateDifference = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            days: diffDays,
            weeks: Math.floor(diffDays / 7),
            remainingDays: diffDays % 7,
            years: (diffDays / 365.25).toFixed(2)
        };
    };

    const calculateNewDate = () => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (Number(addDays) || 0));
        return date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const diff = calculateDifference();

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setMode('diff')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${mode === 'diff' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Clock size={18} /> Süre Hesapla
                </button>
                <button
                    onClick={() => setMode('add')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${mode === 'add' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Calendar size={18} /> Tarih Ekle/Çıkar
                </button>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                {mode === 'diff' ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Başlangıç</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="glass-input w-full" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Bitiş</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="glass-input w-full" />
                            </div>
                        </div>
                        <div className="mt-4 pt-6 border-t border-white/10 text-center flex flex-col gap-2">
                            <div className="text-4xl font-bold text-blue-400 font-mono tracking-tight">{diff.days} Gün</div>
                            <div className="text-sm text-slate-400">veya {diff.weeks} Hafta, {diff.remainingDays} Gün</div>
                            <div className="text-xs text-slate-500">Yaklaşık {diff.years} Yıl</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Tarih</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="glass-input w-full" />
                        </div>
                        <div>
                            <NumpadInput
                                label="Eklenecek Gün (+/-)"
                                value={addDays}
                                onChange={setAddDays}
                                placeholder="Örn: 90"
                            />
                        </div>
                        <div className="mt-4 pt-6 border-t border-white/10 text-center">
                            <div className="text-2xl font-bold text-blue-400">{calculateNewDate()}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* 3. Map Scale Calculator Component */
const MapTool = () => {
    const [mapDist, setMapDist] = useState<string>("10"); // cm
    const [scale, setScale] = useState<string>("1000"); // 1/1000

    const calculateReal = () => {
        const dist = parseFloat(mapDist || "0");
        const sc = parseFloat(scale || "0");
        // Real (m) = Map (cm) * Scale / 100
        return (dist * sc) / 100;
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-center text-lg font-semibold text-emerald-400 mb-2">Ölçek Hesaplama (1/X)</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <NumpadInput
                            label="Harita Uzunluğu (cm)"
                            value={mapDist}
                            onChange={setMapDist}
                        />
                    </div>
                    <div>
                        <NumpadInput
                            label="Ölçek Paydası (1/...)"
                            value={scale}
                            onChange={setScale}
                        />
                    </div>
                </div>

                <div className="mt-4 pt-6 border-t border-white/10 text-center">
                    <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Gerçek Arazi Uzunluğu</label>
                    <div className="text-4xl font-bold text-emerald-400 font-mono tracking-tight">
                        {calculateReal().toLocaleString('tr-TR')} <span className="text-lg text-slate-400 font-sans font-normal">Metre</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        {(calculateReal() / 1000).toLocaleString('tr-TR')} Kilometre
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                        * Harita üzerindeki 1 cm'lik ölçüm, ölçek paydası kadar cm'ye eşittir.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* 4. Finance Tool (KDV & Stopaj) */
const FinanceTool = () => {
    const [amount, setAmount] = useState<string>("1000");
    const [rate, setRate] = useState(20);

    const val = parseFloat(amount || "0");
    // Calculate values
    const kdvAmount = val * (rate / 100);
    const total = val + kdvAmount;

    // Reverse calculation
    const baseFromTotal = val / (1 + (rate / 100));
    const kdvFromTotal = val - baseFromTotal;

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <NumpadInput
                            label="Tutar"
                            value={amount}
                            onChange={setAmount}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Vergi Oranı (%)</label>
                        <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="glass-input w-full">
                            <option value={1} className="bg-slate-800">%1 (KDV)</option>
                            <option value={10} className="bg-slate-800">%10 (KDV)</option>
                            <option value={20} className="bg-slate-800">%20 (KDV/Stopaj)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Method 1: Forward */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-sky-400 font-bold mb-2 uppercase">KDV Hariçten → Dahile</div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-400">KDV Tutarı:</span>
                            <span className="font-mono">{kdvAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-sky-300 pt-2 border-t border-white/10">
                            <span>Toplam:</span>
                            <span>{total.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>

                    {/* Method 2: Reverse */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-purple-400 font-bold mb-2 uppercase">KDV Dahilden → Harice</div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-400">Matrah (Ana Para):</span>
                            <span className="font-mono">{baseFromTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-white/10">
                            <span>İçindeki KDV:</span>
                            <span className="font-mono">{kdvFromTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 5. Coordinates Tool */
const CoordTool = () => {
    const [decLat, setDecLat] = useState<string>("41.0082");
    const [decLng, setDecLng] = useState<string>("28.9784");
    const [dmsResult, setDmsResult] = useState("");

    const toDMS = (coordinate: number, type: 'lat' | 'lng') => {
        const absolute = Math.abs(coordinate);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

        let direction = "";
        if (type === 'lat') direction = coordinate >= 0 ? "N" : "S";
        if (type === 'lng') direction = coordinate >= 0 ? "E" : "W";

        return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    }

    const convert = () => {
        const lat = parseFloat(decLat);
        const lng = parseFloat(decLng);
        if (isNaN(lat) || isNaN(lng)) return;
        setDmsResult(`${toDMS(lat, 'lat')}, ${toDMS(lng, 'lng')}`);
    }

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <NumpadInput
                            label="Enlem (Latitude)"
                            value={decLat}
                            onChange={setDecLat}
                            placeholder="41.0082"
                            type="text"
                        />
                    </div>
                    <div>
                        <NumpadInput
                            label="Boylam (Longitude)"
                            value={decLng}
                            onChange={setDecLng}
                            placeholder="28.9784"
                            type="text"
                        />
                    </div>
                </div>

                <button onClick={convert} className="bg-pink-600/80 hover:bg-pink-500 text-white rounded-lg py-2 font-medium transition-colors">
                    Dönüştür (Decimal → DMS)
                </button>

                {dmsResult && (
                    <div className="mt-4 pt-6 border-t border-white/10 text-center">
                        <div className="text-xl font-bold text-pink-300 font-mono tracking-tight select-all">
                            {dmsResult}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- MAIN COMPONENT ---

export const UnitConverter: React.FC<UnitConverterProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('units');
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const toggleOffline = () => {
        setIsOfflineMode(!isOfflineMode);
    };

    const renderTabButton = (id: TabType, icon: React.ReactNode, label: string, colorClass: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-5 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap outline-none ${activeTab === id
                    ? `border-${colorClass}-500 text-${colorClass}-400 bg-white/5`
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="glass-panel max-w-[900px] mx-auto p-8 animate-[fadeIn_0.5s_ease] relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                    <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                        <Calculator className="text-indigo-400" />
                        Mühendislik ve Hesaplama
                    </h2>
                </div>

                {/* Offline Toggle/Badge */}
                <button
                    onClick={toggleOffline}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isOfflineMode
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    <WifiOff size={14} />
                    {isOfflineMode ? 'Çevrimdışı Modu Aktif' : 'Çevrimdışı Çalışabilir'}
                </button>
            </div>

            <p className="text-slate-400 mb-8 text-center bg-white/5 p-4 rounded-lg">
                Arazi, Tarih, KDV ve Koordinat işlemleri için kapsamlı teknik araç seti.
                <span className="block mt-1 text-xs opacity-70">Tüm işlemler tarayıcınızda gerçekleşir, verileriniz sunucuya gönderilmez.</span>
            </p>

            <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                {renderTabButton('units', <Ruler size={18} />, 'Birim Çevirici', 'orange')}
                {renderTabButton('finance', <Coins size={18} />, 'KDV & Finans', 'sky')}
                {renderTabButton('date', <Calendar size={18} />, 'Tarih & Süre', 'blue')}
                {renderTabButton('map', <Globe size={18} />, 'Harita & Ölçek', 'emerald')}
                {renderTabButton('coords', <Navigation size={18} />, 'Koordinat', 'pink')}
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'units' && <UnitTool />}
                {activeTab === 'finance' && <FinanceTool />}
                {activeTab === 'date' && <DateTool />}
                {activeTab === 'map' && <MapTool />}
                {activeTab === 'coords' && <CoordTool />}
            </div>
        </div>
    );
};
