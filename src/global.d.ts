export interface IElectronAPI {
  getScreenSource: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
  interface MediaTrackConstraints {
    mandatory?: {
      chromeMediaSource: string;
      chromeMediaSourceId: string;
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    };
  }
}
