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
  selectSavePath: (defaultName) => ipcRenderer.invoke('select-save-path', defaultName),
  
  // 🔥 BOZDEMIR ENGINE NATIVE CALLS
  getEngineStatus: () => ipcRenderer.invoke('engine-get-status'),
  nativeProcess: (type, data) => ipcRenderer.invoke('native-file-process', { type, data }),
  
  // Save Helpers (High-Performance Write)
  saveFileFromDataURL: (filePath, dataUrl) => ipcRenderer.invoke('save-file-from-dataurl', { filePath, dataUrl }),
  saveFileFromBuffer: (filePath, buffer) => ipcRenderer.invoke('save-file-from-buffer', { filePath, buffer }),
  
  // Developer Metadata
  developer: 'Ilyas Bozdemir',
  appVersion: '1.0.0',
  engine: 'Bozdemir Desktop Engine v2.0.0',
  reportUIError: (error) => ipcRenderer.send('report-ui-error', error)
});
