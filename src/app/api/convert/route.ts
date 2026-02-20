import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Note: This is an example API route for handling PDF operations on server.
// In a real environment with LibreOffice or similar, we could do full Word -> PDF.
// For now, we'll provide a robust endpoint for PDF manipulation and Font embedding.

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        if (type === 'pdf-watermark') {
            const text = formData.get('text') as string || 'GİZLİ';
            const opacity = parseFloat(formData.get('opacity') as string) || 0.3;
            const color = formData.get('color') as string || '#ff0000';

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
            return new Response(pdfBytes, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="watermarked-${file.name}"`,
                },
            });
        }

        if (type === 'pdf-merge') {
            const otherFiles = formData.getAll('otherFiles') as File[];
            const mainPdf = await PDFDocument.load(arrayBuffer);
            
            for (const f of otherFiles) {
                const otherBuffer = await f.arrayBuffer();
                const otherPdf = await PDFDocument.load(otherBuffer);
                const pages = await mainPdf.copyPages(otherPdf, otherPdf.getPageIndices());
                pages.forEach(p => mainPdf.addPage(p));
            }

            const pdfBytes = await mainPdf.save();
            return new Response(pdfBytes, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="merged.pdf"',
                },
            });
        }

        if (type === 'pdf-split') {
            const pagesStr = formData.get('pages') as string; // comma separated: 1,2,3
            const selectedIndices = pagesStr.split(',').map(n => parseInt(n) - 1);
            
            const sourcePdf = await PDFDocument.load(arrayBuffer);
            const newPdf = await PDFDocument.create();
            
            const pages = await newPdf.copyPages(sourcePdf, selectedIndices);
            pages.forEach(p => newPdf.addPage(p));

            const pdfBytes = await newPdf.save();
            return new Response(pdfBytes, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="split.pdf"',
                },
            });
        }

        if (type === 'pdf-compress') {
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            // pdf-lib compress is limited but we can re-save with optimizations
            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            
            return new Response(pdfBytes, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="compressed.pdf"',
                },
            });
        }

        return NextResponse.json({ error: 'Geçersiz işlem tipi: ' + type }, { status: 400 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'İşlem sırasında sunucu hatası oluştu: ' + (error as Error).message }, { status: 500 });
    }
}
