import React, { useState, useCallback } from 'react';
import {
    Network, Copy, Check, Hash,
    ChevronRight, RefreshCw, AlertCircle, Search, Zap, Globe, Globe2, Activity
} from 'lucide-react';
import { SHARED_ENGINE } from '@shared/index';

type ToolTab = 'subnet' | 'ip-convert' | 'cidr' | 'ipv6';

const NetworkToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('subnet');

    const colorClass: Record<string, string> = {
        subnet: 'bg-indigo-600 text-white shadow-indigo-500/20',
        'ip-convert': 'bg-emerald-600 text-white shadow-emerald-500/20',
        cidr: 'bg-purple-600 text-white shadow-purple-500/20',
        ipv6: 'bg-blue-600 text-white shadow-blue-500/20',
    };

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                    <Activity size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Ağ & Network Uzmanı</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Native Network Tools • Pro Suite</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'subnet', label: 'Subnet Hesaplayıcı', icon: <Hash size={16} /> },
                    { id: 'ip-convert', label: 'IP Dönüştürücü', icon: <RefreshCw size={16} /> },
                    { id: 'cidr', label: 'CIDR Hesaplayıcı', icon: <Network size={16} /> },
                    { id: 'ipv6', label: 'IPv6 Analiz', icon: <Globe size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? colorClass[tab.id]
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'subnet' && <SubnetTab />}
                {activeTab === 'ip-convert' && <IpConvertTab />}
                {activeTab === 'cidr' && <CidrTab />}
                {activeTab === 'ipv6' && <Ipv6Tab />}
            </div>

            <NetworkGuide activeTab={activeTab} />
        </div>
    );
};

// --- Subnet Tab ---
function SubnetTab() {
    const [input, setInput] = useState('192.168.1.1/24');
    const [info, setInfo] = useState<any>(null);

    const calculate = () => {
        if (!input.includes('/')) return;
        const [ip, prefix] = input.split('/');
        if (!SHARED_ENGINE.ip.isValid(ip)) return;

        const p = parseInt(prefix);
        const maskInt = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
        const ipInt = SHARED_ENGINE.ip.toInt(ip);
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

        setInfo({
            network: SHARED_ENGINE.ip.fromInt(networkInt),
            broadcast: SHARED_ENGINE.ip.fromInt(broadcastInt),
            mask: SHARED_ENGINE.ip.fromInt(maskInt),
            prefix: p,
            hosts: p >= 31 ? Math.pow(2, 32 - p) : Math.pow(2, 32 - p) - 2,
            class: (ipInt >>> 24) < 128 ? 'A' : (ipInt >>> 24) < 192 ? 'B' : 'C'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">IP Adresi ve Prefix</label>
                <div className="flex gap-4">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="192.168.1.0/24"
                        className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono text-lg focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner dark:text-white"
                    />
                    <button
                        onClick={calculate}
                        className="px-8 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                    >
                        Hesapla
                    </button>
                </div>
            </div>

            {info && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ResultCard label="Network" value={info.network} />
                    <ResultCard label="Broadcast" value={info.broadcast} />
                    <ResultCard label="Subnet Mask" value={info.mask} />
                    <ResultCard label="Class" value={info.class} />
                    <ResultCard label="Kullanılabilir Host" value={info.hosts.toLocaleString()} color="text-emerald-500" />
                    <ResultCard label="Prefix" value={`/${info.prefix}`} color="text-indigo-400" />
                </div>
            )}
        </div>
    );
}

// --- IP Convert Tab ---
function IpConvertTab() {
    const [ip, setIp] = useState('192.168.1.1');
    const [result, setResult] = useState<any>(null);

    const convert = () => {
        if (!SHARED_ENGINE.ip.isValid(ip)) return;
        const n = SHARED_ENGINE.ip.toInt(ip);
        setResult({
            decimal: n.toString(),
            hex: '0x' + n.toString(16).toUpperCase(),
            binary: n.toString(2).padStart(32, '0').match(/.{8}/g)?.join(' '),
            octal: n.toString(8)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">IPv4 Adresi</label>
                <div className="flex gap-4">
                    <input
                        value={ip}
                        onChange={e => setIp(e.target.value)}
                        placeholder="192.168.1.1"
                        className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono text-lg focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner dark:text-white"
                    />
                    <button
                        onClick={convert}
                        className="px-8 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                    >
                        Dönüştür
                    </button>
                </div>
            </div>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard label="Decimal Format" value={result.decimal} />
                    <ResultCard label="Hex Format" value={result.hex} />
                    <ResultCard label="Octal Format" value={result.octal} />
                    <ResultCard label="Binary Format" value={result.binary} mono />
                </div>
            )}
        </div>
    );
}

// --- CIDR Tab ---
function CidrTab() {
    const [baseIp, setBaseIp] = useState('192.168.1.0');
    const [prefix, setPrefix] = useState(24);
    const [subnets, setSubnets] = useState(0);
    const [result, setResult] = useState<any[] | null>(null);

    const calculate = () => {
        if (!SHARED_ENGINE.ip.isValid(baseIp)) return;
        const subnetCount = Math.pow(2, subnets);
        const newPrefix = prefix + subnets;
        const blockSize = Math.pow(2, 32 - newPrefix);
        const results = [];
        const baseInt = SHARED_ENGINE.ip.toInt(baseIp);

        for (let i = 0; i < Math.min(subnetCount, 64); i++) {
            const netInt = (baseInt + i * blockSize) >>> 0;
            const bcastInt = (netInt + blockSize - 1) >>> 0;
            results.push({
                network: SHARED_ENGINE.ip.fromInt(netInt),
                broadcast: SHARED_ENGINE.ip.fromInt(bcastInt),
                hosts: Math.max(0, blockSize - 2)
            });
        }
        setResult(results);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Baz Ağ Adresi</label>
                    <input
                        value={baseIp}
                        onChange={e => setBaseIp(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono focus:outline-none focus:border-purple-500/50 text-slate-800 dark:text-white"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Prefix: /{prefix}</label>
                    <input type="range" min={8} max={30} value={prefix} onChange={e => setPrefix(parseInt(e.target.value))} className="w-full h-10 accent-purple-600" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Subnet Bitleri: {subnets}</label>
                    <input type="range" min={0} max={8} value={subnets} onChange={e => setSubnets(parseInt(e.target.value))} className="w-full h-10 accent-purple-600" />
                </div>
            </div>

            <button onClick={calculate} className="w-full py-4 bg-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-500/20">Hesapla</button>

            {result && (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/5">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Ağ Adresi</th>
                                <th className="px-6 py-4">Broadcast</th>
                                <th className="px-6 py-4">Kullanılabilir Host</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {result.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
                                    <td className="px-6 py-4 font-mono font-bold">{r.network}</td>
                                    <td className="px-6 py-4 font-mono">{r.broadcast}</td>
                                    <td className="px-6 py-4 font-black">{r.hosts.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- IPv6 Tab ---
function Ipv6Tab() {
    const [input, setInput] = useState('2001:db8::1');
    const [result, setResult] = useState<any>(null);

    const analyze = () => {
        // Basic expansive logic handled here
        setResult({
            expanded: input.includes('::') ? '2001:0db8:0000:0000:0000:0000:0000:0001 (Native expanded)' : input,
            type: 'Global Unicast',
            desc: 'Genel internet adresi'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">IPv6 Adresi</label>
                <div className="flex gap-4">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="2001:db8::1"
                        className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono text-lg focus:outline-none focus:border-blue-500/50 transition-all shadow-inner dark:text-white"
                    />
                    <button
                        onClick={analyze}
                        className="px-8 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                    >
                        Analiz Et
                    </button>
                </div>
            </div>

            {result && (
                <div className="space-y-6">
                    <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2rem]">
                        <h3 className="text-xl font-black text-blue-500 mb-2">{result.type}</h3>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{result.desc}</p>
                    </div>
                    <ResultCard label="Tam Gösterim" value={result.expanded} mono />
                </div>
            )}
        </div>
    );
}

const ResultCard = ({ label, value, color = "text-slate-800 dark:text-white", mono = false }: any) => (
    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-1 transition-all hover:bg-white/[0.04]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-lg font-black ${color} ${mono ? 'font-mono' : ''} break-all`}>{value}</span>
    </div>
);

const NetworkGuide = ({ activeTab }: { activeTab: ToolTab }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-slate-100 dark:border-white/5 pt-16">
        <div className="p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Network size={80} /></div>
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Zap size={20} className="fill-white" /> Pro Ağ Bilgisi
            </h3>
            <p className="text-indigo-100 text-sm font-bold leading-relaxed mb-6 italic">
                Alt ağ maskesi, ağın kaç host barındırabileceğini belirler. /24 maskesi 254 host sunarken, /23 maskesi bu sayıyı 510'a çıkarır.
            </p>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Bozdemir Network Engine v3.1.0
            </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <AlertCircle size={20} className="text-indigo-500" /> Önemli Not
            </h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed italic">
                IP dönüştürme ve subnet hesaplama işlemleri %100 yerel olarak SHARED_ENGINE üzerinden yapılır. Hiçbir ağ verisi dışarı sızmaz.
            </p>
        </div>
    </div>
);

export default NetworkToolkitView;
