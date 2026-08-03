import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";

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

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
