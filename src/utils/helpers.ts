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
      return "green";
    case "Medicamentos":
      return "red";
    case "Enfermagem":
      return "blue";
    case "Higiene":
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