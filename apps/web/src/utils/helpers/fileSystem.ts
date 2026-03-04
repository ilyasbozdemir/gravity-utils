import { isElectron } from './env';
import { saveAs } from 'file-saver';

/**
 * Unified Save - Ilyas Bozdemir Desktop Engine Standard
 * Automatically detects environment and saves either via native dialog or browser download.
 */
export async function unifiedSave(blob: Blob | string, filename: string) {
    if (isElectron()) {
        try {
            const electron = (window as any).electron;
            
            // 1. Get the path from user via native dialog
            const savePath = await electron.selectSavePath(filename);
            if (!savePath) return; // Case: User cancelled

            // 2. Perform the native write
            if (typeof blob === 'string') {
                // It's a dataURL (text/image/pdf generated in UI)
                await electron.saveFileFromDataURL(savePath, blob);
            } else {
                // It's a Blob (zip/binary)
                const arrayBuffer = await blob.arrayBuffer();
                // Send as Uint8Array (works best with Electron IPC)
                const uint8Array = new Uint8Array(arrayBuffer);
                await electron.saveFileFromBuffer(savePath, uint8Array);
            }
            
            // Optional: Auto-reveal in explorer
            // await electron.showItemInFolder(savePath);
            return true;
        } catch (error) {
            console.error('Desktop save engine failed:', error);
            // Non-critical: Try fallback
        }
    }

    // WEB FALLBACK
    saveAs(blob, filename);
}

/**
 * Common App Folders
 */
export async function openDesktopFolder() {
    if (isElectron()) {
        const paths = await (window as any).electron.getAppPaths();
        await (window as any).electron.openPath(paths.desktop);
    }
}

export async function openSystemPath(path: string) {
    if (isElectron()) {
        await (window as any).electron.openPath(path);
    }
}
