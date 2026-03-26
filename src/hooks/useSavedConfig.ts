import { useEffect } from "react";
import { ConfigSchema } from "../schemas/config";

const { electronAPI } = window;

export default function useSavedConfig() {
  useEffect(() => {
    const loadFile = async () => {
      const result = await window.electronAPI.readConfig();

      electronAPI.logToMain(`Config read: ${JSON.stringify(result)}`);

      if (result.read && result.data) {
        applyConfig(result.data);
      }
    };

    loadFile();
  }, []);

  const applyConfig = (config: ConfigSchema): void => {
    // mirror
    if (config["set-camera-mirror"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-camera-mirror",
        payload: JSON.parse(config["set-camera-mirror"]),
      });
    }

    // filter
    if (config["set-video-filter"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-video-filter",
        payload: JSON.parse(config["set-video-filter"]),
      });
    }

    // shape
    if (config["set-camera-shape"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-camera-shape",
        payload: JSON.parse(config["set-camera-shape"]),
      });
    }

    // resolution
    if (config["set-camera-resolution"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-camera-resolution",
        payload: {
          width: config["set-camera-resolution"],
          height: config["set-camera-resolution"],
        },
      });
    }

    // border
    if (config["set-border-width"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-border-width",
        payload: config["set-border-width"],
      });
    }

    if (config["set-border-style"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-border-style",
        payload: config["set-border-style"],
      });
    }

    if (config["set-border-color"]) {
      electronAPI.sendSync("shared-window-channel", {
        type: "set-border-color",
        payload: config["set-border-color"],
      });
    }
  };
}
