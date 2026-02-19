'use client';

import React, { useState, useCallback } from 'react';
import {
    ArrowLeft, Network, Copy, Check, Hash,
    ChevronRight, RefreshCw, AlertCircle, Binary, Search
} from 'lucide-react';

type ToolTab = 'subnet' | 'ip-convert' | 'cidr' | 'ipv6';

// ─── Core IP Math ─────────────────────────────────────────────────────────────
function ipToInt(ip: string): number {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
    return [
        (n >>> 24) & 0xff,
        (n >>> 16) & 0xff,
        (n >>> 8) & 0xff,
        n & 0xff,
    ].join('.');
}

function intToBinary(n: number, bits = 32): string {
    return (n >>> 0).toString(2).padStart(bits, '0');
}

function isValidIp(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => {
        const n = parseInt(p, 10);
        return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
    });
}

function isValidCidr(cidr: string): boolean {
    const [ip, prefix] = cidr.split('/');
    if (!ip || !prefix) return false;
    const p = parseInt(prefix, 10);
    return isValidIp(ip) && !isNaN(p) && p >= 0 && p <= 32;
}

interface SubnetInfo {
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
    subnetMask: string;
    wildcardMask: string;
    hostCount: number;
    prefix: number;
    binaryMask: string;
    ipClass: string;
    isPrivate: boolean;
}

function getSubnetInfo(ip: string, prefix: number): SubnetInfo {
    const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const ipInt = ipToInt(ip);
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
    const wildcard = (~maskInt) >>> 0;
    const hostCount = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2;

    const firstOctet = (ipInt >>> 24) & 0xff;
    let ipClass = 'Unknown';
    if (firstOctet < 128) ipClass = 'A';
    else if (firstOctet < 192) ipClass = 'B';
    else if (firstOctet < 224) ipClass = 'C';
    else if (firstOctet < 240) ipClass = 'D (Multicast)';
    else ipClass = 'E (Reserved)';

    const isPrivate = (
        (firstOctet === 10) ||
        (firstOctet === 172 && ((ipInt >>> 16) & 0xff) >= 16 && ((ipInt >>> 16) & 0xff) <= 31) ||
        (firstOctet === 192 && ((ipInt >>> 16) & 0xff) === 168) ||
        (firstOctet === 127)
    );

    return {
        network: intToIp(networkInt),
        broadcast: intToIp(broadcastInt),
        firstHost: prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1),
        lastHost: prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1),
        subnetMask: intToIp(maskInt),
        wildcardMask: intToIp(wildcard),
        hostCount: Math.max(0, hostCount),
        prefix,
        binaryMask: intToBinary(maskInt),
        ipClass,
        isPrivate,
    };
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button onClick={handle} className="p-1 text-slate-400 hover:text-blue-500 transition-colors rounded shrink-0" title="Kopyala">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
        </button>
    );
}

function InfoRow({ label, value, mono = true, badge }: { label: string; value: string; mono?: boolean; badge?: string }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 w-28 shrink-0">{label}</span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className={`text-sm text-slate-700 dark:text-slate-200 break-all ${mono ? 'font-mono' : 'font-semibold'}`}>
                    {value}
                </span>
                {badge && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase shrink-0">
                        {badge}
                    </span>
                )}
            </div>
            <CopyButton text={value} />
        </div>
    );
}

// ─── IPv6 Helpers ─────────────────────────────────────────────────────────────
function isValidIpv6(addr: string): boolean {
    try {
        // Remove brackets if present
        const clean = addr.replace(/^\[|\]$/g, '');
        // Handle :: expansion
        const halves = clean.split('::');
        if (halves.length > 2) return false;
        const allGroups: string[] = [];
        if (halves.length === 2) {
            const left = halves[0] ? halves[0].split(':') : [];
            const right = halves[1] ? halves[1].split(':') : [];
            // Check for IPv4-mapped suffix in right
            const last = right[right.length - 1];
            if (last && last.includes('.')) {
                // IPv4-mapped: rightmost group is IPv4
                if (left.length + right.length > 6) return false;
            } else {
                if (left.length + right.length > 7) return false;
            }
            const fill = 8 - left.length - right.length;
            allGroups.push(...left, ...Array(fill).fill('0'), ...right);
        } else {
            const parts = clean.split(':');
            // Handle IPv4-mapped
            const last = parts[parts.length - 1];
            if (last && last.includes('.')) {
                if (parts.length !== 7) return false;
            } else {
                if (parts.length !== 8) return false;
            }
            allGroups.push(...parts);
        }
        // Validate each group (ignore IPv4 tail)
        for (const g of allGroups) {
            if (g.includes('.')) {
                // IPv4 part — validate
                const octets = g.split('.');
                if (octets.length !== 4) return false;
                if (!octets.every(o => { const n = parseInt(o, 10); return !isNaN(n) && n >= 0 && n <= 255; })) return false;
            } else {
                if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return false;
            }
        }
        return true;
    } catch { return false; }
}

function expandIpv6(addr: string): string {
    const clean = addr.replace(/^\[|\]$/g, '').toLowerCase();
    const halves = clean.split('::');
    let groups: string[];
    if (halves.length === 2) {
        const left = halves[0] ? halves[0].split(':') : [];
        const right = halves[1] ? halves[1].split(':') : [];
        const fill = 8 - left.length - right.length;
        groups = [...left, ...Array(fill).fill('0'), ...right];
    } else {
        groups = clean.split(':');
    }
    return groups.map(g => g.padStart(4, '0')).join(':');
}

function compressIpv6(expanded: string): string {
    const groups = expanded.split(':');
    // Find longest run of '0000'
    let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
    for (let i = 0; i <= groups.length; i++) {
        if (i < groups.length && groups[i] === '0000') {
            if (curStart === -1) { curStart = i; curLen = 1; } else curLen++;
        } else {
            if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
            curStart = -1; curLen = 0;
        }
    }
    const stripped = groups.map(g => g.replace(/^0+/, '') || '0');
    if (bestStart === -1 || bestLen < 2) return stripped.join(':');
    return stripped.slice(0, bestStart).join(':') + '::' + stripped.slice(bestStart + bestLen).join(':');
}

function ipv6ToBinary(expanded: string): string {
    return expanded.split(':').map(g => parseInt(g, 16).toString(2).padStart(16, '0')).join(' ');
}

function getIpv6Type(expanded: string): { type: string; desc: string; color: string } {
    const g = expanded.split(':').map(g => parseInt(g, 16));
    if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return { type: 'Loopback', desc: '::1 — localhost IPv6 adresi', color: 'purple' };
    if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') return { type: 'Unspecified', desc: ':: — belirtilmemiş adres', color: 'slate' };
    if (g[0] === 0xfe80 || (g[0] >= 0xfe80 && g[0] <= 0xfebf)) return { type: 'Link-Local', desc: 'fe80::/10 — yalnızca yerel bağlantı', color: 'orange' };
    if (g[0] >= 0xfc00 && g[0] <= 0xfdff) return { type: 'ULA (Özel)', desc: 'fc00::/7 — benzersiz lokal adres (RFC 4193)', color: 'green' };
    if (g[0] >= 0xff00) return { type: 'Multicast', desc: 'ff00::/8 — çok noktaya yayın', color: 'red' };
    if (g[0] === 0x2002) return { type: '6to4 Tünel', desc: '2002::/16 — IPv4→IPv6 tünel', color: 'yellow' };
    if (g[0] === 0x2001 && g[1] === 0x0db8) return { type: 'Dokümantasyon', desc: '2001:db8::/32 — örnek/test adresi (RFC 3849)', color: 'blue' };
    if (g[0] === 0 && g[1] === 0 && g[2] === 0 && g[3] === 0 && g[4] === 0 && g[5] === 0xffff) return { type: 'IPv4-Mapped', desc: '::ffff:0:0/96 — IPv4 uyumlu', color: 'cyan' };
    if ((g[0] & 0xe000) === 0x2000) return { type: 'Global Unicast', desc: '2000::/3 — genel internet adresi', color: 'emerald' };
    return { type: 'Bilinmeyen', desc: 'Standart dışı adres', color: 'slate' };
}

// ─── IPv6 Tab ──────────────────────────────────────────────────────────────────
function Ipv6Tab() {
    const [input, setInput] = useState('2001:db8::1');
    const [result, setResult] = useState<{
        expanded: string; compressed: string; binary: string;
        type: string; desc: string; color: string;
        subnet: string; netPrefix: string;
    } | null>(null);
    const [prefix, setPrefix] = useState(64);
    const [error, setError] = useState('');

    const analyze = useCallback(() => {
        setError('');
        const raw = input.trim();
        let addr = raw;
        let pfx = prefix;
        if (raw.includes('/')) {
            const [a, p] = raw.split('/');
            addr = a;
            pfx = parseInt(p);
        }
        if (!isValidIpv6(addr)) {
            setError('Geçersiz IPv6 adresi. Örnek: 2001:db8::1 veya fe80::1/64');
            setResult(null);
            return;
        }
        const expanded = expandIpv6(addr);
        const compressed = compressIpv6(expanded);
        const binary = ipv6ToBinary(expanded);
        const typeInfo = getIpv6Type(expanded);

        // Network prefix (zero out host bits)
        const binStr = binary.replace(/ /g, '');
        const netBin = binStr.slice(0, pfx).padEnd(128, '0');
        const netGroups: string[] = [];
        for (let i = 0; i < 128; i += 16) {
            netGroups.push(parseInt(netBin.slice(i, i + 16), 2).toString(16).padStart(4, '0'));
        }
        const netExpanded = netGroups.join(':');
        const subnet = compressIpv6(netExpanded) + `/${pfx}`;

        setResult({ expanded, compressed, binary, ...typeInfo, subnet, netPrefix: `/${pfx}` });
    }, [input, prefix]);

    const EXAMPLES = [
        { label: 'Loopback', addr: '::1' },
        { label: 'Link-Local', addr: 'fe80::1/64' },
        { label: 'ULA', addr: 'fd00::1/48' },
        { label: 'Global', addr: '2001:db8:1::1/64' },
        { label: 'Multicast', addr: 'ff02::1' },
        { label: 'IPv4-Mapped', addr: '::ffff:192.0.2.1' },
        { label: '6to4', addr: '2002:c000:0201::1' },
        { label: 'Unspecified', addr: '::' },
    ];

    const typeColorMap: Record<string, string> = {
        purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
        orange: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
        green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        slate: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
        cyan: 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">IPv6 Adresi</label>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && analyze()}
                        placeholder="2001:db8::1 veya fe80::1/64"
                        aria-label="IPv6 adresi"
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-200"
                    />
                    <button
                        onClick={analyze}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Search size={16} /> Analiz Et
                    </button>
                </div>
                {!input.includes('/') && (
                    <div className="flex items-center gap-3 mt-3">
                        <label className="text-xs text-slate-500 shrink-0">Prefix /{prefix}</label>
                        <input type="range" min={0} max={128} value={prefix}
                            onChange={e => setPrefix(parseInt(e.target.value))}
                            title={`Prefix /${prefix}`} aria-label={`IPv6 prefix uzunluğu: /${prefix}`}
                            className="flex-1 accent-indigo-500 cursor-pointer" />
                        <span className="text-xs font-mono text-slate-500 w-6">{prefix}</span>
                    </div>
                )}
                {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            </div>

            {/* Examples */}
            <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(ex => (
                    <button key={ex.addr} onClick={() => { setInput(ex.addr); }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-mono transition-all">
                        {ex.label}
                    </button>
                ))}
            </div>

            {result && (
                <>
                    {/* Type badge */}
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${typeColorMap[result.color]}`}>
                        <span className="text-2xl">🌐</span>
                        <div>
                            <p className="font-black text-lg">{result.type}</p>
                            <p className="text-sm opacity-80">{result.desc}</p>
                        </div>
                        <span className="ml-auto font-mono text-sm opacity-60">{result.netPrefix}</span>
                    </div>

                    {/* Address forms */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase">Adres Formları</p>
                        </div>
                        <div className="px-4">
                            <InfoRow label="Tam (Genişletilmiş)" value={result.expanded} />
                            <InfoRow label="Sıkıştırılmış" value={result.compressed} />
                            <InfoRow label="Subnet" value={result.subnet} />
                        </div>
                    </div>

                    {/* Binary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-3">Binary (128 bit)</p>
                        <div className="font-mono text-[10px] leading-6 text-slate-600 dark:text-slate-400 break-all">
                            {result.binary.replace(/ /g, '').split('').map((bit, i) => (
                                <span key={i}>
                                    {i > 0 && i % 16 === 0 && <span className="text-slate-300 dark:text-slate-700 mx-0.5">:</span>}
                                    <span className={bit === '1' ? 'text-indigo-500 font-bold' : 'text-slate-300 dark:text-slate-600'}>{bit}</span>
                                </span>
                            ))}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400">İlk {prefix} bit = ağ adresi · Kalan {128 - prefix} bit = cihaz adresi</div>
                    </div>

                    {/* Quick reference */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-3">IPv6 Adres Türleri Rehberi</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {[
                                ['::1/128', 'Loopback'],
                                ['fe80::/10', 'Link-Local (SLAAC)'],
                                ['fc00::/7', 'ULA — Özel Ağ (RFC 4193)'],
                                ['ff00::/8', 'Multicast'],
                                ['2000::/3', 'Global Unicast (İnternet)'],
                                ['2001:db8::/32', 'Dokümantasyon / Örnek'],
                                ['::ffff:0:0/96', 'IPv4-Mapped'],
                                ['2002::/16', '6to4 Tünel'],
                            ].map(([range, label]) => (
                                <div key={range} className="flex items-center gap-2">
                                    <code className="text-indigo-600 dark:text-indigo-400 font-mono w-36 shrink-0">{range}</code>
                                    <span className="text-slate-500">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Subnet Calculator ────────────────────────────────────────────────────────
function SubnetTab() {
    const [input, setInput] = useState('192.168.1.100/24');
    const [info, setInfo] = useState<SubnetInfo | null>(null);
    const [error, setError] = useState('');

    const calculate = useCallback(() => {
        setError('');
        const trimmed = input.trim();

        let ip = trimmed;
        let prefix = 24;

        if (trimmed.includes('/')) {
            if (!isValidCidr(trimmed)) {
                setError('Geçersiz CIDR notasyonu. Örnek: 192.168.1.0/24');
                setInfo(null);
                return;
            }
            const [i, p] = trimmed.split('/');
            ip = i;
            prefix = parseInt(p, 10);
        } else {
            if (!isValidIp(trimmed)) {
                setError('Geçersiz IP adresi. Örnek: 192.168.1.100');
                setInfo(null);
                return;
            }
        }

        setInfo(getSubnetInfo(ip, prefix));
    }, [input]);

    const COMMON_MASKS = [
        { prefix: 8, hosts: '16.7M', label: '/8  Class A' },
        { prefix: 16, hosts: '65.5K', label: '/16 Class B' },
        { prefix: 24, hosts: '254', label: '/24 Class C' },
        { prefix: 25, hosts: '126', label: '/25 Yarı C' },
        { prefix: 26, hosts: '62', label: '/26 Çeyrek C' },
        { prefix: 27, hosts: '30', label: '/27' },
        { prefix: 28, hosts: '14', label: '/28' },
        { prefix: 29, hosts: '6', label: '/29' },
        { prefix: 30, hosts: '2', label: '/30 P2P' },
        { prefix: 32, hosts: '1', label: '/32 Host' },
    ];

    return (
        <div className="space-y-6">
            {/* Input */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">IP Adresi / CIDR</label>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && calculate()}
                        placeholder="192.168.1.100/24"
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-slate-200"
                    />
                    <button
                        onClick={calculate}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Search size={16} />
                        Hesapla
                    </button>
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />{error}
                    </p>
                )}
            </div>

            {/* Quick mask picker */}
            <div className="flex flex-wrap gap-2">
                {COMMON_MASKS.map(m => (
                    <button
                        key={m.prefix}
                        onClick={() => {
                            const base = input.split('/')[0] || '192.168.1.0';
                            setInput(`${base}/${m.prefix}`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-mono font-bold transition-all"
                    >
                        /{m.prefix}
                        <span className="text-[9px] ml-1 opacity-60">({m.hosts})</span>
                    </button>
                ))}
            </div>

            {info && (
                <>
                    {/* Summary badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Kullanılabilir Host', value: info.hostCount.toLocaleString(), color: 'blue' },
                            { label: 'IP Sınıfı', value: `Sınıf ${info.ipClass}`, color: 'green' },
                            { label: 'Kapsam', value: info.isPrivate ? 'Özel (Private)' : 'Genel (Public)', color: info.isPrivate ? 'orange' : 'red' },
                            { label: 'Prefix', value: `/${info.prefix}`, color: 'purple' },
                        ].map(b => (
                            <div key={b.label} className={`p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}>
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{b.label}</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white font-mono">{b.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed info */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase">Subnet Detayları</p>
                        </div>
                        <div className="px-4">
                            <InfoRow label="Ağ Adresi" value={info.network} badge="Network" />
                            <InfoRow label="Broadcast" value={info.broadcast} badge="Broadcast" />
                            <InfoRow label="İlk Host" value={info.firstHost} />
                            <InfoRow label="Son Host" value={info.lastHost} />
                            <InfoRow label="Subnet Maskesi" value={info.subnetMask} />
                            <InfoRow label="Wildcard Mask" value={info.wildcardMask} />
                            <InfoRow label="CIDR" value={`${info.network}/${info.prefix}`} />
                        </div>
                    </div>

                    {/* Binary mask visualization */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-3">Binary Subnet Maskesi</p>
                        <div className="flex flex-wrap gap-1 font-mono text-xs">
                            {info.binaryMask.split('').map((bit, i) => (
                                <span key={i}>
                                    {i > 0 && i % 8 === 0 && <span className="text-slate-400 mx-1">.</span>}
                                    <span className={`${bit === '1' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-300 dark:text-slate-600'}`}>
                                        {bit}
                                    </span>
                                </span>
                            ))}
                        </div>
                        <div className="mt-2 flex gap-4 text-[10px] text-slate-400">
                            <span><span className="text-blue-500 font-bold">1</span> = Ağ biti ({info.prefix} adet)</span>
                            <span><span className="text-slate-400">0</span> = Host biti ({32 - info.prefix} adet)</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── IP Converter Tab ─────────────────────────────────────────────────────────
function IpConvertTab() {
    const [ip, setIp] = useState('192.168.1.1');
    const [result, setResult] = useState<{ decimal: string; hex: string; binary: string; octal: string } | null>(null);
    const [error, setError] = useState('');

    const convert = () => {
        setError('');
        const trimmed = ip.trim();
        if (!isValidIp(trimmed)) {
            setError('Geçersiz IP adresi');
            setResult(null);
            return;
        }
        const n = ipToInt(trimmed);
        setResult({
            decimal: n.toString(10),
            hex: '0x' + n.toString(16).toUpperCase().padStart(8, '0'),
            binary: intToBinary(n).replace(/(.{8})/g, '$1 ').trim(),
            octal: n.toString(8),
        });
    };

    const PRIVATE_RANGES = [
        { range: '10.0.0.0/8', desc: 'Class A Private (10.x.x.x)', example: '10.0.0.1' },
        { range: '172.16.0.0/12', desc: 'Class B Private (172.16-31.x.x)', example: '172.16.0.1' },
        { range: '192.168.0.0/16', desc: 'Class C Private (192.168.x.x)', example: '192.168.1.1' },
        { range: '127.0.0.0/8', desc: 'Loopback', example: '127.0.0.1' },
        { range: '169.254.0.0/16', desc: 'Link-Local (APIPA)', example: '169.254.1.1' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">IPv4 Adresi</label>
                <div className="flex gap-2">
                    <input
                        value={ip}
                        onChange={e => setIp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && convert()}
                        placeholder="192.168.1.1"
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 text-slate-800 dark:text-slate-200"
                    />
                    <button
                        onClick={convert}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Çevir
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            </div>

            {result && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase">Dönüşüm Sonuçları</p>
                    </div>
                    <div className="px-4">
                        <InfoRow label="Onlu (Decimal)" value={result.decimal} />
                        <InfoRow label="Hexadecimal" value={result.hex} />
                        <InfoRow label="Binary" value={result.binary} />
                        <InfoRow label="Octal" value={result.octal} />
                    </div>
                </div>
            )}

            {/* Private IP Ranges Reference */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase">Özel IP Aralıkları (RFC 1918)</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {PRIVATE_RANGES.map(r => (
                        <div key={r.range} className="px-4 py-3 flex items-center gap-4">
                            <code className="text-xs font-bold text-blue-600 dark:text-blue-400 w-36 shrink-0">{r.range}</code>
                            <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{r.desc}</span>
                            <button
                                onClick={() => { setIp(r.example); convert(); }}
                                className="text-[10px] text-blue-500 hover:underline font-bold shrink-0"
                            >
                                Dene
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── CIDR Calculator Tab ───────────────────────────────────────────────────────
function CidrTab() {
    const [baseIp, setBaseIp] = useState('192.168.1.0');
    const [prefix, setPrefix] = useState(24);
    const [subnets, setSubnets] = useState(0);
    const [result, setResult] = useState<Array<{ network: string; broadcast: string; hosts: number; mask: string }> | null>(null);
    const [error, setError] = useState('');

    const calculate = () => {
        setError('');
        if (!isValidIp(baseIp)) {
            setError('Geçersiz IP adresi');
            return;
        }

        const subnetCount = Math.min(Math.pow(2, subnets), 64);
        const newPrefix = prefix + subnets;

        if (newPrefix > 32) {
            setError('Subnet sayısı çok fazla — prefix /32 üzerine çıkıyor');
            return;
        }

        const results = [];
        const networkInt = ipToInt(baseIp);
        const blockSize = Math.pow(2, 32 - newPrefix);

        for (let i = 0; i < subnetCount; i++) {
            const netInt = (networkInt + i * blockSize) >>> 0;
            const bcastInt = (netInt + blockSize - 1) >>> 0;
            const maskInt = newPrefix === 0 ? 0 : (0xffffffff << (32 - newPrefix)) >>> 0;
            results.push({
                network: intToIp(netInt),
                broadcast: intToIp(bcastInt),
                hosts: Math.max(0, blockSize - 2),
                mask: intToIp(maskInt),
            });
        }

        setResult(results);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Ağ Adresi</label>
                    <input
                        value={baseIp}
                        onChange={e => setBaseIp(e.target.value)}
                        placeholder="192.168.1.0"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-slate-200"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Prefix /{prefix}</label>
                    <input
                        type="range"
                        min={8}
                        max={30}
                        value={prefix}
                        onChange={e => setPrefix(parseInt(e.target.value))}
                        className="w-full h-10 accent-purple-500 cursor-pointer"
                        title={`Prefix /${prefix}`}
                        aria-label={`Prefix uzunluğu: /${prefix}`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                        Subnet Bits: {subnets} = {Math.pow(2, subnets)} alt ağ
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={Math.min(6, 32 - prefix)}
                        value={subnets}
                        onChange={e => setSubnets(parseInt(e.target.value))}
                        className="w-full h-10 accent-purple-500 cursor-pointer"
                        title={`Subnet bitleri: ${subnets}`}
                        aria-label={`Subnet bit sayısı: ${subnets}, ${Math.pow(2, subnets)} alt ağ`}
                    />
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
            >
                <Hash size={16} className="inline mr-2" />
                {Math.pow(2, subnets)} Alt Ağı Hesapla
            </button>

            {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}

            {result && result.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase">Alt Ağlar (/{prefix + subnets})</p>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold">{result.length} subnet</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    {['#', 'Ağ', 'İlk Host', 'Son Host', 'Broadcast', 'Host Sayısı'].map(h => (
                                        <th key={h} className="px-4 py-2 text-left font-bold text-slate-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((r, i) => {
                                    const netInt = ipToInt(r.network);
                                    const bcastInt = ipToInt(r.broadcast);
                                    const firstHost = intToIp(netInt + 1);
                                    const lastHost = intToIp(bcastInt - 1);
                                    return (
                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                                            <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{r.network}/{prefix + subnets}</td>
                                            <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{firstHost}</td>
                                            <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{lastHost}</td>
                                            <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{r.broadcast}</td>
                                            <td className="px-4 py-2.5 font-mono font-bold text-green-600 dark:text-green-400">{r.hosts.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function NetworkToolkit({ onBack }: { onBack: () => void }) {
    const [tab, setTab] = useState<ToolTab>('subnet');

    const TABS = [
        { id: 'subnet' as ToolTab, label: 'Subnet Hesaplayıcı', icon: <Network size={15} />, color: 'blue' },
        { id: 'ip-convert' as ToolTab, label: 'IP Çevirici', icon: <Binary size={15} />, color: 'green' },
        { id: 'cidr' as ToolTab, label: 'CIDR / Alt Ağ Bölücü', icon: <Hash size={15} />, color: 'purple' },
        { id: 'ipv6' as ToolTab, label: 'IPv6 Analiz', icon: <ChevronRight size={15} />, color: 'indigo' },
    ];

    const tabColor: Record<string, string> = {
        blue: 'bg-blue-600 text-white shadow-blue-500/20',
        green: 'bg-green-600 text-white shadow-green-500/20',
        purple: 'bg-purple-600 text-white shadow-purple-500/20',
        indigo: 'bg-indigo-600 text-white shadow-indigo-500/20',
    };

    const activeTab = TABS.find(t => t.id === tab);

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    title="Geri Dön"
                    aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Network className="w-6 h-6 text-blue-500" />
                        Ağ Araç Seti
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Subnet hesaplama, IP dönüşümü, CIDR alt ağ bölümleme, IPv6 analiz
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id
                            ? `${tabColor[t.color]} shadow-lg`
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                {tab === 'subnet' && <SubnetTab />}
                {tab === 'ip-convert' && <IpConvertTab />}
                {tab === 'cidr' && <CidrTab />}
                {tab === 'ipv6' && <Ipv6Tab />}
            </div>

            {/* Quick reference card */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: '/24 → 254 host', sub: '255.255.255.0' },
                    { label: '/16 → 65534 host', sub: '255.255.0.0' },
                    { label: '/30 → 2 host (P2P)', sub: '255.255.255.252' },
                    { label: '/32 → Tek host', sub: '255.255.255.255' },
                ].map(c => (
                    <div key={c.label} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{c.label}</p>
                        <p className="text-[10px] font-mono text-slate-400">{c.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
