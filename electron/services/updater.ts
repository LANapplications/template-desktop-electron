import { autoUpdater } from "electron-updater";
import { dialog } from "electron";
import log from "electron-log";


export function setupUpdater() {
  autoUpdater.logger = log;


  autoUpdater.on("update-available", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Actualización disponible",
      message:
        "Se encontró una nueva versión. Se descargará automáticamente en segundo plano.",
    });
  });


  autoUpdater.on("download-progress", (progress) => {
    console.log(`Descargando update: ${Math.round(progress.percent)}%`);
  });


  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "Actualización lista",
        message: "La aplicación se actualizará ahora.",
      })
      .then(() => {
        autoUpdater.quitAndInstall();
      });
  });


  autoUpdater.on("error", (err) => {
    log.error("Updater error:", err);
  });
}


export function checkForUpdates() {
  autoUpdater.checkForUpdates();
}
