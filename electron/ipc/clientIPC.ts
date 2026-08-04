import { ipcMain } from "electron";
import { clientApi } from "../api/clientApi";
import type { NewClient, UpdateClient } from "../types";


export function registerClientIPC(): void {
  ipcMain.handle("getClients", () => clientApi.findAll());

  ipcMain.handle("createClient", (_event, data: NewClient) =>
    clientApi.create(data)
  );

  ipcMain.handle("updateClient", (_event, id: string, data: UpdateClient) =>
    clientApi.update(id, data)
  );

  ipcMain.handle("deleteClient", (_event, id: string) =>
    clientApi.remove(id)
  );
}
