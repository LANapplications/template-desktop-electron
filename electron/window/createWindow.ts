import { BrowserWindow, Menu } from "electron";
import path from "node:path";
import {
  __dirname,
  VITE_DEV_SERVER_URL,
  RENDERER_DIST,
} from "../config/constants";


export let win: BrowserWindow | null = null;


export function createWindow() {
  win = new BrowserWindow({
    minWidth: 390,
    minHeight: 550,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      plugins: true,
    },
  });

  win.maximize();


  if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(RENDERER_DIST, "index.html"));


  Menu.setApplicationMenu(null);


  return win;
}
