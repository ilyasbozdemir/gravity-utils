
/**
 * Utility to load Turkish-supporting fonts for PDF generation
 */

// Turkish characters: ğ, ü, ş, İ, ö, ç, Ğ, Ü, Ş, I, Ö, Ç
// Standard PDF fonts (Helvetica, etc.) do NOT support these in WinAnsiEncoding.
// We must embed a TTF font.

const ROBOTO_REGULAR_URL = 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Regular.ttf';

let cachedFont: ArrayBuffer | null = null;

export const loadTurkishFont = async (): Promise<ArrayBuffer> => {
    if (cachedFont) return cachedFont;
    
    try {
        const response = await fetch(ROBOTO_REGULAR_URL);
        if (!response.ok) throw new Error('Font yüklenemedi');
        cachedFont = await response.arrayBuffer();
        return cachedFont;
    } catch (error) {
        console.error('Font loading failed:', error);
        throw error;
    }
};
