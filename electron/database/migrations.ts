import type Database from "better-sqlite3";
import { CLIENT_TABLE } from "./tables";


export type Migration = {
  name: string;
  up: (db: Database.Database) => void;
};

// Para agregar una migración nueva: agregá un objeto AL FINAL del array.
// Nunca borres ni reordenes las anteriores (romperías bases ya migradas).
export const migrations: Migration[] = [
  {
    name: "create_client_table",
    up: (db) => db.exec(CLIENT_TABLE),
  },

  // Ejemplo para el futuro:
  // {
  //   name: "add_phone_to_client",
  //   up: (db) => db.exec(`ALTER TABLE clients ADD COLUMN phone TEXT`),
  // },
];


export function runMigrations(db: Database.Database): void {
  // ⚠️ SOLO DESARROLLO: resetea toda la base de datos y vuelve a versión 0.
  // TODO: Comentar este bloque antes de publicar.
  // db.exec("DROP TABLE IF EXISTS clients");
  // db.exec("PRAGMA user_version = 0");

  const applied = db.pragma("user_version", { simple: true }) as number;

  for (let version = applied; version < migrations.length; version++) {
    const migration = migrations[version];

    const run = db.transaction(() => {
      migration.up(db);
      db.pragma(`user_version = ${version + 1}`);
    });

    run();
    console.log(`[db] migración aplicada: ${migration.name}`);
  }
}
