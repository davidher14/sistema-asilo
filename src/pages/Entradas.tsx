import { useEffect, useMemo, useState, type FormEvent } from "react";
import Layout from "../components/layout/Layout";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import Table, { type Column } from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import type { Produto } from "../types";
import { createMovement, type ApiMovimentacao } from "../services/api";
import { loadInventoryData } from "../data/inventoryCache";
import { formatLocalDate, formatLocalDateTime, parseLocalizedNumber, positiveQuantityError } from "../utils/helpers";

export default function Entradas() {
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<ApiMovimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA_COMPRA" | "ENTRADA_DOACAO">("ENTRADA_COMPRA");
  const [quantidade, setQuantidade] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [doadorNome, setDoadorNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [valorCompra, setValorCompra] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroQuantidade, setErroQuantidade] = useState("");
  const [erroValor, setErroValor] = useState("");

  async function carregarDados() {
    const { products: listaProdutos, movements: listaMovimentacoes } = await loadInventoryData();
    setProdutos(listaProdutos.filter((produto) => produto.situacao === "ATIVO"));
    setMovimentacoes(listaMovimentacoes.filter((item) =>
      item.tipoMovimentacao === "ENTRADA_COMPRA" || item.tipoMovimentacao === "ENTRADA_DOACAO",
    ));
    setProdutoId((atual) => atual || listaProdutos.find((produto) => produto.situacao === "ATIVO")?.id || "");
  }

  useEffect(() => {
    carregarDados()
      .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Não foi possível carregar as entradas."))
      .finally(() => setCarregando(false));
  }, []);

  const movimentacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return movimentacoes;
    return movimentacoes.filter((item) =>
      item.produtoNome.toLowerCase().includes(termo) ||
      (item.doadorNome ?? "").toLowerCase().includes(termo) ||
      (item.cidade ?? "").toLowerCase().includes(termo),
    );
  }, [busca, movimentacoes]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro("");
    const unidade = produtos.find((produto) => produto.id === produtoId)?.unidadeMedida ?? "";
    const invalidQuantity = positiveQuantityError(quantidade, unidade);
    const amount = parseLocalizedNumber(quantidade);
    const price = valorCompra.trim() ? parseLocalizedNumber(valorCompra) : undefined;
    const invalidPrice = price !== undefined && (!Number.isFinite(price) || price < 0);
    setErroQuantidade(invalidQuantity);
    setErroValor(invalidPrice ? "Informe um valor válido maior ou igual a zero." : "");
    if (invalidQuantity || invalidPrice || (tipo === "ENTRADA_DOACAO" && !doadorNome.trim())) {
      setErro(tipo === "ENTRADA_DOACAO" && !doadorNome.trim() ? "Informe o nome do doador." : "");
      return;
    }
    setSalvando(true);
    try {
      await createMovement({
        produtoId,
        tipoMovimentacao: tipo,
        quantidade: amount,
        dataValidade: dataValidade || undefined,
        doadorNome: tipo === "ENTRADA_DOACAO" ? doadorNome.trim() || undefined : undefined,
        cidade: tipo === "ENTRADA_DOACAO" ? cidade.trim() || undefined : undefined,
        valorCompra: tipo === "ENTRADA_COMPRA" ? price : undefined,
      });
      await carregarDados();
      setModalAberto(false);
      setQuantidade("");
      setDataValidade("");
      setDoadorNome("");
      setCidade("");
      setValorCompra("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível registrar a entrada.");
    } finally {
      setSalvando(false);
    }
  }

  const columns: Column<ApiMovimentacao>[] = [
    { key: "data", header: "Data", render: (item) => <span className="text-gray-500">{formatLocalDateTime(item.dataHora)}</span> },
    { key: "produto", header: "Produto", render: (item) => <span className="font-semibold text-gray-800">{item.produtoNome}</span> },
    { key: "tipo", header: "Tipo", render: (item) => item.tipoMovimentacao === "ENTRADA_COMPRA" ? "Compra" : "Doação" },
    { key: "quantidade", header: "Quantidade", align: "right", render: (item) => <span className="font-bold text-emerald-600">+{item.quantidade}</span> },
    { key: "lote", header: "Lote / validade", render: (item) => <span>#{item.id}{item.dataValidade && <span className="block text-xs text-gray-500">Val.: {formatLocalDate(item.dataValidade)}</span>}</span> },
    { key: "doador", header: "Doador / valor", render: (item) => item.tipoMovimentacao === "ENTRADA_DOACAO" ? item.doadorNome ?? "—" : item.valorCompra == null ? "—" : item.valorCompra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
    { key: "cidade", header: "Cidade", render: (item) => <span className="text-gray-500">{item.cidade ?? "—"}</span> },
  ];

  return (
    <Layout title="Entradas" subtitle="Compras e doações registradas no estoque">
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por produto, doador ou cidade..." value={busca} onChange={setBusca} className="w-full sm:max-w-md" />
        <Button className="sm:ml-auto" onClick={() => setModalAberto(true)} disabled={!produtos.length}>Registrar entrada</Button>
      </div>
      {carregando ? <p className="py-10 text-center text-sm text-gray-500">Carregando entradas...</p> : <Table columns={columns} data={movimentacoesFiltradas} emptyMessage="Nenhuma entrada encontrada." />}

      {modalAberto && (
        <Modal title="Registrar entrada" subtitle="A quantidade será somada ao estoque do produto" onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Produto</label>
              <select value={produtoId} onChange={(event) => setProdutoId(event.target.value)} required className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800">
                {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tipo de entrada</label>
              <select value={tipo} onChange={(event) => setTipo(event.target.value as typeof tipo)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800">
                <option value="ENTRADA_COMPRA">Compra</option>
                <option value="ENTRADA_DOACAO">Doação</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Quantidade</label>
              <input inputMode="decimal" value={quantidade} onChange={(event) => { setQuantidade(event.target.value); setErroQuantidade(""); }} required aria-invalid={Boolean(erroQuantidade)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
              {erroQuantidade && <p className="mt-1 text-xs text-red-600">{erroQuantidade}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data de validade (opcional)</label>
              <input type="date" value={dataValidade} onChange={(event) => setDataValidade(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
            </div>
            {tipo === "ENTRADA_DOACAO" ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Doador</label>
                  <input value={doadorNome} onChange={(event) => setDoadorNome(event.target.value)} required className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Cidade</label>
                  <input value={cidade} onChange={(event) => setCidade(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Valor da compra (R$)</label>
                <input inputMode="decimal" value={valorCompra} onChange={(event) => { setValorCompra(event.target.value); setErroValor(""); }} className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800" />
                {erroValor && <p className="mt-1 text-xs text-red-600">{erroValor}</p>}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={salvando}>{salvando ? "Registrando..." : "Registrar entrada"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
