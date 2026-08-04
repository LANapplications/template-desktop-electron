import { useAuth } from "../auth/AuthProvider";


export function Login() {
  const { login, authInProgress, error } = useAuth();

  // El botón queda siempre clickeable: si cerraste la pestaña sin querer,
  // volver a clickear descarta el intento anterior y abre uno nuevo.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Bienvenido</h1>
        <p className="opacity-60">Iniciá sesión para continuar</p>
      </div>

      <button
        onClick={login}
        className="rounded-lg border border-border bg-secondary px-5 py-2 font-medium"
      >
        Iniciar sesión
      </button>

      {authInProgress && (
        <p className="text-sm opacity-60">Abriendo el navegador…</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
