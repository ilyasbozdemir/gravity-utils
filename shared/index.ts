/**
 * BOZDEMIR SHARED CORE - Universal Helpers
 * (C) 2026 Ilyas Bozdemir.
 * Feed both Next.js (Web) and Electron (Desktop).
 */

export const SHARED_ENGINE = {
    getOutputName: (originalName: string, suffix: string, ext: string) => {
        const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${base}_${suffix}.${ext.replace('.', '')}`;
    },
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
    ENGINE_VERSION: 'Bozdemir Engine v3.0-Monorepo-Edition'
};
