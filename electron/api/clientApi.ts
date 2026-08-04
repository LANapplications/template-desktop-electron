import { httpClient } from "./httpClient";
import type { Client, NewClient, UpdateClient } from "../types";


export const clientApi = {
  findAll(): Promise<Client[]> {
    return httpClient.get<Client[]>("/clients");
  },

  create(data: NewClient): Promise<Client> {
    return httpClient.post<Client>("/clients", data);
  },

  update(id: string, data: UpdateClient): Promise<Client> {
    return httpClient.put<Client>(`/clients/${id}`, data);
  },

  async remove(id: string): Promise<boolean> {
    // El backend responde { message }; para la UI alcanza con true/false.
    await httpClient.delete<{ message: string }>(`/clients/${id}`);
    return true;
  },
};
