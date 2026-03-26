import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ConfigSchema } from "../src/schemas/config";

export interface ElectronAPI {
  sendSync: (chan: string, message: unknown) => boolean;
  onMessageReceived: (
    chan: string,
    callback: (event: IpcRendererEvent, message: unknown) => void,
  ) => void;
}

contextBridge.exposeInMainWorld("electronAPI", {
  logToMain: (msg: string) => ipcRenderer.send("log-to-main", msg),
  sendSync: (chan: string, message: unknown) =>
    ipcRenderer.sendSync(chan, message),
  onMessageReceived: (
    chan: string,
    callback: (event: IpcRendererEvent, message: unknown) => void,
  ) => ipcRenderer.on(chan, callback),
  readConfig: () => ipcRenderer.invoke("get-config-file"),
  saveConfig: (attribute: keyof ConfigSchema, value: string) =>
    ipcRenderer.invoke("set-config-file", attribute, value),
  hideConfigWindow: () => ipcRenderer.send("hide-config-window"),
} as ElectronAPI);
