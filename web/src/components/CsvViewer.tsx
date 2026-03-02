'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ArrowLeft, Upload, Download, ChevronUp, ChevronDown,
    Search, X, Table2, Braces, BarChart3, FileSpreadsheet,
    FileText, Edit3, Check, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
type ViewTab = 'table' | 'json' | 'stats';

interface SheetData {
    name: string;
    headers: string[];
    rows: string[][];
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(raw: string): SheetData {
    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return { name: 'Sheet1', headers: [], rows: [] };

    function parseLine(line: string): string[] {
        const cells: string[] = [];
        let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
                else inQ = !inQ;
            } else if (ch === ',' && !inQ) {
                cells.push(cur); cur = '';
            } else cur += ch;
        }
        cells.push(cur);
        return cells.map(c => c.trim());
    }

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(l => parseLine(l));
    return { name: 'Sheet1', headers, rows };
}

// ─── Excel Parser ─────────────────────────────────────────────────────────────
function parseExcel(buffer: ArrayBuffer): SheetData[] {
    const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
    return wb.SheetNames.map(name => {
        const ws = wb.Sheets[name];
        const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as string[][];
        if (!data.length) return { name, headers: [], rows: [] };
        const headers = (data[0] ?? []).map(String);
        const rows = data.slice(1).map(r => headers.map((_, i) => String(r[i] ?? '')));
        return { name, headers, rows };
    });
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function toCSV(headers: string[], rows: string[][]): string {
    const esc = (v: string) => v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    return [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
}

function toJSON(headers: string[], rows: string[][]): string {
    return JSON.stringify(rows.map(row =>
        Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
    ), null, 2);
}

function downloadBlob(content: BlobPart, name: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
}

function exportXLSX(headers: string[], rows: string[][], name: string) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    downloadBlob(buf, `${name}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// ─── Stats helper ─────────────────────────────────────────────────────────────
function computeStats(values: string[]) {
    const nums = values.map(Number).filter(n => !isNaN(n) && values.find(v => v !== ''));
    const unique = new Set(values.filter(v => v !== '')).size;
    const empty = values.filter(v => v.trim() === '').length;
    if (!nums.length) return { min: '—', max: '—', avg: '—', sum: '—', unique, empty };
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    const fmt = (n: number) => n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return { min: fmt(min), max: fmt(max), avg: fmt(avg), sum: fmt(sum), unique, empty };
}

// ─── Cell type detector ───────────────────────────────────────────────────────
function cellType(val: string): 'number' | 'date' | 'bool' | 'empty' | 'text' {
    if (!val || val.trim() === '') return 'empty';
    if (!isNaN(Number(val))) return 'number';
    if (/^(true|false|yes|no|evet|hayır)$/i.test(val)) return 'bool';
    if (/^\d{1,4}[.\-\/]\d{1,2}[.\-\/]\d{1,4}/.test(val)) return 'date';
    return 'text';
}

const CELL_COLORS: Record<string, string> = {
    number: 'text-blue-700 dark:text-blue-400',
    date: 'text-purple-700 dark:text-purple-400',
    bool: 'text-green-700 dark:text-green-400',
    empty: 'text-slate-300 dark:text-slate-600 italic',
    text: 'text-slate-700 dark:text-slate-300',
};

// ─── Main Component ────────────────────────────────────────────────────────────
export function CsvViewer({ onBack }: { onBack: () => void }) {
    const [sheets, setSheets] = useState<SheetData[]>([]);
    const [activeSheet, setActiveSheet] = useState(0);
    const [sortCol, setSortCol] = useState<number | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [colFilters, setColFilters] = useState<Record<number, string>>({});
    const [viewTab, setViewTab] = useState<ViewTab>('table');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [filename, setFilename] = useState('');
    const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
    const [editVal, setEditVal] = useState('');
    const [colWidths, setColWidths] = useState<Record<number, number>>({});
    const [colorize, setColorize] = useState(true);
    const editRef = useRef<HTMLInputElement>(null);

    const sheet = sheets[activeSheet] ?? { name: '', headers: [], rows: [] };

    // ─── Loaders ───────────────────────────────────────────────────────────
    const loadCSV = useCallback((text: string, name = 'data') => {
        const parsed = parseCSV(text);
        if (!parsed.headers.length) { setError('Geçerli CSV verisi bulunamadı'); return; }
        setSheets([parsed]);
        setActiveSheet(0);
        setFilename(name);
        setError('');
        setSortCol(null); setSortDir(null);
        setGlobalFilter(''); setColFilters({});
        setEditCell(null); setColWidths({});
    }, []);

    const loadExcel = useCallback((buffer: ArrayBuffer, name = 'workbook') => {
        try {
            const parsed = parseExcel(buffer);
            if (!parsed.length) { setError('Excel dosyası okunamadı'); return; }
            setSheets(parsed);
            setActiveSheet(0);
            setFilename(name);
            setError('');
            setSortCol(null); setSortDir(null);
            setGlobalFilter(''); setColFilters({});
            setEditCell(null); setColWidths({});
        } catch {
            setError('Excel dosyası işlenirken hata oluştu.');
        }
    }, []);

    const handleFile = useCallback((file: File) => {
        const name = file.name.replace(/\.[^.]+$/, '');
        if (file.name.match(/\.(xlsx|xls|ods)$/i)) {
            file.arrayBuffer().then(buf => loadExcel(buf, name));
        } else {
            const reader = new FileReader();
            reader.onload = e => loadCSV(e.target?.result as string, name);
            reader.readAsText(file);
        }
    }, [loadCSV, loadExcel]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    // ─── Sort + Filter ─────────────────────────────────────────────────────
    const displayRows = useCallback(() => {
        let data = [...sheet.rows];
        if (sortCol !== null && sortDir) {
            data.sort((a, b) => {
                const av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
                const an = Number(av), bn = Number(bv);
                const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv, 'tr');
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        const q = globalFilter.toLowerCase();
        if (q) data = data.filter(r => r.some(c => c.toLowerCase().includes(q)));
        Object.entries(colFilters).forEach(([col, val]) => {
            if (val) data = data.filter(r => (r[+col] ?? '').toLowerCase().includes(val.toLowerCase()));
        });
        return data;
    }, [sheet.rows, sortCol, sortDir, globalFilter, colFilters]);

    const handleSort = (col: number) => {
        if (sortCol !== col) { setSortCol(col); setSortDir('asc'); }
        else if (sortDir === 'asc') setSortDir('desc');
        else { setSortCol(null); setSortDir(null); }
    };

    // ─── Cell edit ─────────────────────────────────────────────────────────
    const startEdit = (ri: number, ci: number, val: string) => {
        setEditCell({ row: ri, col: ci }); setEditVal(val);
    };

    const commitEdit = () => {
        if (!editCell) return;
        setSheets(prev => prev.map((s, si) => si !== activeSheet ? s : {
            ...s,
            rows: s.rows.map((r, ri) => ri !== editCell.row ? r : r.map((c, ci) => ci !== editCell.col ? c : editVal)),
        }));
        setEditCell(null);
    };

    useEffect(() => { if (editCell && editRef.current) editRef.current.focus(); }, [editCell]);

    const rows = displayRows();

    // ─── Column letter helper (A, B, … Z, AA, AB…) ────────────────────────
    const colLabel = (i: number) => {
        let s = '';
        i++;
        while (i > 0) { s = String.fromCharCode(64 + (i % 26 || 26)) + s; i = Math.floor((i - 1) / 26); }
        return s;
    };

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div className="max-w-full mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">

            {/* ── Header ── */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="truncate">{filename ? filename : 'Tablo Görüntüleyici'}</span>
                    </h2>
                    {sheet.headers.length > 0 && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            {sheet.headers.length} sütun · {sheet.rows.length} satır
                            {rows.length !== sheet.rows.length && ` · ${rows.length} gösteriliyor`}
                        </p>
                    )}
                </div>

                {sheet.headers.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Colorize toggle */}
                        <button onClick={() => setColorize(v => !v)}
                            title="Hücre renklendirme" aria-label="Hücre renklendirmeyi aç/kapat"
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${colorize ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            🎨 Renk
                        </button>
                        {/* Reset */}
                        <button onClick={() => { setSheets([]); setFilename(''); setError(''); }}
                            title="Yeni dosya yükle" aria-label="Yeni dosya yükle"
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <RefreshCw size={16} />
                        </button>
                        {/* Download CSV */}
                        <button onClick={() => downloadBlob(toCSV(sheet.headers, rows), `${filename || 'data'}.csv`, 'text/csv')}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all">
                            <Download size={13} /> CSV
                        </button>
                        {/* Download XLSX */}
                        <button onClick={() => exportXLSX(sheet.headers, rows, filename || 'data')}
                            className="flex items-center gap-1 px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all">
                            <Download size={13} /> XLSX
                        </button>
                        {/* Download JSON */}
                        <button onClick={() => downloadBlob(toJSON(sheet.headers, rows), `${filename || 'data'}.json`, 'application/json')}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                            <Download size={13} /> JSON
                        </button>
                    </div>
                )}
            </div>

            {/* ── Drop Zone ── */}
            {!sheet.headers.length && (
                <div
                    onDrop={onDrop}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all cursor-pointer
                        ${isDragging
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400'}`}>
                    <FileSpreadsheet className={`w-14 h-14 mx-auto mb-4 transition-colors ${isDragging ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">Dosyayı buraya sürükle bırak</p>
                    <p className="text-slate-400 text-sm mb-6">CSV, Excel (.xlsx / .xls) veya ODS desteklenir</p>

                    <label className="cursor-pointer px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all inline-block">
                        Dosya Seç
                        <input type="file" accept=".csv,.xlsx,.xls,.ods,text/csv"
                            className="hidden"
                            title="Dosya seç" aria-label="CSV veya Excel dosyası seç"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </label>

                    {error && <p className="text-red-500 text-sm mt-4">⚠️ {error}</p>}

                    {/* Sample data buttons */}
                    <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                        <p className="col-span-2 text-xs font-bold uppercase text-slate-400">Demo Verileri</p>
                        <button onClick={() => loadCSV(`Ad,Soyad,Yaş,Şehir,Maaş,Departman,Aktif
Ahmet,Yılmaz,28,İstanbul,12500,Mühendislik,true
Fatma,Kaya,34,Ankara,15800,Yönetim,true
Mehmet,Demir,22,İzmir,9200,Pazarlama,false
Ayşe,Çelik,41,Bursa,18300,Finans,true
Ali,Şahin,29,Adana,11000,Mühendislik,true
Zeynep,Arslan,36,İstanbul,16500,İK,true
Can,Yıldız,25,İzmir,8900,Pazarlama,false`, 'Çalışanlar')}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:border-emerald-400 transition-all text-left">
                            <FileText size={14} className="inline mr-2 text-emerald-500" />
                            <strong>Çalışan Listesi</strong>
                            <span className="block text-slate-400 mt-0.5">Ad, Maaş, Departman...</span>
                        </button>
                        <button onClick={() => loadCSV(`Ürün,Kategori,Fiyat,Stok,Satış,Tarih
Laptop Pro,Elektronik,45999,23,187,2024-01-15
Kablosuz Mouse,Aksesuar,899,156,1043,2024-01-16
Monitör 27",Elektronik,12499,45,312,2024-01-17
USB Hub,Aksesuar,349,89,567,2024-01-18
Klavye RGB,Aksesuar,1299,67,234,2024-01-19
SSD 1TB,Depolama,2899,112,456,2024-01-20
Webcam HD,Çevre Birimleri,2199,34,123,2024-01-21`, 'Ürün Stok')}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:border-emerald-400 transition-all text-left">
                            <Table2 size={14} className="inline mr-2 text-blue-500" />
                            <strong>Ürün & Stok</strong>
                            <span className="block text-slate-400 mt-0.5">Fiyat, Kategori, Tarih...</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Loaded State ── */}
            {sheet.headers.length > 0 && (
                <>
                    {/* Sheet tabs */}
                    {sheets.length > 1 && (
                        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                            {sheets.map((s, i) => (
                                <button key={i} onClick={() => {
                                    setActiveSheet(i);
                                    setSortCol(null); setSortDir(null);
                                    setGlobalFilter(''); setColFilters({});
                                }}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all border-b-2 ${activeSheet === i
                                        ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <FileSpreadsheet size={12} />
                                    {s.name}
                                    <span className="text-[10px] opacity-60">({s.rows.length})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        {/* Global search */}
                        <div className="relative min-w-[180px] flex-1 max-w-xs">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
                                placeholder="Tümünde ara..." aria-label="Tabloda ara"
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 dark:text-slate-300" />
                        </div>
                        {(globalFilter || Object.values(colFilters).some(Boolean)) && (
                            <button onClick={() => { setGlobalFilter(''); setColFilters({}); }}
                                title="Filtreleri temizle" aria-label="Filtreleri temizle"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        )}

                        <span className="text-xs text-slate-400">
                            {rows.length !== sheet.rows.length && (
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold mr-2">
                                    {rows.length} / {sheet.rows.length}
                                </span>
                            )}
                        </span>

                        {/* View tabs — pushed right */}
                        <div className="ml-auto flex gap-1">
                            {([
                                ['table', <Table2 size={13} />, 'Tablo'],
                                ['json', <Braces size={13} />, 'JSON'],
                                ['stats', <BarChart3 size={13} />, 'İstatistik'],
                            ] as const).map(([id, icon, label]) => (
                                <button key={id} onClick={() => setViewTab(id as ViewTab)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewTab === id
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    {icon}{label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── TABLE VIEW ── */}
                    {viewTab === 'table' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-auto max-h-[65vh]">
                                <table className="w-full text-sm border-collapse">
                                    {/* Sticky header */}
                                    <thead className="sticky top-0 z-20">
                                        {/* Column letters row */}
                                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <th className="w-10 px-2 py-1.5 text-center text-[9px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">#</th>
                                            {sheet.headers.map((_, i) => (
                                                <th key={i} className="px-2 py-1 text-center text-[9px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700 min-w-[80px]"
                                                    style={{ minWidth: colWidths[i] ?? 100 }}>
                                                    {colLabel(i)}
                                                </th>
                                            ))}
                                        </tr>
                                        {/* Header names + col filters */}
                                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700">
                                            <th className="sticky left-0 bg-slate-50 dark:bg-slate-800/80 w-10 px-2 py-2 border-r border-slate-200 dark:border-slate-700" />
                                            {sheet.headers.map((h, i) => (
                                                <th key={i} className="px-2 py-1 text-left border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                                                    style={{ minWidth: colWidths[i] ?? 100 }}>
                                                    <button onClick={() => handleSort(i)}
                                                        className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap w-full mb-1">
                                                        <span className="truncate max-w-[120px]" title={h}>{h}</span>
                                                        {sortCol === i
                                                            ? (sortDir === 'asc' ? <ChevronUp size={10} className="text-emerald-500 shrink-0" /> : <ChevronDown size={10} className="text-emerald-500 shrink-0" />)
                                                            : <span className="w-2.5 shrink-0" />}
                                                    </button>
                                                    <input
                                                        value={colFilters[i] ?? ''}
                                                        onChange={e => setColFilters(p => ({ ...p, [i]: e.target.value }))}
                                                        placeholder="filtrele…"
                                                        aria-label={`${h} sütununu filtrele`}
                                                        className="w-full px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500/40 text-slate-600 dark:text-slate-400" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, ri) => (
                                            <tr key={ri}
                                                className={`border-b border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors ${ri % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                                                {/* Row number — sticky */}
                                                <td className="sticky left-0 w-10 px-2 py-2 text-center text-[10px] text-slate-400 font-mono border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                                    {ri + 1}
                                                </td>
                                                {sheet.headers.map((_, ci) => {
                                                    const val = row[ci] ?? '';
                                                    const type = cellType(val);
                                                    const isEditing = editCell?.row === ri && editCell?.col === ci;
                                                    return (
                                                        <td key={ci}
                                                            className="px-2 py-2 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative group/cell"
                                                            style={{ minWidth: colWidths[ci] ?? 100 }}
                                                            onDoubleClick={() => startEdit(ri, ci, val)}>
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-1">
                                                                    <input ref={editRef}
                                                                        value={editVal}
                                                                        onChange={e => setEditVal(e.target.value)}
                                                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Tab') commitEdit(); if (e.key === 'Escape') setEditCell(null); }}
                                                                        onBlur={commitEdit}
                                                                        className="flex-1 min-w-0 px-1 py-0.5 border border-emerald-400 rounded text-xs focus:outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                                                                    <button onClick={commitEdit} className="text-green-500 shrink-0"><Check size={12} /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`text-xs font-mono truncate max-w-[180px] block ${colorize ? CELL_COLORS[type] : 'text-slate-700 dark:text-slate-300'}`}
                                                                        title={val}>
                                                                        {type === 'empty' ? '—' : val}
                                                                    </span>
                                                                    <button onClick={() => startEdit(ri, ci, val)}
                                                                        title="Düzenle" aria-label="Hücreyi düzenle"
                                                                        className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-slate-300 hover:text-emerald-500 transition-all shrink-0">
                                                                        <Edit3 size={10} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                        {!rows.length && (
                                            <tr>
                                                <td colSpan={sheet.headers.length + 1}
                                                    className="px-4 py-12 text-center text-slate-400 text-sm">
                                                    <Search size={28} className="mx-auto mb-2 opacity-30" />
                                                    Sonuç bulunamadı
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer legend */}
                            {colorize && (
                                <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-400 flex-wrap">
                                    <span>Hücre renkleri:</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">Sayı</span>
                                    <span className="text-purple-600 dark:text-purple-400 font-mono">Tarih</span>
                                    <span className="text-green-600 dark:text-green-400 font-mono">Boolean</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-mono">Metin</span>
                                    <span className="ml-auto opacity-60">Çift tıkla → hücreyi düzenle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── JSON VIEW ── */}
                    {viewTab === 'json' && (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase">JSON Çıktı</span>
                                <button onClick={() => navigator.clipboard.writeText(toJSON(sheet.headers, rows))}
                                    title="JSON kopyala" aria-label="JSON çıktısını kopyala"
                                    className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-bold">
                                    Kopyala
                                </button>
                            </div>
                            <pre className="font-mono text-xs text-emerald-400 overflow-auto max-h-[65vh] p-5 leading-relaxed">
                                {toJSON(sheet.headers, rows)}
                            </pre>
                        </div>
                    )}

                    {/* ── STATS VIEW ── */}
                    {viewTab === 'stats' && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sheet.headers.map((h, i) => {
                                const vals = rows.map(r => r[i] ?? '');
                                const s = computeStats(vals);
                                const numericCount = vals.filter(v => !isNaN(Number(v)) && v !== '').length;
                                const fill = vals.length - s.empty;
                                const fillPct = Math.round((fill / vals.length) * 100);
                                return (
                                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{colLabel(i)}</span>
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate" title={h}>{h}</p>
                                        </div>

                                        {/* Fill bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Dolu oran</span>
                                                <span className="font-bold">{fillPct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all"
                                                    style={{ width: `${fillPct}%` }} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-xs">
                                            {[
                                                ['Satır', vals.length],
                                                ['Dolu', fill],
                                                ['Boş', s.empty],
                                                ['Özgün', s.unique],
                                                ...(numericCount > 0 ? [
                                                    ['Min', s.min],
                                                    ['Max', s.max],
                                                    ['Ort.', s.avg],
                                                    ['Toplam', s.sum],
                                                ] : []),
                                            ].map(([label, value]) => (
                                                <div key={label as string} className="flex justify-between items-center">
                                                    <span className="text-slate-400">{label}</span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-right">{value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {numericCount > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] text-blue-500 font-bold">
                                                    {numericCount} sayısal değer
                                                </span>
                                            </div>
                                        )}
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
