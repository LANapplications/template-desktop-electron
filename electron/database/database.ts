import Database from "better-sqlite3";
import { app } from "electron";
import path from "node:path";
import { runMigrations } from "./migrations";


export type AppDatabase = Database.Database;


let db: AppDatabase | null = null;


// Devuelve la conexión a SQLite (una sola para toda la app).
// La primera vez abre el archivo, configura los pragmas y corre las migraciones.
export function getDatabase(): AppDatabase {
  if (db) return db;

  const dbPath = path.join(app.getPath("userData"), "app.db");

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL"); // mejor rendimiento en lecturas/escrituras
  db.pragma("foreign_keys = ON"); // respeta las claves foráneas

  runMigrations(db);

  return db;
}


// Cierra la conexión (útil al salir de la app).
export function closeDatabase(): void {
  db?.close();
  db = null;
}
