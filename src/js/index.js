import { registrarUsuario, loginUsuario } from "../auth/auth.js";
import { criarSalao } from "../db/firestore.js";

console.log("index.js carregado com sucesso!");

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("cadastroEmail")?.value?.trim();
      const nomeAdmin = document.getElementById("cadastroNomeAdmin")?.value?.trim();
      const nomeSalao = document.getElementById("cadastroNomeSalao")?.value?.trim();
      const endereco = document.getElementById("cadastroEndereco")?.value?.trim();
      const telefone = document.getElementById("cadastroTelefone")?.value?.trim();
      const senha = document.getElementById("cadastroPassword")?.value;

      if (!email || !nomeAdmin || !nomeSalao || !senha) {
        alert("Email, nome do administrador, nome do salão e senha são obrigatórios!");
        return;
      }
      if (!email.includes("@") || !email.includes(".")) {
        alert("Por favor, insira um email válido!");
        return;
      }
      if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return;
      }

      try {
        const user = await registrarUsuario(email, senha);
        const dados = {
          nomeAdmin,
          email,
          nomeSalao,
          endereco,
          telefone
        };
        await criarSalao(user.uid, dados);
        alert("Administrador e salão cadastrados com sucesso!");
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao cadastrar: " + error.message);
      }
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail")?.value?.trim();
      const senha = document.getElementById("loginPassword")?.value;

      if (!email || !senha) {
        alert("Email e senha são obrigatórios!");
        return;
      }

      try {
        await loginUsuario(email, senha);
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Erro ao logar:", error);
        alert("Erro ao logar: " + error.message);
      }
    });
  }
});