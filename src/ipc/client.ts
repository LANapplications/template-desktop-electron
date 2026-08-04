import { ClientType, NewClientType, UpdateClientType } from "../types";


// Estas funciones solo cruzan el puente IPC hacia el proceso main, que a su vez
// pega al backend. El renderer no conoce URLs ni tokens.


export const getClients = async (): Promise<ClientType[]> => {
  return await window.ipcRenderer.invoke("getClients");
};


export const createClient = async (
  data: NewClientType
): Promise<ClientType> => {
  return await window.ipcRenderer.invoke("createClient", data);
};


export const updateClient = async (
  id: string,
  data: UpdateClientType
): Promise<ClientType> => {
  return await window.ipcRenderer.invoke("updateClient", id, data);
};


export const deleteClient = async (id: string): Promise<boolean> => {
  return await window.ipcRenderer.invoke("deleteClient", id);
};
