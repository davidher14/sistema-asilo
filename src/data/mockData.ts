import type { Entrada, Idoso, Produto, Saida, Setor, Usuario } from "../types";

export const usuarios: Usuario[] = [
  { id: "u1", nome: "Maria Fernanda Silva", email: "maria@wajunkai.org", perfil: "ADMIN", ativo: true },
  { id: "u2", nome: "João Carlos Tanaka", email: "joao@wajunkai.org", perfil: "ENFERMAGEM", ativo: true },
  { id: "u3", nome: "Ana Paula Ota", email: "ana@wajunkai.org", perfil: "COZINHA", ativo: true },
  { id: "u4", nome: "Rita de Cássia Mori", email: "rita@wajunkai.org", perfil: "HIGIENE_PESSOAL", ativo: false },
];

export const setores: Setor[] = [
  { id: "set-enf", nome: "Enfermagem" },
  { id: "set-coz", nome: "Cozinha" },
  { id: "set-hig", nome: "Higiene Pessoal" },
  { id: "set-idoso", nome: "Idoso (individual)" },
];

export const idosos: Idoso[] = [
  { id: "i1", nome: "Tereza Yamashita" },
  { id: "i2", nome: "Antônio Sakamoto" },
  { id: "i3", nome: "Hideko Nakamura" },
  { id: "i4", nome: "José Kazuo Sato" },
  { id: "i5", nome: "Fumiko Okada" },
  { id: "i6", nome: "Shizue Miyamoto" },
];

export const produtos: Produto[] = [
  { id: "p1", nome: "Fralda geriátrica G", categoria: "Higiene pessoal", unidadeMedida: "pacote", quantidadeEstoque: 320, estoqueMinimo: 200 },
  { id: "p2", nome: "Soro fisiológico 0,9%", categoria: "Medicamentos", unidadeMedida: "unidade", quantidadeEstoque: 48, estoqueMinimo: 60 },
  { id: "p3", nome: "Arroz branco 5kg", categoria: "Alimentos", unidadeMedida: "caixa", quantidadeEstoque: 12, estoqueMinimo: 8 },
  { id: "p4", nome: "Luvas de procedimento M", categoria: "Medicamentos", unidadeMedida: "caixa", quantidadeEstoque: 5, estoqueMinimo: 10 },
  { id: "p5", nome: "Sabonete líquido neutro", categoria: "Higiene pessoal", unidadeMedida: "unidade", quantidadeEstoque: 25, estoqueMinimo: 15 },
  { id: "p6", nome: "Leite em pó integral", categoria: "Alimentos", unidadeMedida: "caixa", quantidadeEstoque: 4, estoqueMinimo: 6 },
  { id: "p7", nome: "Atadura de crepe 10cm", categoria: "Outros", unidadeMedida: "unidade", quantidadeEstoque: 90, estoqueMinimo: 40 },
  { id: "p8", nome: "Álcool em gel 70%", categoria: "Limpeza", unidadeMedida: "unidade", quantidadeEstoque: 30, estoqueMinimo: 20 },
  { id: "p9", nome: "Feijão carioca 1kg", categoria: "Alimentos", unidadeMedida: "pacote", quantidadeEstoque: 18, estoqueMinimo: 10 },
  { id: "p10", nome: "Papel toalha", categoria: "Limpeza", unidadeMedida: "pacote", quantidadeEstoque: 55, estoqueMinimo: 30 },
  { id: "p11", nome: "Dipirona gotas 500mg", categoria: "Medicamentos", unidadeMedida: "unidade", quantidadeEstoque: 2, estoqueMinimo: 10 },
  { id: "p12", nome: "Frango congelado 1kg", categoria: "Alimentos", unidadeMedida: "pacote", quantidadeEstoque: 35, estoqueMinimo: 15 },
];

export const entradas: Entrada[] = [
  {
    id: "e1",
    data: "2026-08-05",
    produto: produtos[0],
    quantidade: 240,
    dataValidade: "2028-08-05",
    fornecedor: "Distribuidora Saúde+",
    observacao: "Lote novo, validade 2028",
  },
  {
    id: "e2",
    data: "2026-08-04",
    produto: produtos[2],
    quantidade: 20,
    dataValidade: "2026-08-20",
    fornecedor: "Comercial Campos",
  },
  {
    id: "e3",
    data: "2026-08-03",
    produto: produtos[7],
    quantidade: 36,
    dataValidade: "2027-08-03",
    fornecedor: "Higipar",
    observacao: "Pedido mensal",
  },
  {
    id: "e4",
    data: "2026-08-01",
    produto: produtos[3],
    quantidade: 15,
    dataValidade: "2027-08-01",
    fornecedor: "Medline Brasil",
  },
  {
    id: "e5",
    data: "2026-07-30",
    produto: produtos[4],
    quantidade: 30,
    dataValidade: "2026-07-30",
    fornecedor: "Higipar",
  },
  {
    id: "e6",
    data: "2026-07-28",
    produto: produtos[11],
    quantidade: 40,
    dataValidade: "2026-08-28",
    fornecedor: "Frigorífico Sudoeste",
    observacao: "Freezer 2",
  },
];

export const saidas: Saida[] = [
  {
    id: "s1",
    data: "2026-08-08",
    produto: produtos[0],
    setor: setores[0],
    quantidade: 18,
    observacao: "Troca rotina matutina",
  },
  {
    id: "s2",
    data: "2026-08-08",
    produto: produtos[0],
    setor: setores[3],
    idoso: idosos[0],
    quantidade: 6,
  },
  {
    id: "s3",
    data: "2026-08-07",
    produto: produtos[2],
    setor: setores[1],
    quantidade: 2,
    observacao: "Panela externa",
  },
  {
    id: "s4",
    data: "2026-08-07",
    produto: produtos[5],
    setor: setores[2],
    quantidade: 4,
    observacao: "Banho assistido",
  },
  {
    id: "s5",
    data: "2026-08-06",
    produto: produtos[1],
    setor: setores[0],
    quantidade: 8,
  },
  {
    id: "s6",
    data: "2026-08-06",
    produto: produtos[3],
    setor: setores[0],
    quantidade: 2,
  },
  {
    id: "s7",
    data: "2026-08-05",
    produto: produtos[10],
    setor: setores[3],
    idoso: idosos[2],
    quantidade: 3,
    observacao: "Prescrição 3x ao dia",
  },
  {
    id: "s8",
    data: "2026-08-05",
    produto: produtos[4],
    setor: setores[2],
    quantidade: 5,
  },
];

export const perfilLabels: Record<Usuario["perfil"], string> = {
  ADMIN: "Administrador",
  ENFERMAGEM: "Enfermagem",
  COZINHA: "Cozinha",
  HIGIENE_PESSOAL: "Higiene Pessoal",
};