import { ClientType, NewClientType, UpdateClientType } from "../types";


export const getClients = async (): Promise<ClientType[]> => {
  return await window.ipcRenderer.invoke("getClients");
};


export const getClient = async (
  id: number
): Promise<ClientType | undefined> => {
  return await window.ipcRenderer.invoke("getClient", id);
};


export const createClient = async (
  data: NewClientType
): Promise<ClientType> => {
  return await window.ipcRenderer.invoke("createClient", data);
};


export const updateClient = async (
  id: number,
  data: UpdateClientType
): Promise<ClientType | undefined> => {
  return await window.ipcRenderer.invoke("updateClient", id, data);
};


export const deleteClient = async (id: number): Promise<boolean> => {
  return await window.ipcRenderer.invoke("deleteClient", id);
};
