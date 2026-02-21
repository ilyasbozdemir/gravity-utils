'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, FileCode, Terminal, Layers, Database, Globe, Code } from 'lucide-react';

export const SchemaGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [fields, setFields] = useState('name\nemail\nphone');
    const [outputs, setOutputs] = useState<Record<string, string>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const generate = (input: string) => {
        const fieldNames = input.split('\n')
            .map(f => f.trim())
            .filter(Boolean)
            .map(f => f.toLowerCase().replace(/[^a-z0-9]/g, '_'));

        // HTML Form
        const htmlForm = fieldNames.map(f => `<div>\n  <label for="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</label>\n  <input type="text" id="${f}" name="${f}">\n</div>`).join('\n');

        // Zod Schema
        const zodSchema = `import { z } from 'zod';\n\nconst schema = z.object({\n${fieldNames.map(f => `  ${f}: z.string().min(1, "${f} is required"),`).join('\n')}\n});`;

        // Yup Schema
        const yupSchema = `import * as yup from 'yup';\n\nconst schema = yup.object().shape({\n${fieldNames.map(f => `  ${f}: yup.string().required(),`).join('\n')}\n});`;

        // React Hook Form
        const rhf = `const { register, handleSubmit } = useForm();\n\n<form onSubmit={handleSubmit(onSubmit)}>\n${fieldNames.map(f => `  <input {...register("${f}")} placeholder="${f}" />`).join('\n')}\n</form>`;

        // Prisma Model (Pseudo)
        const prisma = `model User {\n  id    Int     @id @default(autoincrement())\n${fieldNames.map(f => `  ${f}  String`).join('\n')}\n}`;

        setOutputs({
            'Zod Schema': zodSchema,
            'React Hook Form': rhf,
            'HTML Form': htmlForm,
            'Yup Schema': yupSchema,
            'Prisma Model': prisma
        });
    };

    useEffect(() => {
        generate(fields);
    }, [fields]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} title="Geri Dön" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Şema & Form Oluşturucu</h1>
                    <p className="text-slate-500 text-sm font-medium">Tek girişten form kodlarını ve doğrulama şemalarını üretin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm h-full">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Alan İsimleri (Satır satır)</label>
                        <textarea
                            value={fields}
                            onChange={(e) => setFields(e.target.value)}
                            placeholder="name&#10;email&#10;phone"
                            className="w-full h-[300px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-mono text-sm text-slate-800 dark:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                        />
                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                            <Layers size={20} className="text-blue-600 shrink-0 mt-1" />
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">DRY (Don't Repeat Yourself) prensibi: Aynı alan adlarını 5 farklı yerde yazmak yerine buradan kopyalayın.</p>
                        </div>
                    </div>
                </div>

                {/* Outputs Area */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(outputs).map(([key, val]) => (
                        <div key={key} className={`bg-white dark:bg-[#0b101b] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden flex flex-col ${key === 'Zod Schema' ? 'md:col-span-2' : ''}`}>
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                                <button
                                    onClick={() => handleCopy(val, key)}
                                    className={`p-2 rounded-lg transition-all ${copiedKey === key ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-blue-500'}`}
                                >
                                    {copiedKey === key ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre">
                                    {val}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini Guide / FAQ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pb-10">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Terminal size={20} className="text-blue-600 dark:text-blue-500" /> Sıkça Sorulan Sorular
                    </h3>
                    <div className="space-y-4 text-left">
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                Neden Zod şeması kullanmalıyım?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Zod, TypeScript ile %100 uyumlu bir şema deklarasyon ve doğrulama kütüphanesidir. Sadece veriyi doğrulamakla kalmaz, aynı zamanda tip güvenliği (type safety) sağlar, böylece "runtime" hatalarını minimize edersiniz.
                            </p>
                        </details>
                        <details className="group border-b border-slate-200 dark:border-white/5 pb-4">
                            <summary className="list-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex justify-between items-center group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                "DRY" prensibi nedir?
                                <span className="group-open:rotate-180 transition-transform text-slate-400 dark:text-slate-500">↓</span>
                            </summary>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                "Don't Repeat Yourself" (Kendini Tekrar Etme) prensibi, aynı bilginin veya mantığın kod tabanında birden fazla yerde bulunmaması gerektiğini savunur. Bu araç, şema ve form tanımlarınızı tek bir yerden türeterek bu prensibi uygulamanıza yardımcı olur.
                            </p>
                        </details>
                    </div>
                </div>

                <div className="p-8 bg-emerald-600 dark:bg-emerald-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Code size={20} />
                    </div>
                    <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                        <Code size={20} /> Form İpucu
                    </h3>
                    <p className="text-emerald-50 text-sm leading-relaxed relative z-10">
                        React Hook Form ile Zod resolver'ı birlikte kullanarak hem form yönetimini basitleştirebilir hem de karmaşık doğrulama kurallarını tek bir yerden yönetebilirsiniz.
                    </p>
                    <div className="pt-4 border-t border-white/10 italic text-[11px] text-emerald-100 relative z-10">
                        * Doğru yapılandırılmış şemalar, frontend ve backend arasındaki sözleşmedir (contract).
                    </div>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <Database className="text-amber-500 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Veritabanı Uyumu</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Alan adlarını her zaman küçük harf ve alt çizgi (snake_case) kullanarak veritabanı standartlarına uygun tutun.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <Globe className="text-blue-500 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Frontend Kolaylığı</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Zod ve Hook Form uyumu sayesinde form verilerini tek tipleştirebilir ve runtime hatalarından kurtulabilirsiniz.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <FileCode className="text-emerald-500 mb-4" />
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Tip Güvenliği</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Oluşturulan şemaları TypeScript ile kullanarak tüm katmanlarda tip güvenliğini garantileyin.</p>
                </div>
            </div>
        </div>
    );
};
