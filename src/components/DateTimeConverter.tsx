'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Copy, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { format, formatDistance, fromUnixTime, getUnixTime } from 'date-fns';
import { tr } from 'date-fns/locale';

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
            className={`text-slate-400 hover:text-${color}-500 transition-colors`}>
            {copied
                ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>}
        </button>
    );
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">{label}</span>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg gap-2">
                <code className={`text-sm font-mono ${color} truncate flex-1`}>{value}</code>
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

    const parsedA = new Date(dateA);
    const parsedB = new Date(dateB);
    const diffValid = !isNaN(parsedA.getTime()) && !isNaN(parsedB.getTime());
    const diff = diffValid ? fmtDuration(parsedB.getTime() - parsedA.getTime()) : null;

    const swap = () => { setDateA(dateB); setDateB(dateA); };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-purple-500" /> Tarih &amp; Zaman Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Epoch · ISO 8601 · Yerel format · Tarih farkı</p>
                </div>
            </div>

            {/* ── Section 1: Converter ──────────────────────────────────── */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Clock size={12} /> Format Dönüştürücü
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">Girdiler</h4>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Clock size={14} /> Epoch (Unix Timestamp)
                            </label>
                            <input type="text" value={epochInput} onChange={handleEpochChange}
                                aria-label="Epoch Zaman Damgası" placeholder="Zaman damgası girin"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none" />
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => { const n = new Date(); setDate(n); setEpochInput(String(getUnixTime(n))); }}
                                    className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 text-slate-500">
                                    <RefreshCw size={10} /> Şimdi
                                </button>
                                <button onClick={() => { setEpochInput('0'); setDate(fromUnixTime(0)); }}
                                    className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                                    Başlangıç (1970)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Calendar size={14} /> Tarih Seçici
                            </label>
                            <input type="datetime-local" value={format(date, "yyyy-MM-dd'T'HH:mm")} onChange={handleDateChange}
                                aria-label="Tarih Seçici"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none" />
                        </div>
                    </div>

                    {/* Output panel */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner space-y-4">
                        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2">Sonuçlar</h4>
                        <ResultRow label="ISO 8601" value={date.toISOString()} color="text-purple-600 dark:text-purple-400" />
                        <ResultRow label="RFC 2822" value={date.toUTCString()} color="text-blue-600 dark:text-blue-400" />
                        <ResultRow label="İnsan Okunabilir (Yerel)" value={format(date, 'PPPP p', { locale: tr })} color="text-slate-700 dark:text-slate-200" />
                        <ResultRow label="Göreceli Zaman" value={formatDistance(date, new Date(), { addSuffix: true, locale: tr })} color="text-slate-700 dark:text-slate-200 italic" />
                        <ResultRow label="Epoch (sn)" value={String(getUnixTime(date))} color="text-emerald-600 dark:text-emerald-400" />
                        <ResultRow label="Epoch (ms)" value={String(date.getTime())} color="text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
            </section>

            {/* ── Section 2: Date Diff ──────────────────────────────────── */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <ArrowLeftRight size={12} /> Tarih Farkı Hesaplayıcı
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    {/* Inputs row */}
                    <div className="flex flex-col sm:flex-row items-end gap-3 mb-6">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Başlangıç Tarihi</label>
                            <input type="datetime-local" value={dateA} onChange={e => setDateA(e.target.value)}
                                aria-label="Başlangıç tarihi"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none" />
                        </div>

                        <button onClick={swap} title="Tarihleri yer değiştir"
                            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 shrink-0">
                            <ArrowLeftRight size={18} />
                        </button>

                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bitiş Tarihi</label>
                            <input type="datetime-local" value={dateB} onChange={e => setDateB(e.target.value)}
                                aria-label="Bitiş tarihi"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none" />
                        </div>
                    </div>

                    {/* Diff result */}
                    {diff ? (
                        <div className="space-y-4">
                            {/* Big cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Gün', value: diff.days, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                    { label: 'Saat', value: diff.hours, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                    { label: 'Dakika', value: diff.minutes, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                                    { label: 'Saniye', value: diff.seconds, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                ].map(({ label, value, color, bg }) => (
                                    <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-800`}>
                                        <div className={`text-3xl font-black tabular-nums ${color}`}>{value}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary rows */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Toplam Saat', value: String(diff.days * 24 + diff.hours) + ' saat', color: 'text-blue-600 dark:text-blue-400' },
                                    { label: 'Toplam Dakika', value: String(diff.days * 1440 + diff.hours * 60 + diff.minutes) + ' dk', color: 'text-teal-600 dark:text-teal-400' },
                                    { label: 'Göreceli', value: formatDistance(parsedA, parsedB, { locale: tr }), color: 'text-slate-600 dark:text-slate-300 italic' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl gap-2">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                                            <div className={`text-sm font-bold ${color}`}>{value}</div>
                                        </div>
                                        <CopyBtn text={value} />
                                    </div>
                                ))}
                            </div>

                            {/* Direction badge */}
                            <div className={`text-center text-xs font-bold rounded-xl py-2 px-4 ${diff.sign >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                                {diff.sign >= 0 ? `B tarihi, A tarihinden ${diff.days} gün ${diff.hours} saat ${diff.minutes} dk ${diff.seconds} sn sonra` : `B tarihi, A tarihinden ${diff.days} gün ${diff.hours} saat önce`}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-4 text-sm">Geçerli tarihler girin</p>
                    )}
                </div>
            </section>
        </div>
    );
}
