export type PerfilUsuario = "ADMIN" | "ENFERMAGEM" | "COZINHA" | "HIGIENE_PESSOAL";

export type UnidadeMedida = "caixa" | "unidade" | "litro" | "pacote";

export type CategoriaProduto =
  | "Alimentos"
  | "Higiene pessoal"
  | "Limpeza"
  | "Medicamentos"
  | "Roupas"
  | "Utensílios"
  | "Outros";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

export interface Setor {
  id: string;
  nome: string; // "Enfermagem" | "Cozinha" | "Higiene Pessoal" | "Idoso (individual)"
}

export interface Idoso {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  unidadeMedida: UnidadeMedida;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface Entrada {
  id: string;
  data: string;
  produto: Produto;
  quantidade: number;
  dataValidade: string;
  unidadeMedida?: UnidadeMedida;
  valorEstimado?: number;
  doador?: string;
  responsavel?: string;
  fornecedor?: string;
  observacao?: string;
}

export interface Saida {
  id: string;
  data: string;
  produto: Produto;
  setor: Setor;
  idoso?: Idoso; // preenchido apenas quando setor = "Idoso (individual)"
  quantidade: number;
  observacao?: string;
}

export interface MovimentacaoRecente {
  id: string;
  data: string;
  tipo: "ENTRADA" | "SAIDA";
  produto: Produto;
  quantidade: number;
  setor?: Setor;
  idoso?: Idoso;
}