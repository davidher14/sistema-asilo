import type { CategoriaProduto, Produto, UnidadeMedida, Usuario } from "../types";

const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://wajunkai.onrender.com")
).replace(/\/+$/, "");
const SESSION_KEY = "asilo-api-session";
const MOVEMENT_LOTS_KEY = "asilo-movement-lots";

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
  precisaReposicao: boolean;
  situacao: "ATIVO" | "INATIVO";
}

export interface ApiMovimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  usuarioId: number;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  dataHora: string | null;
  doadorNome?: string;
  cidade?: string;
  valorCompra?: number;
  residenteNome?: string;
  lote?: string;
  dataValidade?: string;
}

type ApiMovimentacaoResponse = Omit<ApiMovimentacao, "quantidade" | "valorCompra"> & {
  quantidade: unknown;
  valorCompra?: unknown;
};

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

let refreshPromise: Promise<boolean> | null = null;
let firstRequest = true;
let slowNoticeTriggered = false;

localStorage.removeItem("asilo-user-role");
localStorage.removeItem("asilo-user-email");

async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort("timeout"), 60_000);
  const slowId = firstRequest && !slowNoticeTriggered
    ? window.setTimeout(() => {
        slowNoticeTriggered = true;
        window.dispatchEvent(new Event("api:slow"));
      }, 5_000)
    : undefined;
  const externalSignal = init?.signal;
  const abortFromExternal = () => controller.abort(externalSignal?.reason);
  externalSignal?.addEventListener("abort", abortFromExternal);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    firstRequest = false;
    return response;
  } catch (error) {
    if (controller.signal.aborted && controller.signal.reason === "timeout") {
      throw new ApiError("O servidor está iniciando, tente novamente em instantes");
    }
    if (error instanceof TypeError) {
      throw new ApiError("Não foi possível acessar a API. Verifique a URL, a disponibilidade do serviço e a configuração CORS do backend.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    if (slowId !== undefined) window.clearTimeout(slowId);
    externalSignal?.removeEventListener("abort", abortFromExternal);
  }
}

export function readSession(): ApiSession | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ApiSession;
  } catch {
    logout(false);
    return null;
  }
}

export function hasValidSession(): boolean {
  const session = readSession();
  return Boolean(session?.accessToken && session.user?.id);
}

export function getSessionRole(): ApiUsuario["tipoUsuario"] | null {
  return readSession()?.user?.tipoUsuario ?? null;
}

function saveSession(session: ApiSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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

export function getSessionIdentity(): { id: number; login: string } {
  const session = readSession();
  if (!session?.accessToken || !session.user) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  return { id: session.user.id, login: session.user.login };
}

export function logout(notify = true) {
  const hadSession = localStorage.getItem(SESSION_KEY) !== null;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("asilo-user-role");
  localStorage.removeItem("asilo-user-email");
  if (notify && hadSession) window.dispatchEvent(new Event("auth:logout"));
  window.dispatchEvent(new Event("api:cache-invalidate"));
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

async function performRefresh(): Promise<boolean> {
  const session = readSession();
  if (!session?.refreshToken) return false;

  const response = await fetchApi(`${API_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      return false;
    }
    throw await parseError(response);
  }

  const tokens = (await response.json()) as Tokens;
  saveSession({ ...session, ...tokens });
  return true;
}

function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
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
  if (response.status === 401 && retryUnauthorized && authenticated) {
    if (await refreshTokens()) return request<T>(path, init, false, authenticated);
    logout();
    throw new ApiError("Sessão expirada, entre novamente", 401);
  }
  if (response.status === 401 && authenticated) {
    logout();
    throw new ApiError("Sessão expirada, entre novamente", 401);
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function allPages<T>(path: string, pageSize: number): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const firstPage = await request<ApiPage<T>>(`${path}${separator}pagina=0&tamanho=${pageSize}`);
  if (firstPage.totalPaginas <= 1) return firstPage.conteudo;
  let loadedPages = 1;
  window.dispatchEvent(new CustomEvent("api:page-progress", {
    detail: { loaded: loadedPages, total: firstPage.totalPaginas },
  }));
  const remaining = await Promise.all(
    Array.from({ length: firstPage.totalPaginas - 1 }, (_, index) =>
      request<ApiPage<T>>(`${path}${separator}pagina=${index + 1}&tamanho=${pageSize}`)
        .then((page) => {
          loadedPages += 1;
          window.dispatchEvent(new CustomEvent("api:page-progress", {
            detail: { loaded: loadedPages, total: firstPage.totalPaginas },
          }));
          return page;
        }),
    ),
  );
  return [firstPage, ...remaining].flatMap((page) => page.conteudo);
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
    precisaReposicao: product.precisaReposicao,
    situacao: product.situacao,
  };
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "valor" in value) {
    return Number(value.valor) || 0;
  }
  return Number(value) || 0;
}

function movementLotKey(movement: Pick<ApiMovimentacao, "id" | "produtoId">): string {
  return `${movement.produtoId}:${movement.id}`;
}

function readMovementLots(): Record<string, string> {
  const stored = localStorage.getItem(MOVEMENT_LOTS_KEY);
  if (!stored) return {};
  try {
    const value: unknown = JSON.parse(stored);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Formato inválido");
    }
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    throw new ApiError("Não foi possível ler os lotes salvos neste navegador.");
  }
}

function saveMovementLot(
  movement: ApiMovimentacao,
  lot: string,
  lots: Record<string, string>,
): ApiMovimentacao {
  const normalizedLot = lot.trim();
  if (!normalizedLot) return movement;
  lots[movementLotKey(movement)] = normalizedLot;
  localStorage.setItem(MOVEMENT_LOTS_KEY, JSON.stringify(lots));
  return { ...movement, lote: normalizedLot };
}

function movementFromApi(
  movement: ApiMovimentacaoResponse,
  lots: Record<string, string>,
): ApiMovimentacao {
  const loteSalvo = lots[movementLotKey(movement)];
  return {
    ...movement,
    quantidade: normalizeNumber(movement.quantidade),
    valorCompra: movement.valorCompra == null ? undefined : normalizeNumber(movement.valorCompra),
    lote: movement.lote?.trim() || loteSalvo,
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
    const user = await request<ApiUsuario>("/v1/usuarios/me", {
      headers: { "X-Usuario-Login": getSessionIdentity().login },
    });
    const authenticatedSession = { ...temporarySession, user };
    saveSession(authenticatedSession);
    return userFromApi(user);
  } catch (error) {
    logout(false);
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
  telefone?: string;
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

export async function listProducts(situacao?: "ATIVO" | "INATIVO"): Promise<Produto[]> {
  const statusQuery = situacao ? `?situacao=${situacao}` : "";
  const products = await allPages<ApiProduto>(`/v1/produtos${statusQuery}`, 100);
  return products.map(productFromApi);
}

export async function getProduct(id: string): Promise<Produto> {
  const product = await request<ApiProduto>(`/v1/produtos/${encodeURIComponent(id)}`);
  return productFromApi(product);
}

export async function createProduct(input: Omit<Produto, "id" | "quantidadeEstoque" | "precisaReposicao" | "situacao">): Promise<Produto> {
  const product = await request<ApiProduto>("/v1/produtos", {
    method: "POST",
    body: JSON.stringify({
      nome: input.nome,
      quantidadeAtual: 0,
      estoqueMinimo: input.estoqueMinimo,
      unidadeMedida: unitToApi(input.unidadeMedida),
      categoria: categoryToApi(input.categoria),
      situacao: "ATIVO",
    }),
  });
  window.dispatchEvent(new Event("api:cache-invalidate"));
  return productFromApi(product);
}

export async function updateProduct(id: string, input: Omit<Produto, "id" | "quantidadeEstoque" | "precisaReposicao" | "situacao">): Promise<Produto> {
  const product = await request<ApiProduto>(`/v1/produtos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      nome: input.nome,
      estoqueMinimo: input.estoqueMinimo,
      unidadeMedida: unitToApi(input.unidadeMedida),
      categoria: categoryToApi(input.categoria),
    }),
  });
  window.dispatchEvent(new Event("api:cache-invalidate"));
  return productFromApi(product);
}

export function deactivateProduct(id: string): Promise<void> {
  return request<void>(`/v1/produtos/${encodeURIComponent(id)}`, { method: "DELETE" })
    .then(() => { window.dispatchEvent(new Event("api:cache-invalidate")); });
}

export function activateProduct(id: string): Promise<void> {
  return request<void>(`/v1/produtos/${encodeURIComponent(id)}/ativar`, { method: "PATCH" })
    .then(() => { window.dispatchEvent(new Event("api:cache-invalidate")); });
}

export async function listMovements(productId?: string): Promise<ApiMovimentacao[]> {
  const productQuery = productId ? `?produtoId=${encodeURIComponent(productId)}` : "";
  const movements = await allPages<ApiMovimentacaoResponse>(`/v1/movimentacao${productQuery}`, 100);
  const lots = readMovementLots();
  return movements.map((movement) => movementFromApi(movement, lots));
}

type CreateMovementInput = {
  produtoId: string;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  doadorNome?: string;
  cidade?: string;
  valorCompra?: number;
  residenteNome?: string;
} & (
  | { tipoMovimentacao: "ENTRADA_DOACAO" | "ENTRADA_COMPRA"; lote: string; dataValidade?: string }
  | { tipoMovimentacao: "SAIDA_CONSUMO" | "SAIDA_PERDA"; lote: string; dataValidade?: never }
);

export async function createMovement(input: CreateMovementInput): Promise<ApiMovimentacao> {
  const { id: usuarioId } = getSessionIdentity();
  if (!usuarioId) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  const { lote, ...movementInput } = input;
  const movement = await request<ApiMovimentacaoResponse>("/v1/movimentacao", {
    method: "POST",
    body: JSON.stringify({ ...movementInput, produtoId: Number(input.produtoId), usuarioId }),
  });
  const lots = readMovementLots();
  const normalizedMovement = movementFromApi(movement, lots);
  const movementWithLot = saveMovementLot(normalizedMovement, lote, lots);
  window.dispatchEvent(new Event("api:cache-invalidate"));
  return movementWithLot;
}

export async function downloadMovementsCsv(dataInicio: string, dataFim: string, tipo: string): Promise<Blob> {
  const query = new URLSearchParams({ tipo, dataInicio, dataFim });
  const session = readSession();
  if (!session?.accessToken) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  const fetchCsv = async (retry: boolean): Promise<Response> => {
    const currentSession = readSession();
    const response = await fetchApi(`${API_URL}/v1/relatorios/movimentacoes/csv?${query}`, {
      headers: { Authorization: `${currentSession?.tokenType || "Bearer"} ${currentSession?.accessToken || ""}` },
    });
    if (response.status === 401 && retry && await refreshTokens()) return fetchCsv(false);
    if (response.status === 401) {
      logout();
      throw new ApiError("Sessão expirada, entre novamente", 401);
    }
    if (!response.ok) throw await parseError(response);
    return response;
  };
  return (await fetchCsv(true)).blob();
}
