import { ipcMain } from "electron";
import { clientService } from "../service/clientService";
import type { NewClient, UpdateClient } from "../database/tables";


export function registerClientIPC(): void {
  ipcMain.handle("getClients", () => clientService.getClients());

  ipcMain.handle("getClient", (_event, id: number) =>
    clientService.getClient(id)
  );

  ipcMain.handle("createClient", (_event, data: NewClient) =>
    clientService.createClient(data)
  );

  ipcMain.handle("updateClient", (_event, id: number, data: UpdateClient) =>
    clientService.updateClient(id, data)
  );

  ipcMain.handle("deleteClient", (_event, id: number) =>
    clientService.deleteClient(id)
  );
}
