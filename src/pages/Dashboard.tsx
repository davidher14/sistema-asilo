import Layout from "../components/layout/Layout";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { entradas, produtos, saidas } from "../data/mockData";
import { formatDate, getSetorVariant } from "../utils/helpers";

export default function Dashboard() {
  const totalProdutos = produtos.length;
  const estoqueBaixo = produtos.filter((p) => p.quantidadeEstoque < p.estoqueMinimo).length;
  const totalEntradas = entradas.reduce((acc, e) => acc + e.quantidade, 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + s.quantidade, 0);

  // Movimentações recentes (entradas + saídas, ordenadas por data)
  const movimentacoes = [
    ...entradas.map((e) => ({
      id: e.id,
      data: e.data,
      tipo: "ENTRADA" as const,
      produto: e.produto,
      quantidade: e.quantidade,
      setor: undefined,
      idoso: undefined,
    })),
    ...saidas.map((s) => ({
      id: s.id,
      data: s.data,
      tipo: "SAIDA" as const,
      produto: s.produto,
      quantidade: s.quantidade,
      setor: s.setor,
      idoso: s.idoso,
    })),
  ]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 6);

  return (
    <Layout
      title="Dashboard"
      subtitle="Visão geral do estoque · 09 de agosto de 2026"
      alertCount={estoqueBaixo}
    >
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produtos cadastrados"
          value={totalProdutos}
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          }
          hint="Todos os setores"
        />
        <StatCard
          label="Alertas de estoque baixo"
          value={estoqueBaixo}
          color="red"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          }
          hint="Abaixo do mínimo"
        />
        <StatCard
          label="Itens em entrada"
          value={totalEntradas}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          }
          hint="Últimos 30 dias"
        />
        <StatCard
          label="Itens em saída"
          value={totalSaidas}
          color="purple"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          }
          hint="Últimos 30 dias"
        />
      </div>

      {/* Gráfico + movimentações */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Gráfico de consumo por categoria */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-1">
          <h3 className="text-sm font-bold text-gray-800">Consumo por categoria</h3>
          <p className="text-xs text-gray-400">Saídas nos últimos 30 dias</p>
          <div className="mt-5 space-y-4">
            {[
              { nome: "Higiene", valor: 38, cor: "bg-purple-500" },
              { nome: "Medicamentos", valor: 22, cor: "bg-red-500" },
              { nome: "Enfermagem", valor: 28, cor: "bg-blue-500" },
              { nome: "Alimentação", valor: 12, cor: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">{item.nome}</span>
                  <span className="font-semibold text-gray-800">{item.valor}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${item.cor}`} style={{ width: `${item.valor}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movimentações recentes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Movimentações recentes</h3>
              <p className="text-xs text-gray-400">Últimas entradas e saídas registradas</p>
            </div>
            <Badge variant="gray">{movimentacoes.length} registros</Badge>
          </div>
          <div className="divide-y divide-gray-100">
            {movimentacoes.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      m.tipo === "ENTRADA" ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {m.tipo === "ENTRADA" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.produto.nome}</p>
                    <p className="text-xs text-gray-400">{formatDate(m.data)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.setor && (
                    <Badge variant={getSetorVariant(m.setor.nome)}>{m.setor.nome}</Badge>
                  )}
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      m.tipo === "ENTRADA" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {m.tipo === "ENTRADA" ? "+" : "−"}
                    {m.quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}