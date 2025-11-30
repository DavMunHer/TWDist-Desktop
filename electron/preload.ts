import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) =>
    ipcRenderer.send('message-channel', message),

  onResponse: (callback: (response: any) => void) =>
    ipcRenderer.on('response-channel', (_event, value) => callback(value)),
});
