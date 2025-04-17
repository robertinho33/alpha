import { auth } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { buscarDadosSalao, adicionarCliente, listarClientes, atualizarCliente, excluirCliente, adicionarServico, listarServicos, atualizarServico, excluirServico, adicionarFuncionario, listarFuncionarios, atualizarFuncionario, excluirFuncionario } from "../db/firestore.js";
import { logoutUsuario } from "../auth/auth.js";

console.log("dashboard.js carregado com sucesso!");

// Função para sanitizar texto (remove tags HTML e caracteres perigosos)
function sanitizarTexto(texto) {
  if (!texto) return "";
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return texto.replace(/[&<>"']/g, char => mapa[char]).trim();
}

// Função para validar email
function validarEmail(email) {
  if (!email) return true; // Email é opcional
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para validar telefone
function validarTelefone(telefone) {
  if (!telefone) return true; // Telefone é opcional
  const regex = /^\d{10,11}$|^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
  return regex.test(telefone.replace(/\D/g, '') || telefone);
}

// Função para validar data
function validarData(data) {
  if (!data) return true; // Data é opcional
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;
  const date = new Date(data);
  return date instanceof Date && !isNaN(date);
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.error("Nenhum usuário logado.");
      window.location.href = "index.html";
      return;
    }

    // Carregar nome do salão e admin
    try {
      const dadosSalao = await buscarDadosSalao(user.uid);
      if (dadosSalao) {
        document.getElementById("nomeSalao").textContent = sanitizarTexto(dadosSalao.salao.nome);
        document.getElementById("nomeAdmin").textContent = sanitizarTexto(dadosSalao.admin.nome);
      } else {
        console.error("Dados do salão não encontrados.");
        document.getElementById("nomeSalao").textContent = "Salão não encontrado";
        document.getElementById("nomeAdmin").textContent = "Usuário desconhecido";
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      document.getElementById("nomeSalao").textContent = "Erro ao carregar";
      document.getElementById("nomeAdmin").textContent = "Erro ao carregar";
    }

    // Botão de logout
    const botaoSair = document.getElementById("botaoSair");
    if (botaoSair) {
      botaoSair.addEventListener("click", async () => {
        try {
          await logoutUsuario();
          window.location.href = "index.html";
        } catch (error) {
          console.error("Erro ao sair:", error);
          alert("Erro ao sair: " + error.message);
        }
      });
    }

    // Função para renderizar clientes
    async function renderClientes(filtros = {}) {
      const listaClientes = document.getElementById("listaClientes");
      if (!listaClientes) return;
      let clientes = await listarClientes(user.uid);

      if (filtros.nome && filtros.nome !== "") {
        clientes = clientes.filter(c => c.nome.toLowerCase().includes(filtros.nome.toLowerCase()));
      }
      if (filtros.email && filtros.email !== "") {
        clientes = clientes.filter(c => c.email && c.email.toLowerCase().includes(filtros.email.toLowerCase()));
      }
      if (filtros.aniversario && filtros.aniversario !== "") {
        clientes = clientes.filter(c => c.aniversario === filtros.aniversario);
      }

      listaClientes.innerHTML = "";
      clientes.forEach(cliente => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${sanitizarTexto(cliente.nome)}</td>
          <td>${sanitizarTexto(cliente.telefone) || "Não informado"}</td>
          <td>${sanitizarTexto(cliente.email) || "Não informado"}</td>
          <td>${sanitizarTexto(cliente.aniversario) || "Não informado"}</td>
          <td>${sanitizarTexto(cliente.observacoes) || "Nenhuma"}</td>
          <td>${cliente.ativo ? "Sim" : "Não"}</td>
          <td>
            <button class="btn btn-sm btn-warning editar-cliente" data-id="${cliente.id}">Editar</button>
            <button class="btn btn-sm btn-danger excluir-cliente" data-id="${cliente.id}">Excluir</button>
          </td>
        `;
        listaClientes.appendChild(tr);
      });

      document.querySelectorAll(".editar-cliente").forEach(button => {
        button.addEventListener("click", async (e) => {
          const clienteId = e.target.dataset.id;
          const clientes = await listarClientes(user.uid);
          const cliente = clientes.find(c => c.id === clienteId);
          document.getElementById("clienteId").value = cliente.id;
          document.getElementById("nomeCliente").value = cliente.nome;
          document.getElementById("telefoneCliente").value = cliente.telefone || "";
          document.getElementById("emailCliente").value = cliente.email || "";
          document.getElementById("aniversarioCliente").value = cliente.aniversario || "";
          document.getElementById("observacoesCliente").value = cliente.observacoes || "";
          document.getElementById("ativoCliente").checked = cliente.ativo;
          document.getElementById("clienteModalLabel").textContent = "Editar Cliente";
          new bootstrap.Modal(document.getElementById("clienteModal")).show();
        });
      });

      document.querySelectorAll(".excluir-cliente").forEach(button => {
        button.addEventListener("click", async (e) => {
          const clienteId = e.target.dataset.id;
          if (confirm("Tem certeza que deseja excluir este cliente?")) {
            try {
              await excluirCliente(user.uid, clienteId);
              alert("Cliente excluído!");
              renderClientes(filtros);
            } catch (error) {
              console.error("Erro ao excluir cliente:", error);
              alert("Erro ao excluir cliente: " + error.message);
            }
          }
        });
      });
    }

    // Função para renderizar serviços
    async function renderServicos(filtros = {}) {
      const listaServicos = document.getElementById("listaServicos");
      if (!listaServicos) return;
      let servicos = await listarServicos(user.uid);

      if (filtros.tipoProfissional && filtros.tipoProfissional !== "") {
        servicos = servicos.filter(s => s.tipoProfissional.toLowerCase().includes(filtros.tipoProfissional.toLowerCase()));
      }
      if (filtros.tipo && filtros.tipo !== "") {
        servicos = servicos.filter(s => s.tipo.toLowerCase().includes(filtros.tipo.toLowerCase()));
      }
      if (filtros.ativo && filtros.ativo !== "") {
        servicos = servicos.filter(s => s.ativo.toString() === filtros.ativo);
      }

      listaServicos.innerHTML = "";
      servicos.forEach(servico => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${sanitizarTexto(servico.nome)}</td>
          <td>${sanitizarTexto(servico.tipo)}</td>
          <td>R$${servico.preco.toFixed(2)}</td>
          <td>${servico.duracaoMinutos} min</td>
          <td>${servico.comissaoPercentual}%</td>
          <td>${sanitizarTexto(servico.tipoProfissional)}</td>
          <td>${servico.ativo ? "Sim" : "Não"}</td>
          <td>
            <button class="btn btn-sm btn-warning editar-servico" data-id="${servico.id}">Editar</button>
            <button class="btn btn-sm btn-danger excluir-servico" data-id="${servico.id}">Excluir</button>
          </td>
        `;
        listaServicos.appendChild(tr);
      });

      document.querySelectorAll(".editar-servico").forEach(button => {
        button.addEventListener("click", async (e) => {
          const servicoId = e.target.dataset.id;
          const servicos = await listarServicos(user.uid);
          const servico = servicos.find(s => s.id === servicoId);
          document.getElementById("servicoId").value = servico.id;
          document.getElementById("nomeServico").value = servico.nome;
          document.getElementById("tipoServico").value = servico.tipo;
          document.getElementById("precoServico").value = servico.preco;
          document.getElementById("duracaoServico").value = servico.duracaoMinutos;
          document.getElementById("comissaoServico").value = servico.comissaoPercentual;
          document.getElementById("tipoProfissional").value = servico.tipoProfissional;
          document.getElementById("ativoServico").checked = servico.ativo;
          document.getElementById("servicoModalLabel").textContent = "Editar Serviço";
          new bootstrap.Modal(document.getElementById("servicoModal")).show();
        });
      });

      document.querySelectorAll(".excluir-servico").forEach(button => {
        button.addEventListener("click", async (e) => {
          const servicoId = e.target.dataset.id;
          if (confirm("Tem certeza que deseja excluir este serviço?")) {
            try {
              await excluirServico(user.uid, servicoId);
              alert("Serviço excluído!");
              renderServicos(filtros);
            } catch (error) {
              console.error("Erro ao excluir serviço:", error);
              alert("Erro ao excluir serviço: " + error.message);
            }
          }
        });
      });
    }

    // Função para renderizar funcionários
    async function renderFuncionarios() {
      const listaFuncionarios = document.getElementById("listaFuncionarios");
      if (!listaFuncionarios) return;
      try {
        const funcionarios = await listarFuncionarios(user.uid);
        listaFuncionarios.innerHTML = "";
        funcionarios.forEach(funcionario => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${sanitizarTexto(funcionario.nome)}</td>
            <td>${sanitizarTexto(funcionario.tipoProfissional)}</td>
            <td>${sanitizarTexto(funcionario.telefone) || "Não informado"}</td>
            <td>${sanitizarTexto(funcionario.email) || "Não informado"}</td>
            <td>${funcionario.ativo ? "Sim" : "Não"}</td>
            <td>
              <button class="btn btn-sm btn-warning editar-funcionario" data-id="${funcionario.id}">Editar</button>
              <button class="btn btn-sm btn-danger excluir-funcionario" data-id="${funcionario.id}">Excluir</button>
            </td>
          `;
          listaFuncionarios.appendChild(tr);
        });

        document.querySelectorAll(".editar-funcionario").forEach(button => {
          button.addEventListener("click", async (e) => {
            const funcionarioId = e.target.dataset.id;
            const funcionarios = await listarFuncionarios(user.uid);
            const funcionario = funcionarios.find(f => f.id === funcionarioId);
            document.getElementById("funcionarioId").value = funcionario.id;
            document.getElementById("nomeFuncionario").value = funcionario.nome;
            document.getElementById("tipoProfissionalFuncionario").value = funcionario.tipoProfissional;
            document.getElementById("telefoneFuncionario").value = funcionario.telefone || "";
            document.getElementById("emailFuncionario").value = funcionario.email || "";
            document.getElementById("ativoFuncionario").checked = funcionario.ativo;
            document.getElementById("funcionarioModalLabel").textContent = "Editar Funcionário";
            new bootstrap.Modal(document.getElementById("funcionarioModal")).show();
          });
        });

        document.querySelectorAll(".excluir-funcionario").forEach(button => {
          button.addEventListener("click", async (e) => {
            const funcionarioId = e.target.dataset.id;
            if (confirm("Tem certeza que deseja excluir este funcionário?")) {
              try {
                await excluirFuncionario(user.uid, funcionarioId);
                alert("Funcionário excluído!");
                renderFuncionarios();
              } catch (error) {
                console.error("Erro ao excluir funcionário:", error);
                alert("Erro ao excluir funcionário: " + error.message);
              }
            }
          });
        });
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        listaFuncionarios.innerHTML = "<tr><td colspan='6'>Erro ao carregar funcionários</td></tr>";
      }
    }

    // Renderizar inicialmente
    await renderClientes();
    await renderServicos();
    await renderFuncionarios();

    // Adiciona ou edita cliente
    const clienteForm = document.getElementById("clienteForm");
    const clienteModalLabel = document.getElementById("clienteModalLabel");
    if (clienteForm) {
      clienteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const clienteId = document.getElementById("clienteId").value;
        const nome = sanitizarTexto(document.getElementById("nomeCliente").value);
        const telefone = sanitizarTexto(document.getElementById("telefoneCliente").value);
        const email = sanitizarTexto(document.getElementById("emailCliente").value);
        const aniversario = document.getElementById("aniversarioCliente").value;
        const observacoes = sanitizarTexto(document.getElementById("observacoesCliente").value);
        const ativo = document.getElementById("ativoCliente").checked;

        // Validações
        if (!nome || nome.length > 100) {
          alert("Nome é obrigatório e deve ter até 100 caracteres.");
          return;
        }
        if (telefone && !validarTelefone(telefone)) {
          alert("Telefone inválido. Use formato (XX) XXXXX-XXXX ou apenas dígitos.");
          return;
        }
        if (email && !validarEmail(email)) {
          alert("Email inválido.");
          return;
        }
        if (aniversario && !validarData(aniversario)) {
          alert("Data de aniversário inválida. Use formato YYYY-MM-DD.");
          return;
        }
        if (observacoes && observacoes.length > 500) {
          alert("Observações devem ter até 500 caracteres.");
          return;
        }

        const clienteData = {
          nome,
          telefone: telefone || null,
          email: email || null,
          aniversario: aniversario || null,
          observacoes: observacoes || null,
          ativo,
          criadoEm: clienteId ? undefined : new Date().toISOString()
        };

        try {
          if (clienteId) {
            await atualizarCliente(user.uid, clienteId, clienteData);
            alert("Cliente atualizado!");
          } else {
            await adicionarCliente(user.uid, clienteData);
            alert("Cliente adicionado!");
          }
          renderClientes();
          clienteForm.reset();
          clienteModalLabel.textContent = "Adicionar Cliente";
          document.getElementById("ativoCliente").checked = true;
          bootstrap.Modal.getInstance(document.getElementById("clienteModal")).hide();
        } catch (error) {
          console.error("Erro ao salvar cliente:", error);
          alert("Erro ao salvar cliente: " + error.message);
        }
      });
    }

    // Adiciona ou edita serviço
    const servicoForm = document.getElementById("servicoForm");
    const servicoModalLabel = document.getElementById("servicoModalLabel");
    if (servicoForm) {
      servicoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const servicoId = document.getElementById("servicoId").value;
        const nome = sanitizarTexto(document.getElementById("nomeServico").value);
        const tipo = sanitizarTexto(document.getElementById("tipoServico").value);
        const preco = parseFloat(document.getElementById("precoServico").value);
        const duracaoMinutos = parseInt(document.getElementById("duracaoServico").value);
        const comissaoPercentual = parseInt(document.getElementById("comissaoServico").value);
        const tipoProfissional = sanitizarTexto(document.getElementById("tipoProfissional").value);
        const ativo = document.getElementById("ativoServico").checked;
        const isAdicionarMais = e.submitter.id === "adicionarMaisServico";

        // Validações
        if (!nome || nome.length > 100) {
          alert("Nome é obrigatório e deve ter até 100 caracteres.");
          return;
        }
        if (!tipo || tipo.length > 50) {
          alert("Tipo é obrigatório e deve ter até 50 caracteres.");
          return;
        }
        if (isNaN(preco) || preco < 0) {
          alert("Preço deve ser um número positivo.");
          return;
        }
        if (isNaN(duracaoMinutos) || duracaoMinutos <= 0 || duracaoMinutos > 1440) {
          alert("Duração deve ser um número entre 1 e 1440 minutos.");
          return;
        }
        if (isNaN(comissaoPercentual) || comissaoPercentual < 0 || comissaoPercentual > 100) {
          alert("Comissão deve ser um número entre 0 e 100.");
          return;
        }
        if (!tipoProfissional || tipoProfissional.length > 50) {
          alert("Tipo Profissional é obrigatório e deve ter até 50 caracteres.");
          return;
        }

        const servicoData = {
          nome,
          tipo,
          preco,
          duracaoMinutos,
          comissaoPercentual,
          tipoProfissional,
          ativo
        };

        try {
          if (servicoId) {
            await atualizarServico(user.uid, servicoId, servicoData);
            alert("Serviço atualizado!");
          } else {
            await adicionarServico(user.uid, servicoData);
            alert("Serviço adicionado!");
          }
          renderServicos();
          servicoForm.reset();
          document.getElementById("servicoId").value = "";
          servicoModalLabel.textContent = "Adicionar Serviço";
          document.getElementById("ativoServico").checked = true;
          if (!isAdicionarMais) {
            bootstrap.Modal.getInstance(document.getElementById("servicoModal")).hide();
          }
        } catch (error) {
          console.error("Erro ao salvar serviço:", error);
          alert("Erro ao salvar serviço: " + error.message);
        }
      });
    }

    // Resetar formulário ao abrir o modal de adicionar serviço
    document.querySelector('[data-bs-target="#servicoModal"]').addEventListener("click", () => {
      const servicoForm = document.getElementById("servicoForm");
      servicoForm.reset();
      document.getElementById("servicoId").value = "";
      document.getElementById("servicoModalLabel").textContent = "Adicionar Serviço";
      document.getElementById("ativoServico").checked = true;
    });

    // Adiciona ou edita funcionário
    const funcionarioForm = document.getElementById("funcionarioForm");
    const funcionarioModalLabel = document.getElementById("funcionarioModalLabel");
    if (funcionarioForm) {
      funcionarioForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const funcionarioId = document.getElementById("funcionarioId").value;
        const nome = sanitizarTexto(document.getElementById("nomeFuncionario").value);
        const tipoProfissional = sanitizarTexto(document.getElementById("tipoProfissionalFuncionario").value);
        const telefone = sanitizarTexto(document.getElementById("telefoneFuncionario").value);
        const email = sanitizarTexto(document.getElementById("emailFuncionario").value);
        const ativo = document.getElementById("ativoFuncionario").checked;
        const isAdicionarMais = e.submitter.id === "adicionarMaisFuncionario";

        // Validações
        if (!nome || nome.length > 100) {
          alert("Nome é obrigatório e deve ter até 100 caracteres.");
          return;
        }
        if (!tipoProfissional || tipoProfissional.length > 50) {
          alert("Tipo Profissional é obrigatório e deve ter até 50 caracteres.");
          return;
        }
        if (telefone && !validarTelefone(telefone)) {
          alert("Telefone inválido. Use formato (XX) XXXXX-XXXX ou apenas dígitos.");
          return;
        }
        if (email && !validarEmail(email)) {
          alert("Email inválido.");
          return;
        }

        const funcionarioData = {
          nome,
          tipoProfissional,
          telefone: telefone || null,
          email: email || null,
          ativo
        };

        try {
          if (funcionarioId) {
            await atualizarFuncionario(user.uid, funcionarioId, funcionarioData);
            alert("Funcionário atualizado!");
          } else {
            await adicionarFuncionario(user.uid, funcionarioData);
            alert("Funcionário adicionado!");
          }
          renderFuncionarios();
          funcionarioForm.reset();
          funcionarioModalLabel.textContent = "Adicionar Funcionário";
          document.getElementById("ativoFuncionario").checked = true;
          if (!isAdicionarMais) {
            bootstrap.Modal.getInstance(document.getElementById("funcionarioModal")).hide();
          }
        } catch (error) {
          console.error("Erro ao salvar funcionário:", error);
          alert("Erro ao salvar funcionário: " + error.message);
        }
      });
    }

    // Aplicar filtros de clientes
    const filtroClientes = document.getElementById("filtroClientes");
    if (filtroClientes) {
      filtroClientes.addEventListener("submit", async (e) => {
        e.preventDefault();
        const filtros = {
          nome: sanitizarTexto(document.getElementById("filtroNome").value),
          email: sanitizarTexto(document.getElementById("filtroEmail").value),
          aniversario: document.getElementById("filtroAniversario").value
        };
        if (filtros.aniversario && !validarData(filtros.aniversario)) {
          alert("Data de filtro inválida.");
          return;
        }
        await renderClientes(filtros);
      });
    }

    // Aplicar filtros de serviços
    const filtroServicos = document.getElementById("filtroServicos");
    if (filtroServicos) {
      filtroServicos.addEventListener("submit", async (e) => {
        e.preventDefault();
        const filtros = {
          tipoProfissional: sanitizarTexto(document.getElementById("filtroTipoProfissional").value),
          tipo: sanitizarTexto(document.getElementById("filtroTipo").value),
          ativo: document.getElementById("filtroAtivo").value
        };
        await renderServicos(filtros);
      });
    }
  });
});