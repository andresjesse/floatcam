"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const config_1 = require("../src/schemas/config");
const os = require("os");
const fs = require("fs").promises;
const path = require("path");
function createMainWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 700,
        maximizable: false,
        minimizable: true,
        alwaysOnTop: false,
        resizable: false,
        transparent: true,
        frame: false,
        titleBarStyle: "customButtonsOnHover",
        hasShadow: false,
        autoHideMenuBar: true,
        fullscreenable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: true,
        },
    });
    const loadURL = process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`;
    win.loadURL(loadURL);
    win.removeMenu();
    win.setMenuBarVisibility(false);
    return win;
}
function createCameraWindow() {
    const win = new electron_1.BrowserWindow({
        width: 120,
        height: 120,
        maxWidth: 500,
        maxHeight: 500,
        resizable: false,
        titleBarStyle: "customButtonsOnHover",
        transparent: true,
        darkTheme: false,
        hasShadow: false,
        frame: false,
        alwaysOnTop: true,
        fullscreenable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    win.loadFile(path.join(__dirname, "cam.html"));
    return win;
}
electron_1.app.whenReady().then(async () => {
    let camAllowed = true;
    if (os.platform() === "darwin") {
        camAllowed = await electron_1.systemPreferences
            .askForMediaAccess("camera")
            .then(async (access) => {
            if (!access) {
                new electron_1.Notification({
                    title: "Camera Access",
                    body: "Camera access is required to use this app",
                }).show();
                return false;
            }
            return true;
        });
    }
    if (!camAllowed) {
        electron_1.app.quit();
        return;
    }
    const mainWindow = createMainWindow();
    const camWindow = createCameraWindow();
    camWindow.setAlwaysOnTop(true, "floating", 1);
    electron_1.ipcMain.on("shared-window-channel", (event, arg) => {
        // Handle exit app request
        if (arg.type === "exit-app") {
            electron_1.app.quit();
            event.returnValue = true;
            return;
        }
        // Forward request-webcams to camera window
        if (arg.type === "request-webcams") {
            camWindow.webContents.send("shared-window-channel", arg);
            event.returnValue = true;
            return;
        }
        // Forward all messages to camera window
        camWindow.webContents.send("shared-window-channel", arg);
        // Forward set-webcams to main window
        if (arg.type === "set-webcams") {
            mainWindow.webContents.send("shared-window-channel", arg);
        }
        // Handle camera resolution changes
        if (arg.type === "set-camera-resolution" && arg.payload) {
            let { width, height } = arg.payload;
            if (width && height) {
                // adding 20 just to make sure the window is not too small to fit the camera
                const widthNum = Number(width.replace("px", "")) + 20;
                const heightNum = Number(height.replace("px", "")) + 20;
                camWindow.setSize(widthNum, heightNum);
            }
        }
        event.returnValue = true;
    });
    electron_1.ipcMain.on("hide-config-window", () => {
        if (mainWindow) {
            mainWindow.hide();
        }
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});
electron_1.ipcMain.on("log-to-main", (_, msg) => {
    console.log("[Renderer Log]:", msg);
});
electron_1.ipcMain.handle("get-config-file", async () => {
    const filePath = path.join(electron_1.app.getPath("home"), ".floatcam-config.json");
    try {
        console.log("Reading config file:", filePath);
        const fileContent = await fs.readFile(filePath, "utf-8");
        console.log("File content read:", fileContent);
        const data = config_1.ConfigSchema.parse(JSON.parse(fileContent));
        console.log("File content parsed:", data);
        return {
            read: true,
            data,
        };
    }
    catch (error) {
        console.error(error);
        return { read: false };
    }
});
electron_1.ipcMain.handle("set-config-file", async (_event, attribute, value) => {
    const filePath = path.join(electron_1.app.getPath("home"), ".floatcam-config.json");
    try {
        let fileContent = "{}";
        try {
            fileContent = await fs.readFile(filePath, "utf-8");
        }
        catch (error) {
            // do nothing
        }
        console.log("File content read:", fileContent);
        let data = config_1.ConfigSchema.parse(JSON.parse(fileContent));
        data[attribute] = value;
        const stringData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, stringData, "utf-8");
        console.log("File content written:", stringData);
        return { success: true };
    }
    catch (error) {
        console.error("Failed to save config:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
