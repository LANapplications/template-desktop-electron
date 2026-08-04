// Tipos compartidos del lado del renderer.
// Reflejan el contrato del backend (template-back-express-mongo).


export type ClientType = {
  id: string;
  name: string;
  description?: string;
};


export type NewClientType = {
  name: string;
  description?: string;
};


export type UpdateClientType = Partial<NewClientType>;


export type User = {
  id: string;
  role: string;
  email?: string;
};
