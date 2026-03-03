import React, { useState, useCallback } from 'react';
import {
    Network, Copy, Check, Hash,
    ChevronRight, RefreshCw, AlertCircle, Search, Zap, Globe
} from 'lucide-react';
import { SHARED_ENGINE } from '@shared/index';

type ToolTab = 'subnet' | 'ip-convert' | 'ipv6';

const NetworkToolkitView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ToolTab>('subnet');

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                    <Network size={40} className="text-white fill-white/10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Ağ & Network Uzmanı</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Bozdemir Engine Native Network Tools</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'subnet', label: 'Subnet Hesaplayıcı', icon: <Hash size={16} /> },
                    { id: 'ip-convert', label: 'IP Dönüştürücü', icon: <RefreshCw size={16} /> },
                    { id: 'ipv6', label: 'IPv6 Analiz', icon: <Globe size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ToolTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-50 dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none min-h-[500px]">
                {activeTab === 'subnet' && <SubnetTab />}
                {activeTab === 'ip-convert' && <IpConvertTab />}
                {activeTab === 'ipv6' && <Ipv6Tab />}
            </div>
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
            hosts: p >= 31 ? Math.pow(2, 32 - p) : Math.pow(2, 32 - p) - 2
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
                        className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono text-lg focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner dark:text-white"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard label="Ağ Adresi (Network)" value={info.network} />
                    <ResultCard label="Broadcast Adresi" value={info.broadcast} />
                    <ResultCard label="Subnet Maskesi" value={info.mask} />
                    <ResultCard label="Kullanılabilir Host" value={info.hosts.toLocaleString()} color="text-emerald-500" />
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
            binary: n.toString(2).padStart(32, '0').match(/.{8}/g)?.join(' ')
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
                        className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 font-mono text-lg focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner dark:text-white"
                    />
                    <button
                        onClick={convert}
                        className="px-8 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                    >
                        Dönüştür
                    </button>
                </div>
            </div>

            {result && (
                <div className="space-y-4">
                    <ResultCard label="Decimal Format" value={result.decimal} />
                    <ResultCard label="Hex Format" value={result.hex} />
                    <ResultCard label="Binary Format" value={result.binary} mono />
                </div>
            )}
        </div>
    );
}

// --- IPv6 Tab (Placeholder for native) ---
function Ipv6Tab() {
    return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500">
                <Globe size={40} />
            </div>
            <div>
                <h3 className="text-xl font-black mb-2">IPv6 Analiz Motoru</h3>
                <p className="text-slate-500 max-w-sm">Native IPv6 yığını masaüstü sürümü için optimize ediliyor. Yakında burada.</p>
            </div>
        </div>
    );
}

const ResultCard = ({ label, value, color = "text-indigo-500", mono = false }: any) => (
    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-1 transition-all hover:bg-white/[0.04]">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`text-xl font-black ${color} ${mono ? 'font-mono' : ''} break-all`}>{value}</span>
    </div>
);

export default NetworkToolkitView;
