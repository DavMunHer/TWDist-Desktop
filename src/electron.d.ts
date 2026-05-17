export interface ElectronAppConfig {
  apiBaseUrl: string;
  useBearerAuth?: boolean;
}

export interface IElectronAPI {
  getAppConfig?: () => Promise<ElectronAppConfig | null>;
  sendMessage: (msg: string) => void;
  onResponse: (callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
    /** Set synchronously by Electron preload when the shell injects config. */
    __electronRuntimeConfig?: ElectronAppConfig;
  }
}
