import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  title: string;
  subtitle: string;
  alertCount?: number;
  children: ReactNode;
}

export default function Layout({ title, subtitle, alertCount, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#eef3fb]">
      <Sidebar />
      <div className="pl-64">
        <main>
          <Header title={title} subtitle={subtitle} alertCount={alertCount} />
          <div className="p-7 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Botão de ajuda flutuante */}
      <button
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        title="Ajuda"
      >
        ?
      </button>
    </div>
  );
}