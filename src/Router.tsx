import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { AuthProvider, useAuth } from "./auth/AuthProvider";

function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

// Muestra Login mientras no haya sesión; el resto de rutas quedan protegidas.
function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center opacity-60">
        Cargando…
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export function Router() {
  return (
    <AuthProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AuthProvider>
  );
}
