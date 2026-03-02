/**
 * BOZDEMIR CORE - SHARED PDF LOGIC
 * This file contains the logic used by both Web and Electron implementations.
 * (C) 2026 Ilyas Bozdemir
 */

export interface PdfOperationOptions {
    quality?: number;
    password?: string;
    watermark?: string;
}

export const PDF_UTILS = {
    // Utility to get a cleaner filename
    getOutputName: (originalName: string, suffix: string) => {
        const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        return `${base}_${suffix}.pdf`;
    },

    // Potential shared constants
    MAX_BROWSER_SIZE: 100 * 1024 * 1024, // 100MB browser limit
};
