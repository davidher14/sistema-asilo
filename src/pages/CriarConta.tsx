import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import instLogo from "../../inst logo.png";
import bgJap from "../assets/bg-japones2.jpg";

export default function CriarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [erro, setErro] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    // Mock: cria a conta e envia para o dashboard
    navigate("/dashboard");
  }

  

  return (
    <div className="flex min-h-screen bg-white">
      {/* Painel esquerdo (foto abaixo do logo) */}
      <div className="hidden w-1/2 lg:flex flex-col justify-between p-10 left-panel">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B4F0] text-white shadow-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold brand-heading"> Wajunkai</p>
            <p className="text-sm text-gray-200">Gestão de Estoque</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-start pt-2">
          <div className="rounded-full bg-white p-0.5 -mt-12 drop-shadow-lg flex items-center justify-center">
            <img src={instLogo} alt="Logo da instituição" className="w-44 h-auto object-contain" />
          </div>
          <img src={bgJap} alt="Foto" className="w-[28rem] rounded-xl object-cover shadow-lg mt-4" />
        </div>

        <p className="text-xs text-gray-500">v0.1 – Protótipo 2026</p>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-lg card-3d card-breathe card-enter border border-[#e6f4ff] p-8 lg:p-10">
          <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500">Preencha os dados abaixo para começar a usar o sistema.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/20"
                required
              />
            </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/20"
                  required
                />
              </div>
            </div>
            {/* Perfil / Setor removido - não utilizado */}

            {erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{erro}</p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link to="/" className="font-semibold text-[#00B4F0] hover:text-[#1E63C6]">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}