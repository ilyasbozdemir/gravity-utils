'use client';

import React, { useState, useRef } from 'react';
import {
    ArrowLeft, FileText, Download, PlayCircle,
    Plus, Trash2, HelpCircle, Code, Save,
    RefreshCw, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { loadTurkishFont } from '../utils/fontLoader';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex?: number;
}

interface ExamGeneratorProps {
    onBack: () => void;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({ onBack }) => {
    const [title, setTitle] = useState('Yeni Sınav / Test');
    const [questions, setQuestions] = useState<Question[]>([
        { id: 'json-to-code', text: 'JSON → Type/Code', options: [], correctIndex: 0 },
        { id: 'sitemap-generator', text: 'Sitemap Oluşturucu', options: [], correctIndex: 0 },
        { id: 'robots-txt-builder', text: 'Robots.txt Hazırlayıcı', options: [], correctIndex: 0 },
        { id: 'xml-validator', text: 'XML / XSD Doğrulayıcı', options: [], correctIndex: 0 },
        { id: 'css-units', text: 'CSS Birim Çevirici', options: [], correctIndex: 0 },
    ]);
    const [jsonInput, setJsonInput] = useState('');
    const [showJsonInput, setShowJsonInput] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

    const MOCK_JSON = [
        {
            "question": "Türkiye'nin başkenti neresidir?",
            "options": ["İstanbul", "Ankara", "İzmir", "Bursa"],
            "answer": 1
        },
        {
            "question": "Aşağıdakilerden hangisi bir programlama dilidir?",
            "options": ["HTML", "CSS", "TypeScript", "JSON"],
            "answer": 2
        }
    ];

    const addQuestion = () => {
        const newQ: Question = {
            id: Date.now().toString(),
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0
        };
        setQuestions([...questions, newQ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const handleImportJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error('JSON bir liste (array) olmalı.');

            const imported: Question[] = parsed.map((item: any, idx: number) => ({
                id: (Date.now() + idx).toString(),
                text: item.question || item.text || '',
                options: item.options || [],
                correctIndex: typeof item.answer === 'number' ? item.answer :
                    (typeof item.answer === 'string' && item.answer.length === 1 ?
                        item.answer.toUpperCase().charCodeAt(0) - 65 : undefined)
            }));

            setQuestions(imported);
            setShowJsonInput(false);
            setJsonInput('');
            toast.success(`${imported.length} soru başarıyla içe aktarıldı.`);
        } catch (err: any) {
            toast.error('JSON Hatası: ' + err.message);
        }
    };

    const loadMockData = () => {
        setJsonInput(JSON.stringify(MOCK_JSON, null, 2));
    };

    const generatePdf = async () => {
        setIsGenerating(true);
        try {
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);

            const fontBytes = await loadTurkishFont();
            const font = await pdfDoc.embedFont(fontBytes);
            const boldFont = await pdfDoc.embedFont(fontBytes);

            let page = pdfDoc.addPage();
            let { width, height } = page.getSize();
            let y = height - 50;
            const margin = 50;

            // Header
            page.drawText(title, {
                x: margin,
                y,
                size: 18,
                font: boldFont,
                color: rgb(0, 0, 0)
            });
            y -= 40;

            questions.forEach((q, idx) => {
                if (y < 150) {
                    page = pdfDoc.addPage();
                    y = height - 50;
                }

                const qNum = `${idx + 1}. `;
                page.drawText(qNum + q.text, {
                    x: margin,
                    y,
                    size: 11,
                    font: boldFont
                });
                y -= 25;

                q.options.forEach((opt, oIdx) => {
                    const label = String.fromCharCode(65 + oIdx) + ') ';
                    page.drawText(label + opt, {
                        x: margin + 20,
                        y,
                        size: 10,
                        font: font
                    });
                    y -= 18;
                });

                y -= 15;
            });

            // Answer Key Page
            if (includeAnswerKey) {
                const answerPage = pdfDoc.addPage();
                let ay = height - 50;
                answerPage.drawText(`CEVAP ANAHTARI: ${title}`, {
                    x: margin,
                    y: ay,
                    size: 14,
                    font: boldFont
                });
                ay -= 40;

                questions.forEach((q, idx) => {
                    if (ay < 50) return; // Simplified for one page
                    const answerLabel = q.correctIndex !== undefined ? String.fromCharCode(65 + q.correctIndex) : '-';
                    answerPage.drawText(`${idx + 1}. SORU: ${answerLabel}`, {
                        x: margin,
                        y: ay,
                        size: 10,
                        font: font
                    });
                    ay -= 20;
                });
            }

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), `${title.replace(/\s+/g, '_')}.pdf`);
            toast.success("Sınav PDF'i hazır!");
        } catch (err: any) {
            console.error(err);
            toast.error('PDF oluşturma hatası: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Sınav Hazırlayıcı</h2>
                        <p className="text-slate-500 text-sm font-medium">JSON veya manuel girişle profesyonel test dökümanları oluşturun.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowJsonInput(!showJsonInput)}
                        className={`p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-xs ${showJsonInput ? 'bg-blue-600/10 text-blue-500 border border-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                    >
                        <Code size={16} /> {showJsonInput ? 'GİRİŞİ KAPAT' : 'JSON İÇE AKTAR'}
                    </button>
                    <button
                        onClick={generatePdf}
                        disabled={isGenerating || questions.length === 0}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                        PDF OLUŞTUR
                    </button>
                </div>
            </div>

            {showJsonInput && (
                <div className="mb-8 p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Code size={120} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                                <Code className="text-blue-500" size={20} /> JSON Verisi İçe Aktar
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hızlı ve toplu soru yükleme sistemi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadMockData}
                                className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                            >
                                Örnek Veri Yükle
                            </button>
                            <button onClick={() => setShowJsonInput(false)} title="Kapat" aria-label="JSON Girişini Kapat" className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><X size={20} /></button>
                        </div>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"question": "Soru?", "options": ["A", "B", "C", "D"], "answer": 0}]'
                        className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-blue-300 focus:border-blue-500 outline-none custom-scrollbar"
                    />
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] text-slate-500 font-medium italic max-w-[300px]">
                            * "answer" alanı 0-3 arası index veya A-D arası harf olabilir.
                        </p>
                        <button
                            onClick={handleImportJson}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                            SORULARI UYGULA
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Sınav / Test Başlığı</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-black bg-transparent border-b-2 border-slate-100 dark:border-white/10 focus:border-blue-500 outline-none w-full pb-2 text-slate-800 dark:text-white transition-all"
                            placeholder="Sınav başlığını girin..."
                        />
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cevap Anahtarı</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{includeAnswerKey ? 'Sona Eklenecek' : 'Eklenmeyecek'}</span>
                        </div>
                        <button
                            onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                            title="Cevap Anahtarını Aç/Kapat"
                            aria-label="Cevap Anahtarını Aç/Kapat"
                            className={`w-12 h-6 rounded-full transition-all relative ${includeAnswerKey ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeAnswerKey ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-blue-500/20">
                                        {idx + 1}
                                    </div>
                                    <textarea
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                        placeholder="Soru metnini buraya yazın..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-base font-bold resize-none min-h-[40px] text-slate-800 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => removeQuestion(q.id)}
                                    title="Soruyu Sil"
                                    aria-label="Soruyu Sil"
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-14">
                                {q.options.map((opt, oIdx) => (
                                    <div
                                        key={oIdx}
                                        onClick={() => updateQuestion(q.id, { correctIndex: oIdx })}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group/opt ${q.correctIndex === oIdx
                                            ? 'bg-emerald-500/5 border-emerald-500/50 text-emerald-600 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-all ${q.correctIndex === oIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'}`}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...q.options];
                                                newOpts[oIdx] = e.target.value;
                                                updateQuestion(q.id, { options: newOpts });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder={`Şık ${String.fromCharCode(65 + oIdx)}...`}
                                            className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold flex-1 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                                        />
                                        {q.correctIndex === oIdx && <CheckCircle2 size={16} className="text-emerald-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addQuestion}
                    className="w-full py-10 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-3 group"
                >
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-[0.2em]">Yeni Soru Ekle</span>
                </button>
            </div>
        </div>
    );
};
