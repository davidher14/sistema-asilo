import { useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { getSessionUser, updateMyAccount } from "../services/api";
import type { Usuario } from "../types";

export default function MinhaConta() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => getSessionUser());
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarAlteracoes() {
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    if (!nomeLimpo && !senha && !telefoneLimpo) {
      setErro("Informe um novo nome, senha ou telefone.");
      return;
    }
    if (nomeLimpo && !/^[a-zA-ZÀ-ÿ\s]{3,100}$/.test(nomeLimpo)) {
      setErro("O nome deve ter de 3 a 100 caracteres e conter apenas letras e espaços.");
      return;
    }
    if (senha && senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (telefoneLimpo && !/^\d{2}9?\d{8}$/.test(telefoneLimpo)) {
      setErro("Informe um telefone válido com DDD, somente números.");
      return;
    }

    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      const usuarioAtualizado = await updateMyAccount({
        ...(nomeLimpo ? { nomeAtualizado: nomeLimpo } : {}),
        ...(senha ? { senhaAtualizada: senha } : {}),
        ...(telefoneLimpo ? { telefone: telefoneLimpo } : {}),
      });
      setUsuario(usuarioAtualizado);
      setNome("");
      setTelefone("");
      setSenha("");
      setSucesso("Dados da conta atualizados com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível atualizar sua conta.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Layout title="Minha conta" subtitle="Atualize seu nome, senha e telefone">
      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Dados da conta</h2>
        <p className="mt-1 text-sm text-gray-500">Seu login não pode ser alterado por esta versão do sistema.</p>

        {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        {sucesso && <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{sucesso}</p>}

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-gray-700">Nome atual</p>
            <p className="text-sm text-gray-600">{usuario?.nome || "Não informado"}</p>
          </div>
          <div>
            <label htmlFor="novo-nome" className="mb-1.5 block text-sm font-semibold text-gray-700">Novo nome</label>
            <input
              id="novo-nome"
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="De 3 a 100 caracteres"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="login-conta" className="mb-1.5 block text-sm font-semibold text-gray-700">Login</label>
            <input
              id="login-conta"
              value={usuario?.email ?? ""}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-gray-700">Telefone atual</p>
            <p className="text-sm text-gray-600">{usuario?.telefone || "Não informado"}</p>
          </div>
          <div>
            <label htmlFor="novo-telefone" className="mb-1.5 block text-sm font-semibold text-gray-700">Novo telefone</label>
            <input
              id="novo-telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="DDD e número, somente números"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="nova-senha" className="mb-1.5 block text-sm font-semibold text-gray-700">Nova senha</label>
            <input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500">Deixe em branco o campo que não deseja alterar. O nome aceita apenas letras e espaços; o telefone deve conter DDD e somente números.</p>
          <Button variant="primary" onClick={salvarAlteracoes} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
