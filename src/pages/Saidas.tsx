import { useEffect, useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, { type Column } from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import type { Produto } from "../types";
import { createMovement, getProduct, type ApiMovimentacao } from "../services/api";
import { loadInventoryData } from "../data/inventoryCache";
import { formatLocalDateTime, parseLocalizedNumber, positiveQuantityError } from "../utils/helpers";

export default function Saidas() {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<ApiMovimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [tipo, setTipo] = useState<"SAIDA_CONSUMO" | "SAIDA_PERDA">("SAIDA_CONSUMO");
  const [quantidade, setQuantidade] = useState("");
  const [residenteNome, setResidenteNome] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroQuantidade, setErroQuantidade] = useState("");

  async function carregarDados() {
    const { products: listaProdutos, movements: listaMovimentacoes } = await loadInventoryData();
    setProdutos(listaProdutos.filter((produto) => produto.situacao === "ATIVO"));
    setMovimentacoes(listaMovimentacoes.filter((item) =>
      item.tipoMovimentacao === "SAIDA_CONSUMO" || item.tipoMovimentacao === "SAIDA_PERDA",
    ));
    setProdutoId((atual) => atual || listaProdutos.find((produto) => produto.situacao === "ATIVO")?.id || "");
  }

  useEffect(() => {
    carregarDados()
      .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Não foi possível carregar as saídas."))
      .finally(() => setCarregando(false));
  }, []);

  const movimentacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return movimentacoes.filter((item) => {
      const correspondeTexto = !termo ||
        item.produtoNome.toLowerCase().includes(termo) ||
        (item.residenteNome ?? "").toLowerCase().includes(termo);
      const correspondeTipo = tipoFiltro === "todos" || item.tipoMovimentacao === tipoFiltro;
      return correspondeTexto && correspondeTipo;
    });
  }, [busca, movimentacoes, tipoFiltro]);

  const resumo = useMemo(() => ({
    consumo: movimentacoes.filter((item) => item.tipoMovimentacao === "SAIDA_CONSUMO").reduce((total, item) => total + item.quantidade, 0),
    perdas: movimentacoes.filter((item) => item.tipoMovimentacao === "SAIDA_PERDA").reduce((total, item) => total + item.quantidade, 0),
  }), [movimentacoes]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro("");
    const product = produtos.find((item) => item.id === produtoId);
    const invalidQuantity = positiveQuantityError(quantidade, product?.unidadeMedida ?? "");
    const amount = parseLocalizedNumber(quantidade);
    setErroQuantidade(invalidQuantity);
    if (invalidQuantity) return;
    setSalvando(true);
    try {
      const latestProduct = await getProduct(produtoId);
      if (amount > latestProduct.quantidadeEstoque) {
        setErro(`Quantidade maior que o estoque disponível (${latestProduct.quantidadeEstoque})`);
        return;
      }
      if (tipo === "SAIDA_CONSUMO" && !residenteNome.trim()) {
        setErro("Informe o nome do residente.");
        return;
      }
      if (!window.confirm("Confirma esta saída? A movimentação não poderá ser desfeita.")) return;
      await createMovement({
        produtoId,
        tipoMovimentacao: tipo,
        quantidade: amount,
        residenteNome: tipo === "SAIDA_CONSUMO" ? residenteNome.trim() : undefined,
      });
      await carregarDados();
      setModalAberto(false);
      setQuantidade("");
      setResidenteNome("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível registrar a saída.");
    } finally {
      setSalvando(false);
    }
  }

  const columns: Column<ApiMovimentacao>[] = [
    { key: "data", header: "Data", render: (item) => <span className="text-gray-500">{formatLocalDateTime(item.dataHora)}</span> },
    { key: "produto", header: "Produto", render: (item) => <span className="font-semibold text-gray-800">{item.produtoNome}</span> },
    { key: "tipo", header: "Tipo", render: (item) => <Badge variant={item.tipoMovimentacao === "SAIDA_PERDA" ? "red" : "purple"}>{item.tipoMovimentacao === "SAIDA_PERDA" ? "Perda" : "Consumo"}</Badge> },
    { key: "quantidade", header: "Quantidade", align: "right", render: (item) => <span className="font-bold text-red-600">−{item.quantidade}</span> },
    { key: "residente", header: "Residente", render: (item) => <span className="text-gray-500">{item.residenteNome ?? "—"}</span> },
  ];

  return (
    <Layout title="Saídas" subtitle="Consumo e perdas registrados no estoque">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Badge variant="purple">Consumo</Badge>
          <p className="mt-3 text-3xl font-bold tabular-nums text-purple-700">{resumo.consumo}</p>
          <p className="text-xs text-gray-500">Itens consumidos</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Badge variant="red">Perdas</Badge>
          <p className="mt-3 text-3xl font-bold tabular-nums text-red-600">{resumo.perdas}</p>
          <p className="text-xs text-gray-500">Itens perdidos</p>
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por produto ou residente..." value={busca} onChange={setBusca} className="w-full sm:max-w-md" />
        <select value={tipoFiltro} onChange={(event) => setTipoFiltro(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 sm:w-auto">
          <option value="todos">Todos os tipos</option>
          <option value="SAIDA_CONSUMO">Consumo</option>
          <option value="SAIDA_PERDA">Perda</option>
        </select>
        <Button className="sm:ml-auto" onClick={() => setModalAberto(true)} disabled={!produtos.length}>Registrar saída</Button>
      </div>
      {carregando ? <p className="py-10 text-center text-sm text-gray-500">Carregando saídas...</p> : <Table columns={columns} data={movimentacoesFiltradas} emptyMessage="Nenhuma saída encontrada." />}

      {modalAberto && (
        <Modal title="Registrar saída" subtitle="A quantidade será descontada do estoque do produto" onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Produto</label>
              <select value={produtoId} onChange={(event) => setProdutoId(event.target.value)} required className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800">
                {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome} ({produto.quantidadeEstoque} {produto.unidadeMedida})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tipo de saída</label>
              <select value={tipo} onChange={(event) => setTipo(event.target.value as typeof tipo)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800">
                <option value="SAIDA_CONSUMO">Consumo</option>
                <option value="SAIDA_PERDA">Perda</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Quantidade</label>
              <input inputMode="decimal" value={quantidade} onChange={(event) => { setQuantidade(event.target.value); setErroQuantidade(""); }} required aria-invalid={Boolean(erroQuantidade)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
              {erroQuantidade && <p className="mt-1 text-xs text-red-600">{erroQuantidade}</p>}
            </div>
            {tipo === "SAIDA_CONSUMO" && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Residente</label>
                <input required value={residenteNome} onChange={(event) => setResidenteNome(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={salvando}>{salvando ? "Registrando..." : "Registrar saída"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
