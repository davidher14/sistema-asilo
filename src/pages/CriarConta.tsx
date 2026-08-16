import { useState, type FormEvent, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq && mq.matches) return;

    const maxX = 12; // px
    const maxY = 8; // px
    let rafId = 0;

    function onMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x - rect.width / 2) / (rect.width / 2);
      const py = (y - rect.height / 2) / (rect.height / 2);
      const tx = Math.max(Math.min(px * maxX, maxX), -maxX);
      const ty = Math.max(Math.min(py * maxY, maxY), -maxY);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (card) card.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    }

    function onLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      if (card) card.style.transform = "";
    }

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
    <div className="flex min-h-screen page-bg">
      {/* Painel esquerdo (foto abaixo do logo) */}
      <div className="hidden w-1/2 lg:flex flex-col p-10 left-panel">
        <div className="flex-1 flex items-center">
          <div className="flex flex-col items-center justify-center gap-12 w-full">
            <div className="rounded-full bg-white p-1 drop-shadow-lg flex items-center justify-center">
              <img src={instLogo} alt="Logo da instituição" className="w-64 h-auto object-contain" />
            </div>
            <img src={bgJap} alt="Foto" className="w-64 md:w-72 rounded-xl object-cover shadow-lg" />
          </div>
        </div>

        <p className="text-xs text-gray-500">v0.1 – Protótipo 2026</p>
      </div>

      {/* Formulário */}
      <div ref={containerRef} className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div ref={cardRef} className="w-full max-w-lg card-3d card-breathe card-enter parallax-card border border-[#e7e2d8] p-8 lg:p-10 bg-white">
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
                className="w-full rounded-lg input-offwhite px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
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
                className="w-full rounded-lg input-offwhite px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
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