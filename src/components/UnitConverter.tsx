import React, { useState } from 'react';
import { ArrowLeft, Calculator, Ruler, Box, Map, Calendar, Clock, Globe } from 'lucide-react';

interface UnitConverterProps {
    file?: File | null;
    onBack: () => void;
}

type TabType = 'units' | 'date' | 'map';
type UnitCategory = 'area' | 'length' | 'volume';

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
    const [amount, setAmount] = useState<number>(1);
    const [fromUnit, setFromUnit] = useState(UNITS.area[0]);
    const [toUnit, setToUnit] = useState(UNITS.area[1]);

    const handleCategoryChange = (cat: UnitCategory) => {
        setCategory(cat);
        setFromUnit(UNITS[cat][0]);
        setToUnit(UNITS[cat][1] || UNITS[cat][0]);
    };

    const convert = () => {
        const baseValue = amount * fromUnit.factor;
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
                    <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Miktar</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="glass-input w-full text-2xl font-mono"
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
    const [addDays, setAddDays] = useState(0);

    // Mode: 'diff' (difference between two dates) or 'add' (add days to date)
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
        date.setDate(date.getDate() + Number(addDays));
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
                            <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Eklenecek Gün (+/-)</label>
                            <input type="number" value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className="glass-input w-full" placeholder="Örn: 90 veya -30" />
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
    const [mapDist, setMapDist] = useState(10); // cm
    const [scale, setScale] = useState(1000); // 1/1000

    const calculateReal = () => {
        // Real (m) = Map (cm) * Scale / 100
        return (mapDist * scale) / 100;
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease]">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-center text-lg font-semibold text-emerald-400 mb-2">Ölçek Hesaplama (1/X)</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Harita Uzunluğu (cm)</label>
                        <input
                            type="number"
                            value={mapDist}
                            onChange={(e) => setMapDist(Number(e.target.value))}
                            className="glass-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">Ölçek Paydası (1/...)</label>
                        <input
                            type="number"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="glass-input w-full"
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
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-left text-xs text-slate-400">
                    <p><strong>Not:</strong> Harita üzerindeki 1 cm'lik ölçüm, ölçek paydası kadar cm'ye eşittir.</p>
                    <p className="mt-1">Formül: Gerçek = Harita (cm) × Ölçek / 100 (m için)</p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const UnitConverter: React.FC<UnitConverterProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('units');

    return (
        <div className="glass-panel max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <Calculator className="text-indigo-400" />
                    Teknik ve İdari Araçlar
                </h2>
            </div>

            <p className="text-slate-400 mb-8 text-center bg-white/5 p-4 rounded-lg">
                Belediye, Fen İşleri ve Teknik Personel için Kapsamlı Hesaplama Seti
            </p>

            <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('units')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'units' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    <Ruler size={18} /> Birim Çevirici
                </button>
                <button
                    onClick={() => setActiveTab('date')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'date' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    <Calendar size={18} /> Tarih & Süre
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'map' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    <Globe size={18} /> Harita & Ölçek
                </button>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'units' && <UnitTool />}
                {activeTab === 'date' && <DateTool />}
                {activeTab === 'map' && <MapTool />}
            </div>
        </div>
    );
};
