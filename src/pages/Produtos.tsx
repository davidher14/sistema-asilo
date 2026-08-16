import { useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { produtos as produtosMock } from "../data/mockData";
import type { Produto, UnidadeMedida } from "../types";
import { getCategoriaVariant } from "../utils/helpers";

const categorias = ["Todos", "Higiene", "Medicamentos", "Enfermagem", "Alimentação"];

export default function Produtos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);

  // Formulário
  const [nome, setNome] = useState("");
  const [categoriaForm, setCategoriaForm] = useState("Higiene");
  const [unidade, setUnidade] = useState<UnidadeMedida>("unidade");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  const produtosFiltrados = useMemo(() => {
    return produtosMock.filter((p) => {
      const matchBusca =
        busca.trim() === "" ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoria === "Todos" || p.categoria === categoria;
      return matchBusca && matchCategoria;
    });
  }, [busca, categoria]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Mock: fecha o modal sem persistir
    setModalAberto(false);
    setNome("");
    setCategoriaForm("Higiene");
    setUnidade("unidade");
    setQuantidade("");
    setMinimo("");
  }

  const columns: Column<Produto>[] = [
    {
      key: "nome",
      header: "Produto",
      render: (p) => <span className="font-semibold text-gray-800">{p.nome}</span>,
    },
    {
      key: "categoria",
      header: "Categoria",
      render: (p) => <Badge variant={getCategoriaVariant(p.categoria)}>{p.categoria}</Badge>,
    },
    {
      key: "unidade",
      header: "Unidade",
      render: (p) => <span className="text-gray-500">{p.unidadeMedida}</span>,
    },
    {
      key: "estoque",
      header: "Estoque atual",
      align: "right",
      render: (p) => (
        <span className={`font-bold tabular-nums ${p.quantidadeEstoque < p.estoqueMinimo ? "text-red-600" : "text-gray-800"}`}>
          {p.quantidadeEstoque}
        </span>
      ),
    },
    {
      key: "minimo",
      header: "Estoque mínimo",
      align: "right",
      render: (p) => <span className="tabular-nums text-gray-500">{p.estoqueMinimo}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (p) =>
        p.quantidadeEstoque < p.estoqueMinimo ? (
          <Badge variant="red">Estoque baixo</Badge>
        ) : (
          <Badge variant="green">OK</Badge>
        ),
    },
  ];

  return (
    <Layout
      title="Produtos"
      subtitle="Catálogo de itens do estoque · 09 de agosto de 2026"
      alertCount={produtosMock.filter((p) => p.quantidadeEstoque < p.estoqueMinimo).length}
    >
      {/* Barra de ações */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Buscar produto ou categoria..."
          value={busca}
          onChange={setBusca}
          className="w-full sm:max-w-xs"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-auto"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === "Todos" ? "Todas as categorias" : c}
            </option>
          ))}
        </select>
        <Button className="sm:ml-auto" onClick={() => setModalAberto(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Produto
        </Button>
      </div>

      <Table columns={columns} data={produtosFiltrados} emptyMessage="Nenhum produto encontrado." />

      {modalAberto && (
        <Modal
          title="Novo Produto"
          subtitle="Cadastre um novo item no estoque"
          onClose={() => setModalAberto(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nome do produto</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Fralda geriátrica G"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Categoria</label>
                <select
                  value={categoriaForm}
                  onChange={(e) => setCategoriaForm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {["Higiene", "Medicamentos", "Enfermagem", "Alimentação"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Unidade de medida</label>
                <select
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="peça">Peça</option>
                  <option value="caixa">Caixa</option>
                  <option value="kg">kg</option>
                  <option value="unidade">Unidade</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Quantidade inicial</label>
                <input
                  type="number"
                  min={0}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Estoque mínimo</label>
                <input
                  type="number"
                  min={0}
                  value={minimo}
                  onChange={(e) => setMinimo(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar produto</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}