import { adicionarCliente, listarClientes, atualizarCliente, excluirCliente, adicionarServico, listarServicos, atualizarServico, excluirServico, adicionarFuncionario, listarFuncionarios, atualizarFuncionario, excluirFuncionario } from "../../db/firestore.js";
import { auth } from "../../firebase/firebase-init.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  // Função para renderizar clientes
  async function renderClientes(filtros = {}) {
    const listaClientes = document.getElementById("listaClientes");
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
        <td>${cliente.nome}</td>
        <td>${cliente.telefone || "Não informado"}</td>
        <td>${cliente.email || "Não informado"}</td>
        <td>${cliente.aniversario || "Não informado"}</td>
        <td>${cliente.observacoes || "Nenhuma"}</td>
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
    let servicos = await listarServicos(user.uid);
    
    if (filtros.tipoProfissional && filtros.tipoProfissional !== "") {
      servicos = servicos.filter(s => s.tipoProfissional === filtros.tipoProfissional);
    }
    if (filtros.tipo && filtros.tipo !== "") {
      servicos = servicos.filter(s => s.tipo === filtros.tipo);
    }
    if (filtros.ativo && filtros.ativo !== "") {
      servicos = servicos.filter(s => s.ativo.toString() === filtros.ativo);
    }

    listaServicos.innerHTML = "";
    servicos.forEach(servico => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${servico.nome}</td>
        <td>${servico.tipo}</td>
        <td>R$${servico.preco.toFixed(2)}</td>
        <td>${servico.duracaoMinutos} min</td>
        <td>${servico.comissaoPercentual}%</td>
        <td>${servico.tipoProfissional}</td>
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
    try {
      const funcionarios = await listarFuncionarios(user.uid);
      console.log("Funcionários carregados:", funcionarios);
      listaFuncionarios.innerHTML = "";
      funcionarios.forEach(funcionario => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${funcionario.nome}</td>
          <td>${funcionario.tipoProfissional}</td>
          <td>${funcionario.telefone || "Não informado"}</td>
          <td>${funcionario.email || "Não informado"}</td>
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

  // Renderizar clientes, serviços e funcionários inicialmente
  await renderClientes();
  await renderServicos();
  await renderFuncionarios();

  // Adiciona ou edita cliente
  const clienteForm = document.getElementById("clienteForm");
  const clienteModalLabel = document.getElementById("clienteModalLabel");
  clienteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const clienteId = document.getElementById("clienteId").value;
    const clienteData = {
      nome: document.getElementById("nomeCliente").value,
      telefone: document.getElementById("telefoneCliente").value || null,
      email: document.getElementById("emailCliente").value || null,
      aniversario: document.getElementById("aniversarioCliente").value || null,
      observacoes: document.getElementById("observacoesCliente").value || null,
      ativo: document.getElementById("ativoCliente").checked,
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

  // Adiciona ou edita serviço
  const servicoForm = document.getElementById("servicoForm");
  const servicoModalLabel = document.getElementById("servicoModalLabel");
  servicoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const servicoId = document.getElementById("servicoId").value;
    const servicoData = {
      nome: document.getElementById("nomeServico").value,
      tipo: document.getElementById("tipoServico").value,
      preco: parseFloat(document.getElementById("precoServico").value),
      duracaoMinutos: parseInt(document.getElementById("duracaoServico").value),
      comissaoPercentual: parseInt(document.getElementById("comissaoServico").value),
      tipoProfissional: document.getElementById("tipoProfissional").value,
      ativo: document.getElementById("ativoServico").checked
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
      servicoModalLabel.textContent = "Adicionar Serviço";
      bootstrap.Modal.getInstance(document.getElementById("servicoModal")).hide();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar serviço: " + error.message);
    }
  });

  // Adiciona ou edita funcionário
  const funcionarioForm = document.getElementById("funcionarioForm");
  const funcionarioModalLabel = document.getElementById("funcionarioModalLabel");
  funcionarioForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const funcionarioId = document.getElementById("funcionarioId").value;
    const funcionarioData = {
      nome: document.getElementById("nomeFuncionario").value,
      tipoProfissional: document.getElementById("tipoProfissionalFuncionario").value,
      telefone: document.getElementById("telefoneFuncionario").value || null,
      email: document.getElementById("emailFuncionario").value || null,
      ativo: document.getElementById("ativoFuncionario").checked
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
      bootstrap.Modal.getInstance(document.getElementById("funcionarioModal")).hide();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar funcionário: " + error.message);
    }
  });

  // Aplicar filtros de clientes
  document.getElementById("filtroClientes").addEventListener("submit", async (e) => {
    e.preventDefault();
    const filtros = {
      nome: document.getElementById("filtroNome").value,
      email: document.getElementById("filtroEmail").value,
      aniversario: document.getElementById("filtroAniversario").value
    };
    await renderClientes(filtros);
  });

  // Aplicar filtros de serviços
  document.getElementById("filtroServicos").addEventListener("submit", async (e) => {
    e.preventDefault();
    const filtros = {
      tipoProfissional: document.getElementById("filtroTipoProfissional").value,
      tipo: document.getElementById("filtroTipo").value,
      ativo: document.getElementById("filtroAtivo").value
    };
    await renderServicos(filtros);
  });
});
