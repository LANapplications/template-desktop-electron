import { app, safeStorage } from "electron";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";


// Guarda los tokens de Auth0 en el disco, cifrados con safeStorage (usa el
// keychain / DPAPI del sistema operativo cuando está disponible). Vive solo en
// el proceso main.


export interface StoredTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number; // epoch en ms
}


const filePath = (): string => join(app.getPath("userData"), "auth.json");


export const tokenStore = {
  save(tokens: StoredTokens): void {
    const json = JSON.stringify(tokens);
    const data = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(json)
      : Buffer.from(json, "utf8");
    writeFileSync(filePath(), data);
  },

  load(): StoredTokens | null {
    const path = filePath();
    if (!existsSync(path)) return null;
    try {
      const data = readFileSync(path);
      const json = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(data)
        : data.toString("utf8");
      return JSON.parse(json) as StoredTokens;
    } catch {
      return null;
    }
  },

  clear(): void {
    const path = filePath();
    if (existsSync(path)) rmSync(path);
  },
};
