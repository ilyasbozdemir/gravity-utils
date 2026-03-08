/**
 * BOZDEMIR SHARED CORE - Universal Helpers
 * (C) 2026 Ilyas Bozdemir.
 * These helpers serve both the Next.js frontend and the Electron Desktop Engine.
 */

export const SHARED_ENGINE = {
    // 🏷️ Filename Generator
    getOutputName: (originalName: string, suffix: string, ext: string) => {
        const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${base}_${suffix}.${ext.replace('.', '')}`;
    },

    // 📁 Mime Type Helper
    getMimeType: (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch(ext) {
            case 'pdf': return 'application/pdf';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            default: return 'application/octet-stream';
        }
    },

    // ⚡ Performance Constants
    CHUNKING_SIZE: 1024 * 1024 * 5, // 5MB chunks
    ENGINE_VERSION: 'Bozdemir Engine v2.0-Standalone',

    // 🔄 Base64 Helper
    arrayBufferToBase64: (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
};
