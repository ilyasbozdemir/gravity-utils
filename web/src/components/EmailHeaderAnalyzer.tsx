'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck, AlertCircle, Search, Trash2, Info, ChevronRight, Check, Copy } from 'lucide-react';

interface HeaderPair {
    key: string;
    value: string;
    description?: string;
    isSecurity?: boolean;
}

export const EmailHeaderAnalyzer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<HeaderPair[]>([]);
    const [securityScore, setSecurityScore] = useState<{ score: number; total: number } | null>(null);

    const parseHeaders = () => {
        if (!input.trim()) {
            setResults([]);
            setSecurityScore(null);
            return;
        }

        const lines = input.split(/\r?\n/);
        const pairs: HeaderPair[] = [];
        let currentKey = '';
        let currentValue = '';

        lines.forEach(line => {
            if (line.match(/^\s/) && currentKey) {
                // Continuation line
                currentValue += ' ' + line.trim();
            } else {
                if (currentKey) {
                    pairs.push({ key: currentKey, value: currentValue.trim() });
                }
                const match = line.match(/^([^:]+):(.*)$/);
                if (match) {
                    currentKey = match[1].trim();
                    currentValue = match[2].trim();
                } else {
                    currentKey = '';
                    currentValue = '';
                }
            }
        });

        if (currentKey) {
            pairs.push({ key: currentKey, value: currentValue.trim() });
        }

        // Analyze and add descriptions
        const analyzed = pairs.map(p => {
            let desc = '';
            let isSec = false;

            const k = p.key.toLowerCase();
            if (k === 'spf' || p.value.toLowerCase().includes('spf=')) {
                desc = 'Sender Policy Framework: Hangi IP\'lerin alan adınız adına e-posta gönderebileceğini belirler.';
                isSec = true;
            } else if (k === 'dkim-signature') {
                desc = 'DomainKeys Identified Mail: E-postanın yolda değiştirilmediğini kanıtlayan dijital imza.';
                isSec = true;
            } else if (k === 'dmarc' || p.value.toLowerCase().includes('dmarc=')) {
                desc = 'Domain-based Message Authentication: SPF ve DKIM sonuçlarına göre ne yapılacağını (karantina, reddet) belirler.';
                isSec = true;
            } else if (k === 'received') {
                desc = 'E-postanın geçtiği sunucu duraklarını gösterir. İz sürmek için kritiktir.';
            } else if (k === 'authentication-results') {
                desc = 'Sunucu tarafından yapılan güvenlik kontrollerinin (SPF, DKIM, DMARC) toplu sonucu.';
                isSec = true;
            } else if (k === 'x-spam-status' || k === 'x-spam-level') {
                desc = 'E-postanın spam olup olmadığına dair sunucu puanı.';
            }

            return { ...p, description: desc, isSecurity: isSec };
        });

        setResults(analyzed);

        // Calculate simple security score
        const secHeaders = ['spf', 'dkim-signature', 'dmarc', 'authentication-results'];
        const found = secHeaders.filter(sh => analyzed.some(a => a.key.toLowerCase().includes(sh)));
        setSecurityScore({ score: found.length, total: secHeaders.length });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Email Header Analiz</h1>
                    <p className="text-slate-500 text-sm font-medium">E-posta başlıklarını (headers) inceleyerek gönderici güvenliğini ve yolculuğunu analiz edin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Raw Email Header</label>
                            <button onClick={() => setInput('')} className="text-[10px] font-bold text-red-500 hover:underline">Temizle</button>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="E-posta uygulamanızdan 'Kaynağı Görüntüle' diyerek başlıkları buraya yapıştırın..."
                            className="w-full h-80 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                        />
                        <button
                            onClick={parseHeaders}
                            className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            ANALİZ ET
                        </button>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-dashed border-amber-200 dark:border-amber-500/20">
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            <strong>İpucu:</strong> Gmail'de 'Orijinalini Göster', Outlook'ta 'İleti Kaynağını Görüntüle' diyerek bu verilere ulaşabilirsiniz.
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {securityScore && (
                        <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-xl 
                                ${securityScore.score === securityScore.total ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                                {securityScore.score}/{securityScore.total}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">Güvenlik Skoru</h3>
                                <p className="text-xs text-slate-500">Temel doğrulama protokolü kontrolleri (SPF, DKIM, DMARC).</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {results.length > 0 ? (
                            results.map((r, i) => (
                                <div key={i} className={`p-4 rounded-2xl border transition-all ${r.isSecurity ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' : 'bg-white dark:bg-[#0b101b] border-slate-100 dark:border-white/5 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider truncate mr-4">{r.key}</span>
                                        <CopyButton text={r.value} />
                                    </div>
                                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all leading-relaxed mb-2">{r.value}</p>
                                    {r.description && (
                                        <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                            <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-[10px] italic text-slate-500 leading-snug">{r.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-4 py-20 bg-white dark:bg-[#0b101b] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem]">
                                <Mail size={48} className="opacity-20 translate-y-4" />
                                <p className="text-sm italic">Analiz için e-posta başlığını yapıştırıp butona basın.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Guide Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GuideCard
                    icon={<ShieldCheck className="text-emerald-500" />}
                    title="SPF Kontrolü"
                    desc="Gönderen sunucunun, o alan adı adına mail atmaya yetkili olup olmadığını doğrular."
                />
                <GuideCard
                    icon={<ShieldCheck className="text-blue-500" />}
                    title="DKIM İmzası"
                    desc="İçeriğin bütünlüğünü korur ve göndericinin kimliğini kriptografik olarak sağlar."
                />
                <GuideCard
                    icon={<ShieldCheck className="text-purple-500" />}
                    title="DMARC Politikası"
                    desc="Oltalama (phishing) saldırılarını engellemek için SPF ve DKIM sonuçlarını raporlar."
                />
            </div>
        </div>
    );
};

const GuideCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-6 bg-white dark:bg-[#0b101b] border border-slate-100 dark:border-white/5 rounded-[2rem] shadow-sm">
        <div className="p-2 w-fit bg-slate-50 dark:bg-white/5 rounded-xl mb-4">{icon}</div>
        <h4 className="text-sm font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-blue-500'}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
    );
};
