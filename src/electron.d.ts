export interface IElectronAPI {
  sendMessage: (msg: string) => void;
  onResponse: (callback: (response: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}