import type { Setor } from "../types";

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getSetorVariant(nome: string): "green" | "blue" | "purple" | "orange" {
  switch (nome) {
    case "Enfermagem":
      return "blue";
    case "Cozinha":
      return "green";
    case "Higiene Pessoal":
      return "purple";
    case "Idoso (individual)":
      return "orange";
    default:
      return "green";
  }
}

export function getCategoriaVariant(categoria: string): "green" | "blue" | "purple" | "red" | "orange" {
  switch (categoria) {
    case "Alimentação":
    case "Alimentos":
      return "green";
    case "Medicamentos":
      return "red";
    case "Enfermagem":
    case "Limpeza":
      return "blue";
    case "Higiene":
    case "Higiene pessoal":
    case "Enfermagem / Higiene":
      return "purple";
    default:
      return "orange";
  }
}

export function initials(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function getSetorNome(setor: Setor | undefined): string {
  return setor?.nome ?? "—";
}

export function toLocalDateKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalDate(iso: string | null | undefined): string {
  const dateKey = toLocalDateKey(iso);
  return dateKey ? new Date(`${dateKey}T00:00:00`).toLocaleDateString("pt-BR") : "—";
}

export function formatLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatLocalDate(iso)} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function parseLocalizedNumber(value: string): number {
  return Number(value.trim().replace(",", "."));
}

export function positiveQuantityError(value: string, unit: string): string {
  const amount = parseLocalizedNumber(value);
  if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return "Informe uma quantidade válida maior que zero.";
  if (unit === "unidade" && !Number.isInteger(amount)) return "Para unidade, informe um número inteiro.";
  return "";
}