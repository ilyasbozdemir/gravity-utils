export type FileCategory = 'image' | 'text' | 'archive' | 'audio' | 'video' | 'unknown';

export interface Format {
    ext: string;
    label: string;
    mime: string;
    // If true, this is just a container rename (byte-copy), not a transcode
    isRenameOnly?: boolean;
}

// Helper for Turkish labels
const TR = {
    zipArchive: 'ZIP Arşivi',
    txtFile: 'Metin Dosyası',
    jpegImg: 'JPEG Görüntüsü',
    pngImg: 'PNG Görüntüsü',
    webpImg: 'WebP Görüntüsü',
    jsonFile: 'JSON Dosyası',
    mdFile: 'Markdown Dosyası',
    pdfDoc: 'PDF Belgesi',
    wordDoc: 'Word Belgesi (.docx)',
    svgImg: 'SVG Çizimi',
};

export const SUPPORTED_CONVERSIONS: Record<string, Format[]> = {
    // Microsoft Office types
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [ // .docx
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' },
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain' },
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    // PDF
    'application/pdf': [
        { ext: 'docx', label: TR.wordDoc, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain' },
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ // .xlsx
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [ // .pptx
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],

    // Images
    'image/png': [
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'webp', label: TR.webpImg, mime: 'image/webp' },
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' }
    ],
    'image/jpeg': [
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'webp', label: TR.webpImg, mime: 'image/webp' },
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' }
    ],
    'image/webp': [
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' }
    ],
    'image/svg+xml': [
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'webp', label: TR.webpImg, mime: 'image/webp' }
    ],

    // Text
    'text/plain': [
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' },
        { ext: 'json', label: TR.jsonFile, mime: 'application/json' },
        { ext: 'md', label: TR.mdFile, mime: 'text/markdown' }
    ],
    'application/json': [
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain' },
        { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' }
    ]
};

// Fallback lookup by extension if MIME is generic (Windows sometimes gives empty MIME)
export const getFormatByExtension = (filename: string): Format[] => {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'docx') {
        return [
            { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' },
            { ext: 'txt', label: TR.txtFile, mime: 'text/plain' },
            { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
            { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
        ];
    }
    if (ext === 'pdf') {
        return [
            { ext: 'docx', label: TR.wordDoc, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
            { ext: 'png', label: TR.pngImg, mime: 'image/png' },
            { ext: 'txt', label: TR.txtFile, mime: 'text/plain' }
        ];
    }
    if (ext === 'svg') {
        return [
            { ext: 'png', label: TR.pngImg, mime: 'image/png' },
            { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' }
        ];
    }

    if (ext === 'xlsx' || ext === 'pptx' || ext === 'apk' || ext === 'jar') {
        return [{ ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }];
    }

    return [];
};

export const getFileCategory = (file: File): FileCategory => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.js')) return 'text';
    if (file.type.includes('zip') || file.type.includes('compressed') || file.name.match(/\.(zip|rar|7z|tar|gz|docx|xlsx|pptx|jar|apk)$/i)) return 'archive';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
};

export const getAvailableFormats = (file: File): Format[] => {
    // 1. Check extension based logic first (more reliable for Office/PDF on some systems)
    const extFormats = getFormatByExtension(file.name);
    if (extFormats.length > 0) return extFormats;

    // 2. Check exact mime match
    if (SUPPORTED_CONVERSIONS[file.type]) {
        return SUPPORTED_CONVERSIONS[file.type];
    }

    // 3. Category Fallbacks
    if (file.type.startsWith('image/')) {
        return [
            { ext: 'png', label: TR.pngImg, mime: 'image/png' },
            { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
            { ext: 'webp', label: TR.webpImg, mime: 'image/webp' },
            { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' }
        ];
    }

    if (file.type.startsWith('text/') || /\.(txt|md|js|ts|json|xml|html|css|py|java|c|cpp|h)$/i.test(file.name)) {
        return [
            { ext: 'pdf', label: TR.pdfDoc, mime: 'application/pdf' },
            { ext: 'json', label: TR.jsonFile, mime: 'application/json', isRenameOnly: true }
        ];
    }

    // 4. Default Renaming Options for Unknowns
    return [
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true },
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain', isRenameOnly: true }
    ];
};

