/**
 * BOZDEMIR PLATFORM CORE - Universal Runtime Abstraction
 * handles differences between Browser (Next.js) and Electron (Desktop).
 */

export type PlatformType = 'web' | 'desktop';

export const getPlatform = (): PlatformType => {
    if (typeof window !== 'undefined' && (window as any).electron) {
        return 'desktop';
    }
    return 'web';
};

export const isDesktop = () => getPlatform() === 'desktop';
export const isWeb = () => getPlatform() === 'web';

export interface FileDialogOptions {
    title?: string;
    multi?: boolean;
    filters?: { name: string; extensions: string[] }[];
}

export const platform = {
    // 📂 Unified File Dialog
    openFile: async (options: FileDialogOptions = {}): Promise<File | File[] | null> => {
        if (isDesktop()) {
            try {
                const results = await (window as any).electron.selectOpenPath({
                    title: options.title || 'Dosya Seçin',
                    properties: options.multi ? ['openFile', 'multiSelections'] : ['openFile'],
                    filters: options.filters
                });
                if (results && results.length > 0) {
                    // Convert electron buffers back to File objects for component compatibility
                    const files = results.map((f: any) => {
                        const blob = new Blob([f.data]);
                        return new File([blob], f.name, { type: 'application/octet-stream' });
                    });
                    return options.multi ? files : files[0];
                }
            } catch (err) {
                console.error('Desktop file selection error:', err);
            }
            return null;
        } else {
            // Web implementation
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = !!options.multi;
                input.onchange = (e: any) => {
                    const files = Array.from(e.target.files || []) as File[];
                    if (files.length === 0) resolve(null);
                    resolve(options.multi ? files : files[0]);
                };
                input.click();
            });
        }
    },

    // 💾 Unified Save Dialog (Mainly for Desktop)
    saveFile: async (blob: Blob, defaultName: string) => {
        if (isDesktop()) {
            const savePath = await (window as any).electron.selectSavePath(defaultName);
            if (savePath) {
                // We'd need a native call to write the blob data to disk
                const arrayBuffer = await blob.arrayBuffer();
                await (window as any).electron.nativeProcess('WRITE_FILE', {
                    path: savePath,
                    buffer: arrayBuffer
                });
                return true;
            }
            return false;
        } else {
            // Web fallback using file-saver or similar
            const { saveAs } = await import('file-saver');
            saveAs(blob, defaultName);
            return true;
        }
    },

    // 🌐 Unified Link/External Opener
    openExternal: (url: string) => {
        if (isDesktop()) {
            (window as any).electron.shell?.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    }
};
