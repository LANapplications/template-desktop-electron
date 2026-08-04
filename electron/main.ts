import { app, BrowserWindow } from "electron";


// config
import "./config/constants";


// setup (arranque de la app: logging y auto-update)
import { setupLogger } from "./setup/logger";
import { setupUpdater, checkForUpdates } from "./setup/updater";


// window
import { createWindow } from "./window/createWindow";


// ipc
import { registerClientIPC } from "./ipc/clientIPC";


// database
import { closeDatabase } from "./database/database";


setupLogger();  //quitar si no se quiere loggear en un archivo
setupUpdater(); //quitar si no se quiere usar el autoUpdate


app.whenReady().then(() => {
  registerClientIPC(); //registra los handlers IPC de Client (CRUD)
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


app.on("before-quit", () => {
  closeDatabase();
});


app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
