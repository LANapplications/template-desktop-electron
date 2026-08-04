import { getDatabase } from "../database/database";
import type { Client, NewClient, UpdateClient } from "../database/tables";


// El repository es la ÚNICA capa que habla SQL con la base de datos.
// No tiene lógica de negocio: solo lee y escribe filas.


export const clientRepository = {
  findAll(): Client[] {
    return getDatabase()
      .prepare("SELECT * FROM clients ORDER BY id DESC")
      .all() as Client[];
  },

  findById(id: number): Client | undefined {
    return getDatabase()
      .prepare("SELECT * FROM clients WHERE id = ?")
      .get(id) as Client | undefined;
  },

  create(data: NewClient): Client {
    const info = getDatabase()
      .prepare("INSERT INTO clients (name, email) VALUES (@name, @email)")
      .run(data);

    return this.findById(Number(info.lastInsertRowid))!;
  },

  update(id: number, data: UpdateClient): Client | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    // Mezclamos lo actual con los cambios: así se pueden mandar campos sueltos.
    const merged = { ...current, ...data };

    getDatabase()
      .prepare("UPDATE clients SET name = @name, email = @email WHERE id = @id")
      .run({ name: merged.name, email: merged.email, id });

    return this.findById(id);
  },

  remove(id: number): boolean {
    const info = getDatabase()
      .prepare("DELETE FROM clients WHERE id = ?")
      .run(id);

    return info.changes > 0;
  },
};
