'use client';

import React, { useState, useRef } from 'react';
import {
    ArrowLeft, FileText, Download, PlayCircle,
    Plus, Trash2, HelpCircle, Code, Save,
    RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
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
        { id: '1', text: 'Örnek soru buraya gelecek?', options: ['Şık A', 'Şık B', 'Şık C', 'Şık D'], correctIndex: 0 }
    ]);
    const [jsonInput, setJsonInput] = useState('');
    const [showJsonInput, setShowJsonInput] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

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
        } catch (err: any) {
            alert('JSON Hatası: ' + err.message);
        }
    };

    const generatePdf = async () => {
        setIsGenerating(true);
        try {
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);

            const fontBytes = await loadTurkishFont();
            const font = await pdfDoc.embedFont(fontBytes);
            const boldFont = await pdfDoc.embedFont(fontBytes); // Normally we'd use a bold font file if available

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
                // Check if we need a new page
                if (y < 150) {
                    page = pdfDoc.addPage();
                    y = height - 50;
                }

                // Question Text
                const qNum = `${idx + 1}. `;
                page.drawText(qNum + q.text, {
                    x: margin,
                    y,
                    size: 11,
                    font: boldFont
                });
                y -= 25;

                // Options
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

                y -= 15; // Space between questions
            });

            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), `${title.replace(/\s+/g, '_')}.pdf`);
        } catch (err: any) {
            console.error(err);
            alert('PDF oluşturma hatası: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Sınav Hazırlayıcı</h2>
                        <p className="text-slate-500 text-sm">JSON veya manuel girişle profesyonel test dökümanları oluşturun.</p>
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
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-bold text-xs shadow-lg shadow-blue-500/20"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                        PDF OLUŞTUR
                    </button>
                </div>
            </div>

            {showJsonInput && (
                <div className="mb-8 p-6 bg-slate-900 rounded-[2rem] border border-white/5 space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Code className="text-blue-500" size={18} /> JSON Verisi Girin
                        </h3>
                        <button onClick={() => setShowJsonInput(false)} title="Kapat" aria-label="JSON Girişini Kapat" className="text-slate-500 hover:text-white"><Trash2 size={16} /></button>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"question": "Soru?", "options": ["A", "B", "C", "D"], "answer": 0}]'
                        className="w-full h-40 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-mono text-blue-300 focus:border-blue-500 outline-none"
                    />
                    <button
                        onClick={handleImportJson}
                        className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-xs hover:bg-blue-600/30 transition-all"
                    >
                        VERİLERİ UYGULA
                    </button>
                    <p className="text-[10px] text-slate-500 italic">Not: "answer" alanı opsiyoneldir (0-3 arası index veya A-D arası harf olabilir).</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sınav / Test Başlığı</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold bg-transparent border-b-2 border-slate-100 dark:border-white/5 focus:border-blue-500 outline-none w-full pb-2 text-slate-800 dark:text-white"
                        placeholder="Sınav başlığını girin..."
                    />
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="group p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500">{idx + 1}</span>
                                    <textarea
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                        placeholder="Soru metnini buraya yazın..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold resize-none min-h-[40px] text-slate-800 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => removeQuestion(q.id)}
                                    title="Soruyu Sil"
                                    aria-label="Soruyu Sil"
                                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                                        <span className="text-[10px] font-black text-slate-400">{String.fromCharCode(65 + oIdx)}</span>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...q.options];
                                                newOpts[oIdx] = e.target.value;
                                                updateQuestion(q.id, { options: newOpts });
                                            }}
                                            placeholder={`Şık ${String.fromCharCode(65 + oIdx)}...`}
                                            className="bg-transparent border-none focus:ring-0 outline-none text-xs flex-1 text-slate-700 dark:text-slate-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addQuestion}
                    className="w-full py-6 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-2"
                >
                    <Plus size={24} />
                    <span className="font-black text-xs uppercase tracking-widest">Yeni Soru Ekle</span>
                </button>
            </div>
        </div>
    );
};
