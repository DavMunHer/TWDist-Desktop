import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = process.env['NODE_ENV'] === 'development';

  if (isDev) {
    // During development (Angular will be running in localhost:4200)
    mainWindow.loadURL('http://localhost:4200');
    // Open devtools automatically
    mainWindow.webContents.openDevTools();
  } else {
    // When in production, we will load the precompiled angular project
    const indexHtmlPath = path.join(
      __dirname,
      '../dist/twdist-desktop/browser/index.html'
    );

    mainWindow.loadFile(indexHtmlPath).catch((e) => console.error(e));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Example of communication with the IPC
ipcMain.on('message-channel', (event, message) => {
  console.log(`Mensaje recibido desde Angular: ${message}`);
  event.reply('response-channel', 'Hola desde Electron Main process!');
});
