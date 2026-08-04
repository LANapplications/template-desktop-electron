// Electron antepone "Error invoking remote method 'canal': " a cualquier error
// que cruza IPC desde el main. Esto lo saca para mostrar un mensaje limpio (que
// arranca directo con "Error: ...").
export function cleanIpcError(err: unknown, fallback = "Ocurrió un error"): string {
  if (!(err instanceof Error)) return fallback;
  return err.message.replace(/^Error invoking remote method '[^']*':\s*/, "");
}
