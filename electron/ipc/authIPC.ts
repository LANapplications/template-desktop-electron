import { ipcMain } from "electron";
import { authService } from "../auth/authService";


// Handlers de autenticación.
export function registerAuthIPC(): void {
  ipcMain.handle("auth:login", () => authService.login());
  ipcMain.handle("auth:register", () => authService.register());
  ipcMain.handle("auth:logout", () => authService.logout());
  ipcMain.handle("auth:getUser", () => authService.getUser());
  ipcMain.handle("auth:isAuthenticated", () => authService.isAuthenticated());
}
