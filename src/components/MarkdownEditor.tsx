'use client';

import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Download, Copy, Check, FileText } from 'lucide-react';

// ─── Simple Markdown → HTML ───────────────────────────────────────────────────
function mdToHtml(md: string): string {
    let html = md
        .replace(/^######\s(.+)/gm, '<h6>$1</h6>')
        .replace(/^#####\s(.+)/gm, '<h5>$1</h5>')
        .replace(/^####\s(.+)/gm, '<h4>$1</h4>')
        .replace(/^###\s(.+)/gm, '<h3>$1</h3>')
        .replace(/^##\s(.+)/gm, '<h2>$1</h2>')
        .replace(/^#\s(.+)/gm, '<h1>$1</h1>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^>\s(.+)/gm, '<blockquote>$1</blockquote>')
        .replace(/^---$/gm, '<hr />')
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/^[\-\*]\s(.+)/gm, '<li>$1</li>')
        .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br />');

    html = html.replace(/(<li>.*?<\/li>(\s*<br \/>)?)+/g, (m) => `<ul>${m.replace(/<br \/>/g, '')}</ul>`);
    html = `<p>${html}</p>`;
    return html;
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
    {
        label: 'Readme',
        content: `# Proje Adı

> Kısa proje açıklaması burada yer alır.

## 🚀 Hızlı Başlangıç

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📋 Özellikler

- ✅ Özellik 1
- ✅ Özellik 2
- 🚧 Yapım aşamasında

## 📖 Kullanım

\`\`\`typescript
import { myFunction } from './lib';

const result = myFunction('param');
console.log(result);
\`\`\`

## 🤝 Katkıda Bulun

Pull request'ler memnuniyetle kabul edilir!

---

**Lisans:** MIT`
    },
    {
        label: 'Blog Yazısı',
        content: `# Makale Başlığı

*Yazar Adı · Tarih · 5 dakika okuma*

---

## Giriş

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Burada makalenize giriş yapın.

## Ana Başlık

> "Harika bir alıntı buraya gelir."

Paragraf içeriği burada yer alır. _İtalik metin_ ve **kalın metin** kullanabilirsiniz.

### Alt Başlık

1. Birinci madde
2. İkinci madde
3. Üçüncü madde

## Sonuç

Makalenizin sonuç paragrafı burada yer alır.`
    },
    { label: 'Boş', content: '' },
];

// ─── Toolbar item types ───────────────────────────────────────────────────────
type ToolbarAction =
    | { type: 'wrap'; before: string; after: string; label: string; cls?: string; placeholder: string }
    | { type: 'line'; prefix: string; label: string; cls?: string }
    | { type: 'block'; insert: string; label: string; cls?: string };

const TOOLBAR: ToolbarAction[] = [
    { type: 'line', prefix: '# ', label: 'H1', cls: 'font-black text-base' },
    { type: 'line', prefix: '## ', label: 'H2', cls: 'font-black' },
    { type: 'line', prefix: '### ', label: 'H3', cls: 'font-bold' },
    { type: 'wrap', before: '**', after: '**', label: 'B', cls: 'font-bold', placeholder: 'kalın metin' },
    { type: 'wrap', before: '*', after: '*', label: 'I', cls: 'italic', placeholder: 'italik metin' },
    { type: 'wrap', before: '~~', after: '~~', label: 'S', cls: 'line-through', placeholder: 'üstü çizili' },
    { type: 'wrap', before: '`', after: '`', label: 'Code', cls: 'font-mono text-xs', placeholder: 'kod' },
    { type: 'line', prefix: '> ', label: 'Quote' },
    { type: 'line', prefix: '- ', label: '• List' },
    { type: 'block', insert: '\n---\n', label: '—' },
    { type: 'block', insert: '[bağlantı metni](https://example.com)', label: '🔗' },
    { type: 'block', insert: '![resim açıklama](https://example.com/image.png)', label: '🖼️' },
];

// ─── Apply a toolbar action to textarea ──────────────────────────────────────
function applyAction(
    action: ToolbarAction,
    ta: HTMLTextAreaElement,
    setValue: (v: string) => void
) {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;
    const selected = val.slice(start, end);

    let newVal: string;
    let newCursorStart: number;
    let newCursorEnd: number;

    if (action.type === 'wrap') {
        const inner = selected || action.placeholder;
        const before = action.before;
        const after = action.after;
        newVal = val.slice(0, start) + before + inner + after + val.slice(end);
        newCursorStart = start + before.length;
        newCursorEnd = newCursorStart + inner.length;
    } else if (action.type === 'line') {
        // Find the start of the current line
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', start);
        const line = val.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

        // Toggle: if line already starts with prefix, remove it
        if (line.startsWith(action.prefix)) {
            const stripped = line.slice(action.prefix.length);
            newVal = val.slice(0, lineStart) + stripped + val.slice(lineEnd === -1 ? val.length : lineEnd);
            newCursorStart = start - action.prefix.length;
        } else {
            newVal = val.slice(0, lineStart) + action.prefix + val.slice(lineStart);
            newCursorStart = start + action.prefix.length;
        }
        newCursorEnd = newCursorStart;
    } else {
        // block insert
        newVal = val.slice(0, start) + action.insert + val.slice(end);
        newCursorStart = start + action.insert.length;
        newCursorEnd = newCursorStart;
    }

    setValue(newVal);
    // Restore focus + selection after react re-render
    requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(newCursorStart, newCursorEnd);
    });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MarkdownEditor({ onBack }: { onBack: () => void }) {
    const [md, setMd] = useState(TEMPLATES[0].content);
    const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');
    const [copied, setCopied] = useState(false);
    const taRef = useRef<HTMLTextAreaElement>(null);

    const html = useMemo(() => mdToHtml(md), [md]);

    const wordCount = md.trim().split(/\s+/).filter(Boolean).length;
    const charCount = md.length;
    const lineCount = md.split('\n').length;
    const readTime = Math.ceil(wordCount / 200);

    const download = (content: string, name: string, mime: string) => {
        const blob = new Blob([content], { type: mime });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    };

    const handleToolbar = (action: ToolbarAction) => {
        const ta = taRef.current;
        if (!ta) return;
        applyAction(action, ta, setMd);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-teal-500" /> Markdown Editör
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {wordCount} kelime · {charCount} karakter · {lineCount} satır · ~{readTime} dk
                    </p>
                </div>

                {/* View toggles */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {([['edit', 'Editör'], ['split', 'İkili'], ['preview', 'Önizleme']] as const).map(([v, label]) => (
                        <button key={v} onClick={() => setView(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(md); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                        title="Markdown'ı kopyala" aria-label="Markdown metnini kopyala"
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 transition-all">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                    <button onClick={() => download(md, 'document.md', 'text/markdown')}
                        title="Markdown olarak indir" aria-label="Markdown dosyası olarak indir"
                        className="flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all">
                        <Download size={14} /> .md
                    </button>
                    <button onClick={() => download(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}code{background:#f4f4f4;padding:2px 6px;border-radius:4px}pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow:auto}blockquote{border-left:4px solid #ddd;margin:0;padding-left:16px;color:#666}h1,h2,h3{font-weight:700}img{max-width:100%}</style></head><body>${html}</body></html>`, 'document.html', 'text/html')}
                        title="HTML olarak indir" aria-label="HTML dosyası olarak indir"
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                        <Download size={14} /> .html
                    </button>
                </div>
            </div>

            {/* Toolbar Row: Templates + Formatting */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                {/* Template label */}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pr-1">Şablon:</span>
                {TEMPLATES.map(t => (
                    <button key={t.label} onClick={() => setMd(t.content)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-400 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-all">
                        {t.label}
                    </button>
                ))}

                {/* Separator */}
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Formatting buttons */}
                {TOOLBAR.map(action => (
                    <button key={action.label}
                        onClick={() => handleToolbar(action)}
                        title={`${action.label} ekle`}
                        aria-label={`${action.label} ekle`}
                        className={`px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg text-xs text-slate-600 dark:text-slate-400 transition-all ${action.cls ?? ''}`}>
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Editor area */}
            <div className={`flex gap-4 ${view === 'split' ? 'grid grid-cols-2' : ''}`}>
                {(view === 'edit' || view === 'split') && (
                    <div className={view === 'split' ? '' : 'w-full'}>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 px-1">Markdown</p>
                        <textarea
                            ref={taRef}
                            value={md}
                            onChange={e => setMd(e.target.value)}
                            spellCheck={false}
                            title="Markdown editör"
                            placeholder="Yazmaya başlayın veya bir şablon seçin..."
                            className="w-full h-[65vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm"
                        />
                    </div>
                )}

                {(view === 'preview' || view === 'split') && (
                    <div className={view === 'split' ? '' : 'w-full'}>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 px-1">Önizleme</p>
                        <div
                            className="w-full h-[65vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-auto shadow-sm
                                prose prose-slate dark:prose-invert max-w-none
                                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-800 [&_h1]:dark:text-white [&_h1]:mb-4 [&_h1]:mt-6
                                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-700 [&_h2]:dark:text-slate-200 [&_h2]:mb-3 [&_h2]:mt-5
                                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-600 [&_h3]:dark:text-slate-300 [&_h3]:mb-2 [&_h3]:mt-4
                                [&_p]:text-slate-700 [&_p]:dark:text-slate-300 [&_p]:leading-relaxed [&_p]:mb-3
                                [&_strong]:font-bold [&_strong]:text-slate-800 [&_strong]:dark:text-slate-200
                                [&_em]:italic [&_em]:text-slate-600 [&_em]:dark:text-slate-400
                                [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_code]:text-pink-600 [&_code]:dark:text-pink-400
                                [&_pre]:bg-slate-900 [&_pre]:dark:bg-slate-950 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-auto [&_pre]:my-4
                                [&_pre_code]:bg-transparent [&_pre_code]:text-green-400 [&_pre_code]:p-0
                                [&_blockquote]:border-l-4 [&_blockquote]:border-teal-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:dark:text-slate-400 [&_blockquote]:my-4
                                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1
                                [&_li]:text-slate-700 [&_li]:dark:text-slate-300
                                [&_hr]:border-slate-200 [&_hr]:dark:border-slate-700 [&_hr]:my-6
                                [&_a]:text-teal-600 [&_a]:dark:text-teal-400 [&_a]:underline
                                [&_del]:line-through [&_del]:text-slate-400
                                [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
