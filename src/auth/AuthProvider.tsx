import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { User } from "../types";
import * as auth from "../ipc/auth";
import { cleanIpcError } from "../ipc/error";


type AuthContextValue = {
  user: User | null;
  loading: boolean; // chequeo inicial de sesión
  authInProgress: boolean; // hay un login/registro abierto en el navegador
  error: string | null;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
};


const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkedRef = useRef(false);
  const attemptSeq = useRef(0);

  // Relee la sesión y trae el perfil.
  async function refresh() {
    const authed = await auth.isAuthenticated();
    setUser(authed ? await auth.getUser() : null);
  }

  // login/register abren el navegador. Si el usuario reintenta, el intento
  // anterior queda "viejo" (el main lo descarta) y acá lo ignoramos por seq.
  async function attempt(fn: () => Promise<void>) {
    const seq = ++attemptSeq.current;
    setError(null);
    setAuthInProgress(true);
    try {
      await fn();
      if (seq !== attemptSeq.current) return;
      await refresh();
    } catch (err) {
      if (seq !== attemptSeq.current) return;
      // El usuario canceló/rechazó o el intento fue reemplazado: sin error.
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("AUTH_CANCELLED") || raw.includes("REPLACED")) return;
      setError(cleanIpcError(err, "Error de autenticación"));
    } finally {
      if (seq === attemptSeq.current) setAuthInProgress(false);
    }
  }

  const login = () => attempt(() => auth.login());
  const register = () => attempt(() => auth.register());

  async function logout() {
    await auth.logout();
    setUser(null);
  }

  // Chequeo inicial de sesión (una sola vez, aun con StrictMode).
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, authInProgress, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
