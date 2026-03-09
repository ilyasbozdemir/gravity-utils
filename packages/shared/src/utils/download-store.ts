/**
 * BOZDEMIR DOWNLOAD STORE
 * Tracks all file downloads made within the app.
 * Persists to localStorage so history survives page reloads.
 */

export interface DownloadEntry {
    id: string;
    fileName: string;
    originalName: string;
    fileType: string;       // e.g. 'pdf', 'docx', 'xlsx', 'jpg', 'zip'
    sizeBytes: number;
    downloadedAt: number;   // timestamp ms
    blob?: Blob;            // kept in memory for re-download (not persisted)
    tool: string;           // e.g. 'Word→PDF', 'PDF→Word', 'Görsel→PDF'
}

const STORAGE_KEY = 'gravity_downloads_v1';
const MAX_ENTRIES = 50;

type Listener = (entries: DownloadEntry[]) => void;

class DownloadStore {
    private entries: DownloadEntry[] = [];
    private listeners: Set<Listener> = new Set();

    constructor() {
        this.load();
    }

    private load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as DownloadEntry[];
                // Blobs are not serializable — strip them on load
                this.entries = parsed.map(e => ({ ...e, blob: undefined }));
            }
        } catch {
            this.entries = [];
        }
    }

    private save() {
        try {
            // Strip blob before persisting
            const toSave = this.entries.map(({ blob: _b, ...rest }) => rest);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave.slice(0, MAX_ENTRIES)));
        } catch {
            // localStorage might be full — silently ignore
        }
    }

    private notify() {
        this.listeners.forEach(fn => fn([...this.entries]));
    }

    subscribe(fn: Listener): () => void {
        this.listeners.add(fn);
        fn([...this.entries]);
        return () => this.listeners.delete(fn);
    }

    getAll(): DownloadEntry[] {
        return [...this.entries];
    }

    add(entry: Omit<DownloadEntry, 'id' | 'downloadedAt'>): DownloadEntry {
        const full: DownloadEntry = {
            ...entry,
            id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            downloadedAt: Date.now(),
        };
        this.entries = [full, ...this.entries].slice(0, MAX_ENTRIES);
        this.save();
        this.notify();
        return full;
    }

    remove(id: string) {
        this.entries = this.entries.filter(e => e.id !== id);
        this.save();
        this.notify();
    }

    clear() {
        this.entries = [];
        this.save();
        this.notify();
    }

    updateBlob(id: string, blob: Blob) {
        this.entries = this.entries.map(e => e.id === id ? { ...e, blob } : e);
        this.notify();
    }
}

// Singleton
export const downloadStore = new DownloadStore();

/**
 * Trigger a native file save.
 * - In Electron: uses native showSaveDialog → writeFileSync via IPC.
 * - In browser: falls back to URL.createObjectURL + <a>.click().
 */
async function triggerDownload(blob: Blob, fileName: string): Promise<void> {
    const electronAPI = (window as any).electron;

    if (electronAPI?.selectSavePath && electronAPI?.saveFileFromBuffer) {
        // ─── Electron native save dialog ───────────────────────────────
        try {
            const filePath: string | null = await electronAPI.selectSavePath(fileName);
            if (!filePath) return; // user cancelled

            const buffer = await blob.arrayBuffer();
            const result = await electronAPI.saveFileFromBuffer(filePath, Array.from(new Uint8Array(buffer)));
            if (!result?.success) {
                console.error('[DownloadStore] Save failed:', result?.error);
            }
        } catch (err) {
            console.error('[DownloadStore] Electron save error:', err);
        }
    } else {
        // ─── Browser fallback ─────────────────────────────────────────
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);
    }
}

/**
 * Convenience: trigger a browser download AND record it in the store.
 * Use this everywhere instead of calling `saveAs` directly.
 */
export function saveAndRecord(
    blob: Blob,
    fileName: string,
    originalName: string,
    tool: string
): DownloadEntry {
    void triggerDownload(blob, fileName);

    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const entry = downloadStore.add({
        fileName,
        originalName,
        fileType: ext,
        sizeBytes: blob.size,
        blob,
        tool,
    });
    return entry;
}
