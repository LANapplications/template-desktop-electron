import { clientRepository } from "../repository/clientRepository";
import type { Client, NewClient, UpdateClient } from "../database/tables";


export const clientService = {
  getClients(): Client[] {
    return clientRepository.findAll();
  },

  getClient(id: number): Client | undefined {
    return clientRepository.findById(id);
  },

  createClient(data: NewClient): Client {
    const name = data.name?.trim();
    const email = data.email?.trim();

    if (!name) throw new Error("El nombre es obligatorio");
    if (!email) throw new Error("El email es obligatorio");

    return clientRepository.create({ name, email });
  },

  updateClient(id: number, data: UpdateClient): Client | undefined {
    return clientRepository.update(id, data);
  },

  deleteClient(id: number): boolean {
    return clientRepository.remove(id);
  },
};
