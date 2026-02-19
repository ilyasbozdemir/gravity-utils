'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Upload, Download, ChevronUp, ChevronDown, Filter, Search, X } from 'lucide-react';

type SortDir = 'asc' | 'desc' | null;

function parseCSV(raw: string): { headers: string[]; rows: string[][] } {
    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return { headers: [], rows: [] };

    function parseLine(line: string): string[] {
        const cells: string[] = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
                else inQ = !inQ;
            } else if (ch === ',' && !inQ) {
                cells.push(cur); cur = '';
            } else {
                cur += ch;
            }
        }
        cells.push(cur);
        return cells.map(c => c.trim());
    }

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(l => parseLine(l));
    return { headers, rows };
}

function toCSV(headers: string[], rows: string[][]): string {
    const escape = (v: string) => v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    return [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');
}

function toJSON(headers: string[], rows: string[][]): string {
    return JSON.stringify(rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))), null, 2);
}

function computeStats(values: string[]): { min: string; max: string; avg: string; unique: number } {
    const nums = values.map(Number).filter(n => !isNaN(n));
    const unique = new Set(values).size;
    if (!nums.length) return { min: '—', max: '—', avg: '—', unique };
    const min = Math.min(...nums).toString();
    const max = Math.max(...nums).toString();
    const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
    return { min, max, avg, unique };
}

export function CsvViewer({ onBack }: { onBack: () => void }) {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [sortCol, setSortCol] = useState<number | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [filter, setFilter] = useState('');
    const [colFilters, setColFilters] = useState<Record<number, string>>({});
    const [activeTab, setActiveTab] = useState<'table' | 'json' | 'stats'>('table');
    const [error, setError] = useState('');

    const load = useCallback((text: string) => {
        const { headers, rows } = parseCSV(text);
        if (!headers.length) { setError('Geçerli CSV verisi bulunamadı'); return; }
        setHeaders(headers); setRows(rows); setError('');
        setSortCol(null); setSortDir(null); setFilter(''); setColFilters({});
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => load(ev.target?.result as string);
        reader.readAsText(file);
    }, [load]);

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => load(ev.target?.result as string);
        reader.readAsText(file);
    };

    const sorted = useCallback(() => {
        let data = [...rows];
        if (sortCol !== null && sortDir) {
            data.sort((a, b) => {
                const av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
                const an = Number(av), bn = Number(bv);
                const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        const q = filter.toLowerCase();
        if (q) data = data.filter(r => r.some(c => c.toLowerCase().includes(q)));
        Object.entries(colFilters).forEach(([col, val]) => {
            if (val) data = data.filter(r => (r[parseInt(col)] ?? '').toLowerCase().includes(val.toLowerCase()));
        });
        return data;
    }, [rows, sortCol, sortDir, filter, colFilters]);

    const handleSort = (col: number) => {
        if (sortCol !== col) { setSortCol(col); setSortDir('asc'); }
        else if (sortDir === 'asc') setSortDir('desc');
        else { setSortCol(null); setSortDir(null); }
    };

    const displayRows = sorted();

    const downloadFile = (content: string, name: string, mime: string) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Filter className="w-6 h-6 text-green-500" /> CSV Görüntüleyici
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">CSV yükle · sırala · filtrele · JSON/CSV olarak indir</p>
                </div>
                {headers.length > 0 && (
                    <div className="flex gap-2">
                        <button onClick={() => downloadFile(toCSV(headers, displayRows), 'filtered.csv', 'text/csv')}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all">
                            <Download size={14} /> CSV
                        </button>
                        <button onClick={() => downloadFile(toJSON(headers, displayRows), 'data.json', 'application/json')}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                            <Download size={14} /> JSON
                        </button>
                    </div>
                )}
            </div>

            {!headers.length ? (
                /* Drop zone */
                <div
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center hover:border-green-400 transition-colors">
                    <Upload className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">CSV dosyasını sürükle bırak</p>
                    <p className="text-slate-400 text-sm mb-4">veya</p>
                    <label className="cursor-pointer px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all inline-block">
                        Dosya Seç
                        <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} title="CSV dosyası seç" aria-label="CSV dosyası seç" />
                    </label>
                    {error && <p className="text-red-500 text-sm mt-4 flex items-center justify-center gap-1"><span>⚠️</span> {error}</p>}

                    {/* Sample */}
                    <div className="mt-8 text-left max-w-md mx-auto">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Örnek ile dene</p>
                        <button onClick={() => load(`Ad,Soyad,Yaş,Şehir,Puan
Ahmet,Yılmaz,28,İstanbul,92.5
Fatma,Kaya,34,Ankara,88.0
Mehmet,Demir,22,İzmir,95.3
Ayşe,Çelik,41,Bursa,76.8
Ali,Şahin,29,Adana,84.1`)}
                            className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-400 hover:border-green-400 transition-colors">
                            Ad, Soyad, Yaş, Şehir, Puan ...
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats bar */}
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold">{headers.length} sütun</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold">{rows.length} satır</span>
                        {filter || Object.values(colFilters).some(Boolean) ? (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-bold">
                                {displayRows.length} gösteriliyor
                            </span>
                        ) : null}

                        {/* Global search */}
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            <div className="relative flex-1 max-w-xs">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={filter} onChange={e => setFilter(e.target.value)}
                                    placeholder="Tümünde ara..." aria-label="Tabloda ara"
                                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 text-slate-700 dark:text-slate-300" />
                            </div>
                            <button onClick={() => { setFilter(''); setColFilters({}); setSortCol(null); setSortDir(null); }}
                                title="Filtreleri temizle" aria-label="Filtreleri temizle"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1">
                            {(['table', 'json', 'stats'] as const).map(t => (
                                <button key={t} onClick={() => setActiveTab(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    {t === 'table' ? 'Tablo' : t === 'json' ? 'JSON' : 'İstatistik'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'table' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-[10px] font-bold uppercase text-slate-400 w-10">#</th>
                                            {headers.map((h, i) => (
                                                <th key={i} className="px-3 py-2 text-left">
                                                    <button onClick={() => handleSort(i)}
                                                        className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-1">
                                                        {h}
                                                        {sortCol === i ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <span className="w-2.5" />}
                                                    </button>
                                                    <input
                                                        value={colFilters[i] ?? ''} onChange={e => setColFilters(p => ({ ...p, [i]: e.target.value }))}
                                                        placeholder="filtre…" aria-label={`${h} sütununu filtrele`}
                                                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-normal focus:outline-none focus:ring-1 focus:ring-green-500/40 text-slate-700 dark:text-slate-300" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayRows.map((row, ri) => (
                                            <tr key={ri} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-3 py-2.5 text-xs text-slate-400 font-mono">{ri + 1}</td>
                                                {headers.map((_, ci) => (
                                                    <td key={ci} className="px-3 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={row[ci]}>
                                                        {row[ci] ?? ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {!displayRows.length && (
                                            <tr><td colSpan={headers.length + 1} className="px-3 py-8 text-center text-slate-400 text-sm">Sonuç bulunamadı</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'json' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                            <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-[60vh] leading-relaxed">
                                {toJSON(headers, displayRows)}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {headers.map((h, i) => {
                                const vals = rows.map(r => r[i] ?? '');
                                const stats = computeStats(vals);
                                const nonEmpty = vals.filter(v => v.trim() !== '').length;
                                return (
                                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-3 truncate">{h}</p>
                                        <div className="space-y-2 text-xs">
                                            {[
                                                ['Dolu', `${nonEmpty} / ${vals.length}`],
                                                ['Benzersiz', stats.unique],
                                                ['Min', stats.min],
                                                ['Max', stats.max],
                                                ['Ort.', stats.avg],
                                            ].map(([label, value]) => (
                                                <div key={label as string} className="flex justify-between">
                                                    <span className="text-slate-400">{label}</span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
