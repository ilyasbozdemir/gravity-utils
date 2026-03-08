const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // General (Branding by Ilyas Bozdemir)
  openExternal: (url) => shell.openExternal(url),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
  
  // OS & Paths
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getAppPaths: () => ipcRenderer.invoke('get-app-paths'),
  
  // File System (Native Desktop Engine)
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  selectOpenPath: (options) => ipcRenderer.invoke('select-open-path', options),
  selectSavePath: (defaultName) => ipcRenderer.invoke('select-save-path', defaultName),
  
  // 🔥 BOZDEMIR ENGINE NATIVE CALLS
  getEngineStatus: () => ipcRenderer.invoke('engine-get-status'),
  nativeProcess: (type, data) => ipcRenderer.invoke('native-file-process', { type, data }),
  
  // Save Helpers (High-Performance Write)
  saveFileFromDataURL: (filePath, dataUrl) => ipcRenderer.invoke('save-file-from-dataurl', { filePath, dataUrl }),
  saveFileFromBuffer: (filePath, buffer) => ipcRenderer.invoke('save-file-from-buffer', { filePath, buffer }),
  
  // OS System Ops (Admin Tools)
  runAdminCommand: (commandName) => ipcRenderer.invoke('run-admin-command', commandName),
  
  // Developer Metadata
  developer: 'Ilyas Bozdemir',
  appVersion: '1.0.0',
  engine: 'Bozdemir Desktop Engine v2.0.0',
  reportUIError: (error) => ipcRenderer.send('report-ui-error', error),
  
  // Theming
  sendThemeChange: (theme) => ipcRenderer.send('theme-changed', theme),
  
  // 🖋️ Native Font Engine (Desktop Exclusive - Bozdemir)
  // Lists all installed system fonts (TTF/OTF)
  getSystemFonts: () => ipcRenderer.invoke('get-system-fonts'),
  // Reads a specific font file as base64 for embedding in PDF/DOCX
  readFontFile: (fontPath) => ipcRenderer.invoke('read-font-file', fontPath),
  // Finds a font by display name (e.g. 'Times New Roman') → returns base64
  // Solves multi-font PDFs where different fonts are referenced by name
  findFontByName: (fontName) => ipcRenderer.invoke('find-font-by-name', fontName)
});
