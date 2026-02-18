import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { File as FileIcon, Folder, Download, ArrowLeft, X, Eye, ChevronLeft, ChevronRight, Copy, Check, Code, Archive } from 'lucide-react';

interface ZipInspectorProps {
    file: File | null;
    onBack: () => void;
}

interface ZipItem {
    path: string;
    isDir: boolean;
    obj: JSZip.JSZipObject | File;
    type?: 'zip' | 'direct';
}

interface PreviewState {
    item: ZipItem;
    type: 'image' | 'text' | 'video' | 'audio' | 'pdf' | 'unsupported';
    content: string | null;
    loading: boolean;
}

export const ZipInspector: React.FC<ZipInspectorProps> = ({ file: initialFile, onBack }) => {
    const [file, setFile] = useState<File | null>(initialFile);
    const [items, setItems] = useState<ZipItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [copying, setCopying] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const [groupedItems, setGroupedItems] = useState<{ media: ZipItem[], content: ZipItem[], other: ZipItem[] } | null>(null);

    useEffect(() => {
        if (!file) return;
        const loadZip = async () => {
            try {
                setLoading(true);
                setError(null);
                setItems([]);
                setGroupedItems(null);

                const isArchive = /\.(zip|jar|apk|docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name);
                const isOffice = /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name);

                if (isArchive) {
                    try {
                        const zip = new JSZip();
                        const loadedZip = await zip.loadAsync(file);
                        const fileItems: ZipItem[] = [];
                        loadedZip.forEach((relativePath, zipEntry) => {
                            if (!zipEntry.dir) {
                                fileItems.push({
                                    path: relativePath,
                                    isDir: false,
                                    obj: zipEntry,
                                    type: 'zip'
                                });
                            }
                        });

                        const sortedItems = fileItems.sort((a, b) => a.path.localeCompare(b.path));
                        setItems(sortedItems);

                        if (isOffice) {
                            const media: ZipItem[] = [];
                            const content: ZipItem[] = [];
                            const other: ZipItem[] = [];

                            sortedItems.forEach(item => {
                                const path = item.path.toLowerCase();
                                if (path.includes('media/') || /\.(png|jpg|jpeg|gif|emf|wmf|tiff|svg|webp|bmp|ico)$/.test(path)) {
                                    media.push(item);
                                } else if (path.endsWith('.xml') && !path.includes('rels') && !path.includes('[content_types]')) {
                                    content.push(item);
                                } else {
                                    other.push(item);
                                }
                            });
                            setGroupedItems({ media, content, other });
                        }

                    } catch (zipErr) {
                        throw zipErr;
                    }
                } else {
                    const singleItem: ZipItem = {
                        path: file.name,
                        isDir: false,
                        obj: file,
                        type: 'direct'
                    };
                    setItems([singleItem]);
                    setTimeout(() => handlePreview(singleItem), 100);
                }

                setLoading(false);
            } catch (e: any) {
                console.error(e);
                if (file) {
                    const singleItem: ZipItem = {
                        path: file.name,
                        isDir: false,
                        obj: file,
                        type: 'direct'
                    };
                    setItems([singleItem]);
                    setTimeout(() => handlePreview(singleItem), 100);
                }
                setLoading(false);
            }
        };
        loadZip();
    }, [file]);

    const handleCopyBase64 = async () => {
        if (!preview) return;
        try {
            setCopying(true);
            let base64 = '';

            if (preview.item.type === 'direct') {
                const f = preview.item.obj as File;
                const buffer = await f.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                base64 = window.btoa(binary);
            } else {
                const zipObj = preview.item.obj as JSZip.JSZipObject;
                base64 = await zipObj.async('base64');
            }

            const ext = preview.item.path.split('.').pop()?.toLowerCase();
            let mime = 'application/octet-stream';
            if (['jpg', 'jpeg'].includes(ext || '')) mime = 'image/jpeg';
            else if (['png'].includes(ext || '')) mime = 'image/png';
            else if (['svg'].includes(ext || '')) mime = 'image/svg+xml';
            else if (['gif'].includes(ext || '')) mime = 'image/gif';
            else if (['webp'].includes(ext || '')) mime = 'image/webp';
            else if (['ico'].includes(ext || '')) mime = 'image/x-icon';
            else if (['bmp'].includes(ext || '')) mime = 'image/bmp';

            const isImage = ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp', 'bmp', 'ico'].includes(ext || '');
            const textToCopy = isImage ? `data:${mime};base64,${base64}` : base64;

            await navigator.clipboard.writeText(textToCopy);

            setTimeout(() => setCopying(false), 2000);
        } catch (err) {
            console.error('Base64 copy error', err);
            setCopying(false);
            alert('Base64 kopyalama başarısız');
        }
    };

    const handleFormat = () => {
        if (!preview || preview.type !== 'text' || !preview.content) return;

        try {
            const content = preview.content;
            let formatted = content;

            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                try {
                    const obj = JSON.parse(content);
                    formatted = JSON.stringify(obj, null, 2);
                } catch (e) { }
            } else if (content.trim().startsWith('<')) {
                try {
                    const xml = new DOMParser().parseFromString(content, 'application/xml');
                    const errorNode = xml.querySelector('parsererror');
                    if (!errorNode) {
                        formatted = content.replace(/>\s*</g, '><')
                            .replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
                        const lines = formatted.split('\r\n');
                        formatted = '';
                        let pad = 0;
                        lines.forEach(line => {
                            let indent = 0;
                            if (line.match(/^<\w/) && !line.match(/>.*<\//)) {
                                indent = 1;
                            } else if (line.match(/^<\/\w/)) {
                                if (pad > 0) pad -= 1;
                            }

                            formatted += new Array(pad * 2).fill(' ').join('') + line + '\n';

                            if (indent > 0) pad += 1;
                        });
                    }
                } catch (e) { }
            }

            setPreview({ ...preview, content: formatted });
        } catch (err) {
            console.error('Format error', err);
        }
    };

    const downloadFile = async (item: ZipItem) => {
        if (item.isDir) return;
        try {
            let blob: Blob;
            if (item.type === 'direct') {
                blob = item.obj as File;
            } else {
                blob = await (item.obj as JSZip.JSZipObject).async('blob');
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const parts = item.path.split('/');
            const name = parts[parts.length - 1] || 'download';
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Dosya indirilirken hata oluştu");
        }
    };

    const handlePreview = async (item: ZipItem) => {
        if (item.isDir) return;

        const name = item.path.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/.test(name);
        const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/.test(name);
        const isAudio = /\.(mp3|wav|aac|m4a|flac)$/.test(name);
        const isPdf = /\.(pdf)$/.test(name);

        const isBinary = /\.(exe|dll|so|dylib|bin|iso|img|dmg|zip|rar|7z|tar|gz)$/.test(name);

        setPreview({ item, type: 'unsupported', content: null, loading: true });

        try {
            if (isImage || isVideo || isAudio || isPdf) {
                let blob: Blob;

                if (item.type === 'direct') {
                    blob = item.obj as File;
                } else {
                    blob = await (item.obj as JSZip.JSZipObject).async('blob');
                }

                if (isPdf && blob.type !== 'application/pdf') blob = new Blob([blob], { type: 'application/pdf' });

                const url = URL.createObjectURL(blob);

                if (isImage) setPreview({ item, type: 'image', content: url, loading: false });
                else if (isVideo) setPreview({ item, type: 'video', content: url, loading: false });
                else if (isAudio) setPreview({ item, type: 'audio', content: url, loading: false });
                else if (isPdf) setPreview({ item, type: 'pdf', content: url, loading: false });

            } else if (!isBinary) {
                // Try to read as text
                let text = '';
                if (item.type === 'direct') {
                    text = await (item.obj as File).text();
                } else {
                    text = await (item.obj as JSZip.JSZipObject).async('string');
                }

                if (text.includes('\0') && text.length > 500) {
                    setPreview({ item, type: 'unsupported', content: null, loading: false });
                } else {
                    setPreview({ item, type: 'text', content: text, loading: false });
                }
            } else {
                setPreview({ item, type: 'unsupported', content: null, loading: false });
            }
        } catch (err) {
            console.error("Preview error", err);
            setPreview(prev => prev ? { ...prev, loading: false, type: 'unsupported' } : null);
        }
    };

    const closePreview = () => {
        if (preview?.type === 'image' && preview.content) {
            URL.revokeObjectURL(preview.content);
        }
        setPreview(null);
    };

    const handleNavigate = (direction: 'next' | 'prev') => {
        if (!preview) return;

        const currentIndex = items.findIndex(item => item.path === preview.item.path);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        let found = false;

        while (!found) {
            if (direction === 'next') {
                nextIndex = (nextIndex + 1) % items.length;
            } else {
                nextIndex = (nextIndex - 1 + items.length) % items.length;
            }

            if (nextIndex === currentIndex) break;

            if (!items[nextIndex].isDir) {
                found = true;
            }
        }

        if (found) {
            if (preview.type === 'image' && preview.content) {
                URL.revokeObjectURL(preview.content);
            }
            handlePreview(items[nextIndex]);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!preview) return;
            if (e.key === 'ArrowRight') handleNavigate('next');
            if (e.key === 'ArrowLeft') handleNavigate('prev');
            if (e.key === 'Escape') closePreview();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [preview, items]);

    const renderFileList = (list: ZipItem[], title?: string) => {
        if (!list || list.length === 0) return null;
        return (
            <div className={title ? "mb-6" : ""}>
                {title && (
                    <h4 className="m-0 mb-2 opacity-80 text-[0.9rem] text-slate-400 border-b border-white/10 pb-1 font-semibold px-4">
                        {title} ({list.length})
                    </h4>
                )}
                {list.map((item) => (
                    <div
                        key={item.path}
                        className={`flex items-center justify-between px-6 py-3 border-b border-white/5 transition-colors ${item.isDir ? "cursor-default" : "cursor-pointer hover:bg-white/5"}`}
                        onClick={() => !item.isDir && handlePreview(item)}
                        title={item.isDir ? 'Klasör' : 'Önizlemek için tıkla'}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {item.isDir ? (
                                <Folder size={16} className="text-amber-400 shrink-0" />
                            ) : (
                                <FileIcon size={16} className="text-slate-400 shrink-0" />
                            )}
                            <span className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                {item.path}
                            </span>
                        </div>
                        {!item.isDir && <Eye size={14} className="opacity-30 shrink-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 animate-[fadeIn_0.5s_ease] rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-start gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 bg-pink-500/20 border border-pink-500/40 text-white rounded-lg hover:bg-pink-500/40 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    title="Geri Dön"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-left">
                    <h2 className="m-0 text-2xl font-bold tracking-tight">
                        {file && /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name) ? 'Belge İçeriği' : 'Arşiv İnceleyici'}
                    </h2>
                    {file && /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name) && (
                        <p className="text-sm text-pink-400 font-medium">Office dosya yapısı ayrıştırıldı</p>
                    )}
                </div>
            </div>

            <p className="text-sm text-slate-400 text-left mb-6 leading-relaxed">
                {file ? (
                    <>
                        <span className="font-semibold text-slate-200">{file.name}</span> dosyasının içeriği görüntüleniyor. Önizlemek için bir dosyaya tıklayın.
                    </>
                ) : (
                    'İncelemek istediğiniz arşivi (zip, docx, vb.) seçin. Dosyaları sunucuya yüklemeden tarayıcınızda görüntüleyin.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-pink-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-5 bg-pink-500/10 rounded-full text-pink-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                        <Archive size={36} />
                    </div>
                    <div className="text-center px-4">
                        <p className="font-bold text-xl mb-1">İncelemek için Arşiv Seçin</p>
                        <p className="text-sm text-slate-500">Zip, Docx, Xlsx ve daha fazlasını tarayıcınızda açın</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        title="Dosya Seç"
                        accept=".zip,.jar,.apk,.docx,.xlsx,.pptx,.odt,.ods,.odp"
                    />
                </div>
            ) : (
                <>
                    {loading && (
                        <div className="flex items-center justify-center gap-3 p-12 text-pink-400 animate-pulse">
                            <Archive size={24} className="animate-bounce" />
                            <span className="font-medium">Arşiv yapısı çözümleniyor...</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="max-h-[600px] overflow-y-auto text-left bg-black/30 rounded-2xl border border-white/5 custom-scrollbar">
                            {items.length === 0 && (
                                <div className="p-12 text-center text-slate-500 italic">
                                    Arşiv boş veya bu format desteklenmiyor.
                                </div>
                            )}

                            {groupedItems ? (
                                <div className="py-2">
                                    {renderFileList(groupedItems.media, 'Medya Dosyaları')}
                                    {renderFileList(groupedItems.content, 'Belge İçeriği (XML)')}
                                    {renderFileList(groupedItems.other, 'Yapısal ve Diğer Dosyalar')}
                                </div>
                            ) : (
                                <div className="py-2">
                                    {renderFileList(items)}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease]">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <h3 className="m-0 text-sm font-mono font-medium text-slate-300 truncate flex-1 text-left mr-4">
                                {preview.item.path}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-1 gap-1">
                                    <button
                                        onClick={() => handleNavigate('prev')}
                                        className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors"
                                        title="Önceki"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('next')}
                                        className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors"
                                        title="Sonraki"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                                <div className="flex items-center gap-1.5">
                                    {preview.type === 'text' && (
                                        <button
                                            onClick={handleFormat}
                                            className="px-3 py-1.5 flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-all"
                                            title="Kod Formatla"
                                        >
                                            <Code size={14} /> <span>Formatla</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCopyBase64}
                                        className="px-3 py-1.5 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-all"
                                        title="Base64 Kopyala"
                                    >
                                        {copying ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        <span>{copying ? 'Kopyalandı' : 'Base64'}</span>
                                    </button>
                                    <button
                                        onClick={() => downloadFile(preview.item)}
                                        className="px-3 py-1.5 flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                                    >
                                        <Download size={14} /> <span>İndir</span>
                                    </button>
                                    <button
                                        onClick={closePreview}
                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/40">
                            {preview.loading ? (
                                <div className="flex flex-col items-center gap-3 text-pink-400 animate-pulse">
                                    <Archive size={40} className="animate-spin" />
                                    <span className="text-sm font-medium">Yükleniyor...</span>
                                </div>
                            ) : preview.type === 'image' ? (
                                <img src={preview.content!} alt="Preview" className="max-w-[95%] max-h-[95%] object-contain rounded shadow-lg" />
                            ) : preview.type === 'video' ? (
                                <video controls src={preview.content!} className="max-w-[95%] max-h-[95%] rounded border border-white/10 shadow-2xl" />
                            ) : preview.type === 'audio' ? (
                                <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10">
                                    <audio controls src={preview.content!} className="w-[300px]" />
                                </div>
                            ) : preview.type === 'pdf' ? (
                                <iframe src={preview.content!} className="w-full h-full border-none" title="PDF Preview" />
                            ) : preview.type === 'text' ? (
                                <pre className="w-full h-full p-6 text-slate-300 font-mono text-sm whitespace-pre-wrap text-left overflow-auto custom-scrollbar select-text leading-relaxed">
                                    {preview.content}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-500">
                                    <FileIcon size={64} className="opacity-20" />
                                    <p className="text-sm">Bu dosya türü için önizleme desteklenmiyor.</p>
                                    <button
                                        onClick={() => downloadFile(preview.item)}
                                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors"
                                    >
                                        Dosyayı İndirip İnceleyin
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
