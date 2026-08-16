import { useState, type FormEvent, useRef, useEffect } from "react";
import instLogo from "../../inst logo.png";
import bgJap from "../assets/bg-japones2.jpg";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    // Mock: qualquer credencial entra no dashboard
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
      <div ref={containerRef} className="flex w-full items-center justify-center p-6">
        <div ref={cardRef} className="w-full max-w-lg card-3d card-breathe card-enter parallax-card border border-[#e7e2d8] p-8 lg:p-10 bg-white">
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
                className="w-full rounded-lg input-offwhite px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
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
                className="w-full rounded-lg input-offwhite px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20"
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