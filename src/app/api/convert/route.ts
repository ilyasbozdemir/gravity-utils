import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Note: This is an example API route for handling PDF operations on server.
// In a real environment with LibreOffice or similar, we could do full Word -> PDF.
// For now, we'll provide a robust endpoint for PDF manipulation and Font embedding.

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let type: string | null = null;
        let arrayBuffer: ArrayBuffer | null = null;
        let formData: FormData | null = null;
        let jsonBody: any = null;
        let fileName = 'file';

        if (contentType.includes('application/json')) {
            jsonBody = await req.json();
            type = jsonBody.type;
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            formData = await req.formData();
            const file = formData.get('file') as File;
            type = formData.get('type') as string;
            if (file) {
                arrayBuffer = await file.arrayBuffer();
                fileName = file.name;
            }
        }

        if (!type) {
            return NextResponse.json({ error: 'İşlem tipi belirtilmedi' }, { status: 400 });
        }

        // --- File Based Operations (Requires ArrayBuffer) ---
        if (arrayBuffer) {
            // PDF Watermark
            if (type === 'pdf-watermark') {
                const text = formData?.get('text') as string || 'GİZLİ';
                const opacity = parseFloat(formData?.get('opacity') as string) || 0.3;
                const color = formData?.get('color') as string || '#ff0000';

                const pdfDoc = await PDFDocument.load(arrayBuffer);
                pdfDoc.registerFontkit(fontkit);
                
                const fontRes = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/roboto@master/src/hinted/Roboto-Regular.ttf');
                const fontBytes = await fontRes.arrayBuffer();
                const font = await pdfDoc.embedFont(fontBytes);
                
                const r = parseInt(color.slice(1, 3), 16) / 255;
                const g = parseInt(color.slice(3, 5), 16) / 255;
                const b = parseInt(color.slice(5, 7), 16) / 255;

                const pages = pdfDoc.getPages();
                pages.forEach(page => {
                    const { width, height } = page.getSize();
                    page.drawText(text, {
                        x: width / 4,
                        y: height / 2,
                        size: 50,
                        font,
                        color: rgb(r, g, b),
                        opacity,
                        rotate: { angle: 45, type: 'degrees' as any }
                    });
                });

                const pdfBytes = await pdfDoc.save();
                return new Response(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="watermarked-${fileName}"`,
                    },
                });
            }

            // PDF Merge
            if (type === 'pdf-merge') {
                const otherFiles = formData?.getAll('otherFiles') as File[];
                const mainPdf = await PDFDocument.load(arrayBuffer);
                
                for (const f of otherFiles) {
                    const otherBuffer = await f.arrayBuffer();
                    const otherPdf = await PDFDocument.load(otherBuffer);
                    const pages = await mainPdf.copyPages(otherPdf, otherPdf.getPageIndices());
                    pages.forEach(p => mainPdf.addPage(p));
                }

                const pdfBytes = await mainPdf.save();
                return new Response(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="merged.pdf"',
                    },
                });
            }

            // PDF Split
            if (type === 'pdf-split') {
                const pagesStr = formData?.get('pages') as string;
                const selectedIndices = pagesStr.split(',').map(n => parseInt(n) - 1);
                
                const sourcePdf = await PDFDocument.load(arrayBuffer);
                const newPdf = await PDFDocument.create();
                
                const pages = await newPdf.copyPages(sourcePdf, selectedIndices);
                pages.forEach(p => newPdf.addPage(p));

                const pdfBytes = await newPdf.save();
                return new Response(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="split.pdf"',
                    },
                });
            }

            // PDF Compress
            if (type === 'pdf-compress') {
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
                
                return new Response(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="compressed.pdf"',
                    },
                });
            }

            // PDF Protect
            if (type === 'pdf-protect') {
                const password = formData?.get('password') as string;
                if (!password) {
                    return NextResponse.json({ error: 'Parola belirtilmedi' }, { status: 400 });
                }

                const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');
                const encryptedBytes = await encryptPDF(new Uint8Array(arrayBuffer), password);

                return new Response(Buffer.from(encryptedBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="protected-${fileName}"`,
                    },
                });
            }

            // Excel / PPT to PDF
            if (type === 'excel-pdf' || type === 'ppt-pdf') {
                const pdfDoc = await PDFDocument.create();
                pdfDoc.registerFontkit(fontkit);
                const fontRes = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/roboto@master/src/hinted/Roboto-Regular.ttf');
                const fontBytes = await fontRes.arrayBuffer();
                const font = await pdfDoc.embedFont(fontBytes);
                
                if (type === 'excel-pdf') {
                    const orientation = formData?.get('orientation') as string || 'portrait';
                    const pageSizeParam = formData?.get('pageSize') as string || 'a4';
                    const gridDataStr = formData?.get('gridData') as string;
                    
                    let dataToProcess: any[][][] = []; // [sheetIndex][row][col]
                    
                    if (gridDataStr) {
                        try {
                            const editedData = JSON.parse(gridDataStr);
                            dataToProcess = [editedData]; // Treat edited grid as a single sheet
                        } catch (e) {
                            console.error('Grid data parse error:', e);
                        }
                    }
                    
                    // Fallback to original file if no edited data
                    if (dataToProcess.length === 0) {
                        const { read, utils } = await import('xlsx');
                        const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
                        for (const name of workbook.SheetNames) {
                            const sheet = workbook.Sheets[name];
                            dataToProcess.push(utils.sheet_to_json(sheet, { header: 1 }) as any[][]);
                        }
                    }
                    
                    dataToProcess.forEach((json, sheetIdx) => {
                        if (json.length === 0) return;
                        
                        let dims: [number, number] = [595.28, 841.89]; // A4
                        if (pageSizeParam === 'a3') dims = [841.89, 1190.55]; 
                        if (orientation === 'landscape') dims = [dims[1], dims[0]];

                        const page = pdfDoc.addPage(dims);
                        const { width, height } = page.getSize();
                        let y = height - 50;

                        page.drawText(`Sayfa ${sheetIdx + 1}`, { x: 50, y, size: 16, font, color: rgb(0, 0.4, 0.7) });
                        y -= 30;

                        const colCount = Math.max(...json.map(r => Array.isArray(r) ? r.length : 0));
                        const colWidth = (width - 100) / (colCount || 1);
                        const rowHeight = 20;

                        json.slice(0, 50).forEach((row, rowIndex) => {
                            if (y < 40) return;
                            let x = 50;
                            if (rowIndex === 0) {
                                page.drawRectangle({ x, y: y-5, width: width-100, height: rowHeight, color: rgb(0.9, 0.9, 0.9) });
                            }
                            row.forEach((cell: any) => {
                                page.drawText(String(cell || "").substring(0, 15), { x: x + 5, y, size: 8, font });
                                page.drawRectangle({ x, y: y-5, width: colWidth, height: rowHeight, borderWidth: 0.5, borderColor: rgb(0.7, 0.7, 0.7) });
                                x += colWidth;
                            });
                            y -= rowHeight;
                        });
                    });
                } else {
                    // PPT to PDF (Text extraction approach)
                    try {
                        const JSZip = (await import('jszip')).default;
                        const zip = await JSZip.loadAsync(arrayBuffer);
                        
                        // Extract slides
                        let i = 1;
                        let hasMore = true;
                        while(hasMore) {
                            const slidePath = `ppt/slides/slide${i}.xml`;
                            const slideFile = zip.file(slidePath);
                            if (!slideFile) {
                                hasMore = false;
                                break;
                            }
                            
                            const slideContent = await slideFile.async('string');
                            const page = pdfDoc.addPage();
                            const { width, height } = page.getSize();
                            
                            page.drawText(`Sayfa ${i}`, { x: width/2 - 20, y: height - 40, size: 10, font });
                            
                            // Basic text extraction from slide XML
                            const texts = slideContent.match(/<a:t>([^<]*)<\/a:t>/g);
                            if (texts) {
                                let yPos = height - 100;
                                texts.forEach(t => {
                                    const match = t.match(/<a:t>([^<]*)<\/a:t>/);
                                    const txt = match ? match[1] : '';
                                    if (txt.trim()) {
                                        page.drawText(txt, { x: 50, y: yPos, size: 12, font });
                                        yPos -= 20;
                                    }
                                });
                            }
                            i++;
                            if (i > 50) break; // Safety limit
                        }
                    } catch (zipErr: any) {
                        const page = pdfDoc.addPage();
                        const font = await pdfDoc.embedFont(fontBytes);
                        page.drawText('Hata: Dosya bir ZIP arşivi değil veya modern bir format değil.', { x: 50, y: 700, size: 14, font });
                        page.drawText('Modern PowerPoint (.pptx) formatı gereklidir. Eski .ppt formatı desteklenmez.', { x: 50, y: 680, size: 10, font });
                        page.drawText(`Teknik Detay: ${zipErr.message}`, { x: 50, y: 660, size: 8, font });
                    }
                }

                const pdfBytes = await pdfDoc.save();
                return new Response(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="converted-${fileName}.pdf"`,
                    },
                });
            }

            // PDF to Excel (Offload from client)
            if (type === 'pdf-excel') {
                const { read, utils, write } = await import('xlsx');
                // Note: Simplified server-side PDF to Excel would need a real PDF parser.
                // For now, we'll return a placeholder or use a library if available.
                // This is a sign to use a more robust PDF parsing solution on server if needed.
                return NextResponse.json({ error: 'Bu işlem için sunucu tarafında gelişmiş parser gereklidir. Yerel dönüştürücü önerilir.' }, { status: 501 });
            }
        }

        // --- Text Processing Logic (JSON or FormData) ---
        if (type === 'text-process') {
            const { action, text, params, to, limit } = jsonBody || Object.fromEntries(formData?.entries() || []);
            let result = text || '';

            switch (action) {
                case 'clean-spaces':
                    result = result.replace(/[ \t]+/g, ' ').trim();
                    break;
                case 'clean-lines':
                    result = result.split('\n').map((l: string) => l.trim()).filter(Boolean).join('\n');
                    break;
                case 'remove-emojis':
                    result = result.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])/g, '');
                    break;
                case 'normalize-tr':
                    const trMap: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U' };
                    result = result.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m: string) => trMap[m] || m);
                    break;
                case 'show-hidden':
                    result = result.replace(/\n/g, '↵\n').replace(/\t/g, '⇥ ').replace(/ /g, '·');
                    break;
                case 'limit':
                    result = result.substring(0, limit || 2200);
                    break;
                case 'case':
                    if (to === 'upper') result = result.toLocaleUpperCase('tr-TR');
                    else if (to === 'lower') result = result.toLocaleLowerCase('tr-TR');
                    else if (to === 'title') result = result.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    else if (to === 'camel') result = result.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_: any, chr: string) => chr.toUpperCase());
                    else if (to === 'snake') result = result.replace(/\s+/g, '_').toLowerCase();
                    else if (to === 'kebab') result = result.replace(/\s+/g, '-').toLowerCase();
                    break;
            }

            return NextResponse.json({ result });
        }

        return NextResponse.json({ error: 'Geçersiz işlem veya dosya eksik' }, { status: 400 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'İşlem sırasında sunucu hatası oluştu: ' + (error as Error).message }, { status: 500 });
    }
}
