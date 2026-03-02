'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check, Clock, RefreshCw } from 'lucide-react';

// ─── Cron Parser ────────────────────────────────────────────────────────────────
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function parseCronPart(val: string, min: number, max: number): number[] {
    const all = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    if (val === '*') return all;
    const result: number[] = [];
    for (const part of val.split(',')) {
        if (part.includes('/')) {
            const [range, step] = part.split('/');
            const stepN = parseInt(step);
            const base = range === '*' ? all : parseCronPart(range, min, max);
            base.filter((_, i) => i % stepN === 0).forEach(v => result.push(v));
        } else if (part.includes('-')) {
            const [from, to] = part.split('-').map(Number);
            for (let i = from; i <= to; i++) result.push(i);
        } else {
            const n = parseInt(part);
            if (!isNaN(n)) result.push(n);
        }
    }
    return [...new Set(result)].sort((a, b) => a - b);
}

function cronToHuman(expr: string): string {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return 'Geçersiz cron ifadesi';
    const [min, hour, dom, month, dow] = parts;
    try {
        const mins = parseCronPart(min, 0, 59);
        const hours = parseCronPart(hour, 0, 23);
        const doms = parseCronPart(dom, 1, 31);
        const months = parseCronPart(month, 1, 12);
        const dows = parseCronPart(dow, 0, 6);

        const minStr = min === '*' ? 'her dakika' : `${mins.join(', ')}. dakika`;
        const hourStr = hour === '*' ? 'her saat' : `saat ${hours.map(h => h.toString().padStart(2, '0')).join(', ')}`;
        const domStr = dom === '*' ? 'her gün' : `ayın ${doms.join(', ')}. günü`;
        const monthStr = month === '*' ? 'her ay' : months.map(m => MONTHS[m - 1]).join(', ');
        const dowStr = dow === '*' ? 'her gün' : dows.map(d => DAYS[d]).join(', ');

        if (expr === '* * * * *') return 'Her dakika';
        if (expr === '0 * * * *') return 'Her saat başı';
        if (expr === '0 0 * * *') return 'Her gün gece yarısı';
        if (expr === '0 0 * * 0') return 'Her Pazar gece yarısı';
        if (expr === '0 0 1 * *') return 'Her ayın 1\'inde gece yarısı';
        if (expr === '0 0 1 1 *') return 'Her yılın 1 Ocak\'ında gece yarısı';

        return `${hourStr}:${min === '*' ? 'xx' : mins[0].toString().padStart(2, '0')} — ${domStr}, ${monthStr}, ${dowStr}`;
    } catch {
        return 'Geçersiz cron ifadesi';
    }
}

function nextExecutions(expr: string, count = 10): Date[] {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return [];
    const [minP, hourP, domP, monthP, dowP] = parts;
    try {
        const mins = parseCronPart(minP, 0, 59);
        const hours = parseCronPart(hourP, 0, 23);
        const months = parseCronPart(monthP, 1, 12);
        const dows = parseCronPart(dowP, 0, 6);

        const results: Date[] = [];
        const now = new Date();
        const d = new Date(now);
        d.setSeconds(0, 0);
        d.setMinutes(d.getMinutes() + 1);

        for (let attempts = 0; attempts < 100000 && results.length < count; attempts++) {
            if (!months.includes(d.getMonth() + 1)) { d.setMonth(d.getMonth() + 1); d.setDate(1); d.setHours(0, 0); continue; }
            if (domP !== '*') {
                const doms = parseCronPart(domP, 1, 31);
                if (!doms.includes(d.getDate())) { d.setDate(d.getDate() + 1); d.setHours(0, 0); continue; }
            }
            if (dowP !== '*' && !dows.includes(d.getDay())) { d.setDate(d.getDate() + 1); d.setHours(0, 0); continue; }
            if (!hours.includes(d.getHours())) { d.setHours(d.getHours() + 1); d.setMinutes(0); continue; }
            if (!mins.includes(d.getMinutes())) { d.setMinutes(d.getMinutes() + 1); continue; }
            results.push(new Date(d));
            d.setMinutes(d.getMinutes() + 1);
        }
        return results;
    } catch { return []; }
}

const PRESETS = [
    { label: 'Her dakika', expr: '* * * * *' },
    { label: 'Her saat başı', expr: '0 * * * *' },
    { label: 'Her gün 09:00', expr: '0 9 * * *' },
    { label: 'Her gün gece yarısı', expr: '0 0 * * *' },
    { label: 'Her Pazartesi 08:00', expr: '0 8 * * 1' },
    { label: 'Her Cuma 17:00', expr: '0 17 * * 5' },
    { label: 'Her hafta başı', expr: '0 0 * * 0' },
    { label: 'Her ayın 1\'i', expr: '0 0 1 * *' },
    { label: 'Her 15 dakikada', expr: '*/15 * * * *' },
    { label: 'Her 6 saatte', expr: '0 */6 * * *' },
    { label: 'Hafta içi 09:00', expr: '0 9 * * 1-5' },
    { label: 'Yılda bir (1 Ocak)', expr: '0 0 1 1 *' },
];

function Field({ label, value, onChange, min, max, hint }: { label: string; value: string; onChange: (v: string) => void; min: number; max: number; hint: string }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">{label}</label>
            <input value={value} onChange={e => onChange(e.target.value)}
                aria-label={`Cron ${label} alanı`}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-center text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-full transition-colors" />
            <p className="text-[9px] text-slate-400 text-center">{hint} ({min}–{max})</p>
        </div>
    );
}

export function CronBuilder({ onBack }: { onBack: () => void }) {
    const [parts, setParts] = useState(['0', '9', '*', '*', '*']);
    const [copied, setCopied] = useState(false);

    const expr = parts.join(' ');
    const human = cronToHuman(expr);
    const nexts = nextExecutions(expr, 8);
    const isValid = !human.includes('Geçersiz');

    const setPart = (i: number, v: string) => setParts(p => p.map((x, idx) => idx === i ? v : x));
    const setPreset = (e: string) => setParts(e.split(' '));
    const copy = () => { navigator.clipboard.writeText(expr); setCopied(true); setTimeout(() => setCopied(false), 1500); };

    const FIELDS = [
        { label: 'Dakika', min: 0, max: 59, hint: '* / , -' },
        { label: 'Saat', min: 0, max: 23, hint: '* / , -' },
        { label: 'Gün (ay)', min: 1, max: 31, hint: '* / , -' },
        { label: 'Ay', min: 1, max: 12, hint: '* / , -' },
        { label: 'Gün (hafta)', min: 0, max: 6, hint: '0=Paz 6=Cmt' },
    ];

    return (
        <div className="max-w-3xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-violet-500" /> Cron İfade Oluşturucu
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Görsel cron builder · insan okunabilir çeviri · sonraki çalışmalar</p>
                </div>
            </div>

            {/* Expression display */}
            <div className={`flex items-center gap-3 p-5 rounded-2xl mb-6 border-2 transition-colors ${isValid ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                <code className="flex-1 text-2xl font-mono font-black text-slate-800 dark:text-white tracking-widest">{expr}</code>
                <button onClick={copy} title="Kopyala" aria-label="Cron ifadesini kopyala"
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-400 transition-colors text-slate-400 hover:text-violet-600">
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
            </div>

            {/* Human readable */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">İnsan Okunabilir</p>
                <p className={`text-lg font-semibold ${isValid ? 'text-slate-800 dark:text-slate-200' : 'text-red-500'}`}>{human}</p>
            </div>

            {/* Fields */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500 mb-4">Alanlar</p>
                <div className="grid grid-cols-5 gap-3">
                    {FIELDS.map((f, i) => (
                        <Field key={f.label} label={f.label} value={parts[i]} onChange={v => setPart(i, v)} min={f.min} max={f.max} hint={f.hint} />
                    ))}
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-300">Sözdizimi:</strong> &nbsp;
                    <code>*</code> = her · <code>,</code> = liste · <code>-</code> = aralık · <code>/</code> = adım &nbsp;
                    <span className="text-slate-400">örn: */5 = her 5'te, 1-5 = 1'den 5'e, 0,6 = 0 ve 6</span>
                </div>
            </div>

            {/* Presets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Hazır Şablonlar</p>
                <div className="grid sm:grid-cols-2 gap-2">
                    {PRESETS.map(p => (
                        <button key={p.expr} onClick={() => setPreset(p.expr)}
                            className={`flex justify-between items-center px-3 py-2.5 rounded-xl border text-sm transition-all ${expr === p.expr ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-300 text-slate-600 dark:text-slate-400'}`}>
                            <span>{p.label}</span>
                            <code className="text-[10px] font-mono text-slate-400">{p.expr}</code>
                        </button>
                    ))}
                </div>
            </div>

            {/* Next executions */}
            {isValid && nexts.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1">
                        <RefreshCw size={12} /> Sonraki {nexts.length} Çalışma
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {nexts.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <span className="text-[10px] text-slate-400 w-4">{i + 1}</span>
                                <Clock size={12} className="text-violet-400 shrink-0" />
                                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                                    {d.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: 'short' })} —{' '}
                                    {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
