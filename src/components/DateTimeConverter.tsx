'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Globe, Moon } from 'lucide-react';
import { format, formatDistance, fromUnixTime, getUnixTime, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function DateTimeConverter({ onBack }: { onBack: () => void }) {
    const [date, setDate] = useState<Date>(new Date());
    const [epochInput, setEpochInput] = useState(String(getUnixTime(new Date())));
    const [isoInput, setIsoInput] = useState('');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            setDate(newDate);
            setEpochInput(String(getUnixTime(newDate)));
        }
    };

    const handleEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setEpochInput(val);
        if (val) {
            const newDate = fromUnixTime(parseInt(val));
            if (!isNaN(newDate.getTime())) setDate(newDate);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-purple-500" />
                        Tarih & Zaman Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Epoch timestamp, ISO 8601 ve yerel zaman formatları
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
                {/* Input Panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Girdiler</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Clock size={16} /> Epoch (Unix Timestamp)
                        </label>
                        <input
                            type="text"
                            value={epochInput}
                            onChange={handleEpochChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                        />
                        <div className="text-xs text-slate-400 dark:text-slate-500 flex gap-2">
                            <button onClick={() => setEpochInput(String(getUnixTime(new Date())))} className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Şimdi</button>
                            <button onClick={() => setEpochInput('0')} className="hover:text-purple-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Başlangıç (1970)</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Calendar size={16} /> Tarih Seçici
                        </label>
                        <input
                            type="datetime-local"
                            value={format(date, "yyyy-MM-dd'T'HH:mm")}
                            onChange={handleDateChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                        />
                    </div>
                </div>

                {/* Output Panel */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Sonuçlar</h3>

                    {/* Result Item */}
                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">ISO 8601</span>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <code className="text-sm font-mono text-purple-600 dark:text-purple-400 truncate">
                                {date.toISOString()}
                            </code>
                            <button onClick={() => navigator.clipboard.writeText(date.toISOString())} className="text-slate-400 hover:text-purple-500"><Copy size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">RFC 2822</span>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <code className="text-sm font-mono text-blue-600 dark:text-blue-400 truncate">
                                {date.toUTCString()}
                            </code>
                            <button onClick={() => navigator.clipboard.writeText(date.toUTCString())} className="text-slate-400 hover:text-blue-500"><Copy size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">İnsan Okunabilir (Yerel)</span>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {format(date, 'PPPP p', { locale: tr })}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Göreceli Zaman</span>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 italic">
                                {formatDistance(date, new Date(), { addSuffix: true, locale: tr })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Copy({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    )
}
