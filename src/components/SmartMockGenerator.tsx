'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, Copy, Check, Sparkles, RefreshCw, Database, FileJson, Play, Plus, Trash2 } from 'lucide-react';

// ─── Custom Faker Data ────────────────────────────────────────────────────────
const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Can', 'Aslı', 'Elif', 'Burak', 'Cem', 'Deniz', 'Ece', 'Fatih', 'Gizem', 'Hakan', 'Irmak', 'Kaan', 'Leyla', 'Murat', 'Nil', 'Oktay', 'Pelin', 'Selin'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özkan', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özcan', 'Güneş', 'Aksoy'];
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri'];
const DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'example.com', 'company.org', 'test.io'];
const JOB_TITLES = ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UX Designer', 'Data Scientist', 'HR Specialist', 'Sales Manager', 'Marketing Director'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomId = () => Math.random().toString(36).substr(2, 9);
const generateRandomEmail = (name: string, surname: string) => `${name.toLowerCase()}.${surname.toLowerCase()}@${getRandom(DOMAINS)}`;

type DataType = 'id' | 'name' | 'surname' | 'fullname' | 'email' | 'city' | 'job' | 'number' | 'boolean' | 'date';

interface SchemaField {
    key: string;
    type: DataType;
}

const DEFAULT_SCHEMA: SchemaField[] = [
    { key: 'id', type: 'id' },
    { key: 'first_name', type: 'name' },
    { key: 'last_name', type: 'surname' },
    { key: 'email', type: 'email' },
    { key: 'city', type: 'city' },
];

export function SmartMockGenerator({ onBack }: { onBack: () => void }) {
    const [count, setCount] = useState(10);
    const [schema, setSchema] = useState<SchemaField[]>(DEFAULT_SCHEMA);
    const [result, setResult] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateData = useCallback(() => {
        setIsGenerating(true);
        setTimeout(() => {
            const data = [];
            for (let i = 0; i < count; i++) {
                const item: any = {};
                const fname = getRandom(FIRST_NAMES);
                const lname = getRandom(LAST_NAMES);

                schema.forEach(field => {
                    switch (field.type) {
                        case 'id': item[field.key] = generateRandomId(); break;
                        case 'name': item[field.key] = fname; break;
                        case 'surname': item[field.key] = lname; break;
                        case 'fullname': item[field.key] = `${fname} ${lname}`; break;
                        case 'email': item[field.key] = generateRandomEmail(fname, lname); break;
                        case 'city': item[field.key] = getRandom(CITIES); break;
                        case 'job': item[field.key] = getRandom(JOB_TITLES); break;
                        case 'number': item[field.key] = Math.floor(Math.random() * 1000); break;
                        case 'boolean': item[field.key] = Math.random() > 0.5; break;
                        case 'date':
                            const date = new Date();
                            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
                            item[field.key] = date.toISOString().split('T')[0];
                            break;
                    }
                });
                data.push(item);
            }
            setResult(data);
            setIsGenerating(false);
        }, 300);
    }, [count, schema]);

    const addField = () => {
        setSchema([...schema, { key: `field_${schema.length + 1}`, type: 'name' }]);
    };

    const removeField = (index: number) => {
        setSchema(schema.filter((_, i) => i !== index));
    };

    const updateField = (index: number, updates: Partial<SchemaField>) => {
        setSchema(schema.map((f, i) => i === index ? { ...f, ...updates } : f));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mock_data.json';
        a.click();
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön"
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Database className="w-6 h-6 text-emerald-500" /> Smart Mock Generator
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Testleriniz için rastgele, gerçekçi JSON dataları üretin.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleCopy}
                        disabled={result.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-50">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Kopyalandı' : 'JSON Kopyala'}
                    </button>
                    <button
                        onClick={downloadJson}
                        disabled={result.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white/20 transition-all shadow-lg shadow-black/10 disabled:opacity-50 border border-white/5"
                    >
                        <Download size={16} /> JSON İNDİR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full pb-20">
                {/* Schema Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-6 h-fit sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Veri Yapısı (Schema)</label>
                            <button onClick={addField} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black hover:bg-emerald-500/20 transition-all">
                                <Plus size={14} /> ALAN EKLE
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {schema.map((field, idx) => (
                                <div key={idx} className="flex gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 group transition-all">
                                    <input
                                        type="text"
                                        value={field.key}
                                        title="Alan Anahtar Adı"
                                        onChange={(e) => updateField(idx, { key: e.target.value })}
                                        className="flex-1 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        placeholder="Anahtar Adı"
                                    />
                                    <select
                                        value={field.type}
                                        title="Veri Tipi Seçin"
                                        onChange={(e) => updateField(idx, { type: e.target.value as DataType })}
                                        className="flex-1 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                    >
                                        <option value="id">Rastgele ID</option>
                                        <option value="name">İsim</option>
                                        <option value="surname">Soyisim</option>
                                        <option value="fullname">Ad Soyad</option>
                                        <option value="email">E-posta</option>
                                        <option value="city">Şehir</option>
                                        <option value="job">Meslek</option>
                                        <option value="number">Sayı</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="date">Tarih</option>
                                    </select>
                                    <button onClick={() => removeField(idx)}
                                        title="Alanı Sil"
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                                <span className="text-slate-600 dark:text-slate-400 tracking-widest uppercase text-[10px]">Satır Sayısı</span>
                                <span className="text-emerald-500">{count}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                className="w-full accent-emerald-500 h-1.5 rounded-lg cursor-pointer appearance-none bg-slate-200 dark:bg-white/10"
                            />

                            <button
                                onClick={generateData}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" /> : <Play size={16} fill="white" />}
                                VERİLERİ ÜRET
                            </button>
                        </div>
                    </div>
                </div>

                {/* JSON Preview */}
                <div className="lg:col-span-3 h-full">
                    <div className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                <FileJson size={12} /> JSON Çıktısı
                            </span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg">
                                    <Sparkles size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Akıllı Üretim Aktif</span>
                                </div>
                            </div>
                        </div>

                        {result.length > 0 ? (
                            <div className="flex-1 bg-slate-50 dark:bg-[#06070a] rounded-[2rem] p-6 font-mono text-xs overflow-auto custom-scrollbar border border-slate-200 dark:border-white/5">
                                <pre className="text-emerald-600 dark:text-emerald-400 leading-relaxed group">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">
                                <Database size={40} className="mb-4 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Üretilecek veri yok</p>
                                <button onClick={generateData} className="mt-4 px-6 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">HEMEN ÜRET</button>
                            </div>
                        )}

                        {/* Decoration */}
                        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}

