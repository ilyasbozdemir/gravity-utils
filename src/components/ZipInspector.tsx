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
            <div style={{ marginBottom: title ? '1.5rem' : 0 }}>
                {title && (
                    <h4 style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                        {title} ({list.length})
                    </h4>
                )}
                {list.map((item) => (
                    <div
                        key={item.path}
                        className="flex-center"
                        style={{
                            justifyContent: 'space-between',
                            padding: '8px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            cursor: item.isDir ? 'default' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => !item.isDir && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={(e) => !item.isDir && (e.currentTarget.style.background = 'transparent')}
                        onClick={() => !item.isDir && handlePreview(item)}
                        title={item.isDir ? 'Klasör' : 'Önizlemek için tıkla'}
                    >
                        <div className="flex-center" style={{ gap: '10px', overflow: 'hidden' }}>
                            {item.isDir ? (
                                <Folder size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                            ) : (
                                <FileIcon size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                            )}
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {item.path}
                            </span>
                        </div>
                        {!item.isDir && <Eye size={14} style={{ opacity: 0.5, flexShrink: 0 }} />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={onBack} className="glass-button" title="Geri" aria-label="Geri" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{file && /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name) ? 'Belge İçeriği' : 'Arşiv İnceleyici'}</h2>
                    {file && /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name) && <span className="text-sm" style={{ opacity: 0.7 }}>Office dosya yapısı ayrıştırıldı</span>}
                </div>
            </div>

            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                {file ? (
                    <>
                        <strong>{file.name}</strong> dosyasının içeriği görüntüleniyor. Önizlemek için dosyaya tıklayın.
                    </>
                ) : (
                    'İncelemek istediğiniz arşivi (zip, docx, vb.) seçin.'
                )}
            </p>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-pink-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-pink-500/10 rounded-full text-pink-400 group-hover:scale-110 transition-transform">
                        <Archive size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">İncelemek için Arşiv Seçin</p>
                        <p className="text-sm text-slate-500 mt-1">Zip, Docx, Xlsx ve daha fazlasını destekler</p>
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
                    {loading && <div className="p-4">Arşiv yapısı okunuyor...</div>}
                    {error && <div className="p-4" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                    {!loading && !error && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            {items.length === 0 && <div className="p-4 text-sm">Arşiv boş veya okunamadı.</div>}

                            {groupedItems ? (
                                <div style={{ padding: '10px' }}>
                                    {renderFileList(groupedItems.media, 'Medya Dosyaları')}
                                    {renderFileList(groupedItems.content, 'Belge İçeriği (XML)')}
                                    {renderFileList(groupedItems.other, 'Yapısal ve Diğer Dosyalar')}
                                </div>
                            ) : (
                                renderFileList(items)
                            )}
                        </div>
                    )}
                </>
            )}

            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <div className="glass-panel w-full" style={{ width: '90%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', margin: 0, overflow: 'hidden', padding: 0 }}>
                        {/* Header */}
                        <div className="flex items-center justify-between" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left', marginRight: '1rem' }}>
                                {preview.item.path}
                            </h3>
                            <div className="flex-center" style={{ gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <div className="flex-center" style={{ gap: '0.5rem' }}>
                                    <button onClick={() => handleNavigate('prev')} className="glass-button" style={{ padding: '8px' }} title="Önceki">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => handleNavigate('next')} className="glass-button" style={{ padding: '8px' }} title="Sonraki">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="flex-center" style={{ gap: '0.5rem' }}>
                                    {preview.type === 'text' && (
                                        <button onClick={handleFormat} className="glass-button" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }} title="Formatla (Güzelleştir)">
                                            <Code size={16} /> <span style={{ fontSize: '0.8rem' }} className="hidden-mobile">Formatla</span>
                                        </button>
                                    )}
                                    <button onClick={handleCopyBase64} className="glass-button" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }} title="Base64 Kopyala">
                                        {copying ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                                        <span style={{ fontSize: '0.8rem' }} className="hidden-mobile">{copying ? 'Kopyalandı' : 'Base64'}</span>
                                    </button>
                                    <button onClick={() => downloadFile(preview.item)} className="glass-button" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }} title="İndir">
                                        <Download size={16} /> <span style={{ fontSize: '0.8rem' }} className="hidden-mobile">İndir</span>
                                    </button>
                                    <button onClick={closePreview} className="glass-button" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }} title="Kapat">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            {preview.loading ? (
                                <div className="flex-center animate-spin">
                                    <Download size={24} />
                                </div>
                            ) : preview.type === 'image' ? (
                                <img src={preview.content!} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                            ) : preview.type === 'video' ? (
                                <video controls src={preview.content!} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }} />
                            ) : preview.type === 'audio' ? (
                                <audio controls src={preview.content!} style={{ width: '100%', maxWidth: '400px' }} />
                            ) : preview.type === 'pdf' ? (
                                <iframe src={preview.content!} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }} title="PDF Preview" />
                            ) : preview.type === 'text' ? (
                                <pre style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'left',
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'auto',
                                    margin: 0,
                                    userSelect: 'text',
                                    color: '#e2e8f0'
                                }}>
                                    {preview.content}
                                </pre>
                            ) : (
                                <div className="flex-center flex-col" style={{ gap: '1rem', opacity: 0.7 }}>
                                    <FileIcon size={48} />
                                    <p>Bu dosya türü için önizleme kullanılamıyor.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
