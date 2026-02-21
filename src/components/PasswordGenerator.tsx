'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check, Eye, EyeOff, Shield, AlertTriangle, Lock, ShieldCheck, Info } from 'lucide-react';

const CHAR_SETS = {
    upper: { label: 'A–Z', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    lower: { label: 'a–z', chars: 'abcdefghijklmnopqrstuvwxyz' },
    digits: { label: '0–9', chars: '0123456789' },
    symbols: { label: '!@#…', chars: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
    similar: { label: 'Benzer hariç (il1O0)', chars: '', exclude: /[il1O0oI]/g },
};

function generate(length: number, opts: Record<string, boolean>, excludeSimilar: boolean): string {
    let pool = '';
    if (opts.upper) pool += CHAR_SETS.upper.chars;
    if (opts.lower) pool += CHAR_SETS.lower.chars;
    if (opts.digits) pool += CHAR_SETS.digits.chars;
    if (opts.symbols) pool += CHAR_SETS.symbols.chars;
    if (excludeSimilar) pool = pool.replace(/[il1O0oI]/g, '');
    if (!pool) return '';
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    let result = '';
    let guaranteed = '';
    if (opts.upper) guaranteed += CHAR_SETS.upper.chars[arr[0] % CHAR_SETS.upper.chars.length];
    if (opts.lower) guaranteed += CHAR_SETS.lower.chars[arr[1] % CHAR_SETS.lower.chars.length];
    if (opts.digits) guaranteed += CHAR_SETS.digits.chars[arr[2] % CHAR_SETS.digits.chars.length];
    if (opts.symbols) guaranteed += CHAR_SETS.symbols.chars[arr[3] % CHAR_SETS.symbols.chars.length];
    for (let i = 0; i < length - guaranteed.length; i++) {
        result += pool[arr[i] % pool.length];
    }
    const combined = (guaranteed + result).split('');
    for (let i = combined.length - 1; i > 0; i--) {
        const j = arr[i % arr.length] % (i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined.join('');
}

function entropyBits(length: number, poolSize: number): number {
    return length * Math.log2(poolSize);
}

function strengthLabel(entropy: number): { label: string; color: string; pct: number } {
    if (entropy < 28) return { label: 'Çok Zayıf', color: 'bg-red-500', pct: 10 };
    if (entropy < 36) return { label: 'Zayıf', color: 'bg-orange-500', pct: 30 };
    if (entropy < 60) return { label: 'Orta', color: 'bg-yellow-500', pct: 55 };
    if (entropy < 80) return { label: 'Güçlü', color: 'bg-blue-500', pct: 78 };
    if (entropy < 100) return { label: 'Çok Güçlü', color: 'bg-green-500', pct: 92 };
    return { label: 'Aşırı Güçlü', color: 'bg-emerald-500', pct: 100 };
}

function analyzePassword(pwd: string) {
    const has = {
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        digit: /\d/.test(pwd),
        symbol: /[^A-Za-z0-9]/.test(pwd),
    };
    let pool = 0;
    if (has.upper) pool += 26;
    if (has.lower) pool += 26;
    if (has.digit) pool += 10;
    if (has.symbol) pool += 32;
    const entropy = pool > 0 ? entropyBits(pwd.length, pool) : 0;
    return { has, entropy, strength: strengthLabel(entropy) };
}

export function PasswordGenerator() {
    const handleBack = () => { window.location.hash = ''; };
    const [length, setLength] = useState(20);
    const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true });
    const [excludeSimilar, setExcludeSimilar] = useState(false);
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(true);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [analyzeInput, setAnalyzeInput] = useState('');

    const strengthBarRef = useRef<HTMLDivElement>(null);
    const analysisBarRef = useRef<HTMLDivElement>(null);



    const gen = useCallback(() => {
        const pwd = generate(length, opts, excludeSimilar);
        setPassword(pwd);
        setHistory(h => [pwd, ...h.slice(0, 9)]);
    }, [length, opts, excludeSimilar]);

    const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };

    const toggleOpt = (key: keyof typeof opts) => setOpts(p => ({ ...p, [key]: !p[key] }));

    const pool = (() => {
        let n = 0;
        if (opts.upper) n += 26; if (opts.lower) n += 26;
        if (opts.digits) n += 10; if (opts.symbols) n += 32;
        if (excludeSimilar) n = Math.max(0, n - 6);
        return n;
    })();
    const entropy = pool > 0 ? entropyBits(length, pool) : 0;
    const strength = strengthLabel(entropy);
    const analysis = analyzeInput ? analyzePassword(analyzeInput) : null;

    useEffect(() => {
        if (strengthBarRef.current) {
            strengthBarRef.current.style.width = `${strength.pct}%`;
        }
    }, [strength.pct]);

    useEffect(() => {
        if (analysisBarRef.current && analysis) {
            analysisBarRef.current.style.width = `${analysis.strength.pct}%`;
        }
    }, [analysis]);

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-500" /> Şifre Üretici
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kriptografik olarak güvenli · entropi analizi</p>
                </div>
            </div>

            {/* Main card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 mb-6">
                {/* Password display */}
                <div>
                    <div className="relative">
                        <div className={`w-full min-h-[3.5rem] px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 ${password ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700'} rounded-xl font-mono text-base text-slate-800 dark:text-slate-200 break-all leading-relaxed transition-all`}>
                            {password ? (show ? password : '•'.repeat(password.length)) : <span className="text-slate-300 dark:text-slate-600 italic">Üret butonuna basın...</span>}
                        </div>
                        {password && (
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => setShow(s => !s)} title={show ? 'Gizle' : 'Göster'} aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-700 rounded-lg">
                                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button onClick={() => copy(password)} title="Kopyala" aria-label="Şifreyi kopyala"
                                    className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors bg-white dark:bg-slate-700 rounded-lg">
                                    {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Strength bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Güç: <strong className="text-slate-700 dark:text-slate-300">{strength.label}</strong></span>
                            <span className="text-slate-400">{entropy.toFixed(0)} bit entropi</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div ref={strengthBarRef} className={`h-full rounded-full transition-all duration-500 ${strength.color}`} />
                        </div>
                    </div>
                </div>

                {/* Length */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Uzunluk</label>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{length}</span>
                    </div>
                    <input type="range" min={4} max={128} value={length} onChange={e => setLength(parseInt(e.target.value))}
                        title={`Uzunluk: ${length}`} aria-label="Şifre uzunluğu"
                        className="w-full accent-emerald-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        {[8, 16, 24, 32, 48, 64, 128].map(v => (
                            <button key={v} onClick={() => setLength(v)}
                                title={`Uzunluk: ${v}`} aria-label={`Uzunluğu ${v} yap`}
                                className={`hover:text-emerald-600 transition-colors ${length === v ? 'text-emerald-600 font-bold' : ''}`}>{v}</button>
                        ))}
                    </div>
                </div>

                {/* Character sets */}
                <div>
                    <p className="text-xs font-bold uppercase text-slate-500 mb-3">Karakter Seti</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.entries(CHAR_SETS).filter(([k]) => k !== 'similar')).map(([key, cfg]) => (
                            <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${opts[key as keyof typeof opts] ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <input type="checkbox" checked={opts[key as keyof typeof opts]} onChange={() => toggleOpt(key as keyof typeof opts)}
                                    aria-label={`${cfg.label} dahil et`}
                                    className="w-4 h-4 rounded accent-emerald-500" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{cfg.label}</p>
                                    <p className="text-[10px] font-mono text-slate-400">{cfg.chars.slice(0, 12)}…</p>
                                </div>
                            </label>
                        ))}
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all col-span-2 ${excludeSimilar ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <input type="checkbox" checked={excludeSimilar} onChange={() => setExcludeSimilar(s => !s)}
                                aria-label="Benzer karakterleri hariç tut"
                                className="w-4 h-4 rounded accent-amber-500" />
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Benzer karakterleri hariç tut</p>
                                <p className="text-[10px] text-slate-400">i, l, 1, O, 0 — görsel karışıklığı önler</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Generate button */}
                <button onClick={gen} disabled={pool === 0}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> Güvenli Şifre Üret
                </button>
            </div>

            {/* Strength analyzer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1">
                    <AlertTriangle size={12} /> Şifre Analiz Et
                </p>
                <input value={analyzeInput} onChange={e => setAnalyzeInput(e.target.value)}
                    type="text" placeholder="Mevcut şifrenizi analiz edin..."
                    aria-label="Analiz edilecek şifre"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-200 mb-3" />
                {analysis && (
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Güç: <strong className="text-slate-700 dark:text-slate-300">{analysis.strength.label}</strong></span>
                            <span className="text-slate-400">{analysis.entropy.toFixed(0)} bit</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div ref={analysisBarRef} className={`h-full rounded-full transition-all ${analysis.strength.color}`} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ['Büyük harf', analysis.has.upper],
                                ['Küçük harf', analysis.has.lower],
                                ['Rakam', analysis.has.digit],
                                ['Sembol', analysis.has.symbol],
                            ].map(([label, ok]) => (
                                <div key={label as string} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${ok ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                    <span>{ok ? '✓' : '✗'}</span>
                                    <span className={ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{label as string}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-500 mb-3">Geçmiş ({history.length})</p>
                    <div className="space-y-2">
                        {history.map((pwd, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{pwd}</code>
                                <button onClick={() => copy(pwd)} title="Kopyala" aria-label="Bu şifreyi kopyala"
                                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors shrink-0">
                                    <Copy size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contextual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10 border-t border-slate-100 dark:border-white/5 pt-10">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none text-left">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Lock size={20} className="text-emerald-600 dark:text-emerald-400" /> Güvenlik Rehberi
                    </h3>
                    <div className="space-y-4">
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-emerald-600 dark:group-open:text-emerald-400 transition-colors">
                                "Entropi" nedir?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Entropi, bir şifrenin ne kadar rastgele ve tahmin edilemez olduğunun ölçüsüdür. Bit cinsinden ölçülür. 80-100 bit arası şifreler günümüz donanımıyla kırılması neredeyse imkansız (brute-force'a dayanıklı) kabul edilir.
                            </p>
                        </details>
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-emerald-600 dark:group-open:text-emerald-400 transition-colors">
                                Şifreler kaydediliyor mu?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Asla. Tüm şifreler tarayıcınızın belleğinde (RAM) üretilir. Sayfayı yenilediğinizde veya kapattığınızda üretilen tüm şifreler ve geçmiş kalıcı olarak silinir.
                            </p>
                        </details>
                    </div>
                </div>

                <div className="p-8 bg-emerald-600 dark:bg-emerald-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                        <AlertTriangle size={20} /> Önemli Tavsiye
                    </h3>
                    <p className="text-emerald-50 text-sm leading-relaxed relative z-10">
                        En güvenli şifre bile, birden fazla sitede kullanılıyorsa zayıftır. Her servis için farklı ve güçlü bir şifre üretin ve bu şifreleri yönetmek için güvenilir bir <b>Password Manager</b> (Bitwarden, 1Password vb.) kullanın.
                    </p>
                    <div className="pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-white/20 rounded-lg"><Lock size={16} /></div>
                        <p className="text-[11px] font-bold">İşlem tarayıcıda, cihazınızın içinde gerçekleşir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
