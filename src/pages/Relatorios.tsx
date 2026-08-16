import { useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import { produtos, saidas, setores } from "../data/mockData";
import { getSetorVariant } from "../utils/helpers";

interface LinhaRelatorio {
  id: string;
  produto: string;
  categoria: string;
  setor: string;
  quantidade: number;
  unidade: string;
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("30");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [produtoFiltro, setProdutoFiltro] = useState("todos");

  const linhas = useMemo<LinhaRelatorio[]>(() => {
    return saidas
      .filter((s) => setorFiltro === "todos" || s.setor.id === setorFiltro)
      .filter((s) => produtoFiltro === "todos" || s.produto.id === produtoFiltro)
      .map((s) => ({
        id: s.id,
        produto: s.produto.nome,
        categoria: s.produto.categoria,
        setor: s.setor.nome,
        quantidade: s.quantidade,
        unidade: s.produto.unidadeMedida,
      }));
  }, [setorFiltro, produtoFiltro]);

  const totalConsumido = linhas.reduce((acc, l) => acc + l.quantidade, 0);

  // Consumo por categoria (para o gráfico)
  const consumoPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    linhas.forEach((l) => {
      mapa.set(l.categoria, (mapa.get(l.categoria) ?? 0) + l.quantidade);
    });
    return Array.from(mapa.entries())
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [linhas]);

  const maxConsumo = Math.max(...consumoPorCategoria.map((c) => c.valor), 1);

  function handleExportar(formato: "csv" | "pdf") {
    // Mock: simula exportação
    console.log(`Exportando relatório em ${formato.toUpperCase()}...`);
    alert(`Relatório exportado em ${formato.toUpperCase()} (simulação).`);
  }

  const columns: Column<LinhaRelatorio>[] = [
    {
      key: "produto",
      header: "Produto",
      render: (l) => <span className="font-semibold text-gray-800">{l.produto}</span>,
    },
    {
      key: "categoria",
      header: "Categoria",
      render: (l) => <Badge variant="gray">{l.categoria}</Badge>,
    },
    {
      key: "setor",
      header: "Setor",
      render: (l) => <Badge variant={getSetorVariant(l.setor)}>{l.setor}</Badge>,
    },
    {
      key: "quantidade",
      header: "Quantidade",
      align: "right",
      render: (l) => (
        <span className="font-bold tabular-nums text-red-600">{l.quantidade}</span>
      ),
    },
    {
      key: "unidade",
      header: "Unidade",
      align: "right",
      render: (l) => <span className="text-gray-500">{l.unidade}</span>,
    },
  ];

  return (
    <Layout
      title="Relatórios"
      subtitle="Análise de consumo e movimentações do estoque"
    >
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Período</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Setor</label>
          <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="todos">Todos os setores</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Produto</label>
          <select
            value={produtoFiltro}
            onChange={(e) => setProdutoFiltro(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="todos">Todos os produtos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => handleExportar("csv")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            CSV
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => handleExportar("pdf")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            PDF
          </Button>
        </div>
      </div>

      {/* Resumo + gráfico */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Consumo por categoria</h3>
              <p className="text-xs text-gray-400">Distribuição das saídas no período</p>
            </div>
            <Badge variant="purple">{totalConsumido} itens</Badge>
          </div>
          <div className="mt-5 space-y-4">
            {consumoPorCategoria.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Sem dados no período selecionado.</p>
            )}
            {consumoPorCategoria.map((c) => (
              <div key={c.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">{c.nome}</span>
                  <span className="font-semibold text-gray-800">
                    {c.valor} {c.valor === 1 ? "item" : "itens"}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${(c.valor / maxConsumo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800">Destaques do período</h3>
          <p className="text-xs text-gray-400">Resumo das movimentações filtradas</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-2xl font-bold text-purple-700">{linhas.length}</p>
              <p className="text-xs font-medium text-purple-500">Registros de saída</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-2xl font-bold text-red-600">{totalConsumido}</p>
              <p className="text-xs font-medium text-red-500">Itens consumidos</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-700">{linhas.length > 0 ? (totalConsumido / linhas.length).toFixed(1) : "0"}</p>
              <p className="text-xs font-medium text-emerald-600">Média por registro</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-2xl font-bold text-blue-700">{consumoPorCategoria.length}</p>
              <p className="text-xs font-medium text-blue-500">Categorias ativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de consumo */}
      <Table
        columns={columns}
        data={linhas}
        emptyMessage="Nenhuma movimentação encontrada com os filtros selecionados."
      />
    </Layout>
  );
}