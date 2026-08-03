import log from "electron-log";
import path from "node:path";
import fs from "fs";


export function setupLogger() {
  log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s} [{level}] {text}";
  log.transports.file.maxSize = 5 * 1024 * 1024;
  log.transports.file.level = "info";


  try {
    const logsDir = path.dirname(log.transports.file.getFile().path);
    const files = fs.readdirSync(logsDir).filter((f) => f.startsWith("main"));


    if (files.length > 5) {
      const sorted = files
        .map((f) => ({
          name: f,
          time: fs.statSync(path.join(logsDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);


      sorted.slice(5).forEach((f) => {
        fs.unlinkSync(path.join(logsDir, f.name));
      });
    }
  } catch (e) {
    log.warn("No se pudieron limpiar logs:", e);
  }


  return log;
}
