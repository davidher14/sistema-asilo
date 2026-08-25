import { useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { entradas as entradasMock, produtos } from "../data/mockData";
import type { Entrada } from "../types";
import { formatDate, getCategoriaVariant } from "../utils/helpers";

export default function Entradas() {
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [entradas, setEntradas] = useState<Entrada[]>(entradasMock);

  // Formulário
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrada, setDataEntrada] = useState("2026-08-25");
  const [dataValidade, setDataValidade] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [observacao, setObservacao] = useState("");

  const entradasFiltradas = useMemo(() => {
    return entradas.filter((e) => {
      if (busca.trim() === "") return true;
      const q = busca.toLowerCase();
      return (
        e.produto.nome.toLowerCase().includes(q) ||
        (e.fornecedor ?? "").toLowerCase().includes(q) ||
        e.produto.categoria.toLowerCase().includes(q)
      );
    });
  }, [busca, entradas]);

  function estaVencida(data: string) {
    return new Date(`${data}T23:59:59`) < new Date();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const produto = produtos.find((item) => item.id === produtoId);
    if (!produto) return;
    setEntradas((atuais) => [{
      id: `e-${Date.now()}`,
      data: dataEntrada,
      dataValidade,
      produto,
      quantidade: Number(quantidade),
      fornecedor: fornecedor || undefined,
      observacao: observacao || undefined,
    }, ...atuais]);
    setModalAberto(false);
    setProdutoId(produtos[0]?.id ?? "");
    setQuantidade("");
    setDataEntrada("2026-08-25");
    setDataValidade("");
    setFornecedor("");
    setObservacao("");
  }

  const columns: Column<Entrada>[] = [
    {
      key: "data",
      header: "Data de entrada",
      render: (e) => <span className="text-gray-500">{formatDate(e.data)}</span>,
    },
    {
      key: "validade",
      header: "Data de validade",
      render: (e) => estaVencida(e.dataValidade) ? (
        <span className="font-semibold text-red-600">{formatDate(e.dataValidade)} <span className="text-xs">Vencido</span></span>
      ) : <span className="text-gray-500">{formatDate(e.dataValidade)}</span>,
    },
    {
      key: "produto",
      header: "Produto",
      render: (e) => <span className="font-semibold text-gray-800">{e.produto.nome}</span>,
    },
    {
      key: "categoria",
      header: "Categoria",
      render: (e) => <Badge variant={getCategoriaVariant(e.produto.categoria)}>{e.produto.categoria}</Badge>,
    },
    {
      key: "quantidade",
      header: "Quantidade",
      align: "right",
      render: (e) => (
        <span className="font-bold tabular-nums text-emerald-600">+{e.quantidade}</span>
      ),
    },
    {
      key: "fornecedor",
      header: "Fornecedor",
      render: (e) => <span className="text-gray-600">{e.fornecedor ?? "—"}</span>,
    },
    {
      key: "obs",
      header: "Observação",
      render: (e) => <span className="text-gray-500">{e.observacao ?? "—"}</span>,
    },
  ];

  return (
    <Layout
      title="Entradas"
      subtitle="Registros de entrada de estoque · 09 de agosto de 2026"
      alertCount={entradas.filter((entrada) => estaVencida(entrada.dataValidade)).length}
    >
      {/* Barra de ações */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Buscar por produto, fornecedor ou categoria..."
          value={busca}
          onChange={setBusca}
          className="w-full sm:max-w-xs"
        />
        <Button className="sm:ml-auto" onClick={() => setModalAberto(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Entrada
        </Button>
      </div>

      {entradasFiltradas.some((entrada) => estaVencida(entrada.dataValidade)) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <span className="text-base">!</span> Existem produtos vencidos nas entradas do estoque.
        </div>
      )}

      <Table columns={columns} data={entradasFiltradas} emptyMessage="Nenhuma entrada encontrada." />

      {modalAberto && (
        <Modal
          title="Registrar Entrada"
          subtitle="Adicione itens ao estoque"
          onClose={() => setModalAberto(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Produto</label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data de entrada</label>
                <input type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data de validade</label>
                <input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" required />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Fornecedor</label>
                <input
                  type="text"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  placeholder="Ex.: Distribuidora Saúde+"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Observação</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                placeholder="Notas adicionais (lote, validade, etc.)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar entrada</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}