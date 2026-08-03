import { app, BrowserWindow } from "electron";


// config
import "./config/constants";


// services
import { setupLogger } from "./services/logger";
import { setupUpdater, checkForUpdates } from "./services/updater";


// window
import { createWindow } from "./window/createWindow";


setupLogger();  //quitar si no se quiere loggear en un archivo
setupUpdater(); //quitar si no se quiere usar el autoUpdate


app.whenReady().then(() => {
  createWindow();
  if (app.isPackaged) {
    checkForUpdates();
  }
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});