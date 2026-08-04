export const CLIENT_TABLE = `
  CREATE TABLE IF NOT EXISTS clients (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;


export type Client = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type NewClient = Omit<Client, "id" | "createdAt">;
export type UpdateClient = Partial<NewClient>;
