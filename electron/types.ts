// Tipos compartidos del proceso main. Reflejan el contrato del backend
// (template-back-express-mongo). El backend arma el "userId" a partir del token,
// así que acá no viaja: el Client solo tiene id, name y description.


export type Client = {
  id: string;
  name: string;
  description?: string;
};


export type NewClient = {
  name: string;
  description?: string;
};


export type UpdateClient = Partial<NewClient>;


export type User = {
  id: string;
  role: string;
  email?: string;
};
