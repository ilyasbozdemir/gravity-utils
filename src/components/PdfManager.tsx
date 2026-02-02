import React, { useState } from 'react';
import { ArrowLeft, FileText, Scissors, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PdfManagerProps {
    file: File;
    onBack: () => void;
}

export const PdfManager: React.FC<PdfManagerProps> = ({ file, onBack }) => {
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [selectedPage, setSelectedPage] = useState<number>(1);
    const [processing, setProcessing] = useState(false);

    React.useEffect(() => {
        const loadPdf = async () => {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            setPageCount(pdfDoc.getPageCount());
        };
        loadPdf();
    }, [file]);

    const handleSplit = async () => {
        if (!pageCount) return;
        setProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            // Adjust to 0-index
            const [copiedPage] = await newDoc.copyPages(srcDoc, [selectedPage - 1]);
            newDoc.addPage(copiedPage);

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `page-${selectedPage}-${file.name}`;
            link.click();
        } catch (err) {
            console.error(err);
            alert('PDF işleminde hata oluştu.');
        }
        setProcessing(false);
    };

    return (
        <div className="glass-panel max-w-[600px] mx-auto p-8 animate-[fadeIn_0.5s_ease] text-center">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="glass-button p-2"><ArrowLeft size={18} /></button>
                <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                    <FileText className="text-red-400" />
                    PDF Sayfa Ayırıcı
                </h2>
            </div>

            <div className="mb-8">
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-slate-400 text-sm">
                    {pageCount ? `${pageCount} Sayfa` : 'Yükleniyor...'}
                </p>
            </div>

            {pageCount && (
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="mb-4 font-semibold flex items-center justify-center gap-2">
                        <Scissors size={18} /> Tek Sayfa Çıkar
                    </h3>

                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span>Sayfa:</span>
                        <input
                            type="number"
                            min="1"
                            max={pageCount}
                            value={selectedPage}
                            onChange={(e) => setSelectedPage(Math.min(parsedInt(e.target.value) || 1, pageCount))}
                            className="bg-black/20 border border-white/10 rounded p-2 w-20 text-center"
                        />
                        <span className="opacity-50">/ {pageCount}</span>
                    </div>

                    <button
                        onClick={handleSplit}
                        disabled={processing}
                        className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        <Download size={18} />
                        {processing ? 'İşleniyor...' : 'Seçili Sayfayı İndir'}
                    </button>

                    <p className="mt-4 text-xs text-slate-400 max-w-xs mx-auto">
                        Bu işlem dosyanızı sunucuya yüklemeden tarayıcınızda gerçekleştirilir.
                    </p>
                </div>
            )}
        </div>
    );
};

const parsedInt = (val: string) => {
    const v = parseInt(val);
    return isNaN(v) ? 0 : v;
};
