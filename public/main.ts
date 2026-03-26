import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  systemPreferences,
} from "electron";
import { ConfigSchema } from "../src/schemas/config";

const os = require("os");
const fs = require("fs").promises;
const path = require("path");

interface WindowMessage {
  type: string;
  payload?: {
    width?: string;
    height?: string;
    [key: string]: unknown;
  };
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
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

  const loadURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`;

  win.loadURL(loadURL);
  win.removeMenu();
  win.setMenuBarVisibility(false);

  win.on("show", () => {
    setTimeout(() => {
      win.minimize();
    }, 500); // A 50ms buffer often solves OS-level race conditions
  });

  return win;
}

function createCameraWindow(): BrowserWindow {
  const win = new BrowserWindow({
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

app.whenReady().then(async () => {
  let camAllowed = true;

  if (os.platform() === "darwin") {
    camAllowed = await systemPreferences
      .askForMediaAccess("camera")
      .then(async (access: boolean) => {
        if (!access) {
          new Notification({
            title: "Camera Access",
            body: "Camera access is required to use this app",
          }).show();
          return false;
        }
        return true;
      });
  }

  if (!camAllowed) {
    app.quit();
    return;
  }

  const mainWindow = createMainWindow();
  const camWindow = createCameraWindow();
  camWindow.setAlwaysOnTop(true, "floating", 1);

  ipcMain.on("shared-window-channel", (event, arg: WindowMessage) => {
    // Handle exit app request
    if (arg.type === "exit-app") {
      app.quit();
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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

ipcMain.on("log-to-main", (_, msg) => {
  console.log("[Renderer Log]:", msg);
});

ipcMain.handle("get-config-file", async () => {
  const filePath = path.join(app.getPath("home"), ".floatcam-config.json");

  try {
    console.log("Reading config file:", filePath);

    const fileContent = await fs.readFile(filePath, "utf-8");

    console.log("File content read:", fileContent);

    const data = ConfigSchema.parse(JSON.parse(fileContent));

    console.log("File content parsed:", data);

    return {
      read: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return { read: false };
  }
});

ipcMain.handle("set-config-file", async (_event, attribute, value) => {
  const filePath = path.join(app.getPath("home"), ".floatcam-config.json");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");

    console.log("File content read:", fileContent);

    let data = ConfigSchema.parse(JSON.parse(fileContent));

    data[attribute as keyof ConfigSchema] = value;

    const stringData = JSON.stringify(data, null, 2);

    await fs.writeFile(filePath, stringData, "utf-8");

    console.log("File content written:", stringData);

    return { success: true };
  } catch (error) {
    console.error("Failed to save config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
