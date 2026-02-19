'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Copy, RefreshCw, ArrowLeftRight, Briefcase, Info, TrendingUp } from 'lucide-react';
import {
    format,
    formatDistance,
    fromUnixTime,
    getUnixTime,
    differenceInBusinessDays,
    differenceInWeeks,
    differenceInMonths,
    differenceInYears,
    differenceInDays,
    intervalToDuration
} from 'date-fns';
import { tr } from 'date-fns/locale';

// ─── types ──────────────────────────────────────────────────────────────────
type DiffMode = 'standard' | 'business' | 'detailed';

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(diffMs: number) {
    const abs = Math.abs(diffMs);
    const totalSec = Math.floor(abs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds, sign: diffMs < 0 ? -1 : 1 };
}

function CopyBtn({ text, color = 'purple' }: { text: string; color?: string }) {
    const [copied, setCopied] = useState(false);
    const handle = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
    return (
        <button onClick={handle} title="Kopyala" aria-label="Kopyala"
            className={`text-slate-400 hover:text-${color}-500 transition-colors shrink-0`}>
            {copied
                ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>}
        </button>
    );
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</span>
            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg gap-2">
                <code className={`text-xs font-mono ${color} truncate flex-1`}>{value}</code>
                <CopyBtn text={value} />
            </div>
        </div>
    );
}

export function DateTimeConverter({ onBack }: { onBack: () => void }) {
    // ── Single date state ──────────────────────────────────────────
    const [date, setDate] = useState<Date>(new Date());
    const [epochInput, setEpochInput] = useState(String(getUnixTime(new Date())));

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) { setDate(newDate); setEpochInput(String(getUnixTime(newDate))); }
    };
    const handleEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setEpochInput(val);
        if (val) { const d = fromUnixTime(parseInt(val)); if (!isNaN(d.getTime())) setDate(d); }
    };

    // ── Diff state ─────────────────────────────────────────────────
    const [dateA, setDateA] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [dateB, setDateB] = useState(format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd'T'HH:mm"));
    const [diffMode, setDiffMode] = useState<DiffMode>('standard');

    const parsedA = new Date(dateA);
    const parsedB = new Date(dateB);
    const diffValid = !isNaN(parsedA.getTime()) && !isNaN(parsedB.getTime());

    // Calculations
    const diffMs = diffValid ? parsedB.getTime() - parsedA.getTime() : 0;
    const standardDiff = diffValid ? fmtDuration(diffMs) : null;

    // date-fns extras
    const businessDays = diffValid ? Math.abs(differenceInBusinessDays(parsedB, parsedA)) : 0;
    const totalWeeks = diffValid ? Math.abs(differenceInWeeks(parsedB, parsedA)) : 0;
    const totalMonths = diffValid ? Math.abs(differenceInMonths(parsedB, parsedA)) : 0;
    const totalYears = diffValid ? Math.abs(differenceInYears(parsedB, parsedA)) : 0;
    const totalDays = diffValid ? Math.abs(differenceInDays(parsedB, parsedA)) : 0;

    const duration = diffValid ? intervalToDuration({
        start: parsedA < parsedB ? parsedA : parsedB,
        end: parsedA < parsedB ? parsedB : parsedA
    }) : null;

    const swap = () => { setDateA(dateB); setDateB(dateA); };

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300 space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <Clock className="w-6 h-6 text-purple-500" /> Zaman &amp; Tarih Merkezi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Epoch çevirici ve gelişmiş tarih farkı hesaplayıcı</p>
                </div>
            </div>

            {/* ── Section 1: Converter ──────────────────────────────────── */}
            <section className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
                    <RefreshCw size={14} className="text-purple-500" /> Format Dönüştürücü
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                <Clock size={14} /> Unix Epoch (sn)
                            </label>
                            <input type="text" value={epochInput} onChange={handleEpochChange}
                                aria-label="Epoch Zaman Damgası" placeholder="Zaman damgası girin"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all" />
                            <div className="flex gap-2 text-[10px]">
                                <button onClick={() => { const n = new Date(); setDate(n); setEpochInput(String(getUnixTime(n))); }}
                                    className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-1 font-bold text-slate-500 transition-colors">
                                    <RefreshCw size={10} /> ŞİMDİ
                                </button>
                                <button onClick={() => { setEpochInput('0'); setDate(fromUnixTime(0)); }}
                                    className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-bold text-slate-500 transition-colors">
                                    GMT 1970
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                <Calendar size={14} /> Tarih &amp; Saat Seçici
                            </label>
                            <input type="datetime-local" value={format(date, "yyyy-MM-dd'T'HH:mm")} onChange={handleDateChange}
                                aria-label="Tarih Seçici"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all" />
                        </div>
                    </div>

                    {/* Output panel */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner space-y-3.5">
                        <ResultRow label="ISO 8601" value={date.toISOString()} color="text-purple-600 dark:text-purple-400" />
                        <ResultRow label="RFC 2822" value={date.toUTCString()} color="text-blue-600 dark:text-blue-400" />
                        <ResultRow label="Yerel Format" value={format(date, 'PPPP p', { locale: tr })} color="text-slate-700 dark:text-slate-200" />
                        <ResultRow label="Göreceli" value={formatDistance(date, new Date(), { addSuffix: true, locale: tr })} color="text-indigo-600 dark:text-indigo-400 italic font-medium" />
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <ResultRow label="Epoch (sn)" value={String(getUnixTime(date))} color="text-emerald-600 dark:text-emerald-400" />
                            <ResultRow label="Epoch (ms)" value={String(date.getTime())} color="text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 2: Date Diff ──────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
                        <ArrowLeftRight size={14} className="text-purple-500" /> Tarih Farkı Hesaplayıcı
                    </h3>
                    {/* Mode Switcher */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                        {(['standard', 'business', 'detailed'] as const).map(m => (
                            <button key={m} onClick={() => setDiffMode(m)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${diffMode === m ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                {m === 'standard' ? 'Süre' : m === 'business' ? 'İş Günü' : 'Detaylı'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <TrendingUp size={120} />
                    </div>

                    {/* Inputs row */}
                    <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
                        <div className="w-full lg:flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Başlangıç Tarihi</label>
                            <input type="datetime-local" value={dateA} onChange={e => setDateA(e.target.value)}
                                aria-label="Başlangıç tarihi"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all shadow-inner" />
                        </div>

                        <button onClick={swap} title="Tarihleri yer değiştir"
                            className="p-3.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-full transition-all text-purple-600 dark:text-purple-400 hover:scale-110 active:scale-95 shadow-sm border border-purple-100 dark:border-purple-500/20 mt-6 lg:mt-6">
                            <ArrowLeftRight size={20} />
                        </button>

                        <div className="w-full lg:flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bitiş Tarihi</label>
                            <input type="datetime-local" value={dateB} onChange={e => setDateB(e.target.value)}
                                aria-label="Bitiş tarihi"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all shadow-inner" />
                        </div>
                    </div>

                    {/* Diff Visualization */}
                    {standardDiff ? (
                        <div className="space-y-6">
                            {diffMode === 'standard' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'GÜN', value: standardDiff.days, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                                        { label: 'SAAT', value: standardDiff.hours, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                                        { label: 'DAKİKA', value: standardDiff.minutes, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/10' },
                                        { label: 'SANİYE', value: standardDiff.seconds, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                                    ].map(({ label, value, color, bg }) => (
                                        <div key={label} className={`${bg} rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-800/50 shadow-sm hover:translate-y-[-2px] transition-transform`}>
                                            <div className={`text-4xl font-black tabular-nums ${color}`}>{value}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {diffMode === 'business' && (
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-8 text-center">
                                        <Briefcase className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                                        <div className="text-5xl font-black text-amber-600 dark:text-amber-400 tabular-nums mb-2">{businessDays}</div>
                                        <div className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-[0.2em]">TOPLAM İŞ GÜNÜ</div>
                                        <p className="text-[10px] text-amber-600/60 dark:text-amber-400/40 mt-3 italic line-clamp-1">Hafta sonları (Cumartesi-Pazar) hariç tutulmuştur.</p>
                                    </div>
                                    <div className="md:w-72 space-y-3">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Takvim Günü</div>
                                            <div className="text-xl font-black text-slate-700 dark:text-slate-300">{totalDays} gün</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Hafta Sonu</div>
                                            <div className="text-xl font-black text-slate-700 dark:text-slate-300">{totalDays - businessDays} gün</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {diffMode === 'detailed' && (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-950 rounded-3xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Info size={18} className="text-indigo-500" />
                                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Hayat/Yaş Periyodu (Hassas)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
                                            {duration && (
                                                <>
                                                    <div className="text-center lg:text-left">
                                                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{duration.years || 0}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">YIL</div>
                                                    </div>
                                                    <div className="text-center lg:text-left">
                                                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{duration.months || 0}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">AY</div>
                                                    </div>
                                                    <div className="text-center lg:text-left">
                                                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{duration.days || 0}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">GÜN</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'TOPLAM HAFTA', value: totalWeeks, color: 'text-slate-600' },
                                            { label: 'TOPLAM AY', value: totalMonths, color: 'text-slate-600' },
                                            { label: 'TOPLAM YIL', value: totalYears, color: 'text-slate-600' },
                                            { label: 'TOPLAM GÜN', value: totalDays, color: 'text-slate-600' },
                                        ].map(f => (
                                            <div key={f.label} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</div>
                                                <div className="text-lg font-black text-slate-800 dark:text-slate-200">{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Relative display & Copy Bar */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${standardDiff.sign >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                                    {standardDiff.sign >= 0 ? 'İleriye Doğru' : 'Geriye Doğru'}
                                    <span className="text-slate-400 mx-1 opacity-50">•</span>
                                    {formatDistance(parsedA, parsedB, { locale: tr })}
                                </div>
                                <div className="sm:ml-auto flex gap-2">
                                    <button onClick={() => navigator.clipboard.writeText(`${totalDays} gün`)}
                                        className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-slate-500 hover:text-purple-500 transition-colors uppercase tracking-widest">
                                        Gün Olarak Kopyala
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <Calendar size={48} className="mx-auto text-slate-200 dark:text-slate-800" />
                            <p className="text-slate-400 font-medium italic">Hesaplamak için geçerli başlangıç ve bitiş tarihleri girin</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
