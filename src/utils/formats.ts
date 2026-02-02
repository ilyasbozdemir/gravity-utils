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
    mdFile: 'Markdown Dosyası'
};

export const SUPPORTED_CONVERSIONS: Record<string, Format[]> = {
    // Microsoft Office types are actually Zips
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [ // .docx
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ // .xlsx
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [ // .pptx
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true }
    ],
    // Standard Zip can be renamed to docx if user knows what they are doing (risky but allowed)
    'application/zip': [
        { ext: 'docx', label: 'Word Belgesi (Deneysel)', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', isRenameOnly: true }
    ],

    // Images
    'image/png': [
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
        { ext: 'webp', label: TR.webpImg, mime: 'image/webp' }
    ],
    'image/jpeg': [
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'webp', label: TR.webpImg, mime: 'image/webp' }
    ],
    'image/webp': [
        { ext: 'png', label: TR.pngImg, mime: 'image/png' },
        { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' }
    ],

    // Text
    'text/plain': [
        { ext: 'json', label: TR.jsonFile, mime: 'application/json' },
        { ext: 'md', label: TR.mdFile, mime: 'text/markdown' }
    ],
    'application/json': [
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain' }
    ]
};

// Fallback lookup by extension if MIME is generic
export const getFormatByExtension = (filename: string): Format[] => {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'docx' || ext === 'xlsx' || ext === 'pptx' || ext === 'apk' || ext === 'jar') {
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
    // 1. Check exact mime match
    if (SUPPORTED_CONVERSIONS[file.type]) {
        return SUPPORTED_CONVERSIONS[file.type];
    }

    // 2. Check extension based logic (better for Windows files)
    const extFormats = getFormatByExtension(file.name);
    if (extFormats.length > 0) return extFormats;

    // 3. Category Fallbacks
    if (file.type.startsWith('image/')) {
        return [
            { ext: 'png', label: TR.pngImg, mime: 'image/png' },
            { ext: 'jpg', label: TR.jpegImg, mime: 'image/jpeg' },
            { ext: 'webp', label: TR.webpImg, mime: 'image/webp' },
            { ext: 'pdf', label: 'PDF Belgesi', mime: 'application/pdf' }
        ];
    }

    if (file.type.startsWith('text/') || /\.(txt|md|js|ts|json|xml|html|css|py|java|c|cpp|h)$/i.test(file.name)) {
        return [
            { ext: 'pdf', label: 'PDF Belgesi', mime: 'application/pdf' },
            { ext: 'json', label: TR.jsonFile, mime: 'application/json', isRenameOnly: true }
        ];
    }

    // Fallback for docx/xlsx if not caught by mime (often happens)
    if (/\.(docx|xlsx|pptx)$/i.test(file.name)) {
        return [
            { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true },
            { ext: 'pdf', label: 'PDF Belgesi (Metin)', mime: 'application/pdf' }
        ];
    }

    // 4. Default Renaming Options for Unknowns
    return [
        { ext: 'zip', label: TR.zipArchive, mime: 'application/zip', isRenameOnly: true },
        { ext: 'txt', label: TR.txtFile, mime: 'text/plain', isRenameOnly: true }
    ];
};
