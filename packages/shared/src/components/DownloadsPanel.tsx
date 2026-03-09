'use client';

import React, { useState, useEffect } from 'react';
import {
    Download, Trash2, FileText, File, RefreshCw, X,
    ChevronDown, ChevronUp, Clock, HardDrive, ArrowDownToLine
} from 'lucide-react';
import { downloadStore, DownloadEntry } from '../utils/download-store';
import { saveAs } from 'file-saver';

// ─── File type icon/colour helpers ────────────────────────────────────────────
function fileColor(ext: string): string {
    switch (ext) {
        case 'pdf': return 'text-red-500 bg-red-500/10';
        case 'docx': return 'text-blue-500 bg-blue-500/10';
        case 'xlsx': return 'text-green-500 bg-green-500/10';
        case 'jpg':
        case 'jpeg':
        case 'png': return 'text-purple-500 bg-purple-500/10';
        case 'zip': return 'text-amber-500 bg-amber-500/10';
        default: return 'text-slate-500 bg-slate-500/10';
    }
}

function formatBytes(b: number): string {
    if (b === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / k ** i).toFixed(1)} ${sizes[i]}`;
}

function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'şimdi';
    if (m < 60) return `${m}dk önce`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}sa önce`;
    return `${Math.floor(h / 24)}g önce`;
}

// ─── Floating trigger button ───────────────────────────────────────────────────
interface DownloadsBadgeProps {
    onClick: () => void;
    count: number;
}
export function DownloadsBadge({ onClick, count }: DownloadsBadgeProps) {
    return (
        <button
            id="downloads-badge-btn"
            onClick={onClick}
            title="İndirilenler Geçmişi"
            aria-label="İndirilenler Geçmişi"
            className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-110 active:scale-95 group"
        >
            <ArrowDownToLine size={18} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}

// ─── Panel ─────────────────────────────────────────────────────────────────────
interface DownloadsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DownloadsPanel({ isOpen, onClose }: DownloadsPanelProps) {
    const [entries, setEntries] = useState<DownloadEntry[]>([]);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        return downloadStore.subscribe(setEntries);
    }, []);

    const filtered = filter === 'all'
        ? entries
        : entries.filter(e => e.fileType === filter);

    const types = ['all', ...Array.from(new Set(entries.map(e => e.fileType)))];

    const redownload = (entry: DownloadEntry) => {
        if (entry.blob) {
            saveAs(entry.blob, entry.fileName);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-4 top-12 z-50 w-[380px] max-h-[calc(100vh-80px)] flex flex-col bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Download size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">İndirilenler</h3>
                            <p className="text-[10px] text-slate-500 font-medium">{entries.length} dosya</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {entries.length > 0 && (
                            <button
                                onClick={() => downloadStore.clear()}
                                title="Geçmişi Temizle"
                                aria-label="Geçmişi Temizle"
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Temizle
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            title="Kapat"
                            aria-label="Paneli Kapat"
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Type filter pills */}
                {types.length > 2 && (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 shrink-0 overflow-x-auto scrollbar-hide">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${filter === t
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                {t === 'all' ? 'Tümü' : t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                <HardDrive size={24} className="text-slate-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">Henüz indirilen dosya yok</p>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                Araçlardan dönüştürüp indirdiğin dosyalar burada görünecek.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filtered.map(entry => (
                                <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group">
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black uppercase ${fileColor(entry.fileType)}`}>
                                        {entry.fileType.slice(0, 3)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-200 truncate">{entry.fileName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock size={9} /> {timeAgo(entry.downloadedAt)}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[10px] text-slate-500">{formatBytes(entry.sizeBytes)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[10px] text-blue-500/70 font-medium truncate max-w-[80px]">{entry.tool}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {entry.blob && (
                                            <button
                                                onClick={() => redownload(entry)}
                                                title="Tekrar İndir"
                                                aria-label="Tekrar İndir"
                                                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                            >
                                                <RefreshCw size={13} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => downloadStore.remove(entry.id)}
                                            title="Geçmişten Kaldır"
                                            aria-label="Geçmişten Kaldır"
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {entries.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-white/5 shrink-0">
                        <p className="text-[10px] text-slate-600 text-center">
                            Blob'lar bellekte tutulur • Uygulama kapanınca kaybolur • Sadece isim/tarih kalır
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Hook for use in TitleBar/Header ─────────────────────────────────────────
export function useDownloadCount(): number {
    const [count, setCount] = useState(0);
    useEffect(() => {
        return downloadStore.subscribe(entries => setCount(entries.length));
    }, []);
    return count;
}
