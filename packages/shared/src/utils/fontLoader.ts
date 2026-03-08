
/**
 * BOZDEMIR FONT ENGINE - Platform-Aware Font Loader
 * 
 * - 🖥️ Desktop (Electron): Reads fonts directly from Windows/macOS/Linux system.
 *   No CDN, no internet needed. Uses native IPC bridge.
 * - 🌐 Web: Downloads Roboto from jsDelivr CDN (as before).
 * 
 * Turkish characters: ğ, ü, ş, İ, ö, ç, Ğ, Ü, Ş, Ö, Ç
 * Standard PDF fonts do NOT support these — we embed a TTF.
 */

// Preferred fonts, in priority order (name as it appears in font file list)
const PREFERRED_FONTS = ['Calibri', 'SegoeUI', 'Segoe UI', 'Arial', 'Helvetica', 'Roboto'];
const CDN_FALLBACK_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@master/src/hinted/Roboto-Regular.ttf';

let cachedFont: ArrayBuffer | null = null;
let cachedFontName: string = 'Unknown';

export const loadTurkishFont = async (): Promise<ArrayBuffer> => {
    if (cachedFont) return cachedFont;

    // 🖥️ DESKTOP PATH: Use system fonts via Bozdemir Native Font Engine
    const electronApi = (window as any).electron;
    if (electronApi?.getSystemFonts) {
        try {
            const result = await electronApi.getSystemFonts();
            if (result.success && result.fonts.length > 0) {
                // Find the best available font
                let chosen = null;
                for (const preferred of PREFERRED_FONTS) {
                    chosen = result.fonts.find((f: { name: string; normalized: string; path: string }) =>
                        f.name.toLowerCase().replace(/\s/g, '') === preferred.toLowerCase().replace(/\s/g, '')
                        || f.normalized?.toLowerCase().replace(/\s/g, '') === preferred.toLowerCase().replace(/\s/g, '')
                        || f.name.toLowerCase().startsWith(preferred.toLowerCase())
                    );
                    if (chosen) break;
                }
                // Fallback to any TTF if none of the preferred found
                if (!chosen) chosen = result.fonts.find((f: { name: string; path: string }) => /\.(ttf|otf)$/i.test(f.path));

                if (chosen) {
                    const fontResult = await electronApi.readFontFile(chosen.path);
                    if (fontResult.success) {
                        const binaryStr = atob(fontResult.base64);
                        const bytes = new Uint8Array(binaryStr.length);
                        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                        cachedFont = bytes.buffer;
                        cachedFontName = chosen.normalized || chosen.name;
                        console.log(`[Bozdemir Font Engine] ✅ System font loaded: ${cachedFontName}`);
                        return cachedFont;
                    }
                }
            }
        } catch (e) {
            console.warn('[Bozdemir Font Engine] Native font load failed, falling back to CDN:', e);
        }
    }

    // 🌐 WEB / FALLBACK PATH: Load from CDN
    try {
        const response = await fetch(CDN_FALLBACK_URL);
        if (!response.ok) throw new Error('Font CDN unavailable');
        cachedFont = await response.arrayBuffer();
        cachedFontName = 'Roboto (CDN)';
        console.log('[Bozdemir Font Engine] ✅ CDN font loaded: Roboto');
        return cachedFont;
    } catch (error) {
        console.error('[Bozdemir Font Engine] ❌ All font sources failed:', error);
        throw error;
    }
};

export const getCachedFontName = () => cachedFontName;

/**
 * 🔍 PDF MULTI-FONT RESOLVER - Bozdemir Desktop Engine
 * 
 * When a PDF/DOCX uses multiple fonts (e.g., body=Arial, headings=Times New Roman,
 * code=Courier New), each referenced by name, this function resolves them
 * from the system font cache.
 * 
 * Cache: font names are cached so a 50-page PDF with 3 fonts
 * only hits the native IPC bridge 3 times total.
 */
const fontNameCache = new Map<string, ArrayBuffer | null>();

export const loadFontByName = async (fontName: string): Promise<ArrayBuffer | null> => {
    if (!fontName) return null;
    
    const key = fontName.toLowerCase().trim();
    if (fontNameCache.has(key)) return fontNameCache.get(key) ?? null;

    const electronApi = (window as any).electron;
    
    // 🖥️ Desktop: native system font lookup
    if (electronApi?.findFontByName) {
        try {
            const result = await electronApi.findFontByName(fontName);
            if (result.success && result.base64) {
                const binaryStr = atob(result.base64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                const buffer = bytes.buffer;
                fontNameCache.set(key, buffer);
                console.log(`[Bozdemir Font Engine] ✅ Named font resolved: ${fontName} → ${result.name}`);
                return buffer;
            }
        } catch (e) {
            console.warn(`[Bozdemir Font Engine] Named font lookup failed for "${fontName}":`, e);
        }
    }

    // Font not found on system — use default Turkish font as fallback
    console.warn(`[Bozdemir Font Engine] ⚠️ Font "${fontName}" not found on system, using fallback.`);
    fontNameCache.set(key, null); // Cache the miss to avoid retrying
    return null;
};
