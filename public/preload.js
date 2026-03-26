"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    logToMain: (msg) => electron_1.ipcRenderer.send("log-to-main", msg),
    sendSync: (chan, message) => electron_1.ipcRenderer.sendSync(chan, message),
    onMessageReceived: (chan, callback) => electron_1.ipcRenderer.on(chan, callback),
    readConfig: () => electron_1.ipcRenderer.invoke("get-config-file"),
    saveConfig: (attribute, value) => electron_1.ipcRenderer.invoke("set-config-file", attribute, value),
    hideConfigWindow: () => electron_1.ipcRenderer.send("hide-config-window"),
});
