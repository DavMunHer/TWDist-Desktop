import { contextBridge, ipcRenderer } from 'electron';

/** Duplicated here — sandboxed preload cannot require sibling modules. */
interface ElectronAppConfig {
  apiBaseUrl: string;
  useBearerAuth?: boolean;
}

const CONFIG_ARG_PREFIX = '--electron-config=';

function readConfigFromPreloadArgv(argv: string[]): ElectronAppConfig | null {
  const encoded = argv.find((entry) => entry.startsWith(CONFIG_ARG_PREFIX));
  if (!encoded) {
    return null;
  }

  const json = Buffer.from(encoded.slice(CONFIG_ARG_PREFIX.length), 'base64').toString('utf8');
  return JSON.parse(json) as ElectronAppConfig;
}

const cachedAppConfig = readConfigFromPreloadArgv(process.argv);

if (cachedAppConfig) {
  contextBridge.exposeInMainWorld('__electronRuntimeConfig', cachedAppConfig);
}

contextBridge.exposeInMainWorld('electronAPI', {
  getAppConfig: () => Promise.resolve(cachedAppConfig ?? ipcRenderer.invoke('get-app-config')),

  sendMessage: (message: string) =>
    ipcRenderer.send('message-channel', message),

  onResponse: (callback: (response: unknown) => void) =>
    ipcRenderer.on('response-channel', (_event, value) => callback(value)),
});
