import React, { useState } from 'react';
import { ArrowLeft, Calculator, Ruler, Box, Map } from 'lucide-react';

interface UnitConverterProps {
    file?: File | null; // Optional, as this tool might be used without a file
    onBack: () => void;
}

type UnitCategory = 'area' | 'length' | 'volume';

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

export const UnitConverter: React.FC<UnitConverterProps> = ({ onBack }) => {
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
        // Convert to base unit (factor 1) then to target unit
        const baseValue = amount * fromUnit.factor;
        const result = baseValue / toUnit.factor;
        return result.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
    };

    return (
        <div className="glass-panel max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <Calculator className="text-orange-400" />
                    Teknik Birim Çevirici
                </h2>
            </div>

            <p className="text-slate-400 mb-8 text-center bg-white/5 p-4 rounded-lg">
                Belediye, Fen İşleri ve teknik personel için pratik alan, uzunluk ve hacim hesaplayıcı.
            </p>

            <div className="flex justify-center gap-4 mb-8">
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

                    <div className="pb-3 text-slate-500">=</div>

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
