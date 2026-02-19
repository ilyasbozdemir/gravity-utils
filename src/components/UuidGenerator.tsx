'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Copy, RefreshCw, Check, Info } from 'lucide-react';

interface UuidGeneratorProps {
    onBack: () => void;
}

// ─── Version metadata ─────────────────────────────────────────────────────────
const UUID_VERSIONS = {
    v1: {
        label: 'v1',
        name: 'Zaman Tabanlı',
        desc: 'Geçerli zaman damgası + MAC adresi simulasyonu kullanır. Her UUID benzersiz ve kronolojik olarak sıralıdır.',
        color: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        needsNamespace: false,
    },
    v3: {
        label: 'v3',
        name: 'Ad Tabanlı (MD5)',
        desc: 'Bir namespace UUID ve isim girerek MD5 hash ile deterministik UUID üretir. Aynı girdiler hep aynı UUID\'yi verir.',
        color: 'text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
        needsNamespace: true,
    },
    v4: {
        label: 'v4',
        name: 'Rastgele',
        desc: 'Şifrografik olarak güvenli rastgele sayı kullanır. En yaygın kullanılan UUID versiyonudur.',
        color: 'text-indigo-600 dark:text-indigo-400',
        badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
        needsNamespace: false,
    },
    v5: {
        label: 'v5',
        name: 'Ad Tabanlı (SHA-1)',
        desc: 'SHA-1 hash kullanan versiyon. v3\'ten daha güvenli. Namespace + isim kombinasyonu ile deterministik UUID üretir.',
        color: 'text-violet-600 dark:text-violet-400',
        badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
        needsNamespace: true,
    },
    v7: {
        label: 'v7',
        name: 'Zaman Sıralı (Yeni)',
        desc: 'Zaman damgasıyla başlayan ve veritabanı indekslemesi için optimize edilmiş modern UUID standardı (RFC 9562).',
        color: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        needsNamespace: false,
    },
} as const;

type VersionKey = keyof typeof UUID_VERSIONS;

// ─── Standart namespace UUID'leri ─────────────────────────────────────────────
const NAMESPACES = {
    'DNS   ': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'URL   ': '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'OID   ': '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'X.500 ': '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

// ─── UUID generators ──────────────────────────────────────────────────────────

function genV4(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function genV1(): string {
    // Gregorian offset: 100-nanosecond intervals between 1582-10-15 and Unix epoch
    const GREG_OFFSET = 122192928000000000n;
    const nowMs = BigInt(Date.now());
    const time = nowMs * 10000n + GREG_OFFSET;

    const timeLow = (time & 0xFFFFFFFFn).toString(16).padStart(8, '0');
    const timeMid = ((time >> 32n) & 0xFFFFn).toString(16).padStart(4, '0');
    const timeHigh = ((time >> 48n) & 0x0FFFn).toString(16).padStart(3, '0');

    const clockSeq = (Math.floor(Math.random() * 0x3FFF) | 0x8000).toString(16).padStart(4, '0');
    const node = Array.from(crypto.getRandomValues(new Uint8Array(6)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

    return `${timeLow}-${timeMid}-1${timeHigh}-${clockSeq}-${node}`;
}

function genV7(): string {
    const tsMs = BigInt(Date.now());
    const rand = crypto.getRandomValues(new Uint8Array(10));

    // 48-bit timestamp | 4-bit version (7) | 12-bit rand | 2-bit variant | 62-bit rand
    const tsHex = tsMs.toString(16).padStart(12, '0');
    const randA = ((rand[0] & 0x0f) | 0x00).toString(16).padStart(1, '0') +
        rand[1].toString(16).padStart(2, '0') +
        rand[2].toString(16).padStart(1, '0');
    const randB = ((rand[3] & 0x3f) | 0x80).toString(16).padStart(2, '0') +
        Array.from(rand.slice(4, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
    const randC = Array.from(rand.slice(8)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `${tsHex.slice(0, 8)}-${tsHex.slice(8, 12)}-7${randA}-${randB}-${randC}`;
}

// Parse UUID string to bytes
function uuidToBytes(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, '');
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
}

// Build namespace + name byte array
function buildNamespaceInput(namespaceUuid: string, name: string): Uint8Array {
    const nsBytes = uuidToBytes(namespaceUuid);
    const nameBytes = new TextEncoder().encode(name);
    const combined = new Uint8Array(nsBytes.length + nameBytes.length);
    combined.set(nsBytes);
    combined.set(nameBytes, nsBytes.length);
    return combined;
}

// v3 (MD5-based) — browser SubtleCrypto doesn't support MD5; we use a pure-JS impl
function md5(input: Uint8Array): Uint8Array {
    // Adapted from the standard MD5 algorithm
    const K = new Int32Array(64);
    const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

    // Pre-processing: adding padding bits and length
    const msgLen = input.length;
    const bitLen = msgLen * 8;
    const newLen = ((msgLen + 8) >> 6) * 64 + 56;
    const msg8 = new Uint8Array(newLen + 8);
    msg8.set(input);
    msg8[msgLen] = 0x80;
    // Append original length in bits as 64-bit little-endian
    for (let i = 0; i < 8; i++) msg8[newLen + i] = (bitLen / Math.pow(2, i * 8)) & 0xff;

    const msg32 = new Int32Array(msg8.buffer);

    for (let i = 0; i < msg32.length; i += 16) {
        let A = a0, B = b0, C = c0, D = d0;
        for (let j = 0; j < 64; j++) {
            let F: number, g: number;
            if (j < 16) { F = (B & C) | (~B & D); g = j; }
            else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
            else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16; }
            else { F = C ^ (B | ~D); g = (7 * j) % 16; }
            F = (F + A + K[j] + msg32[i + g]) | 0;
            A = D; D = C; C = B;
            B = (B + ((F << S[j]) | (F >>> (32 - S[j])))) | 0;
        }
        a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }

    const result = new Uint8Array(16);
    const view = new DataView(result.buffer);
    view.setInt32(0, a0, true); view.setInt32(4, b0, true);
    view.setInt32(8, c0, true); view.setInt32(12, d0, true);
    return result;
}

function genV3(namespaceUuid: string, name: string): string {
    const hash = md5(buildNamespaceInput(namespaceUuid, name));
    hash[6] = (hash[6] & 0x0f) | 0x30; // version 3
    hash[8] = (hash[8] & 0x3f) | 0x80; // variant
    const h = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function genV5(namespaceUuid: string, name: string): Promise<string> {
    const data = buildNamespaceInput(namespaceUuid, name);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hash = new Uint8Array(hashBuffer).slice(0, 16);
    hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
    hash[8] = (hash[8] & 0x3f) | 0x80; // variant
    const h = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const UuidGenerator: React.FC<UuidGeneratorProps> = ({ onBack }) => {
    const [version, setVersion] = useState<VersionKey>('v4');
    const [count, setCount] = useState(5);
    const [uuids, setUuids] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // For v3/v5 namespace-based
    const [namespace, setNamespace] = useState('6ba7b811-9dad-11d1-80b4-00c04fd430c8'); // URL ns
    const [name, setName] = useState('https://example.com');
    const [loading, setLoading] = useState(false);

    const generateUuids = useCallback(async () => {
        setLoading(true);
        setCopiedIndex(null);
        try {
            if (version === 'v3') {
                const result = Array.from({ length: count }, () => genV3(namespace, name));
                setUuids(result);
            } else if (version === 'v5') {
                const results = await Promise.all(
                    Array.from({ length: count }, () => genV5(namespace, name))
                );
                setUuids(results);
            } else {
                const fn = version === 'v1' ? genV1 : version === 'v7' ? genV7 : genV4;
                setUuids(Array.from({ length: count }, fn));
            }
        } finally {
            setLoading(false);
        }
    }, [version, count, namespace, name]);

    useEffect(() => { generateUuids(); }, [generateUuids]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(uuids.join('\n'));
        setCopiedIndex(-1);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const meta = UUID_VERSIONS[version];
    const isNamespaceBased = meta.needsNamespace;

    return (
        <div className="max-w-[900px] mx-auto p-8 animate-[fadeIn_0.5s_ease] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-start gap-4 mb-8">
                <button onClick={onBack}
                    className="p-2 bg-indigo-500/20 border border-indigo-500/40 text-slate-700 dark:text-white rounded-lg hover:bg-indigo-500/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    title="Geri Dön" aria-label="Geri Dön">
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">UUID Oluşturucu</h2>
                    <p className="text-sm text-indigo-400 font-medium tracking-wide">v1 · v3 · v4 · v5 · v7 — RFC 9562</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Version selector */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">UUID Versiyonu</label>
                    <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(UUID_VERSIONS) as VersionKey[]).map(v => {
                            const m = UUID_VERSIONS[v];
                            const active = version === v;
                            return (
                                <button key={v} onClick={() => setVersion(v)}
                                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all ${active
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
                                    <span className={`text-lg font-black ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                        {m.label}
                                    </span>
                                    <span className={`text-[9px] font-bold text-center leading-tight ${active ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`}>
                                        {m.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Info banner */}
                    <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl">
                        <Info size={13} className="shrink-0 mt-0.5 text-indigo-400" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{meta.desc}</p>
                    </div>
                </div>

                {/* Namespace inputs for v3/v5 */}
                {isNamespaceBased && (
                    <div className="space-y-3 p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl">
                        <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Namespace & İsim</p>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Namespace UUID</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {Object.entries(NAMESPACES).map(([label, ns]) => (
                                    <button key={label} onClick={() => setNamespace(ns)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${namespace === ns
                                            ? 'bg-violet-600 text-white border-violet-600'
                                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-violet-400'}`}>
                                        {label.trim()}
                                    </button>
                                ))}
                            </div>
                            <input value={namespace} onChange={e => setNamespace(e.target.value)}
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                title="Namespace UUID"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono text-sm focus:border-violet-500/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İsim (Name)</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                                placeholder="https://example.com"
                                title="UUID oluşturulacak isim"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono text-sm focus:border-violet-500/50 outline-none transition-all" />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            ⚠️ Aynı namespace + isim kombinasyonu her zaman aynı UUID'yi üretir.
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 dark:bg-black/20 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                    {!isNamespaceBased && (
                        <div className="flex-1 space-y-1.5 w-full">
                            <label htmlFor="uuid-count" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Miktar</label>
                            <input id="uuid-count" type="number" min="1" max="100" value={count}
                                title="Oluşturulacak UUID miktarı" placeholder="5"
                                onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-indigo-500/50 outline-none transition-all"
                                aria-label="Oluşturulacak UUID miktarı" />
                        </div>
                    )}
                    <button onClick={generateUuids} disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap">
                        <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Üretiliyor…' : 'Oluştur'}
                    </button>
                    <button onClick={copyAll} disabled={uuids.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold border border-slate-300 dark:border-white/10 transition-all whitespace-nowrap disabled:opacity-40"
                        aria-label={copiedIndex === -1 ? "Tümü Kopyalandı" : "Tüm UUID'leri Kopyala"}>
                        {copiedIndex === -1 ? <Check size={17} className="text-emerald-400" /> : <Copy size={17} />}
                        Tümünü Kopyala
                    </button>
                </div>

                {/* UUID List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar" role="list" aria-label="Oluşturulan UUID'ler">
                    {uuids.map((uuid, index) => (
                        <div key={index}
                            className="group flex items-center justify-between bg-slate-50 dark:bg-black/40 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:bg-slate-100 dark:hover:bg-black/60"
                            role="listitem">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono text-slate-400 font-bold w-4 text-right shrink-0">{index + 1}</span>
                                <span className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded ${meta.badge}`}>{meta.label}</span>
                                <code className={`text-sm font-mono truncate ${meta.color}`}
                                    aria-label={`UUID ${index + 1}: ${uuid}`}>{uuid}</code>
                            </div>
                            <button onClick={() => copyToClipboard(uuid, index)}
                                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all shrink-0"
                                title="Kopyala" aria-label={`UUID ${index + 1}'i kopyala`}>
                                {copiedIndex === index ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl" role="note">
                    <p className="text-[11px] text-slate-500 leading-relaxed text-center font-medium italic">
                        {version === 'v1' && 'v1: 60-bit IEEE 802.1 zaman damgası + 48-bit MAC adresi (burada simüle edilmiştir) · RFC 4122'}
                        {version === 'v3' && 'v3: 16-byte MD5(namespace || name) · Deterministik · RFC 4122'}
                        {version === 'v4' && 'v4: 122-bit kriptografik rastgele değer · En yaygın · RFC 4122'}
                        {version === 'v5' && 'v5: 20-byte SHA-1(namespace || name), ilk 16 byte kullanılır · RFC 4122'}
                        {version === 'v7' && 'v7: 48-bit ms timestamp | 12-bit rand-a | 62-bit rand-b · Veritabanı için sıralı · RFC 9562'}
                    </p>
                </div>
            </div>
        </div>
    );
};
