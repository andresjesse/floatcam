import { ConfigSchema } from "../schemas/config";

export interface ElectronAPI {
  logToMain: (msg: string) => void;
  sendSync: (chan: string, message: unknown) => boolean;
  onMessageReceived: (
    chan: string,
    callback: (event: unknown, message: unknown) => void,
  ) => void;
  readConfig(): Promise<{ read: boolean; data?: ConfigSchema }>;
  saveConfig: (attribute: keyof ConfigSchema, value: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
