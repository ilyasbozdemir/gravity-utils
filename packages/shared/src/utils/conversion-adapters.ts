/**
 * BOZDEMIR CONVERSION ADAPTERS
 * Smart content-aware converters that detect tables, images, lists, headings
 * and produce well-structured output documents.
 */

// ─── PDF text item types ───────────────────────────────────────────────────────
export interface PdfTextItem {
    str: string;
    transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
    width: number;
    height: number;
    fontName?: string;
    hasEOL?: boolean;
}

export interface PdfFontInfo {
    name: string;
    isEmbedded: boolean;
    isSystem: boolean;
    isRisk: boolean;
}

// ─── Detected content block types ────────────────────────────────────────────
export type DocBlockType =
    | 'heading'
    | 'paragraph'
    | 'table'
    | 'image'
    | 'list-item'
    | 'divider'
    | 'empty';

export interface DocLine {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    isBold: boolean;
    width: number;
}

export interface DocTable {
    rows: string[][];
    colWidths: number[];
}

export interface DocBlock {
    type: DocBlockType;
    lines?: DocLine[];
    text?: string;
    fontSize?: number;
    isBold?: boolean;
    table?: DocTable;
    imageData?: Uint8Array;
    imageWidth?: number;
    imageHeight?: number;
    level?: 1 | 2 | 3; // for headings
}

// ─── ADAPTER: PDF text items → DocBlocks ─────────────────────────────────────
/**
 * Groups PDF text items into semantic blocks:
 * - Detects headings by font size
 * - Detects tables by aligned column X positions (handling uneven column counts)
 * - Detects list items by bullet prefix
 * - Falls back to paragraphs
 */
export function pdfItemsToDocBlocks(items: PdfTextItem[], pageHeight: number): DocBlock[] {
    if (!items.length) return [];

    // 1. Group items into lines by Y coordinate (tolerance: 4pt)
    const lineMap = new Map<number, PdfTextItem[]>();
    for (const item of items) {
        if (!item.str.trim() && !item.hasEOL) continue;
        const y = Math.round(item.transform[5]);
        const key = [...lineMap.keys()].find(k => Math.abs(k - y) < 4) ?? y;
        if (!lineMap.has(key)) lineMap.set(key, []);
        lineMap.get(key)!.push(item);
    }

    // Sort lines top-to-bottom (PDF Y is from bottom)
    const sortedLines: [number, PdfTextItem[]][] = [...lineMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([y, its]) => [y, its.sort((a, b) => a.transform[4] - b.transform[4])]);

    // 2. Convert to DocLines with better merging of small text chunks
    const docLines: DocLine[] = sortedLines.map(([y, its]) => {
        // Merge segments that are very close to each other horizontally
        const mergedItems: { str: string, x: number, width: number }[] = [];
        let current: { str: string, x: number, width: number } | null = null;
        
        for (const it of its) {
            const x = it.transform[4];
            if (current && (x - (current.x + current.width) < 5)) {
                current.str += it.str;
                current.width += it.width;
            } else {
                current = { str: it.str, x, width: it.width };
                mergedItems.push(current);
            }
        }

        const text = mergedItems.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
        const fontSize = Math.abs(Math.round(its[0].transform[0] * 1.8)) || 22; // Adjusted scale
        const fontName = (its[0].fontName || '').toLowerCase();
        const isBold = fontName.includes('bold') || fontName.includes('heavy') || fontName.includes('black');
        const x = its[0].transform[4];
        const width = its.reduce((sum, it) => sum + (it.width || 0), 0);
        
        return { text, x, y, fontSize, isBold, width };
    });

    if (docLines.length === 0) return [];

    // 3. Detect average body font size
    const fontSizes = docLines.map(l => l.fontSize).filter(s => s > 0);
    const avgFontSize = fontSizes.length
        ? fontSizes.sort((a,b) => a-b)[Math.floor(fontSizes.length / 2)] // Use median
        : 22;

    // 4. Detect table candidates
    const tableGroups = detectTableGroups(docLines);
    const tableLineIndices = new Set(tableGroups.flatMap(g => g.lineIndices));

    // 5. Build blocks
    const blocks: DocBlock[] = [];
    let i = 0;

    while (i < docLines.length) {
        const line = docLines[i];

        if (!line.text) {
            blocks.push({ type: 'empty' });
            i++;
            continue;
        }

        // Table block
        if (tableLineIndices.has(i)) {
            const group = tableGroups.find(g => g.lineIndices.includes(i));
            if (group) {
                blocks.push({ type: 'table', table: group.table });
                i += group.lineIndices.length;
                continue;
            }
        }

        // List item
        if (/^[•\-–—*▪‣◆►○●◘◙◦]/.test(line.text) || /^\d+[.)]\s/.test(line.text)) {
            blocks.push({
                type: 'list-item',
                text: line.text.replace(/^[•\-–—*▪‣◆►○●◘◙◦]\s*/, '').replace(/^\d+[.)]\s*/, ''),
                fontSize: line.fontSize,
                isBold: line.isBold,
            });
            i++;
            continue;
        }

        // Heading
        if (line.fontSize > avgFontSize * 1.25 || (line.isBold && line.text.length < 100)) {
            const level: 1 | 2 | 3 =
                line.fontSize > avgFontSize * 1.7 ? 1 :
                line.fontSize > avgFontSize * 1.4 ? 2 : 3;
            blocks.push({
                type: 'heading',
                text: line.text,
                fontSize: line.fontSize,
                isBold: true,
                level,
            });
            i++;
            continue;
        }

        // Paragraph merging
        let paraText = line.text;
        let pIndex = i;
        while (
            pIndex + 1 < docLines.length &&
            docLines[pIndex + 1].text &&
            !tableLineIndices.has(pIndex + 1) &&
            !/^[•\-–—*▪‣◆►○●◘◙◦]/.test(docLines[pIndex + 1].text) &&
            !/^\d+[.)]\s/.test(docLines[pIndex + 1].text) &&
            Math.abs(docLines[pIndex + 1].x - line.x) < 30 &&
            docLines[pIndex + 1].fontSize <= avgFontSize * 1.25 &&
            !docLines[pIndex + 1].isBold
        ) {
            pIndex++;
            paraText += ' ' + docLines[pIndex].text;
        }

        blocks.push({
            type: 'paragraph',
            text: paraText,
            fontSize: line.fontSize,
            isBold: line.isBold,
        });
        i = pIndex + 1;
    }

    return blocks;
}

// ─── Table detection ──────────────────────────────────────────────────────────
interface TableGroup {
    lineIndices: number[];
    table: DocTable;
}

function detectTableGroups(lines: DocLine[]): TableGroup[] {
    const groups: TableGroup[] = [];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const tokens = tokenizeByGaps(line);
        if (tokens.length < 2) { i++; continue; }

        // Candidate for first row of table
        const tableIndices = [i];
        const tableRows: string[][] = [tokens.map(t => t.text)];
        const colCount = tokens.length;

        let j = i + 1;
        while (j < lines.length) {
            const nextLine = lines[j];
            if (!nextLine.text) break;
            
            const nextTokens = tokenizeByGaps(nextLine);
            // Must have similar number of columns or aligned X positions
            const isTableLike = nextTokens.length >= 2 && 
                (Math.abs(nextTokens.length - colCount) <= 1 || 
                 nextTokens.some(nt => tokens.some(t => Math.abs(nt.x - t.x) < 40)));
                 
            if (!isTableLike) break;

            tableIndices.push(j);
            tableRows.push(nextTokens.map(t => t.text));
            j++;
            if (j - i > 50) break; // Infinite loop safety
        }

        if (tableIndices.length >= 2) {
            const maxCols = Math.max(...tableRows.map(r => r.length));
            const normalized = tableRows.map(row => {
                const newRow = [...row];
                while (newRow.length < maxCols) newRow.push('');
                return newRow;
            });

            groups.push({
                lineIndices: tableIndices,
                table: { rows: normalized, colWidths: Array(maxCols).fill(Math.round(100 / maxCols)) },
            });
            i = j;
        } else {
            i++;
        }
    }

    return groups;
}

function tokenizeByGaps(line: DocLine): { text: string; x: number }[] {
    // If text contains multiple spaces, it's likely columns
    if (line.text.includes('   ')) {
        const parts = line.text.split(/ {3,}/);
        return parts.map((p, idx) => ({ text: p.trim(), x: line.x + idx * (line.width / parts.length) }));
    }
    return [{ text: line.text, x: line.x }];
}

// ─── ADAPTER: DocBlocks → DOCX (docx library) ────────────────────────────────
export async function docBlocksToDocx(
    blocks: DocBlock[],
    title: string,
    fileName: string,
    options: { useDefaultFont?: boolean } = {}
): Promise<Blob> {
    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        BorderStyle, WidthType, AlignmentType, HeadingLevel, ShadingType
    } = await import('docx');

    const DEFAULT_FONT = options.useDefaultFont ? 'Roboto' : 'Arial';
    const children: any[] = [];

    // Title
    children.push(new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 36, color: '1A202C' })],
        spacing: { after: 300 },
    }));

    children.push(new Paragraph({
        children: [new TextRun({
            text: `Dönüştürme Tarihi: ${new Date().toLocaleDateString('tr-TR')} • Kaynak: ${fileName}`,
            size: 16, color: '718096', italics: true,
        })],
        spacing: { after: 500 },
    }));

    for (const block of blocks) {
        switch (block.type) {

            case 'heading': {
                const level =
                    block.level === 1 ? HeadingLevel.HEADING_1 :
                    block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
                const size =
                    block.level === 1 ? 36 :
                    block.level === 2 ? 28 : 24;
                const color =
                    block.level === 1 ? '1A202C' :
                    block.level === 2 ? '2D3748' : '4A5568';
                children.push(new Paragraph({
                    heading: level,
                    children: [new TextRun({ text: block.text || '', bold: true, size, color })],
                    spacing: { before: 400, after: 200 },
                }));
                break;
            }

            case 'paragraph': {
                if (!block.text?.trim()) break;
                children.push(new Paragraph({
                    children: [new TextRun({
                        text: block.text,
                        size: 22,
                        bold: block.isBold,
                        color: '374151',
                    })],
                    spacing: { before: 80, after: 80 },
                }));
                break;
            }

            case 'list-item': {
                children.push(new Paragraph({
                    bullet: { level: 0 },
                    children: [new TextRun({ text: block.text || '', size: 22, color: '374151' })],
                    spacing: { before: 60, after: 60 },
                }));
                break;
            }

            case 'table': {
                if (!block.table || !block.table.rows.length) break;
                const { rows } = block.table;
                const colCount = rows[0].length;

                const tableRows = rows.map((row, rIdx) =>
                    new TableRow({
                        children: row.map(cell =>
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: String(cell || ''),
                                        bold: rIdx === 0,
                                        size: rIdx === 0 ? 22 : 20,
                                        color: rIdx === 0 ? '2D3748' : '4A5568',
                                    })],
                                    alignment: AlignmentType.LEFT,
                                })],
                                width: { size: Math.round(9000 / colCount), type: WidthType.DXA },
                                shading: rIdx === 0
                                    ? { type: ShadingType.SOLID, fill: 'EBF4FF', color: 'EBF4FF' }
                                    : (rIdx % 2 === 0
                                        ? { type: ShadingType.SOLID, fill: 'F7FAFC', color: 'F7FAFC' }
                                        : undefined),
                                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                            })
                        ),
                        tableHeader: rIdx === 0,
                    })
                );

                children.push(new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                        left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                        right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                    },
                }));
                children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
                break;
            }

            case 'image': {
                if (!block.imageData) break;
                const { ImageRun } = await import('docx');
                children.push(new Paragraph({
                    children: [new ImageRun({
                        data: block.imageData,
                        transformation: {
                            width: Math.min(block.imageWidth || 400, 550),
                            height: block.imageHeight || 300,
                        },
                    })],
                    spacing: { before: 200, after: 200 },
                }));
                break;
            }

            case 'empty': {
                children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
                break;
            }
        }
    }

    const doc = new Document({
        sections: [{ children }],
        creator: 'Gravity Utils — Bozdemir Conversion Engine',
        title,
    });

    return Packer.toBlob(doc);
}

// ─── ADAPTER: Scan PDF for Fonts ─────────────────────────────────────────────
/**
 * Scans all pages of a PDF to detect missing or proprietary fonts.
 */
export async function scanPdfFonts(pdf: any): Promise<PdfFontInfo[]> {
    const fonts: Record<string, PdfFontInfo> = {};
    const systemFonts = [
        'arial', 'times', 'courier', 'helvetica', 'symbol', 'zapfdingbats', 
        'georgia', 'verdana', 'tahoma', 'trebuchet', 'impact', 'comic', 
        'consolas', 'calibri', 'cambria', 'segoe'
    ];

    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        for (const item of textContent.items as any[]) {
            const fontName = item.fontName;
            if (fontName && !fonts[fontName]) {
                const nameParts = fontName.split('+');
                const isEmbedded = nameParts.length > 1;
                const nameClean = (nameParts.pop() || '').toLowerCase();
                const isSystem = systemFonts.some(f => nameClean.includes(f));
                
                fonts[fontName] = {
                    name: fontName,
                    isEmbedded,
                    isSystem,
                    isRisk: !isEmbedded && !isSystem
                };
            }
        }
    }
    return Object.values(fonts);
}

// ─── ADAPTER: Excel → smart DocBlocks ────────────────────────────────────────
/**
 * Reads an Excel file and returns DocBlocks.
 * Each worksheet becomes a heading + table block.
 */
export async function excelToDocBlocks(arrayBuffer: ArrayBuffer): Promise<{ sheetName: string; blocks: DocBlock[] }[]> {
    const { read, utils } = await import('xlsx');
    const workbook = read(arrayBuffer, { type: 'array' });

    return workbook.SheetNames.map(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

        // Filter completely empty rows
        const filtered = rows.filter(row => row.some(cell => cell !== '' && cell !== null));

        const blocks: DocBlock[] = [
            {
                type: 'heading',
                text: sheetName,
                level: 2,
                isBold: true,
            },
            {
                type: 'table',
                table: {
                    rows: filtered.map(row => row.map(cell => String(cell ?? ''))),
                    colWidths: filtered[0] ? filtered[0].map(() => Math.round(100 / filtered[0].length)) : [],
                },
            },
        ];

        return { sheetName, blocks };
    });
}

// ─── ADAPTER: Word HTML → enhanced PDF (via html2canvas) ─────────────────────
/**
 * After docx-preview renders the DOCX to HTML, this adapter
 * analyzes the rendered DOM to detect tables and images and
 * produces better PDF output by rendering them at higher quality.
 */
export interface WordToPdfOptions {
    scale?: number;       // canvas scale (default 2 = retina)
    pageWidthPx?: number; // A4 width in px at 96dpi (default 794)
    pageHeightPx?: number;// A4 height in px at 96dpi (default 1123)
    watermark?: {
        text?: string;
        color?: string;
        opacity?: number;
    }
}

export async function renderedHtmlToPdfBlob(
    container: HTMLElement,
    opts: WordToPdfOptions = {}
): Promise<Blob> {
    const html2canvas = (await import('html2canvas')).default;
    const { PDFDocument, rgb, degrees } = await import('pdf-lib');
    const { loadTurkishFont } = await import('./fontLoader');

    const SCALE = opts.scale ?? 2;
    const A4_W = opts.pageWidthPx ?? 794;
    const A4_H = opts.pageHeightPx ?? 1123;

    const totalH = container.scrollHeight;
    const pageCount = Math.ceil(totalH / A4_H);
    const pdfDoc = await PDFDocument.create();

    // Load font for watermark if needed
    let customFont: any = null;
    if (opts.watermark?.text) {
        const fontBytes = await loadTurkishFont();
        pdfDoc.registerFontkit((await import('@pdf-lib/fontkit')).default);
        customFont = await pdfDoc.embedFont(fontBytes);
    }

    for (let p = 0; p < pageCount; p++) {
        const offsetY = p * A4_H;
        const sliceH = Math.min(A4_H, totalH - offsetY);

        const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            scale: SCALE,
            width: A4_W,
            height: sliceH,
            x: 0,
            y: offsetY,
            windowWidth: A4_W,
            backgroundColor: '#ffffff',
            imageTimeout: 5000,
        });

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.94);
        const base64 = jpegDataUrl.split(',')[1];
        const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const img = await pdfDoc.embedJpg(jpegBytes);

        const page = pdfDoc.addPage([595.28, 841.89]);
        const drawH = 841.89 * (sliceH / A4_H);
        page.drawImage(img, { x: 0, y: 841.89 - drawH, width: 595.28, height: drawH });

        // Apply Watermark
        if (opts.watermark?.text && customFont) {
            const { text, color = '#ff0000', opacity = 0.3 } = opts.watermark;
            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;

            page.drawText(text, {
                x: 100,
                y: 400,
                size: 60,
                font: customFont,
                color: rgb(r, g, b),
                opacity: opacity,
                rotate: degrees(45),
            });
        }
    }

    return new Blob([await pdfDoc.save()], { type: 'application/pdf' });
}
