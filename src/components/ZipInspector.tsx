import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { File as FileIcon, Folder, Download, ArrowLeft, X, Eye, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Copy, Check, Code } from 'lucide-react';

interface ZipInspectorProps {
    file: File;
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
    type: 'image' | 'text' | 'unsupported';
    content: string | null;
    loading: boolean;
}

export const ZipInspector: React.FC<ZipInspectorProps> = ({ file, onBack }) => {
    const [items, setItems] = useState<ZipItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        const loadZip = async () => {
            try {
                setLoading(true);
                setError(null);

                // Attempt to read as ZIP if extension matches simple check
                // or just try and catch.
                const isArchive = /\.(zip|jar|apk|docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name);

                if (isArchive) {
                    try {
                        const zip = new JSZip();
                        const loadedZip = await zip.loadAsync(file);
                        const fileItems: ZipItem[] = [];
                        loadedZip.forEach((relativePath, zipEntry) => {
                            fileItems.push({
                                path: relativePath,
                                isDir: zipEntry.dir,
                                obj: zipEntry,
                                type: 'zip'
                            });
                        });
                        setItems(fileItems.sort((a, b) => a.path.localeCompare(b.path)));
                    } catch (zipErr) {
                        // If zip fail, maybe it's just a misnamed file, treat as direct?
                        // But usually we just throw error for archives.
                        throw zipErr;
                    }
                } else {
                    // Treat as direct single file
                    const singleItem: ZipItem = {
                        path: file.name,
                        isDir: false,
                        obj: file,
                        type: 'direct'
                    };
                    setItems([singleItem]);
                    // Auto open preview for single file
                    // But we can't call handlePreview directly here easily due to closure/async
                    // Let's set a small timeout or just let user click? 
                    // User said "ekrana bas", so auto-preview is better.
                    setTimeout(() => handlePreview(singleItem), 100);
                }

                setLoading(false);
            } catch (e: any) {
                console.error(e);
                // Fallback: If zip failed, maybe show as direct file?
                // Useful if someone renames file.txt to file.zip
                // But for now let's show error to be safe, or just fallback to direct view?
                // Let's fallback to direct view if it fails!
                const singleItem: ZipItem = {
                    path: file.name,
                    isDir: false,
                    obj: file,
                    type: 'direct'
                };
                setItems([singleItem]);
                setTimeout(() => handlePreview(singleItem), 100);

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
                // Convert buffer to base64
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

            // Detect mime type for Data URI
            const ext = preview.item.path.split('.').pop()?.toLowerCase();
            let mime = 'application/octet-stream';
            if (['jpg', 'jpeg'].includes(ext || '')) mime = 'image/jpeg';
            else if (['png'].includes(ext || '')) mime = 'image/png';
            else if (['svg'].includes(ext || '')) mime = 'image/svg+xml';
            else if (['gif'].includes(ext || '')) mime = 'image/gif';
            else if (['webp'].includes(ext || '')) mime = 'image/webp';
            else if (['ico'].includes(ext || '')) mime = 'image/x-icon';
            else if (['bmp'].includes(ext || '')) mime = 'image/bmp';

            // For images (and some others), construct Data URI
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
                // Try JSON
                try {
                    const obj = JSON.parse(content);
                    formatted = JSON.stringify(obj, null, 2);
                } catch (e) {
                    // Not JSON or invalid
                }
            } else if (content.trim().startsWith('<')) {
                // Basic XML formatting
                try {
                    const xml = new DOMParser().parseFromString(content, 'application/xml');
                    const errorNode = xml.querySelector('parsererror');
                    if (!errorNode) {
                        // Use a serializer but it doesn't format. 
                        // Fallback to simple regex approach for display purposes
                        let pad = 0;
                        formatted = content.replace(/>\s*</g, '><')
                            .replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
                        let lines = formatted.split('\r\n');
                        formatted = '';
                        lines.forEach(line => {
                            let indent = 0;
                            if (line.match(/^<\w/) && !line.match(/>.*<\//)) {
                                indent = 1; // Opening tag
                            } else if (line.match(/^<\/\w/)) {
                                if (pad > 0) pad -= 1; // Closing tag
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
            // Extract filename from path (handle nested paths)
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
        // Check for common image extensions
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/.test(name);
        // Check for text extensions
        const isText = /\.(txt|md|json|js|ts|tsx|jsx|css|html|xml|log|ini|yml|yaml|sql|c|cpp|h|java|py|rb|php|gitignore)$/.test(name);

        setPreview({ item, type: 'unsupported', content: null, loading: true });

        try {
            if (isImage) {
                let url: string;
                if (item.type === 'direct') {
                    url = URL.createObjectURL(item.obj as File);
                } else {
                    const blob = await (item.obj as JSZip.JSZipObject).async('blob');
                    url = URL.createObjectURL(blob);
                }
                setPreview({ item, type: 'image', content: url, loading: false });
            } else if (isText || !isImage) {
                // Default to text if not image? Risky for binaries but user wants to "see inside".
                // Let's try to read as text.
                let text = '';
                if (item.type === 'direct') {
                    text = await (item.obj as File).text();
                } else {
                    text = await (item.obj as JSZip.JSZipObject).async('string');
                }

                // If it looks binary, maybe warn?
                // Simple check for null bytes?
                if (text.includes('\0') && text.length > 100) {
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

        // Find next/prev non-directory item
        while (!found) {
            if (direction === 'next') {
                nextIndex = (nextIndex + 1) % items.length;
            } else {
                nextIndex = (nextIndex - 1 + items.length) % items.length;
            }

            // Prevent infinite loop if all items are directories or empty list (though list check handles empty)
            if (nextIndex === currentIndex) break;

            if (!items[nextIndex].isDir) {
                found = true;
            }
        }

        if (found) {
            // Revoke current object url if image
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

    const isOffice = /\.(docx|xlsx|pptx|odt|ods|odp)$/i.test(file.name);

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={onBack} className="glass-button" title="Geri" aria-label="Geri" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{isOffice ? 'Belge İçeriği' : 'Arşiv İnceleyici'}</h2>
                    {isOffice && <span className="text-sm" style={{ opacity: 0.7 }}>Office Belgesi Yapısı (XML)</span>}
                </div>
            </div>
            <p className="text-sm" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <strong>{file.name}</strong> dosyasının içeriği görüntüleniyor. Önizlemek için dosyaya tıklayın.
            </p>

            {loading && <div className="p-4">Arşiv yapısı okunuyor...</div>}
            {error && <div className="p-4" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

            {!loading && !error && (
                <div style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    {items.length === 0 && <div className="p-4 text-sm">Arşiv boş veya okunamadı.</div>}
                    {items.map((item) => (
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
                                {item.isDir ? <Folder size={16} color="#fbbf24" style={{ flexShrink: 0 }} /> : <FileIcon size={16} color="#94a3b8" style={{ flexShrink: 0 }} />}
                                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.path}</span>
                            </div>
                            {!item.isDir && <Eye size={14} style={{ opacity: 0.5, flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>
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
                                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 5px', display: 'none' }} className="d-sm-block"></div>
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
                                <div className="flex-center spin">
                                    <Download size={24} />
                                </div>
                            ) : preview.type === 'image' ? (
                                <img src={preview.content!} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
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
