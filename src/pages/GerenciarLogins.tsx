import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import type { Usuario } from "../types";
import { createUser, deactivateUser, getSessionRole, listUsers } from "../services/api";

export default function GerenciarLogins() {
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState<"ADMIN" | "USER">("USER");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (getSessionRole() !== "ADMIN") return;
    setCarregando(true);
    listUsers()
      .then(setListaUsuarios)
      .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Não foi possível carregar os usuários."))
      .finally(() => setCarregando(false));
  }, []);

  async function cadastrarUsuario() {
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    if (!nomeLimpo || !email.trim() || !senha.trim()) {
      setErro("Preencha nome, login e senha.");
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ\s]{3,100}$/.test(nomeLimpo)) {
      setErro("O nome deve ter de 3 a 100 caracteres e conter apenas letras e espaços.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (telefoneLimpo && !/^\d{2}9?\d{8}$/.test(telefoneLimpo)) {
      setErro("Informe um telefone válido com DDD, somente números.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const novoUsuario = await createUser({
        nome: nomeLimpo,
        login: email.trim(),
        senha,
        tipoUsuario: cargo === "ADMIN" ? "ADMIN" : "FUNCIONARIO",
        telefone: telefoneLimpo || undefined,
      });
      setListaUsuarios((usuariosAtuais) => [novoUsuario, ...usuariosAtuais]);
      setNome("");
      setEmail("");
      setSenha("");
      setTelefone("");
      setCargo("USER");
      setMostrarCadastro(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível cadastrar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function desativarUsuario(usuario: Usuario) {
    setErro("");
    try {
      await deactivateUser(usuario.id);
      setListaUsuarios((atuais) => atuais.map((item) => item.id === usuario.id ? { ...item, ativo: false } : item));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível desativar o usuário.");
    }
  }

  return (
    <Layout
      title="Gerenciar usuários"
      subtitle="Cadastro, ativação e bloqueio de acessos do sistema"
    >
      {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Controle de usuários</h2>
            <p className="text-sm text-gray-500">
              O administrador pode cadastrar e desativar usuários. A API atual ainda não permite reativá-los.
            </p>
          </div>

          <Button variant="primary" size="md" onClick={() => setMostrarCadastro((prev) => !prev)}>
            {mostrarCadastro ? "Fechar" : "+ Novo usuário"}
          </Button>
        </div>

        {mostrarCadastro && (
          <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-blue-500"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Login"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-blue-500"
            />
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone (opcional)"
              inputMode="tel"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-blue-500"
            />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              autoComplete="new-password"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value as "ADMIN" | "USER")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
              >
                <option value="USER">Usuário</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button variant="primary" size="md" onClick={cadastrarUsuario} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Nome</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Login</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Cargo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {carregando ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Carregando usuários...</td></tr> : listaUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{usuario.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{usuario.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={usuario.ativo ? "green" : "red"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{usuario.perfil === "ADMIN" ? "Admin" : "Usuário"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={usuario.ativo ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => desativarUsuario(usuario)}
                      disabled={!usuario.ativo}
                      title={!usuario.ativo ? "A API ainda não oferece reativação de usuários." : undefined}
                    >
                      {usuario.ativo ? "Desativar" : "Inativo"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
