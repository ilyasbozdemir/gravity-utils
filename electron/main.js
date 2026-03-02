const { app, BrowserWindow, shell, ipcMain, dialog, Menu, Notification, protocol } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const os = require('os');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// 🚀 INTEGRATE BOZDEMIR ENGINE
const Engine = require('./engine/index');

/**
 * 🔒 CUSTOM PROTOCOLS - NO MORE WHITE SCREEN
 * Replacing file:// with app:// to handle Next.js static asset resolution properly.
 * This is the professional standard to fix "Path not found" errors in Electron SPA.
 */
function registerAppProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    // 1. Remove the protocol prefix
    let url = request.url.replace('app://', '');
    
    // 2. CRITICAL: On Windows, leading slashes in path.join can resolve to drive root.
    // We strip any leading/trailing slash/dot to ensure we stay relative to 'out'.
    url = decodeURIComponent(url).replace(/^\/+/, ''); // Strip leading slashes
    
    try {
      // 3. Resolve to the real 'out' folder
      let filePath = path.join(__dirname, '../out', url);
      
      // 4. Default to index.html for root or SPA paths
      if (!url || url === '.' || url === './') {
          filePath = path.join(__dirname, '../out/index.html');
      }

      // 5. Handle Directories (especially for trailingSlash: true)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
         filePath = path.join(filePath, 'index.html');
      }

      // 6. Check existence, fallback to index.html for SPA (Client Side Routing)
      if (!fs.existsSync(filePath)) {
          // If it's a static file request (._next, png etc) but missing, it might really be missing.
          // But for general URL paths, we want index.html.
          if (!url.includes('.')) {
              filePath = path.join(__dirname, '../out/index.html');
          }
      }
      
      callback({ path: path.normalize(filePath) });
    } catch (error) {
       console.error('Bozdemir Protocol Error:', error);
       callback({ error: -6 });
    }
  });
}

/**
 * Auto-Updater (OTA) - Ilyas Bozdemir Desktop Engine Standard
 */
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', (info) => {
  new Notification({ title: 'Bozdemir Engine Güncellemesi', body: `Yeni sürüm (${info.version}) indiriliyor...` }).show();
});

/**
 * Main Window Configuration
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    title: "Gravity Utils - Ilyas Bozdemir Engine v1.0",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/logo.png'),
    titleBarStyle: 'hidden',
    backgroundColor: '#0b101b'
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools();
  } else {
    // 🌐 CUSTOM L-PROTOCOL LOADING (FIXED WHITE SCREEN)
    win.loadURL('app://./index.html');
  }

  // Intercept external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Custom Application Menu (Ilyas Bozdemir Signature)
  setupMenu();
}

function setupMenu() {
  const template = [
    { label: 'Gravity Utils', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'Düzenle', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }] },
    { label: 'Görünüm', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { label: 'Geliştirici Destek', submenu: [
        { label: 'Güncellemeleri Denetle', click: () => autoUpdater.checkForUpdatesAndNotify() },
        { label: 'Bozdemir Engine Durumu', click: async () => {
            const status = await Engine.getStatus();
            dialog.showMessageBox({ title: 'Engine Status', message: `Versiyon: ${status.version}\nMotor: ${status.id}\nDurum: ${status.status}\nFiziksel Bellek: ${Math.round(status.memory)}MB` });
        }},
        { label: 'Sistem Loglarını Gör', click: () => shell.openPath(app.getPath('userData')) },
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/**
 * 🛠️ IPC HANDLERS - THE REAL MOTOR CONTROL
 */

// Native Engine Status
ipcMain.handle('engine-get-status', async () => {
    return await Engine.getStatus();
});

// Helper for Native File Manipulation (The Core Motor)
ipcMain.handle('native-file-process', async (event, { type, data }) => {
    // This is where we separate Next.js logic from Electron Engine.
    switch(type) {
        case 'IMAGE_TO_PDF':
            const { buffer, ext } = data;
            const pdfBuffer = await Engine.imageToPdfNative(Buffer.from(buffer), ext);
            return { success: true, buffer: pdfBuffer };
            
        case 'PDF_MERGE':
            const mergedBuffer = await Engine.nativeMergePdfs(data.buffers.map(b => Buffer.from(b)));
            return { success: true, buffer: mergedBuffer };
            
        default:
            return { success: false, error: 'Unknown process type' };
    }
});

// Native File System Ops
ipcMain.handle('get-system-info', () => ({
    platform: process.platform, arch: process.arch, cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    user: os.userInfo().username
}));

ipcMain.handle('open-path', async (event, pathStr) => {
  if (!pathStr) return { success: false, error: 'Path required' };
  const error = await shell.openPath(pathStr);
  return { success: !error, error };
});

ipcMain.handle('show-item-in-folder', (event, pathStr) => shell.showItemInFolder(pathStr));

ipcMain.handle('get-app-paths', () => ({
  desktop: app.getPath('desktop'), documents: app.getPath('documents'),
  downloads: app.getPath('downloads'), userData: app.getPath('userData')
}));

ipcMain.handle('select-save-path', async (event, defaultName) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('downloads'), defaultName),
    title: 'Gravity Utils - Dosyayı Kaydet'
  });
  return canceled ? null : filePath;
});

// NATIVE FILE WRITE ENGINE (NOT THROUGH BROWSER MEMORY LIMITS)
ipcMain.handle('save-file-from-buffer', async (event, { filePath, buffer }) => {
    try {
        fs.writeFileSync(filePath, Buffer.from(buffer));
        new Notification({ title: 'Dosya Kaydedildi', body: `${path.basename(filePath)} başarıyla kaydedildi.`, icon: path.join(__dirname, '../public/logo.png') }).show();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

/**
 * APP LIFECYCLE
 */
app.whenReady().then(() => {
  // 1. Fix protocol issues first
  registerAppProtocol();
  
  // 2. Create window
  createWindow();
  
  // 3. OTA Check
  if (!isDev) autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
