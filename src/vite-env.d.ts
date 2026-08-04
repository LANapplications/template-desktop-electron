/// <reference types="vite/client" />

import type { User } from "./types";

// Puente de Auth0 expuesto por preload.ts (contextBridge). El typing de
// window.ipcRenderer vive en electron/electron-env.d.ts.
export interface AuthBridge {
  login(): Promise<void>;
  register(): Promise<void>;
  logout(): Promise<void>;
  getUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}

declare global {
  interface Window {
    auth: AuthBridge;
  }
}
