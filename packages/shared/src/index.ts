/**
 * BOZDEMIR SHARED CORE - Universal Helpers
 * (C) 2026 Ilyas Bozdemir.
 * Feed both Next.js (Web) and Electron (Desktop).
 */

export const SHARED_ENGINE = {
    getOutputName: (originalName: string, suffix: string, ext: string) => {
        const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${base}_${suffix}.${ext.startsWith('.') ? ext.slice(1) : ext}`;
    },
    getMimeType: (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch(ext) {
            case 'pdf': return 'application/pdf';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'json': return 'application/json';
            case 'txt': return 'text/plain';
            default: return 'application/octet-stream';
        }
    },
    // --- IP & Network Helpers ---
    ip: {
        toInt: (ip: string): number => {
            const parts = ip.split('.').map(Number);
            return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
        },
        fromInt: (n: number): string => {
            return [
                (n >>> 24) & 0xff,
                (n >>> 16) & 0xff,
                (n >>> 8) & 0xff,
                n & 0xff,
            ].join('.');
        },
        isValid: (ip: string): boolean => {
            const parts = ip.split('.');
            if (parts.length !== 4) return false;
            return parts.every(p => {
                const n = parseInt(p, 10);
                return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
            });
        }
    },
    // --- String & Format Helpers ---
    formatBytes: (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    ENGINE_VERSION: 'Bozdemir Engine v3.1.0-Shared-Core-Secure'
};

export * from './platform';
export * from './platform-adapter';
export * from './components/DataToolkit';
export * from './components/OfficeTools';
export * from './components/DesignToolkit';
export * from './components/DevTools';
export * from './components/DocumentToolkit';
export * from './components/ExamGenerator';
export * from './components/FileConverter';
export * from './components/MediaToolkit';
export * from './components/NetworkToolkit';
export * from './components/PdfManager';
export * from './components/TextToolkit';
export * from './components/WebToolkit';
export * from './components/CheckToolkit';
export * from './components/DesktopToolkit';
export * from './components/JsonFormatter';
export * from './components/JwtDebugger';
export * from './components/SqlFormatter';
export * from './components/RegexTester';
export * from './components/SmartCalculator';
export * from './components/EmailHeaderAnalyzer';
export * from './utils/shared-core';
export * from './utils/fontLoader';
export * from './utils/formats';
