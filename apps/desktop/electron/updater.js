const { autoUpdater } = require('electron-updater')
const { ipcMain } = require('electron')
const log = require('electron-log')

autoUpdater.logger = log
autoUpdater.autoDownload = false

function initUpdater(win) {
  autoUpdater.checkForUpdates()

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update:available', info)
  })
  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update:not-available')
  })
  autoUpdater.on('download-progress', (p) => {
    win.webContents.send('update:progress', p)
  })
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update:downloaded')
  })

  ipcMain.on('update:download', () => autoUpdater.downloadUpdate())
  ipcMain.on('update:install', () => autoUpdater.quitAndInstall())
}

module.exports = { initUpdater }
