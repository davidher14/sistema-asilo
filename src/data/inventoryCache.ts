import { listMovements, listProducts, type ApiMovimentacao } from "../services/api";
import type { Produto } from "../types";

const CACHE_TTL_MS = 60_000;

interface InventoryData {
  products: Produto[];
  movements: ApiMovimentacao[];
}

let cached: InventoryData | null = null;
let cachedAt = 0;
let pending: Promise<InventoryData> | null = null;
let generation = 0;

function invalidateCache() {
  generation += 1;
  cached = null;
  cachedAt = 0;
  pending = null;
}

window.addEventListener("api:cache-invalidate", invalidateCache);

export function loadInventoryData(force = false): Promise<InventoryData> {
  if (force) {
    invalidateCache();
  }
  if (cached && Date.now() - cachedAt < CACHE_TTL_MS) return Promise.resolve(cached);
  if (pending) return pending;

  const requestGeneration = generation;
  const request = Promise.all([listProducts(), listMovements()])
    .then(([products, movements]) => {
      const result = { products, movements };
      if (requestGeneration === generation) {
        cached = result;
        cachedAt = Date.now();
      }
      return result;
    })
    .finally(() => {
      if (pending === request) pending = null;
    });
  pending = request;
  return request;
}
