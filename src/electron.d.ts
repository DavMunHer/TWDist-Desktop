export interface IElectronAPI {
  sendMessage: (msg: string) => void;
  onResponse: (callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}