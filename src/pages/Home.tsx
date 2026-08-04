import { useEffect, useState } from "react";
import { ClientType } from "../types";
import { getClients, createClient, deleteClient } from "../ipc/client";

export function Home() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Trae la lista desde la base de datos (main process) al montar.
  async function loadClients() {
    setClients(await getClients());
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createClient({ name, email });
      setName("");
      setEmail("");
      await loadClients();
    } catch (err) {
      // El service tira Error si falta algo; acá lo mostramos.
      setError(err instanceof Error ? err.message : "Error al crear cliente");
    }
  }

  async function handleDelete(id: number) {
    await deleteClient(id);
    await loadClients();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap items-start gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="rounded-lg border border-border px-3 py-2"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-secondary px-4 py-2 font-medium"
        >
          Agregar
        </button>
        {error && <p className="w-full text-sm text-red-500">{error}</p>}
      </form>

      <ul className="flex flex-col gap-2">
        {clients.length === 0 && (
          <li className="opacity-60">Todavía no hay clientes.</li>
        )}
        {clients.map((client) => (
          <li
            key={client.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{client.name}</span>
              <span className="text-sm opacity-60">{client.email}</span>
            </div>
            <button
              onClick={() => handleDelete(client.id)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
