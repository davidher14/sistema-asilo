import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import type { Produto } from "../types";
import { downloadMovementsCsv, type ApiMovimentacao } from "../services/api";
import { loadInventoryData } from "../data/inventoryCache";
import { formatLocalDate, toLocalDateKey } from "../utils/helpers";

type TipoRelatorio = "GERAL" | "DOACOES" | "COMPRAS" | "SAIDA_RESIDENTE" | "SAIDA_PERDA";

interface LinhaRelatorio {
  id: string;
  produto: string;
  categoria: string;
  tipo: string;
  quantidade: number;
  data: string;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function movementLabel(movement: ApiMovimentacao) {
  switch (movement.tipoMovimentacao) {
    case "ENTRADA_DOACAO": return "Doação";
    case "ENTRADA_COMPRA": return "Compra";
    case "SAIDA_CONSUMO": return "Consumo";
    case "SAIDA_PERDA": return "Perda";
  }
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("30");
  const [tipo, setTipo] = useState<TipoRelatorio>("GERAL");
  const [produtoFiltro, setProdutoFiltro] = useState("todos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<ApiMovimentacao[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    loadInventoryData()
      .then(({ products, movements }) => {
        setProdutos(products);
        setMovimentacoes(movements);
      })
      .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Não foi possível carregar o relatório."))
      .finally(() => setCarregando(false));
  }, []);

  const dataFim = formatDateInput(new Date());
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - Number(periodo));
  const dataInicio = formatDateInput(inicio);
  const produtoPorId = useMemo(
    () => new Map(produtos.map((produto) => [Number(produto.id), produto])),
    [produtos],
  );

  const linhas = useMemo<LinhaRelatorio[]>(() => {
    return movimentacoes
      .filter((item) => {
        const dateKey = toLocalDateKey(item.dataHora);
        return dateKey >= dataInicio && dateKey <= dataFim;
      })
      .filter((item) => tipo === "GERAL" || item.tipoMovimentacao === ({
        DOACOES: "ENTRADA_DOACAO",
        COMPRAS: "ENTRADA_COMPRA",
        SAIDA_RESIDENTE: "SAIDA_CONSUMO",
        SAIDA_PERDA: "SAIDA_PERDA",
      } as const)[tipo])
      .filter((item) => produtoFiltro === "todos" || String(item.produtoId) === produtoFiltro)
      .map((item) => ({
        id: String(item.id),
        produto: item.produtoNome,
        categoria: produtoPorId.get(item.produtoId)?.categoria ?? item.produtoNome,
        tipo: movementLabel(item),
        quantidade: item.quantidade,
        data: item.dataHora,
      }));
  }, [dataFim, dataInicio, movimentacoes, produtoFiltro, produtoPorId, tipo]);

  const totalMovimentado = linhas.reduce((total, item) => total + item.quantidade, 0);
  const consumoPorCategoria = useMemo(() => {
    const totais = new Map<string, number>();
    linhas.filter((item) => item.tipo === "Consumo").forEach((item) => {
      totais.set(item.categoria, (totais.get(item.categoria) ?? 0) + item.quantidade);
    });
    return [...totais.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
  }, [linhas]);
  const maxConsumo = Math.max(...consumoPorCategoria.map((item) => item.valor), 1);

  async function exportarCsv() {
    setErro("");
    if (dataInicio > dataFim) {
      setErro("A data inicial deve ser anterior ou igual à data final.");
      return;
    }
    setExportando(true);
    try {
      const blob = await downloadMovementsCsv(dataInicio, dataFim, tipo);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `movimentacoes-${dataInicio}-${dataFim}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível exportar o CSV.");
    } finally {
      setExportando(false);
    }
  }

  const columns: Column<LinhaRelatorio>[] = [
    { key: "data", header: "Data", render: (item) => <span className="text-gray-500">{formatLocalDate(item.data)}</span> },
    { key: "produto", header: "Produto", render: (item) => <span className="font-semibold text-gray-800">{item.produto}</span> },
    { key: "categoria", header: "Categoria", render: (item) => <Badge variant="gray">{item.categoria}</Badge> },
    { key: "tipo", header: "Tipo", render: (item) => item.tipo },
    { key: "quantidade", header: "Quantidade", align: "right", render: (item) => <span className="font-bold tabular-nums text-gray-800">{item.quantidade}</span> },
  ];

  return (
    <Layout title="Relatórios" subtitle="Análise das movimentações do estoque">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Período</label>
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Tipo</label>
          <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoRelatorio)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <option value="GERAL">Todas as movimentações</option>
            <option value="DOACOES">Doações</option>
            <option value="COMPRAS">Compras</option>
            <option value="SAIDA_RESIDENTE">Consumo</option>
            <option value="SAIDA_PERDA">Perdas</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Produto</label>
          <select value={produtoFiltro} onChange={(event) => setProdutoFiltro(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <option value="todos">Todos os produtos</option>
            {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={exportarCsv} disabled={exportando}>
            {exportando ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
      </div>
      <p className="mb-5 text-xs text-gray-500">A exportação CSV usa o período e o tipo selecionados; o filtro de produto aplica-se à tabela. Setor e PDF não fazem parte do contrato atual.</p>
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-gray-800">Consumo por categoria</h3><p className="text-xs text-gray-400">Saídas classificadas como consumo</p></div>
            <Badge variant="purple">{totalMovimentado} itens</Badge>
          </div>
          <div className="mt-5 space-y-4">
            {consumoPorCategoria.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Sem dados no período selecionado.</p>}
            {consumoPorCategoria.map((item) => (
              <div key={item.nome}>
                <div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium text-gray-600">{item.nome}</span><span className="font-semibold text-gray-800">{item.valor}</span></div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-purple-500" style={{ width: `${(item.valor / maxConsumo) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800">Destaques do período</h3>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4"><p className="text-2xl font-bold text-blue-700">{linhas.length}</p><p className="text-xs font-medium text-blue-500">Movimentações</p></div>
            <div className="rounded-lg bg-red-50 p-4"><p className="text-2xl font-bold text-red-600">{totalMovimentado}</p><p className="text-xs font-medium text-red-500">Itens movimentados</p></div>
            <div className="rounded-lg bg-purple-50 p-4"><p className="text-2xl font-bold text-purple-700">{linhas.length ? (totalMovimentado / linhas.length).toFixed(1) : "0"}</p><p className="text-xs font-medium text-purple-500">Média por movimentação</p></div>
            <div className="rounded-lg bg-emerald-50 p-4"><p className="text-2xl font-bold text-emerald-700">{consumoPorCategoria.length}</p><p className="text-xs font-medium text-emerald-500">Categorias de consumo</p></div>
          </div>
        </div>
      </div>
      {carregando ? <p className="py-10 text-center text-sm text-gray-500">Carregando relatório...</p> : <Table columns={columns} data={linhas} emptyMessage="Nenhuma movimentação encontrada com os filtros selecionados." />}
    </Layout>
  );
}
