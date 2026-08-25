import { useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { produtos as produtosMock } from "../data/mockData";
import type { CategoriaProduto, Produto, UnidadeMedida } from "../types";
import { getCategoriaVariant } from "../utils/helpers";

const categorias: Array<"Todos" | CategoriaProduto> = ["Todos", "Alimentos", "Higiene pessoal", "Limpeza", "Medicamentos", "Roupas", "Utensílios", "Outros"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T12:00:00`));
}

export default function Produtos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>(produtosMock);
  const [produtoExcluindo, setProdutoExcluindo] = useState<Produto | null>(null);

  // Formulário
  const [nome, setNome] = useState("");
  const [categoriaForm, setCategoriaForm] = useState<CategoriaProduto>("Higiene pessoal");
  const [unidade, setUnidade] = useState<UnidadeMedida>("unidade");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca =
        busca.trim() === "" ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoria === "Todos" || p.categoria === categoria;
      return matchBusca && matchCategoria;
    });
  }, [busca, categoria, produtos]);

  const totalItens = produtos.reduce((total, produto) => total + produto.quantidadeEstoque, 0);
  const emEstoque = produtos.filter((produto) => produto.quantidadeEstoque >= produto.estoqueMinimo).length;
  const faltando = produtos.filter((produto) => produto.quantidadeEstoque > 0 && produto.quantidadeEstoque < produto.estoqueMinimo).length;
  const esgotados = produtos.filter((produto) => produto.quantidadeEstoque === 0).length;

  function abrirNovoProduto() {
    setProdutoEditando(null);
    setNome(""); setCategoriaForm("Higiene pessoal"); setUnidade("unidade"); setQuantidade(""); setMinimo("");
    setModalAberto(true);
  }

  function abrirEdicao(produto: Produto) {
    setProdutoEditando(produto);
    setNome(produto.nome); setCategoriaForm(produto.categoria); setUnidade(produto.unidadeMedida);
    setQuantidade(String(produto.quantidadeEstoque)); setMinimo(String(produto.estoqueMinimo));
    setModalAberto(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const dados = { nome: nome.trim(), categoria: categoriaForm, unidadeMedida: unidade, quantidadeEstoque: Number(quantidade), estoqueMinimo: Number(minimo) };
    if (produtoEditando) {
      setProdutos((atuais) => atuais.map((produto) => produto.id === produtoEditando.id ? { ...produto, ...dados } : produto));
    } else {
      setProdutos((atuais) => [...atuais, { id: `p-${Date.now()}`, ...dados }]);
    }
    setModalAberto(false);
  }

  return (
    <Layout
      title="Doações de Produtos"
      subtitle="Controle de entrada e saída do estoque"
      alertCount={faltando + esgotados}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total de itens", value: totalItens, tone: "bg-blue-50 text-[#1b4a9b]", icon: "▣" },
          { label: "Em estoque", value: emEstoque, tone: "bg-emerald-50 text-emerald-600", icon: "✓" },
          { label: "Faltando", value: faltando, tone: "bg-amber-50 text-amber-600", icon: "△" },
          { label: "Esgotado", value: esgotados, tone: "bg-red-50 text-red-500", icon: "×" },
        ].map((stat) => <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold ${stat.tone}`}>{stat.icon}</span><div><p className="text-2xl font-bold text-[#17336d]">{stat.value}</p><p className="text-xs text-gray-500">{stat.label}</p></div></div>)}
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput placeholder="Buscar produto ou categoria..." value={busca} onChange={setBusca} className="w-full lg:max-w-sm" />
        <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-gray-500">Filtrar:</span>{categorias.map((item) => <button key={item} onClick={() => setCategoria(item)} className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${categoria === item ? "border-[#204895] bg-[#204895] text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-[#204895] hover:text-[#204895]"}`}>{item}</button>)}</div>
        <Button className="lg:ml-auto" onClick={abrirNovoProduto}><span className="text-lg leading-none">+</span> Adicionar produto</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wider text-[#35517f]">{["Produto", "Categoria", "Quantidade", "Status", "Data adicionado", "Ações"].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead><tbody>
        {produtosFiltrados.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Nenhum produto encontrado.</td></tr> : produtosFiltrados.map((produto) => { const status = produto.quantidadeEstoque === 0 ? "Esgotado" : produto.quantidadeEstoque < produto.estoqueMinimo ? "Faltando" : "Em estoque"; const statusStyle = status === "Em estoque" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : status === "Faltando" ? "border-amber-200 bg-amber-50 text-amber-600" : "border-red-200 bg-red-50 text-red-500"; return <tr key={produto.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30"><td className="px-4 py-4 font-semibold text-[#172b55]">{produto.nome}</td><td className="px-4 py-4"><Badge variant={getCategoriaVariant(produto.categoria)}>{produto.categoria}</Badge></td><td className="px-4 py-4 font-semibold text-[#172b55]">{produto.quantidadeEstoque} <span className="text-xs font-normal text-gray-500">{produto.unidadeMedida}</span></td><td className="px-4 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}>{status}</span></td><td className="px-4 py-4 text-gray-500">{formatDate("2026-08-01")}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => abrirEdicao(produto)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#204895] hover:bg-blue-100" aria-label={`Editar ${produto.nome}`} title="Editar">✎</button><button onClick={() => setProdutoExcluindo(produto)} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100" aria-label={`Excluir ${produto.nome}`} title="Excluir">⌫</button></div></td></tr>; })}
      </tbody></table></div>

      {modalAberto && (
        <Modal
          title={produtoEditando ? "Editar produto" : "Adicionar produto"}
          subtitle={produtoEditando ? "Atualize os dados do item" : "Cadastre um novo item no estoque"}
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
                    {categorias.slice(1).map((c) => (
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
                  <option value="caixa">Caixa</option>
                  <option value="unidade">Unidade</option>
                  <option value="litro">Litro</option>
                  <option value="pacote">Pacote</option>
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

      {produtoExcluindo && (
        <Modal
          title="Excluir produto"
          subtitle="Essa ação não pode ser desfeita"
          onClose={() => setProdutoExcluindo(null)}
        >
          <p className="text-sm leading-6 text-gray-600">
            Tem certeza que deseja excluir <strong className="text-gray-800">{produtoExcluindo.nome}</strong> do estoque?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setProdutoExcluindo(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setProdutos((atuais) => atuais.filter((produto) => produto.id !== produtoExcluindo.id));
                setProdutoExcluindo(null);
              }}
            >
              Excluir produto
            </Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}