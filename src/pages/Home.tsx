import { useEffect, useState } from "react";
import { ClientType } from "../types";
import { getClients, createClient, deleteClient } from "../ipc/client";
import { cleanIpcError } from "../ipc/error";

export function Home() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Trae la lista desde el backend (vía main process) al montar.
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
      await createClient({ name, description });
      setName("");
      setDescription("");
      await loadClients();
    } catch (err) {
      // El backend tira Error si algo falla; acá lo mostramos limpio.
      setError(cleanIpcError(err, "Error al crear cliente"));
    }
  }

  async function handleDelete(id: string) {
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
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
              {client.description && (
                <span className="text-sm opacity-60">{client.description}</span>
              )}
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
