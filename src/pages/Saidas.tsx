import { useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { idosos, produtos, saidas as saidasMock, setores } from "../data/mockData";
import type { Saida } from "../types";
import { formatDate, getSetorVariant } from "../utils/helpers";

export default function Saidas() {
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);

  // Formulário
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [setorId, setSetorId] = useState(setores[0]?.id ?? "");
  const [idosoId, setIdosoId] = useState(idosos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");

  const setorSelecionado = setores.find((s) => s.id === setorId);
  const isIdosoIndividual = setorSelecionado?.nome === "Idoso (individual)";

  // Cards de resumo por setor
  const resumoPorSetor = setores.map((setor) => {
    const itens = saidasMock.filter((s) => s.setor.id === setor.id);
    const total = itens.reduce((acc, s) => acc + s.quantidade, 0);
    return { setor, total, registros: itens.length };
  });

  const saidasFiltradas = useMemo(() => {
    return saidasMock.filter((s) => {
      const matchBusca =
        busca.trim() === "" ||
        s.produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (s.idoso?.nome ?? "").toLowerCase().includes(busca.toLowerCase());
      const matchSetor = setorFiltro === "todos" || s.setor.id === setorFiltro;
      return matchBusca && matchSetor;
    });
  }, [busca, setorFiltro]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Mock: fecha o modal sem persistir
    setModalAberto(false);
    setProdutoId(produtos[0]?.id ?? "");
    setSetorId(setores[0]?.id ?? "");
    setIdosoId(idosos[0]?.id ?? "");
    setQuantidade("");
    setObservacao("");
  }

  const columns: Column<Saida>[] = [
    {
      key: "data",
      header: "Data",
      render: (s) => <span className="text-gray-500">{formatDate(s.data)}</span>,
    },
    {
      key: "produto",
      header: "Produto",
      render: (s) => <span className="font-semibold text-gray-800">{s.produto.nome}</span>,
    },
    {
      key: "setor",
      header: "Setor",
      render: (s) => <Badge variant={getSetorVariant(s.setor.nome)}>{s.setor.nome}</Badge>,
    },
    {
      key: "idoso",
      header: "Idoso",
      render: (s) => (
        <span className="text-gray-600">{s.setor.nome === "Idoso (individual)" ? (s.idoso?.nome ?? "—") : "—"}</span>
      ),
    },
    {
      key: "quantidade",
      header: "Quantidade",
      align: "right",
      render: (s) => (
        <span className="font-bold tabular-nums text-red-600">−{s.quantidade}</span>
      ),
    },
    {
      key: "obs",
      header: "Observação",
      render: (s) => <span className="text-gray-500">{s.observacao ?? "—"}</span>,
    },
  ];

  return (
    <Layout
      title="Saídas"
      subtitle="Consumo de estoque por setor · 09 de agosto de 2026"
    >
      {/* Cards de resumo por setor */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumoPorSetor.map(({ setor, total, registros }) => (
          <div key={setor.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Badge variant={getSetorVariant(setor.nome)}>{setor.nome}</Badge>
              <span className="text-xs text-gray-400">{registros} registros</span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-red-600">{total}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Itens consumidos</p>
          </div>
        ))}
      </div>

      {/* Barra de ações */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Buscar produto ou idoso..."
          value={busca}
          onChange={setBusca}
          className="w-full sm:max-w-xs"
        />
        <select
          value={setorFiltro}
          onChange={(e) => setSetorFiltro(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-auto"
        >
          <option value="todos">Todos os setores</option>
          {setores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        <Button className="sm:ml-auto" onClick={() => setModalAberto(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Saída
        </Button>
      </div>

      <Table columns={columns} data={saidasFiltradas} emptyMessage="Nenhuma saída encontrada." />

      {modalAberto && (
        <Modal
          title="Registrar Saída"
          subtitle="Registre o consumo de um item do estoque"
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
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Setor</label>
                <select
                  value={setorId}
                  onChange={(e) => setSetorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            {/* Campo Idoso aparece apenas quando o setor é "Idoso (individual)" */}
            {isIdosoIndividual && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Idoso</label>
                <select
                  value={idosoId}
                  onChange={(e) => setIdosoId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {idosos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Observação</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                placeholder="Notas adicionais"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar saída</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}