/// <reference types="vite/client" />

interface Window {
  electron: {
    getSystemInfo: () => Promise<any>;
    selectOpenPath: (options: { title?: string; filters?: any[]; properties?: string[] }) => Promise<any[] | null>;
    selectSavePath: (defaultPath: string) => Promise<string | null>;
    saveFileFromBuffer: (params: { filePath: string; buffer: ArrayBuffer }) => Promise<{ success: boolean; error?: string }>;
    showItemInFolder: (path: string) => void;
    openPath: (path: string) => Promise<{ success: boolean; error?: string }>;
    getAppPaths: () => Promise<any>;
    reportUIError: (error: any) => void;
    engineGetStatus: () => Promise<any>;
    nativeFileProcess: (params: { type: string; data: any }) => Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }>;
  };
}
