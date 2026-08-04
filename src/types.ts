// Tipos compartidos del lado del renderer.
// Reflejan lo que devuelve la base de datos (electron/database/tables.ts).


export type ClientType = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};


export type NewClientType = Omit<ClientType, "id" | "createdAt">;


export type UpdateClientType = Partial<NewClientType>;
