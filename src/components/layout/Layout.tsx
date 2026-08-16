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
    <div className="min-h-screen bg-[#f5f6f7]">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <Header title={title} subtitle={subtitle} alertCount={alertCount} />
          {children}
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