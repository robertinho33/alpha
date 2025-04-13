import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Login
const loginForm = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    signInWithEmailAndPassword(auth, email, senha)
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch(() => {
        mensagem.textContent = 'E-mail ou senha errados!';
      });
  });
}

// Verificar login
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes('index.html')) {
    window.location.href = 'dashboard.html';
  } else if (!user && window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'index.html';
  }
});

// Sair
const sairButton = document.getElementById('sair');
if (sairButton) {
  sairButton.addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = 'index.html';
    });
  });
}

// Adicionar funcionário (com comissão)
const funcionarioForm = document.getElementById('funcionarioForm');
const listaFuncionarios = document.getElementById('listaFuncionarios');

if (funcionarioForm) {
  funcionarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeFuncionario').value;
    const funcao = document.getElementById('funcaoFuncionario').value;
    const comissao = Number(document.getElementById('comissaoFuncionario').value);
    if (nome && funcao && comissao >= 0 && comissao <= 100) {
      console.log('Tentando adicionar funcionário:', { nome, funcao, comissao });
      await addDoc(collection(db, 'funcionarios'), {
        nome,
        funcao,
        comissao
      });
      funcionarioForm.reset();
    } else {
      console.log("Preencha nome, função e comissão (0-100) antes de adicionar!");
    }
  });
}

// Mostrar funcionários (com comissão)
if (listaFuncionarios) {
  onSnapshot(collection(db, 'funcionarios'), (snapshot) => {
    listaFuncionarios.innerHTML = '';
    snapshot.forEach((doc) => {
      const funcionario = doc.data();
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${funcionario.nome} - ${funcionario.funcao} (Comissão: ${funcionario.comissao}%)`;
      listaFuncionarios.appendChild(li);
    });
  }, (error) => {
    console.error("Erro ao carregar funcionários:", error);
  });
}

// Adicionar cliente
const clienteForm = document.getElementById('clienteForm');
const listaClientes = document.getElementById('listaClientes');

if (clienteForm) {
  clienteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeCliente').value;
    if (nome) {
      console.log('Tentando adicionar cliente:', { nome });
      await addDoc(collection(db, 'clientes'), {
        nome
      });
      clienteForm.reset();
    } else {
      console.log("Digite um nome antes de adicionar!");
    }
  });
}

// Mostrar clientes e preencher select
const clienteSelect = document.getElementById('cliente');
if (listaClientes || clienteSelect) {
  onSnapshot(collection(db, 'clientes'), (snapshot) => {
    if (listaClientes) {
      listaClientes.innerHTML = '';
    }
    if (clienteSelect) {
      clienteSelect.innerHTML = '<option value="">Selecione</option>';
    }
    snapshot.forEach((doc) => {
      const cliente = doc.data();
      if (listaClientes) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = cliente.nome;
        listaClientes.appendChild(li);
      }
      if (clienteSelect) {
        const option = document.createElement('option');
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        clienteSelect.appendChild(option);
      }
    });
  }, (error) => {
    console.error("Erro ao carregar clientes:", error);
  });
}

// Adicionar serviço (com comissão)
const servicoForm = document.getElementById('servicoForm');
const listaServicos = document.getElementById('listaServicos');

if (servicoForm) {
  servicoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeServico').value;
    const preco = Number(document.getElementById('precoServico').value);
    const funcao = document.getElementById('funcaoServico').value;
    const comissao = Number(document.getElementById('comissaoServico').value);
    if (nome && preco && funcao && comissao >= 0 && comissao <= 100) {
      console.log('Tentando adicionar serviço:', { nome, preco, funcao, comissao });
      await addDoc(collection(db, 'servicos'), {
        nome,
        preco,
        funcao,
        comissao
      });
      servicoForm.reset();
    } else {
      console.log("Digite nome, preço, função e comissão (0-100) antes de adicionar!");
    }
  });
}

// Mostrar serviços e preencher selects (com comissão)
const servicosContainer = document.getElementById('servicosContainer');
let servicos = [];
if (listaServicos || servicosContainer) {
  onSnapshot(collection(db, 'servicos'), (snapshot) => {
    servicos = [];
    if (listaServicos) {
      listaServicos.innerHTML = '';
    }
    snapshot.forEach((doc) => {
      const servico = doc.data();
      servicos.push(servico);
      if (listaServicos) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${servico.nome} - R$${servico.preco} (${servico.funcao}) - Comissão: ${servico.comissao}%`;
        listaServicos.appendChild(li);
      }
    });
    atualizarServicos();
  }, (error) => {
    console.error("Erro ao carregar serviços:", error);
  });
}

// Função para atualizar os selects de serviços e funcionários
function atualizarServicos() {
  const servicoSelects = document.querySelectorAll('.servicoSelect');
  const funcionarioSelects = document.querySelectorAll('.funcionarioSelect');
  let funcionarios = [];

  onSnapshot(collection(db, 'funcionarios'), (snapshot) => {
    funcionarios = [];
    snapshot.forEach((doc) => {
      funcionarios.push(doc.data());
    });

    servicoSelects.forEach((select, index) => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Selecione</option>';
      servicos.forEach((servico) => {
        const option = document.createElement('option');
        option.value = JSON.stringify(servico);
        option.textContent = servico.nome;
        select.appendChild(option);
      });
      if (currentValue) {
        select.value = currentValue;
      }

      const funcSelect = funcionarioSelects[index];
      const currentFuncValue = funcSelect.value;
      funcSelect.innerHTML = '<option value="">Selecione</option>';

      if (select.value) {
        const selectedServico = JSON.parse(select.value || '{}');
        if (selectedServico.funcao) {
          funcionarios.forEach((funcionario) => {
            if (funcionario.funcao === selectedServico.funcao) {
              const option = document.createElement('option');
              option.value = funcionario.nome;
              option.textContent = funcionario.nome;
              funcSelect.appendChild(option);
            }
          });
        }
      }
      if (currentFuncValue) {
        funcSelect.value = currentFuncValue;
      }

      if (!select.dataset.listenerAdded) {
        select.addEventListener('change', () => {
          const selectedServico = JSON.parse(select.value || '{}');
          funcSelect.innerHTML = '<option value="">Selecione</option>';
          if (selectedServico.funcao) {
            funcionarios.forEach((funcionario) => {
              if (funcionario.funcao === selectedServico.funcao) {
                const option = document.createElement('option');
                option.value = funcionario.nome;
                option.textContent = funcionario.nome;
                funcSelect.appendChild(option);
              }
            });
          }
        });
        select.dataset.listenerAdded = 'true';
      }
    });
  }, (error) => {
    console.error("Erro ao atualizar serviços:", error);
  });
}

// Adicionar mais serviços
const adicionarServicoBtn = document.getElementById('adicionarServico');
if (adicionarServicoBtn) {
  adicionarServicoBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'servicoItem row g-2 mb-2';
    div.innerHTML = `
      <div class="col">
        <select class="servicoSelect form-select"></select>
      </div>
      <div class="col">
        <select class="funcionarioSelect form-select"></select>
      </div>
      <div class="col-auto">
        <button type="button" class="removerServico btn btn-danger">Remover</button>
      </div>
    `;
    servicosContainer.appendChild(div);
    atualizarServicos();
    div.querySelector('.removerServico').addEventListener('click', () => {
      div.remove();
    });
  });
}

// Abrir comanda
const comandaForm = document.getElementById('comandaForm');
if (comandaForm) {
  comandaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente = document.getElementById('cliente').value;
    const data = document.getElementById('data').value;
    const servicoItems = document.querySelectorAll('.servicoItem');

    const servicosSelecionados = [];
    let total = 0;

    servicoItems.forEach((item, index) => {
      const servicoSelect = item.querySelector('.servicoSelect');
      const funcionarioSelect = item.querySelector('.funcionarioSelect');
      const servicoValue = servicoSelect.value;
      const funcionarioValue = funcionarioSelect.value;

      console.log(`Serviço ${index}:`, { servicoValue, funcionarioValue });

      if (servicoValue && funcionarioValue) {
        const servico = JSON.parse(servicoValue);
        if (servico.nome && servico.preco) {
          const comissaoServico = servico.comissao !== undefined ? servico.comissao : 50;
          servicosSelecionados.push({
            nome: servico.nome,
            funcionario: funcionarioValue,
            preco: servico.preco,
            comissaoServico: comissaoServico
          });
          total += servico.preco;
          console.log(`Serviço ${index} adicionado:`, servicosSelecionados[servicosSelecionados.length - 1]);
        } else {
          console.log(`Serviço ${index} inválido:`, servico);
        }
      } else {
        console.log(`Serviço ${index} incompleto: serviço=${servicoValue}, funcionário=${funcionarioValue}`);
      }
    });

    if (!cliente) {
      console.log("Erro: Cliente não selecionado!");
      return;
    }
    if (!data) {
      console.log("Erro: Data não preenchida!");
      return;
    }
    if (servicosSelecionados.length === 0) {
      console.log("Erro: Nenhum serviço válido selecionado!");
      return;
    }

    const comandaData = {
      cliente,
      servicos: servicosSelecionados,
      data,
      status: 'aberta',
      total
    };

    console.log('Abrindo comanda:', comandaData);

    try {
      await addDoc(collection(db, 'comandas'), comandaData);
      comandaForm.reset();
      servicosContainer.innerHTML = `
        <div class="servicoItem row g-2 mb-2">
          <div class="col">
            <select class="servicoSelect form-select"></select>
          </div>
          <div class="col">
            <select class="funcionarioSelect form-select"></select>
          </div>
          <div class="col-auto">
            <button type="button" class="removerServico btn btn-danger">Remover</button>
          </div>
        </div>
      `;
      atualizarServicos();
    } catch (error) {
      console.error("Erro ao salvar comanda:", error);
    }
  });
}

// Mostrar comandas abertas e preencher select para fechar
const comandasAbertas = document.getElementById('comandasAbertas');
const comandaSelect = document.getElementById('comandaSelect');
const totalComanda = document.getElementById('totalComanda');
let comandasAbertasList = [];
if (comandasAbertas || comandaSelect) {
  onSnapshot(collection(db, 'comandas'), (snapshot) => {
    if (comandasAbertas) {
      comandasAbertas.innerHTML = '';
    }
    if (comandaSelect) {
      comandaSelect.innerHTML = '<option value="">Selecione</option>';
    }
    comandasAbertasList = [];
    snapshot.forEach((doc) => {
      const comanda = { id: doc.id, ...doc.data() };
      if (comanda.status === 'aberta') {
        comandasAbertasList.push(comanda);
        if (comandasAbertas) {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          const servicosText = comanda.servicos.map(s => `${s.nome} com ${s.funcionario}`).join(', ');
          li.textContent = `${comanda.cliente} - ${servicosText} em ${new Date(comanda.data).toLocaleString('pt-BR')} - Total: R$${comanda.total}`;
          comandasAbertas.appendChild(li);
        }
        if (comandaSelect) {
          const option = document.createElement('option');
          option.value = JSON.stringify(comanda);
          option.textContent = `${comanda.cliente} - ${new Date(comanda.data).toLocaleString('pt-BR')}`;
          comandaSelect.appendChild(option);
        }
      }
    });
  }, (error) => {
    console.error("Erro ao carregar comandas abertas:", error);
  });
}

if (comandaSelect) {
  comandaSelect.addEventListener('change', () => {
    const selectedComanda = JSON.parse(comandaSelect.value || '{}');
    totalComanda.textContent = selectedComanda.total ? `R$${selectedComanda.total}` : 'R$0';
  });
}

// Mostrar comandas fechadas
const comandasFechadas = document.getElementById('comandasFechadas');
if (comandasFechadas) {
  onSnapshot(collection(db, 'comandas'), (snapshot) => {
    comandasFechadas.innerHTML = '';
    snapshot.forEach((doc) => {
      const comanda = doc.data();
      if (comanda.status === 'fechada') {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        const servicosText = comanda.servicos.map(s => `${s.nome} com ${s.funcionario}`).join(', ');
        const pagamentosText = comanda.pagamentos.map(p => `${p.metodo}: R$${p.valor}`).join(', ');
        li.textContent = `${comanda.cliente} - ${servicosText} em ${new Date(comanda.data).toLocaleString('pt-BR')} - Total: R$${comanda.total} (${pagamentosText})`;
        comandasFechadas.appendChild(li);
      }
    });
  }, (error) => {
    console.error("Erro ao carregar comandas fechadas:", error);
  });
}

// Mostrar comissões dos profissionais (usando a coleção comissoes)
const listaComissoes = document.getElementById('listaComissoes');
if (listaComissoes) {
  onSnapshot(collection(db, 'comissoes'), (snapshot) => {
    const comissoes = {};
    snapshot.forEach((doc) => {
      const comissao = doc.data();
      const funcionario = comissao.funcionario;
      if (!comissoes[funcionario]) {
        comissoes[funcionario] = 0;
      }
      comissoes[funcionario] += comissao.valorComissao;
    });

    listaComissoes.innerHTML = '';
    for (const funcionario in comissoes) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${funcionario} - Comissão: R$${comissoes[funcionario].toFixed(2)}`;
      listaComissoes.appendChild(li);
    }
  }, (error) => {
    console.error("Erro ao carregar comissões:", error);
    listaComissoes.innerHTML = '<li class="list-group-item">Erro ao carregar comissões. Tente recarregar a página.</li>';
  });
}

// Adicionar mais pagamentos
const adicionarPagamentoBtn = document.getElementById('adicionarPagamento');
const pagamentosContainer = document.getElementById('pagamentosContainer');
if (adicionarPagamentoBtn) {
  adicionarPagamentoBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'pagamentoItem row g-2 mb-2';
    div.innerHTML = `
      <div class="col">
        <select class="metodoPagamento form-select">
          <option value="Pix">Pix</option>
          <option value="Crédito">Crédito</option>
          <option value="Débito">Débito</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
      </div>
      <div class="col">
        <input type="number" class="valorPagamento form-control" placeholder="Valor (R$)">
      </div>
      <div class="col-auto">
        <button type="button" class="removerPagamento btn btn-danger">Remover</button>
      </div>
    `;
    pagamentosContainer.appendChild(div);
    div.querySelector('.removerPagamento').addEventListener('click', () => {
      div.remove();
    });
  });
}

// Fechar comanda e registrar comissões
const fecharComandaForm = document.getElementById('fecharComandaForm');
if (fecharComandaForm) {
  fecharComandaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedComanda = JSON.parse(comandaSelect.value || '{}');
    const pagamentoItems = document.querySelectorAll('.pagamentoItem');

    const pagamentos = [];
    let totalPago = 0;
    pagamentoItems.forEach((item) => {
      const metodo = item.querySelector('.metodoPagamento').value;
      const valor = Number(item.querySelector('.valorPagamento').value || 0);
      if (metodo && valor) {
        pagamentos.push({ metodo, valor });
        totalPago += valor;
      }
    });

    if (selectedComanda.id && totalPago === selectedComanda.total) {
      console.log('Fechando comanda:', { id: selectedComanda.id, pagamentos, total: selectedComanda.total });
      const comandaRef = doc(db, 'comandas', selectedComanda.id);

      try {
        // Atualizar o status da comanda
        await updateDoc(comandaRef, {
          status: 'fechada',
          pagamentos
        });

        // Pegar os funcionários (usando getDocs em vez de onSnapshot)
        const funcionariosSnapshot = await getDocs(collection(db, 'funcionarios'));
        const funcionarios = {};
        funcionariosSnapshot.forEach((doc) => {
          const func = doc.data();
          funcionarios[func.nome] = func.comissao;
        });

        // Registrar comissões na coleção 'comissoes'
        for (const servico of selectedComanda.servicos) {
          const funcionario = servico.funcionario;
          const comissaoFuncionario = funcionarios[funcionario] || 50;
          const comissaoServico = servico.comissaoServico || 50;
          const comissaoPercentual = Math.max(comissaoFuncionario, comissaoServico);
          const valorComissao = (servico.preco * comissaoPercentual) / 100;

          await addDoc(collection(db, 'comissoes'), {
            funcionario: servico.funcionario,
            servico: servico.nome,
            valorComissao: valorComissao,
            data: selectedComanda.data,
            comandaId: selectedComanda.id
          });
          console.log(`Comissão registrada: ${funcionario} - ${servico.nome} - R$${valorComissao}`);
        }

        // Resetar o formulário
        fecharComandaForm.reset();
        pagamentosContainer.innerHTML = `
          <div class="pagamentoItem row g-2 mb-2">
            <div class="col">
              <select class="metodoPagamento form-select">
                <option value="Pix">Pix</option>
                <option value="Crédito">Crédito</option>
                <option value="Débito">Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div class="col">
              <input type="number" class="valorPagamento form-control" placeholder="Valor (R$)">
            </div>
            <div class="col-auto">
              <button type="button" class="removerPagamento btn btn-danger">Remover</button>
            </div>
          </div>
        `;
        totalComanda.textContent = 'R$0';
      } catch (error) {
        console.error("Erro ao fechar comanda ou registrar comissões:", error);
      }
    } else {
      console.log("Selecione uma comanda e verifique se o total pago coincide com o valor da comanda!");
    }
  });
}