import { useState, type FormEvent } from "react";
import instLogo from "../../inst logo.png";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Mock: qualquer credencial entra no dashboard
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo (identidade visual) */}
      <div className="hidden w-1/2 flex-col justify-between bg-white p-10 text-[#1B2A83] lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00B4F0] text-white shadow-md">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold"> Wajunkai</p>
            <p className="text-sm text-gray-500">Gestão de Estoque</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <img
            src={instLogo}
            alt="Logo da instituição"
            className="w-full max-w-lg object-contain mx-auto py-6 drop-shadow-lg animate-float enter"
          />
        </div>

        <p className="text-xs text-gray-500">v0.1 – Protótipo 2026</p>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-[#00B4F0] via-[#1E63C6] to-[#1B2A83] p-6 lg:w-1/2">
        <div className="w-full max-w-sm card-3d enter">
          {/* Logo mobile */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B2A83] text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-[#1B2A83]">ILPI Wajunkai</p>
              <p className="text-xs text-gray-500">Gestão de Estoque</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Entrar na conta</h1>
          <p className="mt-1 text-sm text-gray-500">Acesse o painel de gestão de estoque da sua instituição.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@sua-instituicao.org"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/20"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#00B4F0] focus:ring-[#00B4F0]" />
                Lembrar de mim
              </label>
              <a href="#" className="font-semibold text-[#00B4F0] hover:text-[#1E63C6]">
                Esqueci a senha
              </a>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem uma conta?{" "}
            <Link to="/criar-conta" className="font-semibold text-[#00B4F0] hover:text-[#1E63C6]">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}