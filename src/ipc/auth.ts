import { User } from "../types";


// Puente IPC hacia el flujo de Auth0 que vive en el proceso main.


export const login = (): Promise<void> => window.auth.login();

export const register = (): Promise<void> => window.auth.register();

export const logout = (): Promise<void> => window.auth.logout();

export const getUser = (): Promise<User | null> => window.auth.getUser();

export const isAuthenticated = (): Promise<boolean> =>
  window.auth.isAuthenticated();
