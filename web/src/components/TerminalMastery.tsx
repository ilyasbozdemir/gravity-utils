'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, Search, Copy, Check, Monitor, Cpu, Network, FileCode, Shield, Activity, Share2, Info } from 'lucide-react';

interface Command {
    cmd: string;
    desc: string;
    example?: string;
    os: 'win' | 'linux' | 'both';
}

interface Category {
    id: string;
    title: string;
    icon: React.ReactNode;
    commands: Command[];
}

const COMMAND_DATA: Category[] = [
    {
        id: 'network',
        title: 'Ağ & Bağlantı',
        icon: <Network size={20} />,
        commands: [
            { cmd: 'ipconfig', desc: 'Ağ arayüzü bilgilerini gösterir.', example: 'ipconfig /all', os: 'win' },
            { cmd: 'ifconfig', desc: 'Ağ arayüzlerini yapılandırır ve gösterir.', example: 'ifconfig -a', os: 'linux' },
            { cmd: 'ping [host]', desc: 'Hedef sunucuya erişilebilirliği test eder.', example: 'ping google.com', os: 'both' },
            { cmd: 'netstat -an', desc: 'Aktif bağlantıları ve portları listeler.', os: 'both' },
            { cmd: 'tracert [host]', desc: 'Paketlerin hedefe giden rotasını izler.', example: 'tracert google.com', os: 'win' },
            { cmd: 'traceroute [host]', desc: 'Paketlerin hedefe giden rotasını izler.', example: 'traceroute google.com', os: 'linux' },
            { cmd: 'nslookup [domain]', desc: 'DNS kayıtlarını sorgular.', os: 'both' },
            { cmd: 'curl -I [url]', desc: 'HTTP header bilgilerini çeker.', example: 'curl -I https://google.com', os: 'both' },
        ]
    },
    {
        id: 'files',
        title: 'Dosya & Dizin',
        icon: <FileCode size={20} />,
        commands: [
            { cmd: 'ls -al', desc: 'Gizli dosyalar dahil tüm dosyaları detaylı listeler.', os: 'linux' },
            { cmd: 'dir', desc: 'Dizindeki dosyaları listeler.', os: 'win' },
            { cmd: 'cd [path]', desc: 'Dizini değiştirir.', os: 'both' },
            { cmd: 'mkdir [name]', desc: 'Yeni klasör oluşturur.', os: 'both' },
            { cmd: 'rm -rf [name]', desc: 'Dosya veya klasörü zorlayarak siler (Dikkat!).', os: 'linux' },
            { cmd: 'del [file]', desc: 'Dosyayı siler.', os: 'win' },
            { cmd: 'cp [source] [dest]', desc: 'Dosya kopyalar.', os: 'linux' },
            { cmd: 'copy [source] [dest]', desc: 'Dosya kopyalar.', os: 'win' },
            { cmd: 'pwd', desc: 'Bulunduğunuz tam dizin yolunu gösterir.', os: 'linux' },
            { cmd: 'grep "[text]" [file]', desc: 'Dosya içinde metin arar.', os: 'linux' },
        ]
    },
    {
        id: 'system',
        title: 'Sistem Bilgisi',
        icon: <Cpu size={20} />,
        commands: [
            { cmd: 'systeminfo', desc: 'Detaylı işletim sistemi bilgilerini gösterir.', os: 'win' },
            { cmd: 'uname -a', desc: 'Çekirdek (kernel) ve sistem bilgilerini gösterir.', os: 'linux' },
            { cmd: 'hostname', desc: 'Bilgisayarın ağ adını gösterir.', os: 'both' },
            { cmd: 'df -h', desc: 'Disk kullanımını okunabilir formatta gösterir.', os: 'linux' },
            { cmd: 'free -m', desc: 'Bellek (RAM) kullanımını gösterir.', os: 'linux' },
            { cmd: 'uptime', desc: 'Sistemin ne kadar süredir açık olduğunu gösterir.', os: 'both' },
        ]
    },
    {
        id: 'process',
        title: 'Süreç Yönetimi',
        icon: <Activity size={20} />,
        commands: [
            { cmd: 'top', desc: 'Canlı süreçleri ve kaynak kullanımını gösterir.', os: 'linux' },
            { cmd: 'tasklist', desc: 'Çalışan tüm görevleri listeler.', os: 'win' },
            { cmd: 'taskkill /F /IM [app].exe', desc: 'Bir uygulamayı zorla kapatır.', os: 'win' },
            { cmd: 'kill -9 [pid]', desc: 'Belirli bir süreci zorla sonlandırır.', os: 'linux' },
            { cmd: 'ps aux', desc: 'Tüm çalışan süreçlerin detaylı listesini verir.', os: 'linux' },
        ]
    },
    {
        id: 'security',
        title: 'Güvenlik & Yetki',
        icon: <Shield size={20} />,
        commands: [
            { cmd: 'sudo [command]', desc: 'Komutu yönetici (root) yetkisiyle çalıştırır.', os: 'linux' },
            { cmd: 'chmod [permission] [file]', desc: 'Dosya izinlerini değiştirir.', example: 'chmod 755 script.sh', os: 'linux' },
            { cmd: 'chown [user]:[group] [file]', desc: 'Dosya sahibini değiştirir.', os: 'linux' },
            { cmd: 'whoami', desc: 'Aktif kullanıcı adını gösterir.', os: 'both' },
            { cmd: 'net user [name]', desc: 'Kullanıcı hesabı bilgilerini gösterir.', os: 'win' },
        ]
    }
];

export function TerminalMastery({ onBack }: { onBack: () => void }) {
    const [search, setSearch] = useState('');
    const [osFilter, setOsFilter] = useState<'all' | 'win' | 'linux'>('all');
    const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

    const handleCopy = (cmd: string) => {
        navigator.clipboard.writeText(cmd);
        setCopiedCmd(cmd);
        setTimeout(() => setCopiedCmd(null), 2000);
    };

    const filteredData = COMMAND_DATA.map(cat => ({
        ...cat,
        commands: cat.commands.filter(c => {
            const matchesSearch = c.cmd.toLowerCase().includes(search.toLowerCase()) ||
                c.desc.toLowerCase().includes(search.toLowerCase());
            const matchesOS = osFilter === 'all' || c.os === 'both' || c.os === osFilter;
            return matchesSearch && matchesOS;
        })
    })).filter(cat => cat.commands.length > 0);

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön"
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Terminal className="w-6 h-6 text-emerald-500" /> Terminal Mastery Pro
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Windows ve Linux için hayat kurtaran terminal komutları rehberi.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                        onClick={() => setOsFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${osFilter === 'all' ? 'bg-white dark:bg-white/10 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
                    >Tümü</button>
                    <button
                        onClick={() => setOsFilter('win')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${osFilter === 'win' ? 'bg-white dark:bg-white/10 text-blue-500 shadow-sm' : 'text-slate-500'}`}
                    >Windows</button>
                    <button
                        onClick={() => setOsFilter('linux')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${osFilter === 'linux' ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm' : 'text-slate-500'}`}
                    >Linux</button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-12 max-w-2xl mx-auto">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                <input
                    type="text"
                    placeholder="Komut veya açıklama ara... (örn: network, delete, ip)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b101b] border-2 border-slate-200 dark:border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-lg focus:outline-none focus:border-emerald-500 transition-all shadow-xl dark:text-emerald-50"
                />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                {filteredData.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                {cat.icon}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.title}</h3>
                        </div>

                        <div className="space-y-3">
                            {cat.commands.map((c, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-[#0b101b] rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/50 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{c.cmd}</code>
                                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${c.os === 'win' ? 'bg-blue-100 text-blue-600' : c.os === 'linux' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {c.os === 'both' ? 'W/L' : c.os}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.desc}</p>
                                        {c.example && (
                                            <p className="text-[10px] text-slate-400 mt-1 italic font-mono">Örn: {c.example}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(c.cmd)}
                                        className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:text-emerald-500 transition-all shadow-sm shrink-0"
                                    >
                                        {copiedCmd === c.cmd ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                    </div>
                ))}
            </div>

            {/* Terminal Info */}
            <div className="bg-slate-900 text-slate-300 p-8 rounded-[3rem] border border-white/10 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500">
                        <Monitor size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">Terminal Kısayolu</h4>
                        <p className="text-sm text-slate-400">Windows: <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-emerald-400">Win + R</kbd> yazıp <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-emerald-400">cmd</kbd> yazın.</p>
                        <p className="text-sm text-slate-400">Linux: <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-emerald-400">Ctrl + Alt + T</kbd> kombinasyonunu kullanın.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">40+</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">KOMUT</span>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-4" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">5</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">KATEGORİ</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
