import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import type { Produto } from "../types";
import { loadInventoryData } from "../data/inventoryCache";
import type { ApiMovimentacao } from "../services/api";
import { formatLocalDateTime } from "../utils/helpers";

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<ApiMovimentacao[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    loadInventoryData()
      .then(({ products, movements }) => {
        setProdutos(products);
        setMovimentacoes(movements);
      })
      .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Não foi possível carregar o painel."))
      .finally(() => setCarregando(false));
  }, []);

  const estoqueBaixo = produtos.filter((produto) => produto.precisaReposicao).length;
  const paraReposicao = produtos.filter((produto) => produto.situacao === "ATIVO" && produto.precisaReposicao);
  const totalEntradas = movimentacoes
    .filter((item) => item.tipoMovimentacao === "ENTRADA_COMPRA" || item.tipoMovimentacao === "ENTRADA_DOACAO")
    .reduce((total, item) => total + item.quantidade, 0);
  const totalSaidas = movimentacoes
    .filter((item) => item.tipoMovimentacao === "SAIDA_CONSUMO" || item.tipoMovimentacao === "SAIDA_PERDA")
    .reduce((total, item) => total + item.quantidade, 0);

  const consumoPorCategoria = useMemo(() => {
    const categoriaPorProduto = new Map(produtos.map((produto) => [Number(produto.id), produto.categoria]));
    const totals = new Map<string, number>();
    movimentacoes
      .filter((item) => item.tipoMovimentacao === "SAIDA_CONSUMO")
      .forEach((item) => {
        const category = categoriaPorProduto.get(item.produtoId) ?? item.produtoNome ?? "Outros";
        totals.set(category, (totals.get(category) ?? 0) + item.quantidade);
      });
    return [...totals.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
  }, [produtos, movimentacoes]);

  const recentes = [...movimentacoes]
    .sort((a, b) => (b.dataHora ?? "").localeCompare(a.dataHora ?? ""))
    .slice(0, 6);
  const maxConsumo = Math.max(...consumoPorCategoria.map((item) => item.valor), 1);

  return (
    <Layout title="Dashboard" subtitle="Visão geral do estoque e das movimentações" alertCount={estoqueBaixo}>
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Produtos cadastrados" value={carregando ? "—" : produtos.filter((p) => p.situacao === "ATIVO").length} color="blue" icon="▣" hint="Produtos ativos" />
        <StatCard label="Alertas de estoque baixo" value={carregando ? "—" : estoqueBaixo} color="red" icon="!" hint="Abaixo do mínimo" />
        <StatCard label="Itens em entrada" value={carregando ? "—" : totalEntradas} color="green" icon="↑" hint="Todas as entradas" />
        <StatCard label="Itens em saída" value={carregando ? "—" : totalSaidas} color="purple" icon="↓" hint="Consumo e perdas" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800">Repor estoque ({paraReposicao.length})</h3>
          {paraReposicao.length === 0 ? <p className="mt-3 text-sm text-gray-400">Nenhum item precisa de reposição.</p> : <ul className="mt-3 space-y-2">{paraReposicao.map((p) => <li key={p.id} className="text-sm text-amber-700">{p.nome}</li>)}</ul>}
        </section>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800">Consumo por categoria</h3>
          <p className="text-xs text-gray-400">Saídas classificadas como consumo</p>
          <div className="mt-5 space-y-4">
            {consumoPorCategoria.length === 0 && !carregando && <p className="py-6 text-center text-sm text-gray-400">Sem dados de consumo.</p>}
            {consumoPorCategoria.map((item) => (
              <div key={item.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">{item.nome}</span>
                  <span className="font-semibold text-gray-800">{item.valor}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${(item.valor / maxConsumo) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Movimentações recentes</h3>
              <p className="text-xs text-gray-400">Entradas, consumo e perdas</p>
            </div>
            <Badge variant="gray">{recentes.length} registros</Badge>
          </div>
          {carregando ? <p className="py-8 text-center text-sm text-gray-500">Carregando movimentações...</p> : recentes.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">Nenhuma movimentação encontrada.</p> : (
            <div className="divide-y divide-gray-100">
              {recentes.map((item) => {
                const entrada = item.tipoMovimentacao.startsWith("ENTRADA");
                const tipoLabel = item.tipoMovimentacao === "ENTRADA_COMPRA" ? "Compra" :
                  item.tipoMovimentacao === "ENTRADA_DOACAO" ? "Doação" :
                  item.tipoMovimentacao === "SAIDA_PERDA" ? "Perda" : "Consumo";
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.produtoNome}</p>
                      <p className="text-xs text-gray-400">{tipoLabel} · {formatLocalDateTime(item.dataHora)}</p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${entrada ? "text-emerald-600" : "text-red-600"}`}>
                      {entrada ? "+" : "−"}{item.quantidade}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
