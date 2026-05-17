import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

import { loadElectronAppConfig } from './app-config';
import { encodeConfigForPreload } from './preload-config';
import {
  APP_SCHEME,
  getAppIndexUrl,
  getBrowserDistPath,
  registerAppProtocol,
  registerAppScheme,
} from './static-protocol';

let mainWindow: BrowserWindow | null;

registerAppScheme();

function createWindow(): void {
  const isDev = process.env['NODE_ENV'] === 'development';
  const electronConfig = loadElectronAppConfig();
  const preloadPath = path.join(__dirname, 'preload.js');
  const additionalArguments = electronConfig
    ? [encodeConfigForPreload(electronConfig)]
    : [];

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      additionalArguments,
      webSecurity: isDev,
    },
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${APP_SCHEME}:`) && !url.startsWith('http://localhost:')) {
      event.preventDefault();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(getAppIndexUrl()).catch((error) => console.error(error));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const isDev = process.env['NODE_ENV'] === 'development';

  if (!isDev) {
    registerAppProtocol(getBrowserDistPath());
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-config', () => loadElectronAppConfig());

ipcMain.on('message-channel', (event, message) => {
  console.log(`Mensaje recibido desde Angular: ${message}`);
  event.reply('response-channel', 'Hola desde Electron Main process!');
});
