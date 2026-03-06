const { app, BrowserWindow, shell, ipcMain, dialog, Menu, Notification, protocol, net } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const os = require('os');
const fs = require('fs');

// 🛡️ REGISTER PROTOCOL BEFORE APP READY
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  try {
    require('electron-reloader')(module, {
        debug: true,
        watchRenderer: false // Next.js handles renderer reload at localhost:3000
    });
  } catch (_) {}
}

// 🚀 INTEGRATE BOZDEMIR ENGINE
const Engine = require('./engine/index');

// 🛡️ BOZDEMIR CRASH LOGGER - No more hidden errors
const logFile = path.join(app.getPath('userData'), 'bozdemir-crash.log');
function logToDisk(msg) {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
}

logToDisk("--- BOZDEMIR ENGINE STARTING ---");

/**
 * PROTOCOL HANDLER - THE BRIDGE (UPGRADED TO protocol.handle)
 */
function setupProtocol() {
  protocol.handle('app', async (request) => {
    try {
        let urlPath = request.url.replace('app://', '');
        // Clean hostname/dots (e.g., app://./index.html or app://index.html)
        urlPath = decodeURIComponent(urlPath).replace(/^(\.|\/)+/, '');
        
        let baseDir = path.join(__dirname, '../out');
        const outDirNormalized = path.normalize(baseDir);
        let fullPath = path.join(outDirNormalized, urlPath || 'index.html');

        // Handle Next.js trailingSlash: true
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            fullPath = path.join(fullPath, 'index.html');
        }

        // SECURE FALLBACK LOGIC
        const isAsset = urlPath.includes('.');
        if (!fs.existsSync(fullPath)) {
            if (!isAsset) {
                fullPath = path.join(outDirNormalized, 'index.html');
            } else {
                logToDisk(`❌ Asset Missing: ${urlPath} -> ${fullPath}`);
                return new Response('Not Found', { status: 404 });
            }
        }

        return net.fetch('file://' + fullPath);
    } catch (e) {
        logToDisk(`❌ Protocol Critical Failure: ${e.message}`);
        return new Response('Internal Error', { status: 500 });
    }
  });
}

/**
 * Auto-Updater (OTA) - Ilyas Bozdemir Desktop Engine Standard
 */
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
    logToDisk('GitHub üzerinden güncelleme kontrol ediliyor...');
});

autoUpdater.on('update-available', (info) => {
    logToDisk(`Güncelleme bulundu: v${info.version}`);
    new Notification({ title: 'Gravity Update Motoru', body: `Yeni v${info.version} sürümü bulundu, arkaplanda indiriliyor...` }).show();
});

autoUpdater.on('update-not-available', () => {
    logToDisk('Şu an en güncel sürümdesiniz.');
});

autoUpdater.on('error', (err) => {
    logToDisk('OTA Hatası: ' + err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
    // Sadece konsola yazalım veya loglayalım, UI mesajlaşması istenirse eklenecek
    log.info(`İndirme Hızı: ${progressObj.bytesPerSecond} - İndirildi: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
    logToDisk(`Güncelleme başarıyla indirildi: v${info.version}`);
    
    // Kullanıcıya yüklemek isteyip istemediğini sor
    const dialogOpts = {
        type: 'info',
        buttons: ['Yeniden Başlat & Kur', 'Daha Sonra Kur'],
        title: 'Gravity Desktop Güncellemesi',
        message: `Bozdemir Engine Yeni Sürüm: ${info.version}`,
        detail: 'Yeni versiyon arkaplanda başarıyla indirildi. Mevcut uygulamayı kapatıp yeni sürüme geçmek ister misiniz?'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
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
    titleBarOverlay: {
      color: '#0b101b',
      symbolColor: '#74b9ff',
      height: 32
    },
    backgroundColor: '#0b101b'
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // 🌐 Modern protocol loading
    win.loadURL('app://index.html');
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

// Dynamic Titlebar & Theme Synchronization
ipcMain.on('theme-changed', (event, theme) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
        if (theme === 'dark') {
            win.setBackgroundColor('#06070a');
            win.setTitleBarOverlay({
                color: '#06070a',
                symbolColor: '#74b9ff'
            });
        } else {
            win.setBackgroundColor('#ffffff');
            win.setTitleBarOverlay({
                color: '#ffffff',
                symbolColor: '#3b82f6'
            });
        }
    }
});

// Helper for Native File Manipulation (The Core Motor)
ipcMain.handle('native-file-process', async (event, { type, data }) => {
    try {
        logToDisk(`🚀 Native Process Start: ${type}`);
        switch(type) {
            case 'IMAGE_TO_PDF':
                const pdfBuffer = await Engine.imageToPdfNative(Buffer.from(data.buffer), data.ext);
                return { success: true, buffer: pdfBuffer };
            case 'PDF_MERGE':
                const mergedBuffer = await Engine.nativeMergePdfs(data.buffers.map(b => Buffer.from(b)));
                return { success: true, buffer: mergedBuffer };
            default:
                return { success: false, error: 'Unknown process type' };
        }
    } catch (err) {
        logToDisk(`❌ Native Process Error [${type}]: ${err.message}`);
        return { success: false, error: err.message };
    }
});

// UI Error Reporting
ipcMain.on('report-ui-error', (event, error) => {
    logToDisk(`❗ UI EXCEPTION: ${JSON.stringify(error)}`);
});

// Native File System Ops
ipcMain.handle('get-system-info', () => ({
    platform: process.platform, arch: process.arch, cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    user: os.userInfo().username
}));

// Yüksek Yetkili (Admin) İşlemler
ipcMain.handle('run-admin-command', async (event, commandName) => {
    try {
        if (process.platform !== 'win32') return { success: false, error: 'Bu özellik sadece Windows üzerinde çalışır.' };
        
        let psCommand = '';
        switch (commandName) {
            case 'dns-flush':
                psCommand = 'ipconfig /flushdns';
                break;
            case 'temp-clean':
                // Temporarily silme ama önemli OS verilerine dokunma
                psCommand = 'Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path $env:windir\\Temp\\* -Recurse -Force -ErrorAction SilentlyContinue';
                break;
            default:
                return { success: false, error: 'Bilinmeyen yetkili motor komutu' };
        }

        const { exec } = require('child_process');
        return new Promise((resolve) => {
            // -WindowStyle Hidden ensures it doesn't pop up a black terminal loudly for long
            const runCmd = `powershell.exe -Command "Start-Process powershell -ArgumentList '-NoProfile -WindowStyle Hidden -Command ${psCommand}' -Verb RunAs"`;
            exec(runCmd, (error) => {
                if (error) {
                    logToDisk(`Admin Process Canceled/Failed [${commandName}]: ${error.message}`);
                    resolve({ success: false, error: 'Yetki reddedildi veya işlemde hata oluştu.' });
                } else {
                    logToDisk(`Admin Process Success [${commandName}]`);
                    resolve({ success: true });
                }
            });
        });
    } catch (err) {
        return { success: false, error: err.message };
    }
});

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

ipcMain.handle('select-open-path', async (event, { title, filters, properties }) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: title || 'Dosya Seçin',
    filters: filters || [],
    properties: properties || ['openFile', 'multiSelections']
  });
  if (canceled) return null;
  return filePaths.map(p => ({
    name: path.basename(p),
    path: p,
    data: fs.readFileSync(p)
  }));
});

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
  setupProtocol();
  
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
