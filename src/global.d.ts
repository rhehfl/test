export interface IElectronAPI {
  getScreenSource: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
