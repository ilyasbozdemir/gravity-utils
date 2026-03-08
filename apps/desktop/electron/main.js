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
 * 
 * 🐛 FIX: Electron parses `app://index.html` with `index.html` as the hostname,
 * not the pathname. So we must use URL parsing and strip the hostname.
 * Previously `app://index.html/assets/xx.js` resolved to:
 *   out/index.html/assets/xx.js  ← WRONG (blank screen bug)
 * Now resolves correctly to:
 *   out/assets/xx.js             ← CORRECT
 */
function setupProtocol() {
  protocol.handle('app', async (request) => {
    try {
        const baseDir = path.normalize(path.join(__dirname, '../out'));

        // Proper URL parse – strips hostname (e.g. 'index.html') + gets pathname
        const parsedUrl = new URL(request.url);
        // pathname for `app://index.html/assets/x.js` is `/assets/x.js`
        // pathname for `app://index.html` is `/`
        let urlPath = decodeURIComponent(parsedUrl.pathname).replace(/^\//, '');

        // Route root or empty path → serve index.html
        if (!urlPath || urlPath === '') {
            urlPath = 'index.html';
        }

        let fullPath = path.join(baseDir, urlPath);

        // If directory, look for index.html inside
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            fullPath = path.join(fullPath, 'index.html');
        }

        // SECURE FALLBACK LOGIC
        const isAsset = urlPath.includes('.');
        if (!fs.existsSync(fullPath)) {
            if (!isAsset) {
                // SPA fallback: unknown routes → index.html
                fullPath = path.join(baseDir, 'index.html');
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
    // ✅ Use loadFile for production — avoids protocol hostname parse issues.
    // Electron handles relative asset paths (./assets/...) correctly this way.
    const indexPath = path.join(__dirname, '../out/index.html');
    win.loadFile(indexPath);
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

/**
 * 🖋️ NATIVE FONT ENGINE - Bozdemir Desktop Exclusive
 * Platform-aware: Windows, macOS, Linux
 * Reads local system fonts so Word→PDF conversions use real installed fonts
 * instead of downloading Roboto from a CDN every time.
 */

// ─── Platform-specific font directories ────────────────────────────
function getSystemFontDirs() {
    if (process.platform === 'win32') {
        return [
            path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts'),
            path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts')
        ];
    } else if (process.platform === 'darwin') {
        return [
            // System-wide
            '/System/Library/Fonts',
            '/System/Library/Fonts/Supplemental', // Times New Roman, Arial, etc.
            '/Library/Fonts',
            // User fonts
            path.join(os.homedir(), 'Library', 'Fonts'),
            // Microsoft Office fonts on Mac (if Office installed)
            '/Library/Application Support/Microsoft/Fonts',
            path.join(os.homedir(), 'Library', 'Application Support', 'Microsoft', 'Fonts')
        ];
    } else {
        // Linux
        return [
            '/usr/share/fonts',
            '/usr/local/share/fonts',
            '/usr/share/fonts/truetype',
            '/usr/share/fonts/opentype',
            path.join(os.homedir(), '.fonts'),
            path.join(os.homedir(), '.local', 'share', 'fonts')
        ];
    }
}

// ─── Recursive font scanner ─────────────────────────────────────────
function scanFontsInDir(dir, fonts = [], depth = 0) {
    if (depth > 3) return; // Guard against deep recursion
    if (!fs.existsSync(dir)) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // On Windows fonts are flat, on Mac/Linux they may be nested
            if (process.platform !== 'win32') {
                scanFontsInDir(fullPath, fonts, depth + 1);
            }
        } else if (/\.(ttf|otf)$/i.test(entry.name)) {
            const name = entry.name.replace(/\.[^.]+$/, '');
            // Normalize: 'TimesNewRoman' → 'Times New Roman'
            const normalized = name
                .replace(/-?(Regular|Bold|Italic|Light|Medium|Semibold|Black|Condensed|Narrow).*$/i, '')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .trim();
            fonts.push({
                name,           // e.g. 'TimesNewRoman'
                normalized,     // e.g. 'Times New Roman'
                path: fullPath
            });
        }
    }
}

ipcMain.handle('get-system-fonts', async () => {
    try {
        const fontDirs = getSystemFontDirs();
        const fonts = [];
        for (const dir of fontDirs) {
            scanFontsInDir(dir, fonts);
        }
        // Deduplicate by path
        const seen = new Set();
        const unique = fonts.filter(f => {
            if (seen.has(f.path)) return false;
            seen.add(f.path);
            return true;
        });
        logToDisk(`[Font Engine] ${unique.length} sistem fontu bulundu (${process.platform})`);
        return { success: true, fonts: unique };
    } catch (err) {
        logToDisk(`[Font Engine] Hata: ${err.message}`);
        return { success: false, error: err.message, fonts: [] };
    }
});

/**
 * 🔍 FIND FONT BY NAME - PDF'deki font adını sisteme eşle
 * Örnek: PDF'de 'Times New Roman' yazıyor → sistemde dosyayı bul
 * Bu PDFdeki çoklu font sorununu çözer.
 */
ipcMain.handle('find-font-by-name', async (event, fontName) => {
    try {
        const fontDirs = getSystemFontDirs();
        const fonts = [];
        for (const dir of fontDirs) scanFontsInDir(dir, fonts);

        const search = fontName.toLowerCase().replace(/[\s-]/g, '');

        // Exact match first
        let found = fonts.find(f =>
            f.name.toLowerCase().replace(/[\s-]/g, '') === search ||
            f.normalized.toLowerCase().replace(/[\s-]/g, '') === search
        );
        // Partial match fallback
        if (!found) {
            found = fonts.find(f =>
                f.name.toLowerCase().replace(/[\s-]/g, '').includes(search) ||
                search.includes(f.normalized.toLowerCase().replace(/[\s-]/g, ''))
            );
        }
        if (found) {
            const buffer = fs.readFileSync(found.path);
            return { success: true, name: found.name, path: found.path, base64: buffer.toString('base64') };
        }
        return { success: false, error: `Font bulunamadı: ${fontName}` };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

/**
 * 📖 NATIVE FONT READER - Load a specific font file as base64 for embedding
 */
ipcMain.handle('read-font-file', async (event, fontPath) => {
    try {
        // Security: only allow reading from known font directories
        const allowedDirs = getSystemFontDirs();
        // Normalize both paths for comparison (handles trailing slashes, case on mac)
        const isAllowed = allowedDirs.some(d => {
            const norm = (p) => path.normalize(p).toLowerCase();
            return norm(fontPath).startsWith(norm(d));
        });
        if (!isAllowed) {
            logToDisk(`[Font Engine] ⛔ Yetkisiz font yolu: ${fontPath}`);
            return { success: false, error: 'Unauthorized font path' };
        }
        const buffer = fs.readFileSync(fontPath);
        return { success: true, base64: buffer.toString('base64') };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

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
