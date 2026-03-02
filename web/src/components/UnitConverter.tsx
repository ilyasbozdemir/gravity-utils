"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calculator, Ruler, Box, Map, Calendar, Clock, Globe, Navigation, Coins, Delete, X, WifiOff, Info, Zap, RefreshCw } from 'lucide-react';

interface UnitConverterProps {
    file?: File | null;
    onBack?: () => void;
}

type TabType = 'units' | 'date' | 'map' | 'finance' | 'coords';
type UnitCategory = 'area' | 'length' | 'volume';

// --- SHARED COMPONENTS ---

const VirtualNumpad = ({ onInput, onClose, onClear, onBackspace }: { onInput: (val: string) => void, onClose: () => void, onClear: () => void, onBackspace: () => void }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

    return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 rounded-xl shadow-2xl p-4 w-[240px] animate-[fadeIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sanal Klavye</span>
                <button onClick={onClose} title="Klavye Kapat" className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {keys.map(k => (
                    <button
                        key={k}
                        onClick={() => onInput(k)}
                        className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-orange-500 active:text-white transition-colors p-3 rounded-lg font-mono text-lg font-bold border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200"
                    >
                        {k}
                    </button>
                ))}
                <button onClick={onBackspace} title="Geri Sil" className="bg-slate-50 dark:bg-white/5 hover:bg-red-500/20 text-red-500 dark:text-red-300 transition-colors p-3 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5">
                    <Delete size={20} />
                </button>
                <button onClick={onClear} title="Tamamını Temizle" className="col-span-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wider mt-2 border border-red-500/20">
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
                    title="Sanal Klavye"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${showPad ? 'text-orange-400 bg-orange-400/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
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
    const [fromAmount, setFromAmount] = useState<string>("1");
    const [toAmount, setToAmount] = useState<string>("1000");
    const [fromUnit, setFromUnit] = useState(UNITS.area[0]);
    const [toUnit, setToUnit] = useState(UNITS.area[1]);
    const [lastSource, setLastSource] = useState<'from' | 'to'>('from');

    const format = (num: number) => {
        if (isNaN(num)) return '';
        return parseFloat(num.toFixed(6)).toString();
    };

    // Update units when category changes
    useEffect(() => {
        const f = UNITS[category][0];
        const t = UNITS[category][1] || UNITS[category][0];
        setFromUnit(f);
        setToUnit(t);
        // Reset amounts based on 1 unit of the first item
        setFromAmount("1");
        setToAmount(format(f.factor / t.factor));
        setLastSource('from');
    }, [category]);

    const handleAmountChange = (val: string, source: 'from' | 'to') => {
        const v = parseFloat(val || "0");
        if (source === 'from') {
            setFromAmount(val);
            setToAmount(format((v * fromUnit.factor) / toUnit.factor));
        } else {
            setToAmount(val);
            setFromAmount(format((v * toUnit.factor) / fromUnit.factor));
        }
        setLastSource(source);
    };

    const handleUnitChange = (unitName: string, type: 'from' | 'to') => {
        const unit = UNITS[category].find(u => u.name === unitName)!;
        if (type === 'from') {
            setFromUnit(unit);
            if (lastSource === 'to') {
                setFromAmount(format((parseFloat(toAmount) * toUnit.factor) / unit.factor));
            } else {
                setToAmount(format((parseFloat(fromAmount) * unit.factor) / toUnit.factor));
            }
        } else {
            setToUnit(unit);
            if (lastSource === 'from') {
                setToAmount(format((parseFloat(fromAmount) * fromUnit.factor) / unit.factor));
            } else {
                setFromAmount(format((parseFloat(toAmount) * unit.factor) / fromUnit.factor));
            }
        }
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                <button
                    onClick={() => setCategory('area')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'area' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Map size={18} /> Alan
                </button>
                <button
                    onClick={() => setCategory('length')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'length' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Ruler size={18} /> Uzunluk
                </button>
                <button
                    onClick={() => setCategory('volume')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${category === 'volume' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <Box size={18} /> Hacim
                </button>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    <div className="space-y-4">
                        <select
                            title="Kaynak Birim"
                            value={fromUnit.name}
                            onChange={(e) => handleUnitChange(e.target.value, 'from')}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                            {UNITS[category].map(u => (
                                <option key={u.name} value={u.name} className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{u.label}</option>
                            ))}
                        </select>
                        <NumpadInput
                            label="Miktar"
                            value={fromAmount}
                            onChange={(val) => handleAmountChange(val, 'from')}
                        />
                    </div>

                    <div className="hidden md:flex flex-col items-center gap-2 text-slate-400">
                        <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-orange-500/50 to-transparent"></div>
                        <RefreshCw size={20} className="animate-spin-slow" />
                        <div className="h-10 w-[2px] bg-gradient-to-t from-transparent via-orange-500/50 to-transparent"></div>
                    </div>

                    <div className="space-y-4">
                        <select
                            title="Hedef Birim"
                            value={toUnit.name}
                            onChange={(e) => handleUnitChange(e.target.value, 'to')}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                            {UNITS[category].map(u => (
                                <option key={u.name} value={u.name} className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{u.label}</option>
                            ))}
                        </select>
                        <NumpadInput
                            label="Sonuç"
                            value={toAmount}
                            onChange={(val) => handleAmountChange(val, 'to')}
                        />
                    </div>
                </div>

                <div className="p-6 bg-orange-500/5 rounded-2xl border border-dashed border-orange-500/20 text-center">
                    <p className="text-sm font-bold text-orange-400">
                        * Artık çift yönlü! Her iki alanı da düzenleyebilir, birimleri istediğiniz gibi değiştirebilirsiniz.
                    </p>
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
                                <input title="Başlangıç Tarihi" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-700 dark:text-slate-200" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Bitiş</label>
                                <input title="Bitiş Tarihi" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-700 dark:text-slate-200" />
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
                            <input title="Tarih Seçin" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-700 dark:text-slate-200" />
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
    const [net, setNet] = useState<string>("1000");
    const [gross, setGross] = useState<string>("1200");
    const [rate, setRate] = useState(20);

    const format = (num: number) => {
        if (isNaN(num)) return '';
        return parseFloat(num.toFixed(2)).toString();
    };

    const updateFromNet = (val: string, r: number) => {
        setNet(val);
        const v = parseFloat(val || "0");
        setGross(format(v * (1 + r / 100)));
    };

    const updateFromGross = (val: string, r: number) => {
        setGross(val);
        const v = parseFloat(val || "0");
        setNet(format(v / (1 + r / 100)));
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Vergi Oranı (%)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 10, 20].map(r => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRate(r);
                                    updateFromNet(net, r);
                                }}
                                className={`py-2 rounded-xl text-sm font-bold border transition-all ${rate === r ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                            >
                                %{r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <NumpadInput
                            label="Matrah (Net Tutar)"
                            value={net}
                            onChange={(val) => updateFromNet(val, rate)}
                        />
                        <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10">
                            <div className="text-[10px] text-sky-400 font-bold uppercase mb-1">Hesaplanan KDV</div>
                            <div className="text-xl font-mono text-sky-200">
                                {format(parseFloat(gross) - parseFloat(net))} ₺
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <NumpadInput
                            label="Toplam (Brüt Tutar)"
                            value={gross}
                            onChange={(val) => updateFromGross(val, rate)}
                        />
                        <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                            <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">İçindeki KDV</div>
                            <div className="text-xl font-mono text-purple-200">
                                {format(parseFloat(gross) - parseFloat(net))} ₺
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-slate-500/5 rounded-2xl border border-dashed border-slate-500/20 text-center">
                    <p className="text-xs text-slate-400 italic font-medium">
                        * Artık çift yönlü! Matrahı veya Toplam tutarı değiştirerek anında hesaplama yapabilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
};

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
    const handleBack = onBack || (() => { window.location.hash = ''; });
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
        <div className="max-w-[900px] mx-auto p-8 animate-[fadeIn_0.5s_ease] relative bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön" className="glass-button p-2"><ArrowLeft size={18} /></button>
                    <h2 className="text-xl font-bold m-0 flex items-center gap-2 text-slate-800 dark:text-white">
                        <Calculator className="text-indigo-600 dark:text-indigo-400" />
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

            <p className="text-slate-600 dark:text-slate-300 mb-8 text-center bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5">
                Arazi, Tarih, KDV ve Koordinat işlemleri için kapsamlı teknik araç seti.
                <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">Tüm işlemler tarayıcınızda gerçekleşir, verileriniz sunucuya gönderilmez.</span>
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

            {/* Contextual Guide */}
            <UnitConverterGuide activeTab={activeTab} />
        </div>
    );
};

const UnitConverterGuide = ({ activeTab }: { activeTab: TabType }) => {
    const guides: Record<TabType, { title: string; content: { q: string; a: string }[]; tip: string; icon: React.ReactNode }> = {
        units: {
            title: 'Birim Çevirici Rehberi',
            content: [
                { q: 'Dönüm ve Dekar farkı nedir?', a: 'Aslında bir fark yoktur. 1 Dekar = 1000 m²\'dir ve halk arasında "Dönüm" olarak bilinir.' },
                { q: 'Hektar ne kadar büyüktür?', a: '1 Hektar = 10.000 m²\'dir. Yaklaşık olarak standart bir futbol sahasının 1.5 katı büyüklüktedir.' }
            ],
            tip: 'Arazi ölçümlerinde "Ar" birimi 100 m²\'ye tekabül eder. Özellikle tapu kayıtlarında bu terimlerle sıkça karşılaşırsınız.',
            icon: <Ruler size={24} />
        },
        finance: {
            title: 'KDV & Stopaj Rehberi',
            content: [
                { q: 'KDV Dahil hesaplama nasıl yapılır?', a: 'Net tutarı (1 + KDV Oranı) ile çarparak brüt tutarı bulabilirsiniz. Örn: 100 * 1.20 = 120 TL.' },
                { q: 'Stopaj nedir?', a: 'Gelir vergisinin kaynaktan kesilmesidir. Kira veya serbest meslek makbuzlarında genellikle %20 oranında uygulanır.' }
            ],
            tip: 'Ticari işlemlerde KDV tevkifatı gibi özel durumlar olabilir. Bu araç genel bilgilendirme amaçlı temel hesaplamalar sunar.',
            icon: <Coins size={24} />
        },
        date: {
            title: 'Tarih & Süre Rehberi',
            content: [
                { q: 'İki tarih arası gün nasıl sayılır?', a: 'Başlangıç gününü 0 kabul ederek bitiş gününe kadar olan takvim günleri toplanır.' },
                { q: 'İş günü hesaplaması?', a: 'Bu araç takvim günlerini baz alır. Resmi tatil ve hafta sonlarını manuel olarak düşmelisiniz.' }
            ],
            tip: 'Yıllık izin veya proje bitiş tarihi hesaplarken bitiş gününün dahil olup olmadığını netleştirmeniz hesaplamayı etkiler.',
            icon: <Calendar size={24} />
        },
        map: {
            title: 'Harita & Ölçek Rehberi',
            content: [
                { q: 'Harita ölçeği nasıl okunur?', a: '1/25.000 ölçek, haritadaki 1 cm\'nin gerçekte 25.000 cm (250 metre) olduğunu gösterir.' },
                { q: 'Ölçek paydası büyüdükçe ne olur?', a: 'Payda büyüdükçe harita küçülür, daha geniş bir alan daha az detayla gösterilir.' }
            ],
            tip: 'İmar planlarında genellikle 1/1000 (Uygulama) ve 1/5000 (Nazım) ölçekleri kullanılır.',
            icon: <Globe size={24} />
        },
        coords: {
            title: 'Koordinat Sistemleri',
            content: [
                { q: 'Decimal vs DMS farkı?', a: 'Decimal (41.0082) sayısal hesaplamalar için, DMS (41° 0\' 29") ise geleneksel haritacılık ve denizcilik için kullanılır.' },
                { q: 'Hassasiyet neden önemli?', a: 'Virgülden sonraki 4. basamak yaklaşık 11 metrelik bir farka denk gelir. GPS cihazları genellikle 5-6 basamak kullanır.' }
            ],
            tip: 'Google Haritalar\'dan kopyaladığınız koordinatları Decimal (Ondalık) kısmına yapıştırarak DMS karşılığını anında alabilirsiniz.',
            icon: <Navigation size={24} />
        }
    };

    const guide = guides[activeTab];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 pb-10 border-t border-slate-100 dark:border-white/5 pt-10">
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
                    {guide.icon}
                </div>
                <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                    <Zap size={20} /> Uzman İpucu
                </h3>
                <p className="text-indigo-50 text-sm leading-relaxed relative z-10">
                    {guide.tip}
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg"><Info size={16} /></div>
                    <p className="text-[11px] font-bold">Tüm dönüşümler tarayıcıda, yerel olarak gerçekleşir.</p>
                </div>
            </div>
        </div>
    );
};
