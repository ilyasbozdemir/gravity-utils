'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, Upload, Download, Copy, Check, Trash2, Plus, Share2, Search, Eye } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface QrEntry {
    id: string;
    label: string;
    content: string;
    dataUrl: string;   // base64 PNG
    createdAt: string;
    type: QrContentType;
    color: string;
    bg: string;
}

type QrContentType = 'url' | 'text' | 'email' | 'tel' | 'wifi' | 'vcard';
type Tab = 'create' | 'scan' | 'history';

const LS_KEY = 'gravity_qr_history';

// ─── LocalStorage helpers ──────────────────────────────────────────────────
function loadHistory(): QrEntry[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); }
    catch { return []; }
}

function saveHistory(entries: QrEntry[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(0, 50))); }
    catch { /* quota */ }
}

// ─── QR generator ──────────────────────────────────────────────────────────
async function generateQR(content: string, color: string, bg: string): Promise<string> {
    return QRCode.toDataURL(content, {
        width: 512,
        margin: 2,
        color: { dark: color, light: bg },
        errorCorrectionLevel: 'H',
    });
}

// ─── Content presets ───────────────────────────────────────────────────────
const TYPE_META: Record<QrContentType, { label: string; emoji: string; placeholder: string; buildContent: (fields: Record<string, string>) => string }> = {
    url: { label: 'Web Adresi', emoji: '🌐', placeholder: 'https://example.com', buildContent: f => f.url },
    text: { label: 'Serbest Metin', emoji: '✏️', placeholder: 'İçeriğinizi buraya yazın...', buildContent: f => f.text },
    email: { label: 'E-posta', emoji: '📧', placeholder: 'ornek@mail.com', buildContent: f => `mailto:${f.email}?subject=${encodeURIComponent(f.subject ?? '')}&body=${encodeURIComponent(f.body ?? '')}` },
    tel: { label: 'Telefon', emoji: '📞', placeholder: '+90 555 123 4567', buildContent: f => `tel:${f.tel.replace(/\s/g, '')}` },
    wifi: { label: 'Wi-Fi', emoji: '📶', placeholder: 'Ağ adı (SSID)', buildContent: f => `WIFI:T:WPA;S:${f.ssid};P:${f.pass};;` },
    vcard: { label: 'Kişi Kartı', emoji: '👤', placeholder: 'Ad Soyad', buildContent: f => `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\nTEL:${f.tel ?? ''}\nEMAIL:${f.email ?? ''}\nURL:${f.url ?? ''}\nEND:VCARD` },
};

const COLORS = ['#1e293b', '#7c3aed', '#0284c7', '#059669', '#dc2626', '#d97706', '#db2777', '#000000'];
const BG_COLORS = ['#ffffff', '#f8fafc', '#fef9c3', '#f0fdf4', '#fdf4ff', '#f0f9ff', '#fff7ed'];

// ─── Component ─────────────────────────────────────────────────────────────
interface QrManagerProps {
    file?: File | null;
    onBack: () => void;
}

export const QrManager: React.FC<QrManagerProps> = ({ file: initialFile, onBack }) => {
    const [tab, setTab] = useState<Tab>('create');

    // ── Create state ──
    const [contentType, setContentType] = useState<QrContentType>('url');
    const [fields, setFields] = useState<Record<string, string>>({ url: '', text: '', email: '', subject: '', body: '', tel: '', ssid: '', pass: '', name: '' });
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#1e293b');
    const [bg, setBg] = useState('#ffffff');
    const [preview, setPreview] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    // ── Scan state ──
    const [scanFile, setScanFile] = useState<File | null>(initialFile ?? null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);

    // ── History state ──
    const [history, setHistory] = useState<QrEntry[]>([]);
    const [search, setSearch] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const [viewEntry, setViewEntry] = useState<QrEntry | null>(null);

    useEffect(() => { setHistory(loadHistory()); }, []);

    // Live preview when fields change
    useEffect(() => {
        const content = TYPE_META[contentType].buildContent(fields);
        if (!content.trim()) { setPreview(null); return; }
        const t = setTimeout(async () => {
            const url = await generateQR(content, color, bg);
            setPreview(url);
        }, 300);
        return () => clearTimeout(t);
    }, [fields, contentType, color, bg]);

    // Scan when file changes
    useEffect(() => {
        if (!scanFile) { setScanResult(null); setScanError(null); return; }
        setScanning(true);
        setScanResult(null); setScanError(null);
        const scan = async () => {
            try {
                const h = new Html5Qrcode('qr-reader-hidden');
                const res = await h.scanFile(scanFile, true);
                setScanResult(res);
            } catch {
                setScanError('QR kod bulunamadı veya okunamadı. Net bir QR görseli deneyin.');
            } finally { setScanning(false); }
        };
        scan();
    }, [scanFile]);

    const setField = (k: string, v: string) => setFields(p => ({ ...p, [k]: v }));

    const save = async () => {
        const content = TYPE_META[contentType].buildContent(fields);
        if (!content.trim()) return;
        setGenerating(true);
        const dataUrl = await generateQR(content, color, bg);
        const entry: QrEntry = {
            id: crypto.randomUUID(),
            label: label.trim() || TYPE_META[contentType].label,
            content,
            dataUrl,
            createdAt: new Date().toISOString(),
            type: contentType,
            color,
            bg,
        };
        const updated = [entry, ...history];
        setHistory(updated);
        saveHistory(updated);
        setGenerating(false);
        setTab('history');
        setViewEntry(entry);
    };

    const remove = (id: string) => {
        const updated = history.filter(e => e.id !== id);
        setHistory(updated);
        saveHistory(updated);
        if (viewEntry?.id === id) setViewEntry(null);
    };

    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 1800);
    };

    const download = (entry: QrEntry) => {
        const a = document.createElement('a');
        a.href = entry.dataUrl;
        a.download = `qr-${entry.id.slice(0, 8)}.png`;
        a.click();
    };

    const getShareUrl = (id: string) =>
        `${window.location.origin}/qr/${id}`;

    const filtered = history.filter(e =>
        e.label.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase())
    );

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-blue-500" /> QR Kod Yöneticisi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Oluştur · Oku · Kaydet · Paylaş</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                        {history.length} kayıtlı
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-6">
                {([['create', '✨ Oluştur'], ['scan', '📷 Oku & Tara'], ['history', `🗂 Geçmiş (${history.length})`]] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === v
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* ── CREATE TAB ── */}
            {tab === 'create' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Form */}
                    <div className="space-y-5">
                        {/* Content type */}
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">İçerik Türü</p>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {(Object.entries(TYPE_META) as [QrContentType, typeof TYPE_META[QrContentType]][]).map(([type, meta]) => (
                                    <button key={type} onClick={() => setContentType(type)}
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all ${contentType === type
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 bg-white dark:bg-slate-900'}`}>
                                        <span className="text-lg">{meta.emoji}</span>
                                        <span className={`text-[9px] font-bold leading-tight ${contentType === type ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'}`}>
                                            {meta.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fields by type */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                            {contentType === 'url' && (
                                <InputField label="Web Adresi" value={fields.url} onChange={v => setField('url', v)} placeholder="https://example.com" />
                            )}
                            {contentType === 'text' && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Metin</label>
                                    <textarea value={fields.text} onChange={e => setField('text', e.target.value)}
                                        placeholder="İçeriğinizi yazın..." rows={4}
                                        aria-label="QR içerik metni"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-300" />
                                </div>
                            )}
                            {contentType === 'email' && (<>
                                <InputField label="E-posta" value={fields.email} onChange={v => setField('email', v)} placeholder="ornek@mail.com" />
                                <InputField label="Konu" value={fields.subject} onChange={v => setField('subject', v)} placeholder="E-posta konusu" />
                                <InputField label="Mesaj" value={fields.body} onChange={v => setField('body', v)} placeholder="Opsiyonel mesaj" />
                            </>)}
                            {contentType === 'tel' && (
                                <InputField label="Telefon" value={fields.tel} onChange={v => setField('tel', v)} placeholder="+90 555 123 4567" />
                            )}
                            {contentType === 'wifi' && (<>
                                <InputField label="Ağ Adı (SSID)" value={fields.ssid} onChange={v => setField('ssid', v)} placeholder="WiFi Ağı" />
                                <InputField label="Şifre" value={fields.pass} onChange={v => setField('pass', v)} placeholder="Ağ şifresi" type="password" />
                            </>)}
                            {contentType === 'vcard' && (<>
                                <InputField label="Ad Soyad" value={fields.name} onChange={v => setField('name', v)} placeholder="Ahmet Yılmaz" />
                                <InputField label="Telefon" value={fields.tel} onChange={v => setField('tel', v)} placeholder="+90 555 123 4567" />
                                <InputField label="E-posta" value={fields.email} onChange={v => setField('email', v)} placeholder="ornek@mail.com" />
                                <InputField label="Web Sitesi" value={fields.url} onChange={v => setField('url', v)} placeholder="https://example.com" />
                            </>)}
                        </div>

                        {/* Label */}
                        <InputField label="Etiket (opsiyonel)" value={label} onChange={setLabel} placeholder="Bu QR için bir isim..." />

                        {/* Colors */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase text-slate-400 mb-2">QR Rengi</p>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setColor(c)} title={c} aria-label={`QR rengi: ${c}`}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'scale-110 border-blue-500' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: c }} />
                                    ))}
                                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                                        title="Özel renk" aria-label="Özel QR rengi seç"
                                        className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Arka Plan</p>
                                <div className="flex flex-wrap gap-2">
                                    {BG_COLORS.map(c => (
                                        <button key={c} onClick={() => setBg(c)} title={c} aria-label={`Arka plan rengi: ${c}`}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${bg === c ? 'scale-110 border-blue-500' : 'border-slate-300 hover:scale-105'}`}
                                            style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <button onClick={save} disabled={generating || !preview}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                            {generating ? '⏳ Oluşturuluyor...' : <><Plus size={18} /> Oluştur ve Kaydet</>}
                        </button>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-4">Canlı Önizleme</p>
                        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4 w-full">
                            {preview ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="QR önizleme" className="w-56 h-56 rounded-xl shadow-lg" />
                                    <p className="text-xs text-slate-400 text-center font-mono break-all max-w-xs">
                                        {TYPE_META[contentType].buildContent(fields).slice(0, 60)}{TYPE_META[contentType].buildContent(fields).length > 60 ? '…' : ''}
                                    </p>
                                </>
                            ) : (
                                <div className="w-56 h-56 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <QrCode size={64} className="text-slate-300 dark:text-slate-600" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── SCAN TAB ── */}
            {tab === 'scan' && (
                <div className="max-w-xl mx-auto">
                    <div id="qr-reader-hidden" className="hidden" />

                    {!scanFile ? (
                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-14 text-center hover:border-blue-400 transition-colors">
                                <Upload className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">QR Kod Görseli Seç</p>
                                <p className="text-slate-400 text-sm">PNG, JPG, WebP… formatlar desteklenir</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden"
                                title="QR kod görseli seç" aria-label="QR kod görseli seç"
                                onChange={e => { const f = e.target.files?.[0]; if (f) setScanFile(f); }} />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={URL.createObjectURL(scanFile)} alt="Taranan Görsel"
                                    className="max-h-48 mx-auto rounded-xl mb-4 shadow" />
                                <button onClick={() => setScanFile(null)}
                                    className="text-xs text-slate-400 hover:text-red-500 transition-colors underline">
                                    Başka bir görsel seç
                                </button>
                            </div>

                            {scanning && (
                                <div className="text-center py-8 text-slate-400">
                                    <QrCode className="mx-auto mb-3 animate-pulse text-blue-400" size={40} />
                                    <p className="text-sm">Taranıyor...</p>
                                </div>
                            )}

                            {scanResult && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
                                    <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                        ✅ Başarıyla Okundu!
                                    </p>
                                    <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 p-4 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 break-all mb-4">
                                        {scanResult}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copy(scanResult, 'scan')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all">
                                            {copied === 'scan' ? <Check size={15} /> : <Copy size={15} />}
                                            {copied === 'scan' ? 'Kopyalandı' : 'Kopyala'}
                                        </button>
                                        {scanResult.startsWith('http') && (
                                            <a href={scanResult} target="_blank" rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
                                                🔗 Aç
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {scanError && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-red-700 dark:text-red-400 text-sm">
                                    ⚠️ {scanError}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── HISTORY TAB ── */}
            {tab === 'history' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: List */}
                    <div>
                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="QR ara..." aria-label="QR geçmişinde ara"
                                className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-300" />
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <QrCode size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">{history.length === 0 ? 'Henüz QR oluşturmadınız' : 'Sonuç bulunamadı'}</p>
                                {history.length === 0 && (
                                    <button onClick={() => setTab('create')}
                                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                                        İlk QR'ı Oluştur
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map(entry => (
                                    <div key={entry.id}
                                        onClick={() => setViewEntry(entry)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${viewEntry?.id === entry.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 bg-white dark:bg-slate-900'}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={entry.dataUrl} alt={entry.label} className="w-12 h-12 rounded-xl shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{entry.label}</p>
                                            <p className="text-xs text-slate-400 truncate">{entry.content}</p>
                                            <p className="text-[10px] text-slate-300 dark:text-slate-600">
                                                {new Date(entry.createdAt).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <span className="text-base">{TYPE_META[entry.type]?.emoji}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Detail panel */}
                    <div>
                        {viewEntry ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{viewEntry.label}</h3>
                                    <button onClick={() => remove(viewEntry.id)}
                                        title="Sil" aria-label="QR kodunu sil"
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={viewEntry.dataUrl} alt={viewEntry.label}
                                    className="w-48 h-48 mx-auto rounded-2xl shadow-xl mb-5 border-4 border-slate-100 dark:border-slate-800" />

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4 font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                                    {viewEntry.content}
                                </div>

                                {/* Action buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => download(viewEntry)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all">
                                        <Download size={14} /> PNG İndir
                                    </button>
                                    <button onClick={() => copy(viewEntry.content, `content-${viewEntry.id}`)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all">
                                        {copied === `content-${viewEntry.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        İçerik Kopyala
                                    </button>
                                    <button onClick={() => copy(getShareUrl(viewEntry.id), `share-${viewEntry.id}`)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all col-span-2">
                                        {copied === `share-${viewEntry.id}` ? <Check size={14} /> : <Share2 size={14} />}
                                        {copied === `share-${viewEntry.id}` ? 'Link Kopyalandı!' : `Paylaşım Linki Kopyala (/qr/${viewEntry.id.slice(0, 8)}…)`}
                                    </button>
                                    <a href={getShareUrl(viewEntry.id)} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-2.5 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400 rounded-xl text-xs font-bold transition-all col-span-2">
                                        <Eye size={14} /> Paylaşım Sayfasını Aç
                                    </a>
                                </div>

                                <p className="text-[10px] text-slate-400 text-center mt-3">
                                    ID: <code className="font-mono">{viewEntry.id}</code>
                                </p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400">
                                <Eye size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Detay görmek için listeden bir QR seçin</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Reusable InputField ───────────────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 dark:text-slate-300" />
        </div>
    );
}
