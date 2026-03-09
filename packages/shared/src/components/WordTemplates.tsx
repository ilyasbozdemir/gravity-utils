'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    FileText, Plus, Trash2, Edit3, Play, X, ChevronRight,
    Save, Copy, Download, Search, Tag, AlignLeft, Heading1,
    List, Minus, Bold, Italic, Star, Clock, FileCheck,
    ArrowLeft, Sparkles, BookTemplate, FolderOpen, Check,
    AlertCircle, GripVertical, ArrowUp, ArrowDown, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { saveAndRecord } from '../utils/download-store';

// ─── Types ────────────────────────────────────────────────────────────────────
export type BlockType = 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'divider' | 'signature';

export interface TemplateBlock {
    id: string;
    type: BlockType;
    content: string;    // raw text with {{placeholder}} markers
    bold?: boolean;
    italic?: boolean;
}

export interface WordTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    blocks: TemplateBlock[];
    createdAt: number;
    updatedAt: number;
    useCount: number;
}

// ─── Defaults / Storage ───────────────────────────────────────────────────────
const STORAGE_KEY = 'gravity_word_templates_v1';

const BUILTIN_TEMPLATES: WordTemplate[] = [
    {
        id: 'builtin_dilekce',
        name: 'Dilekçe Şablonu',
        description: 'Resmi kuruma hitap eden standart dilekçe',
        category: 'Resmi',
        icon: '📋',
        createdAt: 0,
        updatedAt: 0,
        useCount: 0,
        blocks: [
            { id: 'b1', type: 'heading1', content: '{{kurum_adi}} BAŞKANLIĞINA', bold: true },
            { id: 'b2', type: 'paragraph', content: '' },
            { id: 'b3', type: 'paragraph', content: 'Konu: {{konu}}' },
            { id: 'b4', type: 'paragraph', content: '' },
            { id: 'b5', type: 'paragraph', content: '{{aciklama}}' },
            { id: 'b6', type: 'paragraph', content: '' },
            { id: 'b7', type: 'paragraph', content: 'Gereğini saygılarımla arz ederim.' },
            { id: 'b8', type: 'paragraph', content: '' },
            { id: 'b9', type: 'signature', content: '{{tarih}}\n{{ad_soyad}}\n{{tc_kimlik}}\n{{adres}}\n{{telefon}}' },
        ]
    },
    {
        id: 'builtin_sozlesme',
        name: 'Hizmet Sözleşmesi',
        description: 'Freelance / hizmet sözleşmesi taslağı',
        category: 'Hukuki',
        icon: '⚖️',
        createdAt: 0,
        updatedAt: 0,
        useCount: 0,
        blocks: [
            { id: 's1', type: 'heading1', content: 'HİZMET SÖZLEŞMESİ', bold: true },
            { id: 's2', type: 'divider', content: '' },
            { id: 's3', type: 'heading2', content: 'TARAFLAR' },
            { id: 's4', type: 'paragraph', content: 'Hizmet Veren: {{hizmet_veren_ad}} (TC: {{hizmet_veren_tc}})' },
            { id: 's5', type: 'paragraph', content: 'Hizmet Alan: {{hizmet_alan_ad}}' },
            { id: 's6', type: 'heading2', content: 'KONU' },
            { id: 's7', type: 'paragraph', content: '{{hizmet_konusu}}' },
            { id: 's8', type: 'heading2', content: 'ÜCRET VE ÖDEME' },
            { id: 's9', type: 'paragraph', content: 'Toplam ücret: {{ucret}} TL' },
            { id: 's10', type: 'paragraph', content: 'Ödeme tarihi: {{odeme_tarihi}}' },
            { id: 's11', type: 'heading2', content: 'SÜRE' },
            { id: 's12', type: 'paragraph', content: 'Başlangıç: {{baslangic_tarihi}} — Bitiş: {{bitis_tarihi}}' },
            { id: 's13', type: 'divider', content: '' },
            { id: 's14', type: 'signature', content: 'Tarih: {{imza_tarihi}}\n\nHizmet Veren\n{{hizmet_veren_ad}}\n\nHizmet Alan\n{{hizmet_alan_ad}}' },
        ]
    },
    {
        id: 'builtin_rapor',
        name: 'Faaliyet Raporu',
        description: 'Aylık / haftalık faaliyet raporu',
        category: 'İş',
        icon: '📊',
        createdAt: 0,
        updatedAt: 0,
        useCount: 0,
        blocks: [
            { id: 'r1', type: 'heading1', content: '{{donem}} DÖNEMİ FAALİYET RAPORU', bold: true },
            { id: 'r2', type: 'paragraph', content: 'Hazırlayan: {{hazirlayan}} | Tarih: {{tarih}}' },
            { id: 'r3', type: 'divider', content: '' },
            { id: 'r4', type: 'heading2', content: 'ÖZET' },
            { id: 'r5', type: 'paragraph', content: '{{ozet}}' },
            { id: 'r6', type: 'heading2', content: 'YAPILAN ÇALIŞMALAR' },
            { id: 'r7', type: 'bullet', content: '{{calisma_1}}' },
            { id: 'r8', type: 'bullet', content: '{{calisma_2}}' },
            { id: 'r9', type: 'bullet', content: '{{calisma_3}}' },
            { id: 'r10', type: 'heading2', content: 'SONUÇ VE ÖNERİLER' },
            { id: 'r11', type: 'paragraph', content: '{{sonuc}}' },
        ]
    },
];

function loadTemplates(): WordTemplate[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveTemplates(templates: WordTemplate[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)); } catch { }
}

// ─── Placeholder extractor ────────────────────────────────────────────────────
function extractPlaceholders(blocks: TemplateBlock[]): string[] {
    const set = new Set<string>();
    const regex = /\{\{([^}]+)\}\}/g;
    for (const b of blocks) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(b.content)) !== null) {
            set.add(m[1].trim());
        }
    }
    return Array.from(set);
}

function fillContent(content: string, values: Record<string, string>): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (_, key) => values[key.trim()] ?? `[${key.trim()}]`);
}

// ─── Block type config ────────────────────────────────────────────────────────
const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; hint: string }[] = [
    { type: 'heading1', label: 'Büyük Başlık', icon: <Heading1 size={14} />, hint: 'H1 - Ana başlık' },
    { type: 'heading2', label: 'Orta Başlık', icon: <Hash size={14} />, hint: 'H2 - Alt başlık' },
    { type: 'heading3', label: 'Küçük Başlık', icon: <Hash size={12} />, hint: 'H3 - Bölüm başlığı' },
    { type: 'paragraph', label: 'Paragraf', icon: <AlignLeft size={14} />, hint: 'Normal metin' },
    { type: 'bullet', label: 'Madde', icon: <List size={14} />, hint: '• Madde işaretli' },
    { type: 'divider', label: 'Ayraç', icon: <Minus size={14} />, hint: '─────────────' },
    { type: 'signature', label: 'İmza Alanı', icon: <FileCheck size={14} />, hint: 'İmza / kapanış' },
];

function blockTypeStyle(type: BlockType): string {
    switch (type) {
        case 'heading1': return 'text-xl font-black text-slate-900 dark:text-white';
        case 'heading2': return 'text-base font-bold text-slate-800 dark:text-slate-100';
        case 'heading3': return 'text-sm font-semibold text-slate-700 dark:text-slate-200';
        case 'bullet': return 'text-sm text-slate-600 dark:text-slate-300 pl-4';
        case 'divider': return 'text-slate-300 dark:text-slate-700 text-center tracking-widest text-xs';
        case 'signature': return 'text-sm text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-700 pl-3';
        default: return 'text-sm text-slate-600 dark:text-slate-300';
    }
}

// ─── Unique id helper ─────────────────────────────────────────────────────────
function uid() { return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

// ─── DOCX generator ─────────────────────────────────────────────────────────
async function generateDocx(template: WordTemplate, values: Record<string, string>): Promise<Blob> {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, WidthType } = await import('docx');

    const children: any[] = [];

    for (const block of template.blocks) {
        const filled = fillContent(block.content, values);

        if (block.type === 'divider') {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: '─'.repeat(60), color: 'AAAAAA', size: 18 })],
                    spacing: { before: 200, after: 200 },
                })
            );
            continue;
        }

        if (block.type === 'signature') {
            const lines = filled.split('\n');
            for (const line of lines) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: line, italics: true, color: '666666', size: 20 })],
                    spacing: { before: 60, after: 60 },
                    indent: { left: 360 },
                }));
            }
            continue;
        }

        // Split line-by-line for multi-line blocks
        const lines = filled.split('\n');
        for (const line of lines) {
            const runs: any[] = [];
            // Parse **bold** inline markers within a line
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            for (const part of parts) {
                const isBold = part.startsWith('**') && part.endsWith('**');
                runs.push(new TextRun({
                    text: isBold ? part.slice(2, -2) : part,
                    bold: isBold || block.bold,
                    italics: block.italic,
                    size: block.type === 'heading1' ? 36 :
                        block.type === 'heading2' ? 28 :
                            block.type === 'heading3' ? 24 : 22,
                    color: block.type === 'heading1' ? '1A202C' :
                        block.type === 'heading2' ? '2D3748' :
                            block.type === 'heading3' ? '4A5568' : '374151',
                }));
            }

            children.push(new Paragraph({
                children: runs,
                bullet: block.type === 'bullet' ? { level: 0 } : undefined,
                spacing: {
                    before: block.type === 'heading1' ? 400 :
                        block.type === 'heading2' ? 300 :
                            block.type === 'heading3' ? 200 : 120,
                    after: block.type === 'heading1' ? 200 :
                        block.type === 'heading2' ? 160 : 80,
                },
            }));
        }
    }

    const doc = new Document({
        sections: [{ children }],
        creator: 'Gravity Utils - Word Şablon Motoru',
        title: template.name,
    });

    return Packer.toBlob(doc);
}

// ─── VIEW: Template List ──────────────────────────────────────────────────────
type View = 'list' | 'editor' | 'fill';

interface TemplateListProps {
    templates: WordTemplate[];
    builtins: WordTemplate[];
    onEdit: (t: WordTemplate) => void;
    onUse: (t: WordTemplate) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
}

function TemplateList({ templates, builtins, onEdit, onUse, onDelete, onNew }: TemplateListProps) {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');

    const all = [...builtins, ...templates];
    const filtered = all.filter(t =>
        (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())) &&
        (!catFilter || t.category === catFilter)
    );
    const categories = Array.from(new Set(all.map(t => t.category)));

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Şablon ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                </div>
                <button
                    onClick={onNew}
                    id="new-template-btn"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 shrink-0"
                >
                    <Plus size={14} /> Yeni Şablon
                </button>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 px-6 pb-4 shrink-0 overflow-x-auto">
                <button
                    onClick={() => setCatFilter('')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${!catFilter ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >Tümü</button>
                {categories.map(c => (
                    <button key={c} onClick={() => setCatFilter(c === catFilter ? '' : c)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${catFilter === c ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >{c}</button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText size={28} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Şablon bulunamadı</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(t => {
                            const isBuiltin = t.id.startsWith('builtin_');
                            const ph = extractPlaceholders(t.blocks);
                            return (
                                <div key={t.id} className="group bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all hover:scale-[1.01] flex flex-col gap-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shrink-0">
                                                {t.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{t.name}</h3>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{t.description}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-widest shrink-0">{t.category}</span>
                                    </div>

                                    {/* Placeholders preview */}
                                    {ph.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {ph.slice(0, 5).map(p => (
                                                <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20">
                                                    {'{{'}{p}{'}}'}
                                                </span>
                                            ))}
                                            {ph.length > 5 && <span className="text-[9px] text-slate-400 px-1">+{ph.length - 5}</span>}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                        <span>{t.blocks.length} blok</span>
                                        <span>·</span>
                                        <span>{ph.length} yer tutucu</span>
                                        {t.useCount > 0 && <><span>·</span><span>{t.useCount}× kullanıldı</span></>}
                                        {isBuiltin && <span className="ml-auto text-amber-500 font-bold flex items-center gap-1"><Star size={9} fill="currentColor" /> Hazır</span>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            onClick={() => onUse(t)}
                                            id={`use-template-${t.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-sm shadow-blue-500/20"
                                        >
                                            <Play size={10} className="fill-white" /> Kullan
                                        </button>
                                        {!isBuiltin && (
                                            <button onClick={() => onEdit(t)} title="Düzenle"
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all">
                                                <Edit3 size={14} />
                                            </button>
                                        )}
                                        {!isBuiltin && (
                                            <button onClick={() => onDelete(t.id)} title="Sil"
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── VIEW: Template Editor ────────────────────────────────────────────────────
interface TemplateEditorProps {
    template: WordTemplate | null;
    onSave: (t: WordTemplate) => void;
    onBack: () => void;
}

function TemplateEditor({ template, onSave, onBack }: TemplateEditorProps) {
    const isNew = !template;
    const [name, setName] = useState(template?.name ?? '');
    const [description, setDescription] = useState(template?.description ?? '');
    const [category, setCategory] = useState(template?.category ?? 'Genel');
    const [icon, setIcon] = useState(template?.icon ?? '📄');
    const [blocks, setBlocks] = useState<TemplateBlock[]>(template?.blocks ?? [
        { id: uid(), type: 'heading1', content: '', bold: true },
        { id: uid(), type: 'paragraph', content: '' },
    ]);
    const [dragId, setDragId] = useState<string | null>(null);
    const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

    const ph = extractPlaceholders(blocks);

    const updateBlock = (id: string, patch: Partial<TemplateBlock>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    };
    const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
    const addBlock = (afterId: string, type: BlockType = 'paragraph') => {
        const idx = blocks.findIndex(b => b.id === afterId);
        const nb: TemplateBlock = { id: uid(), type, content: '' };
        const next = [...blocks];
        next.splice(idx + 1, 0, nb);
        setBlocks(next);
        setShowBlockMenu(null);
    };
    const moveBlock = (id: string, dir: 'up' | 'down') => {
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id);
            if (dir === 'up' && idx === 0) return prev;
            if (dir === 'down' && idx === prev.length - 1) return prev;
            const next = [...prev];
            const tgt = dir === 'up' ? idx - 1 : idx + 1;
            [next[idx], next[tgt]] = [next[tgt], next[idx]];
            return next;
        });
    };

    const handleSave = () => {
        if (!name.trim()) { toast.error('Şablon adı gereklidir.'); return; }
        const now = Date.now();
        const saved: WordTemplate = {
            id: template?.id ?? `tpl_${now}`,
            name: name.trim(),
            description: description.trim(),
            category: category.trim() || 'Genel',
            icon,
            blocks,
            createdAt: template?.createdAt ?? now,
            updatedAt: now,
            useCount: template?.useCount ?? 0,
        };
        onSave(saved);
    };

    const ICONS = ['📄', '📋', '⚖️', '📊', '💼', '✉️', '🏢', '📝', '🎓', '🔖', '💡', '📌'];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/5 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95">
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <div className="flex-1">
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                        {isNew ? '+ Yeni Şablon Oluştur' : `${template.name} — Düzenle`}
                    </h2>
                    <p className="text-[10px] text-slate-400">Blokları düzenle, yer tutucuları {'{{}}'} ile belirt</p>
                </div>
                <button onClick={handleSave} id="save-template-btn"
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    <Save size={14} /> Kaydet
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Meta */}
                <div className="w-64 border-r border-slate-200 dark:border-white/5 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto">
                    {/* Icon picker */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">İkon</label>
                        <div className="grid grid-cols-6 gap-1">
                            {ICONS.map(ic => (
                                <button key={ic} onClick={() => setIcon(ic)}
                                    className={`w-8 h-8 rounded-lg text-base transition-all hover:scale-110 ${icon === ic ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    {ic}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Şablon Adı</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Ör: Kira Sözleşmesi"
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Açıklama</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Kısa açıklama"
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Kategori</label>
                        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ör: Resmi, İş, Hukuki"
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                    </div>

                    {/* Placeholders detected */}
                    {ph.length > 0 && (
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Algılanan Yer Tutucular</label>
                            <div className="flex flex-wrap gap-1">
                                {ph.map(p => (
                                    <span key={p} className="text-[9px] font-bold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20">
                                        {'{{'}{p}{'}}'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add block shortcut */}
                    <div className="mt-auto">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Blok Ekle</label>
                        <div className="space-y-1">
                            {BLOCK_TYPES.map(bt => (
                                <button key={bt.type} onClick={() => setBlocks(prev => [...prev, { id: uid(), type: bt.type, content: '' }])}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[11px] font-medium text-slate-500 dark:text-slate-400 transition-all text-left">
                                    <span className="shrink-0">{bt.icon}</span> {bt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Block editor */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {blocks.map((block, idx) => (
                        <div key={block.id} className="group flex items-start gap-2">
                            {/* Drag / move */}
                            <div className="flex flex-col items-center gap-0.5 pt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveBlock(block.id, 'up')} disabled={idx === 0} title="Yukarı"
                                    className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors rounded">
                                    <ArrowUp size={12} />
                                </button>
                                <GripVertical size={14} className="text-slate-300 dark:text-slate-700 cursor-grab" />
                                <button onClick={() => moveBlock(block.id, 'down')} disabled={idx === blocks.length - 1} title="Aşağı"
                                    className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors rounded">
                                    <ArrowDown size={12} />
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Type selector */}
                                <div className="flex items-center gap-2 mb-1">
                                    <select value={block.type} onChange={e => updateBlock(block.id, { type: e.target.value as BlockType })}
                                        title="Blok türü"
                                        className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40">
                                        {BLOCK_TYPES.map(bt => <option key={bt.type} value={bt.type}>{bt.label}</option>)}
                                    </select>
                                    {block.type !== 'divider' && (
                                        <>
                                            <button onClick={() => updateBlock(block.id, { bold: !block.bold })}
                                                title="Kalın"
                                                className={`p-1 rounded-md transition-all text-[10px] font-bold ${block.bold ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                                <Bold size={11} />
                                            </button>
                                            <button onClick={() => updateBlock(block.id, { italic: !block.italic })}
                                                title="İtalik"
                                                className={`p-1 rounded-md transition-all text-[10px] ${block.italic ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                                <Italic size={11} />
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => removeBlock(block.id)} title="Bloğu sil"
                                        className="ml-auto p-1 text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100">
                                        <X size={12} />
                                    </button>
                                </div>

                                {/* Content textarea */}
                                {block.type === 'divider' ? (
                                    <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2 rounded-full" />
                                ) : (
                                    <textarea
                                        value={block.content}
                                        onChange={e => updateBlock(block.id, { content: e.target.value })}
                                        rows={block.type === 'signature' ? 4 : block.type === 'paragraph' ? 2 : 1}
                                        placeholder={block.type === 'heading1' ? 'Büyük başlık metni... {{yer_tutucu}} kullanabilirsin' :
                                            block.type === 'bullet' ? '• Madde metni...' :
                                                block.type === 'signature' ? 'İmza bilgileri...\n{{ad_soyad}}\n{{tarih}}' :
                                                    'Paragraf metni... {{yer_tutucu}} ekle'}
                                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all font-mono text-xs ${blockTypeStyle(block.type)}`}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add block at bottom */}
                    <button onClick={() => setBlocks(prev => [...prev, { id: uid(), type: 'paragraph', content: '' }])}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all text-xs font-bold">
                        <Plus size={14} /> Yeni Blok Ekle
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── VIEW: Fill Form (Use Template) ──────────────────────────────────────────
interface FillFormProps {
    template: WordTemplate;
    onBack: () => void;
    onGenerated: () => void;
}

function FillForm({ template, onBack, onGenerated }: FillFormProps) {
    const placeholders = extractPlaceholders(template.blocks);
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(placeholders.map(p => [p, '']))
    );
    const [generating, setGenerating] = useState(false);
    const [generatingAll, setGeneratingAll] = useState(false);

    // ── External data import state ─────────────────────────────────
    const [importedRows, setImportedRows] = useState<Record<string, string>[]>([]);
    const [importedCols, setImportedCols] = useState<string[]>([]);
    const [selectedRowIdx, setSelectedRowIdx] = useState(0);
    const [colMap, setColMap] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const normalise = (s: string) => s.toLowerCase().replace(/[\s_\-\.]/g, '');

    const autoMap = useCallback((cols: string[]) => {
        const map: Record<string, string> = {};
        for (const p of placeholders) {
            const np = normalise(p);
            const match = cols.find(c => normalise(c) === np)
                ?? cols.find(c => normalise(c).includes(np) || np.includes(normalise(c)));
            if (match) map[p] = match;
        }
        return map;
    }, [placeholders]);

    const applyRow = useCallback((idx: number, rows: Record<string, string>[], map: Record<string, string>) => {
        const row = rows[idx] ?? {};
        setValues(prev => {
            const next = { ...prev };
            for (const p of placeholders) { if (map[p] && row[map[p]] !== undefined) next[p] = row[map[p]]; }
            return next;
        });
    }, [placeholders]);

    const loadData = (rows: Record<string, string>[], cols: string[]) => {
        const map = autoMap(cols);
        setImportedCols(cols); setImportedRows(rows); setColMap(map); setSelectedRowIdx(0);
        applyRow(0, rows, map);
    };

    function parseCSV(text: string) {
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return { rows: [] as Record<string, string>[], cols: [] as string[] };
        const sep = lines[0].includes(';') ? ';' : ',';
        const splitLine = (line: string) => { const c: string[] = []; let cur = '', inQ = false; for (const ch of line) { if (ch === '"') { inQ = !inQ; } else if (ch === sep && !inQ) { c.push(cur.trim()); cur = ''; } else cur += ch; } c.push(cur.trim()); return c; };
        const cols = splitLine(lines[0]);
        const rows = lines.slice(1).filter(Boolean).map(l => { const cells = splitLine(l); return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? ''])); });
        return { rows, cols };
    }

    const handleImportFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        try {
            if (ext === 'json') {
                const arr = JSON.parse(await file.text());
                const data = Array.isArray(arr) ? arr : [arr];
                const cols = Array.from(new Set(data.flatMap(r => Object.keys(r))));
                loadData(data.map(r => Object.fromEntries(cols.map(c => [c, String(r[c] ?? '')]))), cols);
                toast.success(`${data.length} kayıt yüklendi (JSON)`);
            } else if (['csv', 'tsv', 'txt'].includes(ext!)) {
                const { rows, cols } = parseCSV(await file.text());
                loadData(rows, cols);
                toast.success(`${rows.length} kayıt yüklendi (CSV)`);
            } else if (['xlsx', 'xls'].includes(ext!)) {
                const XLSX = await import('xlsx');
                const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
                const arr: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }) as Record<string, unknown>[];
                const cols = arr.length ? Object.keys(arr[0]) : [];
                loadData(arr.map((r: Record<string, unknown>) => Object.fromEntries(cols.map(c => [c, String(r[c] ?? '')]))), cols);
                toast.success(`${arr.length} kayıt yüklendi (Excel)`);
            } else toast.error('Desteklenen format: CSV, JSON, XLSX');
        } catch (e: any) { toast.error(`Dosya okunamadı: ${e.message}`); }
    };

    const setFieldCol = (placeholder: string, col: string) => {
        const newMap = { ...colMap, [placeholder]: col };
        setColMap(newMap);
        if (col && importedRows.length) { const row = importedRows[selectedRowIdx] ?? {}; setValues(prev => ({ ...prev, [placeholder]: row[col] ?? '' })); }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const blob = await generateDocx(template, values);
            const safeName = `${template.name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').replace(/\s+/g, '_')}_${Date.now()}.docx`;
            saveAndRecord(blob, safeName, template.name, 'Word Şablon');
            toast.success(`"${template.name}" başarıyla oluşturuldu!`);
            onGenerated();
        } catch (err: any) { toast.error(`Dosya oluşturulamadı: ${err.message}`); }
        finally { setGenerating(false); }
    };

    const handleBulkGenerate = async () => {
        if (!importedRows.length) return;
        setGeneratingAll(true);
        try {
            for (let i = 0; i < importedRows.length; i++) {
                const row = importedRows[i];
                const rv = { ...values };
                for (const p of placeholders) { if (colMap[p] && row[colMap[p]] !== undefined) rv[p] = row[colMap[p]]; }
                const blob = await generateDocx(template, rv);
                saveAndRecord(blob, `${template.name.replace(/\s+/g, '_')}_${i + 1}_${Date.now()}.docx`, template.name, 'Word Toplu');
                await new Promise(r => setTimeout(r, 120));
            }
            toast.success(`${importedRows.length} dosya oluşturuldu!`); onGenerated();
        } catch (e: any) { toast.error(`Toplu üretim hatası: ${e.message}`); }
        finally { setGeneratingAll(false); }
    };

    const empty = placeholders.filter(p => !values[p]);
    const allFilled = empty.length === 0;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/5 shrink-0">
                <button onClick={onBack} title="Geri" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95">
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">{template.name}</h2>
                        <p className="text-[10px] text-slate-400">{placeholders.length} yer tutucu → Word oluştur</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                    <button onClick={() => fileInputRef.current?.click()} title="CSV / JSON / Excel veri aktar"
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-sm shadow-indigo-500/20">
                        <Plus size={13} /> Veri Aktar
                    </button>
                    <input ref={fileInputRef} type="file" accept=".csv,.tsv,.json,.xlsx,.xls,.txt" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }} />
                    {importedRows.length > 1 && (
                        <button onClick={handleBulkGenerate} disabled={generatingAll} title={`Tüm ${importedRows.length} kayıt için Word`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-sm">
                            {generatingAll ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" /> : <Copy size={13} />}
                            Tümünü ({importedRows.length})
                        </button>
                    )}
                    <button onClick={handleGenerate} disabled={generating} id="generate-docx-btn"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        {generating ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" /> : <Download size={13} />}
                        {generating ? 'Oluşturuluyor...' : 'Word İndir'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Left: Form + Import ─────────────────────────── */}
                <div className="w-[340px] border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 overflow-hidden">

                    {/* Import Bar */}
                    {importedRows.length > 0 && (
                        <div className="border-b border-slate-200 dark:border-white/5 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                    📂 Aktarılan Veri — {importedRows.length} kayıt
                                </span>
                                <button onClick={() => { setImportedRows([]); setImportedCols([]); setColMap({}); }} title="Veriyi temizle"
                                    className="text-indigo-400 hover:text-red-400 p-1 rounded transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                            {/* Record selector */}
                            <select value={selectedRowIdx} title="Kayıt seç"
                                onChange={e => { const i = Number(e.target.value); setSelectedRowIdx(i); applyRow(i, importedRows, colMap); }}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                {importedRows.map((row, i) => <option key={i} value={i}>{i + 1}. {importedCols[0] ? (row[importedCols[0]] || `Kayıt ${i + 1}`) : `Kayıt ${i + 1}`}</option>)}
                            </select>
                            {/* Auto-map status chips */}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {placeholders.map(p => (
                                    <span key={p} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 ${colMap[p] ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                        {colMap[p] ? <Check size={8} /> : <AlertCircle size={8} />} {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fields */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Progress */}
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                                <span>Doldurma İlerlemesi</span>
                                <span className={allFilled ? 'text-emerald-500' : 'text-blue-500'}>{placeholders.length - empty.length}/{placeholders.length}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${placeholders.length ? ((placeholders.length - empty.length) / placeholders.length) * 100 : 100}%` }} />
                            </div>
                        </div>

                        {placeholders.length === 0 ? (
                            <div className="text-center py-8">
                                <Check size={32} className="text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-500">Yer tutucu yok</p>
                            </div>
                        ) : placeholders.map(p => (
                            <div key={p}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                    {p.replace(/_/g, ' ')}
                                    {values[p] ? <Check size={10} className="inline ml-1 text-emerald-500" /> : <span className="text-red-400 ml-1">*</span>}
                                </label>
                                {/* Column select — only when data is loaded */}
                                {importedCols.length > 0 && (
                                    <select value={colMap[p] ?? ''} onChange={e => setFieldCol(p, e.target.value)} title={`${p} için sütun seç`}
                                        className={`w-full mb-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${colMap[p] ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500'}`}>
                                        <option value="">— Elle gir —</option>
                                        {importedCols.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                )}
                                <input type="text" value={values[p]} id={`field-${p}`}
                                    onChange={e => { if (colMap[p]) setColMap(prev => ({ ...prev, [p]: '' })); setValues(prev => ({ ...prev, [p]: e.target.value })); }}
                                    placeholder={colMap[p] ? `← ${colMap[p]}` : `{{${p}}}`}
                                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${values[p] ? 'border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/20' : 'border-slate-200 dark:border-white/5 focus:ring-blue-500/20'}`} />
                            </div>
                        ))}

                        {!allFilled && empty.length > 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                    {empty.length} alan boş → <code className="font-mono">[alan_adı]</code> olarak görünür.
                                </p>
                            </div>
                        )}

                        {importedRows.length === 0 && (
                            <button onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-xs font-bold">
                                <Plus size={13} /> CSV / JSON / Excel Veri Aktar
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Right: Live Preview ───────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950/30">
                    <div className="max-w-2xl mx-auto bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-10 space-y-3 font-sans">
                        {template.blocks.map(block => {
                            const text = fillContent(block.content, values);
                            if (block.type === 'divider') return <hr key={block.id} className="border-slate-200 dark:border-slate-700" />;
                            if (!text) return null;
                            return (
                                <div key={block.id} className={blockTypeStyle(block.type)}>
                                    {block.type === 'bullet' && <span className="mr-2">•</span>}
                                    {text.split('\n').map((line, i) => (
                                        <span key={i} className="block">{line || <br />}</span>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const WordTemplateManager: React.FC = () => {
    const [view, setView] = useState<View>('list');
    const [templates, setTemplates] = useState<WordTemplate[]>(loadTemplates);
    const [editTarget, setEditTarget] = useState<WordTemplate | null>(null);
    const [fillTarget, setFillTarget] = useState<WordTemplate | null>(null);

    const saveAll = (updated: WordTemplate[]) => {
        setTemplates(updated);
        saveTemplates(updated);
    };

    const handleSaveTemplate = (t: WordTemplate) => {
        const existing = templates.findIndex(x => x.id === t.id);
        if (existing >= 0) {
            const updated = [...templates];
            updated[existing] = t;
            saveAll(updated);
            toast.success('Şablon güncellendi.');
        } else {
            saveAll([t, ...templates]);
            toast.success('Yeni şablon kaydedildi.');
        }
        setView('list');
        setEditTarget(null);
    };

    const handleDelete = (id: string) => {
        saveAll(templates.filter(t => t.id !== id));
        toast.success('Şablon silindi.');
    };

    const handleUse = (t: WordTemplate) => {
        // Increment useCount in user templates
        if (!t.id.startsWith('builtin_')) {
            const idx = templates.findIndex(x => x.id === t.id);
            if (idx >= 0) {
                const updated = [...templates];
                updated[idx] = { ...updated[idx], useCount: updated[idx].useCount + 1 };
                saveAll(updated);
                t = updated[idx];
            }
        }
        setFillTarget(t);
        setView('fill');
    };

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Page header */}
            {view === 'list' && (
                <div className="flex items-center gap-6 px-6 py-5 border-b border-slate-200 dark:border-white/5 shrink-0">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <FileText size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Word Şablon Merkezi</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-0.5">
                            Bozdemir Template Engine v1.0 — Hazır şablonlar, akıllı yer tutucular
                        </p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                {view === 'list' && (
                    <TemplateList
                        templates={templates}
                        builtins={BUILTIN_TEMPLATES}
                        onEdit={t => { setEditTarget(t); setView('editor'); }}
                        onUse={handleUse}
                        onDelete={handleDelete}
                        onNew={() => { setEditTarget(null); setView('editor'); }}
                    />
                )}
                {view === 'editor' && (
                    <TemplateEditor
                        template={editTarget}
                        onSave={handleSaveTemplate}
                        onBack={() => setView('list')}
                    />
                )}
                {view === 'fill' && fillTarget && (
                    <FillForm
                        template={fillTarget}
                        onBack={() => setView('list')}
                        onGenerated={() => setView('list')}
                    />
                )}
            </div>
        </div>
    );
};
