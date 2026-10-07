import type { CategoriaProduto, Produto, UnidadeMedida, Usuario } from "../types";

const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://wajunkai.onrender.com")
).replace(/\/+$/, "");
const SESSION_KEY = "asilo-api-session";

type ApiCategoria =
  | "ALIMENTACAO"
  | "ENFERMAGEM_HIGIENE"
  | "FARMACIA"
  | "LIMPEZA"
  | "MANUTENCAO"
  | "OUTROS";
type ApiUnidade = "UN" | "KG" | "L" | "CX" | "PCT";
export type TipoMovimentacao = "ENTRADA_DOACAO" | "ENTRADA_COMPRA" | "SAIDA_CONSUMO" | "SAIDA_PERDA";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  tempoExpiracao: number;
}

interface ApiSession extends Tokens {
  user: ApiUsuario;
}

interface ApiUsuario {
  id: number;
  nome: string;
  login: string;
  tipoUsuario: "FUNCIONARIO" | "ADMIN";
  ativo: boolean;
  telefone?: string;
  dataNascimento?: string;
}

interface ApiProduto {
  id: number;
  nome: string;
  quantidadeAtual: { valor: number };
  estoqueMinimo: { valor: number };
  unidadeMedidaProduto: ApiUnidade;
  categoriaProduto: ApiCategoria;
  dataValidade?: string;
  situacao: "ATIVO" | "INATIVO";
}

export interface ApiMovimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  usuarioId: number;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  dataHora: string;
  doadorNome?: string;
  cidade?: string;
  valorCompra?: number;
  residenteNome?: string;
}

interface ApiPage<T> {
  conteudo: T[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalElementos: number;
  totalPaginas: number;
}

interface ApiErrorBody {
  message?: string;
  mensagem?: string;
  error?: string;
  detail?: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError("Não foi possível acessar a API. Verifique a URL, a disponibilidade do serviço e a configuração CORS do backend.");
    }
    throw error;
  }
}

function readSession(): ApiSession | null {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? (JSON.parse(stored) as ApiSession) : null;
}

function saveSession(session: ApiSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("asilo-user-role", session.user.tipoUsuario === "ADMIN" ? "ADMIN" : "USER");
  localStorage.setItem("asilo-user-email", session.user.login);
}

export function getSessionUser(): Usuario | null {
  const session = readSession();
  return session
    ? {
        id: String(session.user.id),
        nome: session.user.nome,
        email: session.user.login,
        perfil: session.user.tipoUsuario === "ADMIN" ? "ADMIN" : "ENFERMAGEM",
        ativo: session.user.ativo,
      }
    : null;
}

export function getSessionUserId(): number {
  const session = readSession();
  if (!session) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  return session.user.id;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("asilo-user-role");
  localStorage.removeItem("asilo-user-email");
}

async function parseError(response: Response): Promise<ApiError> {
  const text = await response.text();
  let message = text;
  try {
    const body = JSON.parse(text) as ApiErrorBody;
    message = body.message || body.mensagem || body.detail || body.error || text;
  } catch {
    // Keep a non-JSON error body readable.
  }
  return new ApiError(message || `Erro na API (${response.status}).`, response.status);
}

async function refreshTokens(): Promise<boolean> {
  const session = readSession();
  if (!session?.refreshToken) return false;

  const response = await fetchApi(`${API_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      logout();
      return false;
    }
    throw await parseError(response);
  }

  const tokens = (await response.json()) as Tokens;
  saveSession({ ...session, ...tokens });
  return true;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retryUnauthorized = true,
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const session = authenticated ? readSession() : null;
  if (authenticated && !session?.accessToken) {
    throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  }
  if (session?.accessToken) {
    headers.set("Authorization", `${session.tokenType || "Bearer"} ${session.accessToken}`);
  }

  const response = await fetchApi(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retryUnauthorized && authenticated && (await refreshTokens())) {
    return request<T>(path, init, false, authenticated);
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function allPages<T>(path: string, pageSize: number): Promise<T[]> {
  const values: T[] = [];
  let pageNumber = 0;
  let totalPages = 1;

  while (pageNumber < totalPages) {
    const separator = path.includes("?") ? "&" : "?";
    const result = await request<ApiPage<T>>(
      `${path}${separator}pagina=${pageNumber}&tamanho=${pageSize}`,
    );
    values.push(...result.conteudo);
    totalPages = result.totalPaginas;
    pageNumber += 1;
  }
  return values;
}

function categoryFromApi(category: ApiCategoria): CategoriaProduto {
  switch (category) {
    case "ALIMENTACAO":
      return "Alimentos";
    case "ENFERMAGEM_HIGIENE":
      return "Enfermagem / Higiene";
    case "FARMACIA":
      return "Medicamentos";
    case "LIMPEZA":
      return "Limpeza";
    case "MANUTENCAO":
      return "Manutenção";
    case "OUTROS":
      return "Outros";
  }
}

function categoryToApi(category: CategoriaProduto): ApiCategoria {
  switch (category) {
    case "Alimentos":
      return "ALIMENTACAO";
    case "Higiene pessoal":
    case "Enfermagem / Higiene":
      return "ENFERMAGEM_HIGIENE";
    case "Medicamentos":
      return "FARMACIA";
    case "Limpeza":
      return "LIMPEZA";
    case "Manutenção":
      return "MANUTENCAO";
    case "Roupas":
    case "Utensílios":
    case "Outros":
      return "OUTROS";
  }
}

function unitFromApi(unit: ApiUnidade): UnidadeMedida {
  switch (unit) {
    case "UN":
      return "unidade";
    case "KG":
      return "kg";
    case "L":
      return "litro";
    case "CX":
      return "caixa";
    case "PCT":
      return "pacote";
  }
}

function unitToApi(unit: UnidadeMedida): ApiUnidade {
  switch (unit) {
    case "unidade":
      return "UN";
    case "kg":
      return "KG";
    case "litro":
      return "L";
    case "caixa":
      return "CX";
    case "pacote":
      return "PCT";
  }
}

function productFromApi(product: ApiProduto): Produto {
  return {
    id: String(product.id),
    nome: product.nome,
    categoria: categoryFromApi(product.categoriaProduto),
    unidadeMedida: unitFromApi(product.unidadeMedidaProduto),
    quantidadeEstoque: product.quantidadeAtual.valor,
    estoqueMinimo: product.estoqueMinimo.valor,
  };
}

function userFromApi(user: ApiUsuario): Usuario {
  return {
    id: String(user.id),
    nome: user.nome,
    email: user.login,
    perfil: user.tipoUsuario === "ADMIN" ? "ADMIN" : "ENFERMAGEM",
    ativo: user.ativo,
  };
}

export async function login(login: string, senha: string): Promise<Usuario> {
  const tokens = await request<Tokens>(
    "/v1/auth/login",
    { method: "POST", body: JSON.stringify({ login, senha }) },
    false,
    false,
  );
  const temporarySession: ApiSession = {
    ...tokens,
    user: { id: 0, nome: "", login, tipoUsuario: "FUNCIONARIO", ativo: true },
  };
  saveSession(temporarySession);

  try {
    const user = await request<ApiUsuario>(
      `/v1/usuarios/me`,
      { headers: { "X-Usuario-Login": login } },
    );
    const authenticatedSession = { ...temporarySession, user };
    saveSession(authenticatedSession);
    return userFromApi(user);
  } catch (error) {
    logout();
    throw error;
  }
}

export async function listUsers(): Promise<Usuario[]> {
  const users = await allPages<ApiUsuario>("/v1/usuarios", 100);
  return users.map(userFromApi);
}

export async function createUser(input: {
  nome: string;
  login: string;
  senha: string;
  tipoUsuario: "FUNCIONARIO" | "ADMIN";
}): Promise<Usuario> {
  const user = await request<ApiUsuario>("/v1/usuarios", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return userFromApi(user);
}

export function deactivateUser(id: string): Promise<void> {
  return request<void>(`/v1/usuarios/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function listProducts(): Promise<Produto[]> {
  const products = await allPages<ApiProduto>("/v1/produtos?situacao=ATIVO", 100);
  return products.map(productFromApi);
}

export async function createProduct(input: Omit<Produto, "id">): Promise<Produto> {
  const product = await request<ApiProduto>("/v1/produtos", {
    method: "POST",
    body: JSON.stringify({
      nome: input.nome,
      quantidadeAtual: input.quantidadeEstoque,
      estoqueMinimo: input.estoqueMinimo,
      unidadeMedida: unitToApi(input.unidadeMedida),
      categoria: categoryToApi(input.categoria),
      situacao: "ATIVO",
    }),
  });
  return productFromApi(product);
}

export async function updateProduct(id: string, input: Omit<Produto, "id" | "quantidadeEstoque">): Promise<Produto> {
  const product = await request<ApiProduto>(`/v1/produtos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      nome: input.nome,
      estoqueMinimo: input.estoqueMinimo,
      unidadeMedida: unitToApi(input.unidadeMedida),
      categoria: categoryToApi(input.categoria),
    }),
  });
  return productFromApi(product);
}

export function deactivateProduct(id: string): Promise<void> {
  return request<void>(`/v1/produtos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function listMovements(productId?: string): Promise<ApiMovimentacao[]> {
  const productQuery = productId ? `?produtoId=${encodeURIComponent(productId)}` : "";
  return allPages<ApiMovimentacao>(`/v1/movimentacao${productQuery}`, 100);
}

export function createMovement(input: {
  produtoId: string;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  doadorNome?: string;
  cidade?: string;
  valorCompra?: number;
  residenteNome?: string;
}): Promise<ApiMovimentacao> {
  return request<ApiMovimentacao>("/v1/movimentacao", {
    method: "POST",
    body: JSON.stringify({ ...input, produtoId: Number(input.produtoId), usuarioId: getSessionUserId() }),
  });
}

export async function downloadMovementsCsv(dataInicio: string, dataFim: string, tipo: string): Promise<Blob> {
  const query = new URLSearchParams({ tipo, dataInicio, dataFim });
  const session = readSession();
  if (!session?.accessToken) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  const response = await fetchApi(`${API_URL}/v1/relatorios/movimentacoes/csv?${query}`, {
    headers: { Authorization: `${session?.tokenType || "Bearer"} ${session?.accessToken || ""}` },
  });
  if (response.status === 401 && (await refreshTokens())) {
    const refreshedSession = readSession();
    const retryResponse = await fetchApi(`${API_URL}/v1/relatorios/movimentacoes/csv?${query}`, {
      headers: { Authorization: `${refreshedSession?.tokenType || "Bearer"} ${refreshedSession?.accessToken || ""}` },
    });
    if (!retryResponse.ok) throw await parseError(retryResponse);
    return retryResponse.blob();
  }
  if (!response.ok) throw await parseError(response);
  return response.blob();
}
