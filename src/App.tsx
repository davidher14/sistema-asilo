import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Entradas from "./pages/Entradas";
import Saidas from "./pages/Saidas";
import Relatorios from "./pages/Relatorios";
import GerenciarLogins from "./pages/GerenciarLogins";
import { getSessionRole, hasValidSession } from "./services/api";

function ProtectedRoute() {
  return hasValidSession() ? <Outlet /> : <Navigate to="/" replace />;
}

function AdminRoute() {
  return getSessionRole() === "ADMIN" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function LoginRoute() {
  return hasValidSession() ? <Navigate to="/dashboard" replace /> : <Login />;
}

function RouterEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [slow, setSlow] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  useEffect(() => {
    const onLogout = () => {
      navigate("/", { replace: true, state: { message: "Sessão expirada, entre novamente" } });
    };
    const onSlow = () => setSlow(true);
    const onPageProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ loaded: number; total: number }>).detail;
      setProgress(detail.loaded < detail.total ? detail : null);
    };
    window.addEventListener("auth:logout", onLogout);
    window.addEventListener("api:slow", onSlow);
    window.addEventListener("api:page-progress", onPageProgress);
    return () => {
      window.removeEventListener("auth:logout", onLogout);
      window.removeEventListener("api:slow", onSlow);
      window.removeEventListener("api:page-progress", onPageProgress);
    };
  }, [navigate]);

  useEffect(() => {
    setSlow(false);
    setProgress(null);
  }, [location.pathname]);

  return slow || progress ? (
    <div role="status" className="fixed bottom-4 right-4 z-50 rounded-lg bg-[#102d5d] px-4 py-3 text-sm text-white shadow-lg">
      {progress ? `Carregando páginas ${progress.loaded}/${progress.total}. ` : ""}
      {slow ? "O servidor pode demorar para iniciar." : ""}
    </div>
  ) : null;
}

function App() {
  return (
    <BrowserRouter>
      <RouterEvents />
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/entradas" element={<Entradas />} />
          <Route path="/saidas" element={<Saidas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route element={<AdminRoute />}>
            <Route path="/gerenciar-logins" element={<GerenciarLogins />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;