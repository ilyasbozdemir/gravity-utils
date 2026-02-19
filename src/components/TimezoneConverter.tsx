'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Copy, Check, Globe } from 'lucide-react';

const ALL_TIMEZONES = [
    { tz: 'Europe/Istanbul', label: 'İstanbul', flag: '🇹🇷' },
    { tz: 'UTC', label: 'UTC', flag: '🌐' },
    { tz: 'Europe/London', label: 'Londra', flag: '🇬🇧' },
    { tz: 'Europe/Paris', label: 'Paris', flag: '🇫🇷' },
    { tz: 'Europe/Berlin', label: 'Berlin / Frankfurt', flag: '🇩🇪' },
    { tz: 'Europe/Madrid', label: 'Madrid', flag: '🇪🇸' },
    { tz: 'Europe/Rome', label: 'Roma', flag: '🇮🇹' },
    { tz: 'Europe/Amsterdam', label: 'Amsterdam', flag: '🇳🇱' },
    { tz: 'Europe/Moscow', label: 'Moskova', flag: '🇷🇺' },
    { tz: 'Asia/Dubai', label: 'Dubai', flag: '🇦🇪' },
    { tz: 'Asia/Kolkata', label: 'Mumbai / Yeni Delhi', flag: '🇮🇳' },
    { tz: 'Asia/Bangkok', label: 'Bangkok', flag: '🇹🇭' },
    { tz: 'Asia/Singapore', label: 'Singapur', flag: '🇸🇬' },
    { tz: 'Asia/Shanghai', label: 'Şanghay / Pekin', flag: '🇨🇳' },
    { tz: 'Asia/Tokyo', label: 'Tokyo', flag: '🇯🇵' },
    { tz: 'Asia/Seoul', label: 'Seul', flag: '🇰🇷' },
    { tz: 'Australia/Sydney', label: 'Sidney', flag: '🇦🇺' },
    { tz: 'Pacific/Auckland', label: 'Auckland', flag: '🇳🇿' },
    { tz: 'Pacific/Honolulu', label: 'Honolulu', flag: '🇺🇸' },
    { tz: 'America/Anchorage', label: 'Anchorage', flag: '🇺🇸' },
    { tz: 'America/Los_Angeles', label: 'Los Angeles / Seattle', flag: '🇺🇸' },
    { tz: 'America/Denver', label: 'Denver', flag: '🇺🇸' },
    { tz: 'America/Chicago', label: 'Chicago / Dallas', flag: '🇺🇸' },
    { tz: 'America/New_York', label: 'New York / Miami', flag: '🇺🇸' },
    { tz: 'America/Sao_Paulo', label: 'São Paulo', flag: '🇧🇷' },
    { tz: 'America/Buenos_Aires', label: 'Buenos Aires', flag: '🇦🇷' },
    { tz: 'Africa/Cairo', label: 'Kahire', flag: '🇪🇬' },
    { tz: 'Africa/Johannesburg', label: 'Johannesburg', flag: '🇿🇦' },
    { tz: 'Africa/Lagos', label: 'Lagos', flag: '🇳🇬' },
    { tz: 'America/Toronto', label: 'Toronto', flag: '🇨🇦' },
    { tz: 'America/Vancouver', label: 'Vancouver', flag: '🇨🇦' },
    { tz: 'Asia/Riyadh', label: 'Riyad', flag: '🇸🇦' },
    { tz: 'Asia/Karachi', label: 'Karaçi', flag: '🇵🇰' },
    { tz: 'Asia/Dhaka', label: 'Dakka', flag: '🇧🇩' },
    { tz: 'Asia/Taipei', label: 'Taipei', flag: '🇹🇼' },
    { tz: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh', flag: '🇻🇳' },
    { tz: 'Asia/Jakarta', label: 'Jakarta', flag: '🇮🇩' },
    { tz: 'Asia/Kathmandu', label: 'Katmandu', flag: '🇳🇵' },
    { tz: 'Asia/Colombo', label: 'Kolombo', flag: '🇱🇰' },
    { tz: 'Asia/Tashkent', label: 'Taşkent', flag: '🇺🇿' },
    { tz: 'Asia/Baku', label: 'Bakü', flag: '🇦🇿' },
    { tz: 'Asia/Tehran', label: 'Tahran', flag: '🇮🇷' },
    { tz: 'Asia/Kabul', label: 'Kabil', flag: '🇦🇫' },
    { tz: 'Europe/Athens', label: 'Atina', flag: '🇬🇷' },
    { tz: 'Europe/Warsaw', label: 'Varşova', flag: '🇵🇱' },
    { tz: 'Europe/Stockholm', label: 'Stockholm', flag: '🇸🇪' },
    { tz: 'Europe/Helsinki', label: 'Helsinki', flag: '🇫🇮' },
    { tz: 'Europe/Bucharest', label: 'Bükreş', flag: '🇷🇴' },
    { tz: 'Europe/Kyiv', label: 'Kyiv', flag: '🇺🇦' },
];

const DEFAULT_ZONES = ['Europe/Istanbul', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

function getTimeInZone(date: Date, tz: string) {
    try {
        const opts: Intl.DateTimeFormatOptions = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const time = new Intl.DateTimeFormat('tr-TR', opts).format(date);
        const dateStr = new Intl.DateTimeFormat('tr-TR', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short' }).format(date);
        const offset = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? '';
        return { time, dateStr, offset };
    } catch {
        return { time: '--:--:--', dateStr: '---', offset: '---' };
    }
}

function isDaytime(date: Date, tz: string): boolean {
    try {
        const hour = parseInt(new Intl.DateTimeFormat('en', { timeZone: tz, hour: 'numeric', hour12: false }).format(date));
        return hour >= 7 && hour < 20;
    } catch { return true; }
}

function convertTime(fromTz: string, toTz: string, dateStr: string, timeStr: string): string {
    try {
        const [h, m] = timeStr.split(':').map(Number);
        const [year, month, day] = dateStr.split('-').map(Number);
        const dt = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        // Create a date in fromTz context
        const fromOffset = getOffset(dt, fromTz);
        const toOffset = getOffset(dt, toTz);
        const diff = toOffset - fromOffset;
        const result = new Date(dt.getTime() + diff * 60000);
        return result.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return '--:--'; }
}

function getOffset(date: Date, tz: string): number {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

export function TimezoneConverter({ onBack }: { onBack: () => void }) {
    const [now, setNow] = useState(new Date());
    const [selected, setSelected] = useState<string[]>(DEFAULT_ZONES);
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [tab, setTab] = useState<'clock' | 'convert' | 'overlap'>('clock');
    const [fromTz, setFromTz] = useState('Europe/Istanbul');
    const [toTz, setToTz] = useState('America/New_York');
    const [inputTime, setInputTime] = useState('09:00');
    const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 10));
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const addZone = (tz: string) => { if (!selected.includes(tz)) setSelected(p => [...p, tz]); setShowPicker(false); setSearch(''); };
    const removeZone = (tz: string) => setSelected(p => p.filter(z => z !== tz));

    const filtered = ALL_TIMEZONES.filter(z =>
        !selected.includes(z.tz) &&
        (z.label.toLowerCase().includes(search.toLowerCase()) || z.tz.toLowerCase().includes(search.toLowerCase()))
    );

    const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };

    // Overlap grid (8 business hours from 09:00 to 17:00 UTC for all zones)
    const overlapHours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-sky-500" /> Zaman Dilimi Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Dünya saatleri · saat dönüştür · toplantı planlayıcı</p>
                </div>
                <button onClick={() => setShowPicker(s => !s)}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/20">
                    <Plus size={16} /> Şehir Ekle
                </button>
            </div>

            {/* City picker */}
            {showPicker && (
                <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Şehir veya zaman dilimi ara..."
                        aria-label="Şehir veya zaman dilimi ara"
                        autoFocus
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-slate-700 dark:text-slate-300 mb-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                        {filtered.map(z => (
                            <button key={z.tz} onClick={() => addZone(z.tz)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-left transition-all">
                                <span className="text-base">{z.flag}</span>
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">{z.label}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{z.tz.split('/')[1]?.replace('_', ' ') ?? z.tz}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {([['clock', '🕐 Dünya Saatleri'], ['convert', '⇄ Dönüştür'], ['overlap', '📅 Toplantı Planlayıcı']] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Clock tab */}
            {tab === 'clock' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selected.map(tz => {
                        const meta = ALL_TIMEZONES.find(z => z.tz === tz);
                        const { time, dateStr, offset } = getTimeInZone(now, tz);
                        const day = isDaytime(now, tz);
                        return (
                            <div key={tz}
                                className={`relative p-5 rounded-2xl border transition-all group ${day ? 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 border-sky-200 dark:border-sky-800' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'}`}>
                                <button onClick={() => removeZone(tz)}
                                    title="Kaldır" aria-label={`${meta?.label ?? tz} şehrini kaldır`}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-slate-400 hover:text-red-500">
                                    <X size={14} />
                                </button>
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-2xl">{meta?.flag ?? '🌐'}</span>
                                    <div>
                                        <p className={`font-bold text-sm ${day ? 'text-slate-700 dark:text-slate-300' : 'text-slate-200'}`}>{meta?.label ?? tz}</p>
                                        <p className={`text-[10px] font-mono ${day ? 'text-slate-400' : 'text-slate-500'}`}>{offset}</p>
                                    </div>
                                    <span className="ml-auto text-base">{day ? '☀️' : '🌙'}</span>
                                </div>
                                <p className={`text-3xl font-black font-mono tracking-tight ${day ? 'text-slate-800 dark:text-slate-100' : 'text-white'}`}>{time}</p>
                                <p className={`text-xs mt-1 ${day ? 'text-slate-500' : 'text-slate-400'}`}>{dateStr}</p>
                                <button onClick={() => copy(`${meta?.label ?? tz}: ${time}`)}
                                    title="Kopyala" aria-label={`${meta?.label ?? tz} saatini kopyala`}
                                    className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${day ? 'text-slate-400 hover:text-sky-500' : 'text-slate-500 hover:text-sky-400'}`}>
                                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                                </button>
                            </div>
                        );
                    })}
                    {selected.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-slate-400">
                            <Globe size={40} className="mx-auto mb-3 opacity-30" />
                            <p>Şehir eklemek için &quot;Şehir Ekle&quot; butonuna basın</p>
                        </div>
                    )}
                </div>
            )}

            {/* Convert tab */}
            {tab === 'convert' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Kaynak Zaman Dilimi</p>
                            <select value={fromTz} onChange={e => setFromTz(e.target.value)}
                                title="Kaynak zaman dilimi seç" aria-label="Kaynak zaman dilimi"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30">
                                {ALL_TIMEZONES.map(z => <option key={z.tz} value={z.tz}>{z.flag} {z.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Hedef Zaman Dilimi</p>
                            <select value={toTz} onChange={e => setToTz(e.target.value)}
                                title="Hedef zaman dilimi seç" aria-label="Hedef zaman dilimi"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30">
                                {ALL_TIMEZONES.map(z => <option key={z.tz} value={z.tz}>{z.flag} {z.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Tarih</p>
                            <input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)}
                                aria-label="Dönüştürülecek tarih"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Saat</p>
                            <input type="time" value={inputTime} onChange={e => setInputTime(e.target.value)}
                                aria-label="Dönüştürülecek saat"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                        <div className="text-center bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-5 flex-1">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{ALL_TIMEZONES.find(z => z.tz === fromTz)?.label}</p>
                            <p className="text-3xl font-black font-mono text-sky-700 dark:text-sky-300">{inputTime}</p>
                        </div>
                        <div className="text-slate-400 font-bold text-2xl">→</div>
                        <div className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 flex-1">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{ALL_TIMEZONES.find(z => z.tz === toTz)?.label}</p>
                            <p className="text-3xl font-black font-mono text-green-700 dark:text-green-300">{convertTime(fromTz, toTz, inputDate, inputTime)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlap / Meeting planner tab */}
            {tab === 'overlap' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Seçili zaman dilimlerinin günlük saat dağılımı — yeşil: gündüz (07–20)
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left px-2 py-1 text-slate-400 font-bold w-32">Şehir</th>
                                    {overlapHours.map(h => (
                                        <th key={h} className="text-center px-0.5 py-1 text-slate-400 font-mono w-8">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selected.map(tz => {
                                    const meta = ALL_TIMEZONES.find(z => z.tz === tz);
                                    return (
                                        <tr key={tz} className="border-t border-slate-100 dark:border-slate-800">
                                            <td className="px-2 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {meta?.flag} {meta?.label ?? tz}
                                            </td>
                                            {overlapHours.map(utcHour => {
                                                // Convert utc hour to local hour in this timezone
                                                const testDate = new Date();
                                                testDate.setUTCHours(utcHour, 0, 0, 0);
                                                const localHour = parseInt(new Intl.DateTimeFormat('en', { timeZone: tz, hour: 'numeric', hour12: false }).format(testDate));
                                                const isWork = localHour >= 9 && localHour < 18;
                                                const isDay = localHour >= 7 && localHour < 20;
                                                return (
                                                    <td key={utcHour} className="px-0.5 py-1">
                                                        <div className={`h-6 w-7 rounded text-center text-[9px] font-mono leading-6 ${isWork ? 'bg-green-500 text-white' : isDay ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                                                            {localHour}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded inline-block" /> Çalışma saati (09–18)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded inline-block border border-green-200 dark:border-green-800" /> Gündüz (07–20)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded inline-block" /> Gece</span>
                        <span className="ml-auto text-slate-400">Yatay: UTC saatleri (0–23)</span>
                    </div>
                </div>
            )}
        </div>
    );
}
