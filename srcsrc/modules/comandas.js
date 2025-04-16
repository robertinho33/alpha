// src/modules/comandas.js
import { addComanda, updateComanda, closeComanda, listenServicos, listenFuncionarios } from '../db/comandas.js';
import { renderSelect } from '../ui/render.js';

export function initComandas() {
  let servicoSelectCount = 0;
  let funcionarioSelectCount = 0;

  const comandaForm = document.getElementById('comandaForm');
  if (comandaForm) {
    const servicosContainer = document.getElementById('servicosContainer');
    const adicionarServicoButton = document.getElementById('adicionarServico');

    function adicionarServicoItem(servicos = [], funcionarios = {}) {
      const servicoItem = document.createElement('div');
      servicoItem.className = 'servicoItem row g-2 mb-2';
      const servicoSelectId = `servicoSelect-${servicoSelectCount++}`;
      const funcionarioSelectId = `funcionarioSelect-${funcionarioSelectCount++}`;
      servicoItem.innerHTML = `
        <div class="col">
          <select id="${servicoSelectId}" class="servicoSelect form-select">
            <option value="">Selecione um serviço...</option>
          </select>
        </div>
        <div class="col">
          <select id="${funcionarioSelectId}" class="funcionarioSelect form-select">
            <option value="">Selecione um profissional...</option>
          </select>
        </div>
        <div class="col-auto">
          <button type="button" class="removerServico btn btn-danger">Remover</button>
        </div>
      `;
      servicosContainer.appendChild(servicoItem);

      if (servicos.length > 0) {
        renderSelect(servicoSelectId, servicos, JSON.stringify, (s) => s.nome);
      } else {
        listenServicos((servicosData) => {
          console.log('Preenchendo serviço:', servicoSelectId, servicosData);
          renderSelect(servicoSelectId, servicosData, JSON.stringify, (s) => s.nome);
        });
      }

      const servicoSelect = servicoItem.querySelector(`#${servicoSelectId}`);
      servicoSelect.addEventListener('change', () => {
        let selectedServico;
        try {
          selectedServico = JSON.parse(servicoSelect.value || '{}');
        } catch (e) {
          console.error('Erro ao parsear serviço:', e);
          selectedServico = {};
        }
        if (selectedServico.funcao) {
          listenFuncionarios((funcionarios) => {
            const filteredFuncionarios = Object.entries(funcionarios)
              .filter(([_, data]) => data.funcao === selectedServico.funcao)
              .map(([nome]) => nome);
            console.log('Funcionários filtrados:', filteredFuncionarios);
            renderSelect(funcionarioSelectId, filteredFuncionarios, null, null);
          });
        } else {
          renderSelect(funcionarioSelectId, [], null, null);
        }
      });

      servicoItem.querySelector('.removerServico').addEventListener('click', () => {
        servicosContainer.removeChild(servicoItem);
      });
    }

    adicionarServicoButton.addEventListener('click', () => {
      adicionarServicoItem();
    });

    comandaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cliente = document.getElementById('cliente').value;
      const data = document.getElementById('data').value;
      const servicoItems = document.querySelectorAll('.servicoItem');
      const servicosSelecionados = [];
      let total = 0;

      servicoItems.forEach((item) => {
        const servicoSelect = item.querySelector('.servicoSelect');
        const funcionarioSelect = item.querySelector('.funcionarioSelect');
        let servico;
        try {
          servico = JSON.parse(servicoSelect.value || '{}');
        } catch (e) {
          console.error('Erro ao parsear serviço:', e);
          return;
        }
        const funcionario = funcionarioSelect.value;
        if (servico.nome && funcionario) {
          const comissaoServico = servico.comissao !== undefined ? servico.comissao : 50;
          servicosSelecionados.push({
            nome: servico.nome,
            funcionario,
            preco: servico.preco,
            comissaoServico
          });
          total += servico.preco;
        }
      });

      if (cliente && data && servicosSelecionados.length > 0) {
        await addComanda({
          cliente,
          servicos: servicosSelecionados,
          data,
          status: 'aberta',
          total
        });
        comandaForm.reset();
        while (servicosContainer.children.length > 1) {
          servicosContainer.removeChild(servicosContainer.lastChild);
        }
        adicionarServicoItem();
      } else {
        alert('Preencha todos os campos e selecione pelo menos um serviço!');
      }
    });

    Promise.all([
      new Promise((resolve) => listenServicos(resolve)),
      new Promise((resolve) => listenFuncionarios(resolve))
    ]).then(([servicos, funcionarios]) => {
      console.log('Dados iniciais carregados:', servicos, funcionarios);
      adicionarServicoItem(servicos, funcionarios);
    });
  }

  const fecharComandaForm = document.getElementById('fecharComandaForm');
  if (fecharComandaForm) {
    const pagamentosContainer = document.getElementById('pagamentosContainer');
    const adicionarPagamentoButton = document.getElementById('adicionarPagamento');
    const comandaSelect = document.getElementById('comandaSelect');

    let comandaModal = document.getElementById('comandaModal');
    if (!comandaModal) {
      comandaModal = document.createElement('div');
      comandaModal.className = 'modal fade';
      comandaModal.id = 'comandaModal';
      comandaModal.tabIndex = -1;
      comandaModal.setAttribute('aria-labelledby', 'comandaModalLabel');
      comandaModal.setAttribute('aria-hidden', 'true');
      comandaModal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="comandaModalLabel">Detalhes da Comanda</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="comandaModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="editarComandaBtn">Salvar Alterações</button>
              <button type="button" class="btn btn-success" id="fecharComandaBtn">Fechar Comanda</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(comandaModal);
    }

    function adicionarPagamentoItem() {
      const pagamentoItem = document.createElement('div');
      pagamentoItem.className = 'pagamentoItem row g-2 mb-2';
      pagamentoItem.innerHTML = `
        <div class="col">
          <select class="metodoPagamento form-select">
            <option value="Pix">Pix</option>
            <option value="Crédito">Crédito</option>
            <option value="Débito">Débito</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </div>
        <div class="col">
          <input type="number" class="valorPagamento form-control" placeholder="Valor (R$)" min="0" step="0.01">
        </div>
        <div class="col-auto">
          <button type="button" class="removerPagamento btn btn-danger">Remover</button>
        </div>
      `;
      pagamentosContainer.appendChild(pagamentoItem);

      pagamentoItem.querySelector('.removerPagamento').addEventListener('click', () => {
        pagamentosContainer.removeChild(pagamentoItem);
      });
    }

    // src/modules/comandas.js (trecho do fecharComandaForm)
function renderComandaModal(comanda, servicosDisponiveis, funcionarios) {
  console.log('Iniciando renderComandaModal com:', { comanda, servicosDisponiveis, funcionarios }); // Log 4: entrada
  const modalBody = document.getElementById('comandaModalBody');
  if (!comanda || !comanda.id) {
    console.log('Comanda inválida ou sem ID:', comanda);
    modalBody.innerHTML = '<div class="alert alert-warning">Nenhuma comanda selecionada.</div>';
    return;
  }

  // Valores padrão e formatação
  const cliente = comanda.cliente || '';
  const data = comanda.data ? comanda.data.split('T')[0] : ''; // Remove timestamp
  const status = comanda.status || 'Aberta';
  const servicos = Array.isArray(comanda.servicos) ? comanda.servicos : [];
  const pagamentos = Array.isArray(comanda.pagamentos) ? comanda.pagamentos : [];
  const total = Number(comanda.total) || 0;

  console.log('Dados processados:', { cliente, data, status, servicos, pagamentos, total }); // Log 5: dados formatados

  modalBody.innerHTML = `
    <div id="modalAlertContainer"></div>
    <div class="mb-3">
      <label class="form-label"><strong>Cliente:</strong></label>
      <input type="text" class="form-control fs-5" id="modalCliente" value="${cliente.replace(/"/g, '&quot;')}" placeholder="Nome do cliente">
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Data:</strong></label>
      <input type="date" class="form-control fs-5" id="modalData" value="${data}">
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Status:</strong></label>
      <input type="text" class="form-control fs-5" id="modalStatus" value="${status}" readonly>
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Serviços:</strong></label>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Profissional</th>
            <th>Preço (R$)</th>
            <th>Comissão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="modalServicosContainer">
          ${
            servicos.length > 0
              ? servicos
                  .map(
                    (s, index) => `
                      <tr class="servicoModalItem" data-index="${index}">
                        <td>
                          <select id="servicoModal-${index}" class="servicoModalSelect form-select fs-5">
                            <option value="">Selecione...</option>
                          </select>
                        </td>
                        <td>
                          <select id="funcionarioModal-${index}" class="funcionarioModalSelect form-select fs-5">
                            <option value="">Selecione...</option>
                          </select>
                        </td>
                        <td class="text-center">${s.preco || 0}</td>
                        <td class="text-center">${s.comissaoServico || 0}</td>
                        <td class="text-center">
                          <button type="button" class="removerServicoModal btn btn-danger btn-sm">Remover</button>
                        </td>
                      </tr>
                    `
                  )
                  .join('')
              : '<tr><td colspan="5">Nenhum serviço registrado.</td></tr>'
          }
        </tbody>
      </table>
      <button type="button" id="adicionarServicoModal" class="btn btn-secondary btn-sm mt-2">Adicionar Serviço</button>
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Pagamentos:</strong></label>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Método</th>
            <th>Valor (R$)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="modalPagamentosContainer">
          ${
            pagamentos.length > 0
              ? pagamentos
                  .map(
                    (p, index) => `
                      <tr class="pagamentoModalItem" data-index="${index}">
                        <td>
                          <select id="metodoModal-${index}" class="metodoModalSelect form-select fs-5">
                            <option value="Pix" ${p.metodo === 'Pix' ? 'selected' : ''}>Pix</option>
                            <option value="Crédito" ${p.metodo === 'Crédito' ? 'selected' : ''}>Crédito</option>
                            <option value="Débito" ${p.metodo === 'Débito' ? 'selected' : ''}>Débito</option>
                            <option value="Dinheiro" ${p.metodo === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" id="valorModal-${index}" class="valorModalInput form-control fs-5" value="${p.valor || 0}" placeholder="Valor (R$)" min="0" step="0.01">
                        </td>
                        <td class="text-center">
                          <button type="button" class="removerPagamentoModal btn btn-danger btn-sm">Remover</button>
                        </td>
                      </tr>
                    `
                  )
                  .join('')
              : '<tr><td colspan="3">Nenhum pagamento registrado.</td></tr>'
          }
        </tbody>
      </table>
      <button type="button" id="adicionarPagamentoModal" class="btn btn-secondary btn-sm mt-2">Adicionar Pagamento</button>
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Total da Comanda:</strong></label>
      <span id="modalTotal" class="fw-bold">${total.toFixed(2)}</span>
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Total Pago:</strong></label>
      <span id="modalTotalPago" class="fw-bold">0.00</span>
    </div>
    <div class="mb-3">
      <label class="form-label"><strong>Restante a Pagar:</strong></label>
      <span id="modalRestante" class="fw-bold">${total.toFixed(2)}</span>
    </div>
  `;

  const modalServicosContainer = modalBody.querySelector('#modalServicosContainer');
  const modalPagamentosContainer = modalBody.querySelector('#modalPagamentosContainer');
  let servicoModalCount = servicos.length;
  let pagamentoModalCount = pagamentos.length;

  // Preencher serviços
  console.log('Preenchendo serviços no modal:', servicos); // Log 6: serviços
  // src/modules/comandas.js (dentro de renderComandaModal)
// src/modules/comandas.js (dentro de renderComandaModal)
// src/modules/comandas.js (dentro de renderComandaModal)
servicos.forEach((servico, index) => {
  const servicoSelect = modalBody.querySelector(`#servicoModal-${index}`);
  const funcionarioSelect = modalBody.querySelector(`#funcionarioModal-${index}`);

  console.log(`Processando serviço ${index}:`, servico); // Log 18

  // Preencher opções de serviços
  renderSelect(
    `servicoModal-${index}`,
    servicosDisponiveis,
    (s) => JSON.stringify({
      nome: s.nome,
      funcao: s.funcao,
      preco: s.preco,
      comissao: s.comissao,
      id: s.id
    }),
    (s) => s.nome
  );

  // Selecionar o serviço correto
  const servicoValue = servicosDisponiveis.find((s) => s.nome === servico.nome && s.preco === servico.preco);
  if (servicoValue) {
    const valueToSet = JSON.stringify({
      nome: servicoValue.nome,
      funcao: servicoValue.funcao,
      preco: servicoValue.preco,
      comissao: servico.comissaoServico || servicoValue.comissao,
      id: servicoValue.id
    });
    servicoSelect.value = valueToSet;
    console.log(`Serviço ${index} selecionado:`, valueToSet); // Log 7
  } else {
    console.log(`Serviço ${servico.nome} não encontrado em servicosDisponiveis`); // Log 8
  }

  // Preencher opções de funcionários
  const selectedServico = servicoValue || { funcao: '' };
  const filteredFuncionarios = selectedServico.funcao
    ? Object.entries(funcionarios)
        .filter(([_, data]) => data.funcao === selectedServico.funcao)
        .map(([nome]) => nome)
    : [];
  console.log(`Funcionários filtrados para serviço ${index} (${selectedServico.funcao}):`, filteredFuncionarios); // Log 14
  console.log('Valores brutos de filteredFuncionarios:', JSON.stringify(filteredFuncionarios)); // Log 25
  renderSelect(`funcionarioModal-${index}`, filteredFuncionarios, null, null);

  // Normalizar e selecionar funcionário
  const funcionarioNormalizado = (servico.funcionario || '').trim();
  console.log(`Tentando selecionar funcionário para serviço ${index}:`, funcionarioNormalizado); // Log 15
  console.log('Valor bruto de funcionarioNormalizado:', JSON.stringify(funcionarioNormalizado)); // Log 26
  const funcionarioMatch = filteredFuncionarios.find((f) => f.toLowerCase() === funcionarioNormalizado.toLowerCase());
  console.log(`Funcionário correspondente encontrado:`, funcionarioMatch); // Log 27
  if (funcionarioMatch) {
    setTimeout(() => {
      funcionarioSelect.value = funcionarioMatch;
      console.log(`Definindo funcionarioSelect.value para:`, funcionarioMatch); // Log 28
      console.log(`Funcionário ${index} realmente selecionado (após timeout):`, funcionarioSelect.value); // Log 30
      console.log('HTML do select após timeout:', funcionarioSelect.outerHTML); // Log 31
    }, 0);
  } else {
    console.log(`Funcionário ${funcionarioNormalizado} não está nas opções:`, filteredFuncionarios); // Log 17
    funcionarioSelect.value = '';
  }
  console.log(`Funcionário ${index} realmente selecionado:`, funcionarioSelect.value); // Log 16
  console.log('HTML do select após renderização:', funcionarioSelect.outerHTML); // Log 29
});

  // Remover serviço
  modalBody.querySelectorAll('.removerServicoModal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const servicoItem = btn.closest('.servicoModalItem');
      modalServicosContainer.removeChild(servicoItem);
      atualizarTotalModal();
    });
  });

  // Adicionar serviço
  modalBody.querySelector('#adicionarServicoModal')?.addEventListener('click', () => {
    const servicoModalId = `servicoModal-${servicoModalCount}`;
    const funcionarioModalId = `funcionarioModal-${servicoModalCount}`;
    const servicoItem = document.createElement('tr');
    servicoItem.className = 'servicoModalItem';
    servicoItem.innerHTML = `
      <td>
        <select id="${servicoModalId}" class="servicoModalSelect form-select fs-5">
          <option value="">Selecione...</option>
        </select>
      </td>
      <td>
        <select id="${funcionarioModalId}" class="funcionarioModalSelect form-select fs-5">
          <option value="">Selecione...</option>
        </select>
      </td>
      <td class="text-center">0</td>
      <td class="text-center">0</td>
      <td class="text-center">
        <button type="button" class="removerServicoModal btn btn-danger btn-sm">Remover</button>
      </td>
    `;
    modalServicosContainer.appendChild(servicoItem);

    renderSelect(
      servicoModalId,
      servicosDisponiveis,
      (s) => JSON.stringify({
        nome: s.nome,
        funcao: s.funcao,
        preco: s.preco,
        comissao: s.comissao,
        id: s.id
      }),
      (s) => s.nome
    );

    const servicoSelect = modalBody.querySelector(`#${servicoModalId}`);
    servicoSelect.addEventListener('change', () => {
      let newServico;
      try {
        newServico = JSON.parse(servicoSelect.value || '{}');
      } catch (e) {
        console.error('Erro ao parsear serviço modal:', e);
        newServico = {};
      }
      const newFilteredFuncionarios = newServico.funcao
        ? Object.entries(funcionarios)
            .filter(([_, data]) => data.funcao === newServico.funcao)
            .map(([nome]) => nome)
        : [];
      renderSelect(funcionarioModalId, newFilteredFuncionarios, null, null);
      atualizarTotalModal();
    });

    servicoItem.querySelector('.removerServicoModal').addEventListener('click', () => {
      modalServicosContainer.removeChild(servicoItem);
      atualizarTotalModal();
    });

    servicoModalCount++;
  });

  // Remover pagamento
  modalBody.querySelectorAll('.removerPagamentoModal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pagamentoItem = btn.closest('.pagamentoModalItem');
      modalPagamentosContainer.removeChild(pagamentoItem);
      atualizarTotalPago();
    });
  });

  // Adicionar pagamento
  modalBody.querySelector('#adicionarPagamentoModal')?.addEventListener('click', () => {
    const pagamentoModalId = `metodoModal-${pagamentoModalCount}`;
    const valorModalId = `valorModal-${pagamentoModalCount}`;
    const pagamentoItem = document.createElement('tr');
    pagamentoItem.className = 'pagamentoModalItem';
    pagamentoItem.innerHTML = `
      <td>
        <select id="${pagamentoModalId}" class="metodoModalSelect form-select fs-5">
          <option value="Pix">Pix</option>
          <option value="Crédito">Crédito</option>
          <option value="Débito">Débito</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
      </td>
      <td>
        <input type="number" id="${valorModalId}" class="valorModalInput form-control fs-5" placeholder="Valor (R$)" min="0" step="0.01">
      </td>
      <td class="text-center">
        <button type="button" class="removerPagamentoModal btn btn-danger btn-sm">Remover</button>
      </td>
    `;
    modalPagamentosContainer.appendChild(pagamentoItem);

    const valorInput = pagamentoItem.querySelector(`#${valorModalId}`);
    valorInput.addEventListener('input', atualizarTotalPago);

    pagamentoItem.querySelector('.removerPagamentoModal').addEventListener('click', () => {
      modalPagamentosContainer.removeChild(pagamentoItem);
      atualizarTotalPago();
    });

    pagamentoModalCount++;
    atualizarTotalPago();
  });

  function atualizarTotalModal() {
    const servicoItems = modalServicosContainer.querySelectorAll('.servicoModalItem');
    let novoTotal = 0;
    servicoItems.forEach((item) => {
      const servicoSelect = item.querySelector('.servicoModalSelect');
      let servico;
      try {
        servico = JSON.parse(servicoSelect.value || '{}');
      } catch (e) {
        servico = { preco: 0 };
      }
      novoTotal += servico.preco || 0;
      const row = item.closest('tr');
      row.children[2].textContent = servico.preco || 0;
      row.children[3].textContent = servico.comissao || 0;
    });
    modalBody.querySelector('#modalTotal').textContent = novoTotal.toFixed(2);
    atualizarTotalPago();
  }

  function atualizarTotalPago() {
    const pagamentoItems = modalPagamentosContainer.querySelectorAll('.pagamentoModalItem');
    let totalPago = 0;
    pagamentoItems.forEach((item) => {
      const valorInput = item.querySelector('.valorModalInput');
      totalPago += Number(valorInput.value || 0);
    });
    const totalComanda = Number(modalBody.querySelector('#modalTotal').textContent);
    modalBody.querySelector('#modalTotalPago').textContent = totalPago.toFixed(2);
    modalBody.querySelector('#modalRestante').textContent = (totalComanda - totalPago).toFixed(2);
  }

  atualizarTotalPago();
}

    // src/modules/comandas.js (trecho do fecharComandaForm)
    comandaSelect.addEventListener('change', () => {
      console.log('comandaSelect mudou, valor bruto:', comandaSelect.value); // Log 10: valor cru
      let selectedComanda;
      try {
        selectedComanda = comandaSelect.value ? JSON.parse(comandaSelect.value) : {};
        console.log('Comanda parseada:', selectedComanda); // Log 11: após parse
      } catch (e) {
        console.error('Erro ao parsear comanda:', e, 'Valor:', comandaSelect.value);
        selectedComanda = {};
      }
      if (!selectedComanda.id) {
        console.log('Nenhuma comanda válida selecionada:', selectedComanda); // Log 12: sem ID
        return;
      }
      Promise.all([
        new Promise((resolve) => listenServicos((data) => resolve(data))),
        new Promise((resolve) => listenFuncionarios((data) => resolve(data)))
      ])
        .then(([servicos, funcionarios]) => {
          console.log('Dados carregados para modal:', { servicos, funcionarios }); // Log 13: serviços e funcionários
          renderComandaModal(selectedComanda, servicos, funcionarios);
          const modal = new bootstrap.Modal(document.getElementById('comandaModal'));
          modal.show();
        })
        .catch((error) => {
          console.error('Erro ao carregar serviços ou funcionários:', error);
          alert('Erro ao carregar detalhes da comanda.');
        });
    });

    document.getElementById('editarComandaBtn')?.addEventListener('click', async () => {
      let selectedComanda;
      try {
        selectedComanda = comandaSelect.value ? JSON.parse(comandaSelect.value) : {};
      } catch (e) {
        console.error('Erro ao parsear comanda para edição:', e);
        return;
      }
      if (!selectedComanda.id) {
        showAlert('Selecione uma comanda válida.', 'danger');
        return;
      }

      const modalCliente = document.getElementById('modalCliente').value.trim();
      const modalData = document.getElementById('modalData').value;
      const modalServicosContainer = document.getElementById('modalServicosContainer');
      const servicoItems = modalServicosContainer.querySelectorAll('.servicoModalItem');
      const servicosAtualizados = [];
      let total = 0;

      if (!modalCliente) {
        showAlert('O nome do cliente é obrigatório.', 'danger');
        return;
      }
      if (!modalData) {
        showAlert('A data é obrigatória.', 'danger');
        return;
      }

      servicoItems.forEach((item) => {
        const servicoSelect = item.querySelector('.servicoModalSelect');
        const funcionarioSelect = item.querySelector('.funcionarioModalSelect');
        let servico;
        try {
          servico = JSON.parse(servicoSelect.value || '{}');
        } catch (e) {
          console.error('Erro ao parsear serviço editado:', e);
          return;
        }
        const funcionario = funcionarioSelect.value;
        if (servico.nome && funcionario) {
          const comissaoServico = servico.comissao !== undefined ? servico.comissao : 50;
          servicosAtualizados.push({
            nome: servico.nome,
            funcionario,
            preco: servico.preco,
            comissaoServico
          });
          total += servico.preco;
        }
      });

      if (servicosAtualizados.length === 0) {
        showAlert('Adicione pelo menos um serviço.', 'danger');
        return;
      }

      try {
        await updateComanda(selectedComanda.id, {
          cliente: modalCliente,
          data: modalData,
          servicos: servicosAtualizados,
          total,
          status: 'aberta'
        });
        console.log('Comanda atualizada:', selectedComanda.id);
        showAlert('Comanda atualizada com sucesso!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('comandaModal')).hide();
      } catch (error) {
        console.error('Erro ao atualizar comanda:', error);
        showAlert('Erro ao salvar alterações.', 'danger');
      }
    });

    document.getElementById('fecharComandaBtn')?.addEventListener('click', async () => {
      let selectedComanda;
      try {
        selectedComanda = comandaSelect.value ? JSON.parse(comandaSelect.value) : {};
      } catch (e) {
        console.error('Erro ao parsear comanda para fechar:', e);
        return;
      }
      if (!selectedComanda.id) {
        showAlert('Selecione uma comanda válida.', 'danger');
        return;
      }

      const modalCliente = document.getElementById('modalCliente').value.trim();
      const modalData = document.getElementById('modalData').value;
      const modalServicosContainer = document.getElementById('modalServicosContainer');
      const modalPagamentosContainer = document.getElementById('modalPagamentosContainer');
      const servicoItems = modalServicosContainer.querySelectorAll('.servicoModalItem');
      const pagamentoItems = modalPagamentosContainer.querySelectorAll('.pagamentoModalItem');
      const servicosAtualizados = [];
      const pagamentos = [];
      let total = 0;
      let totalPago = 0;

      if (!modalCliente) {
        showAlert('O nome do cliente é obrigatório.', 'danger');
        return;
      }
      if (!modalData) {
        showAlert('A data é obrigatória.', 'danger');
        return;
      }

      servicoItems.forEach((item) => {
        const servicoSelect = item.querySelector('.servicoModalSelect');
        const funcionarioSelect = item.querySelector('.funcionarioModalSelect');
        let servico;
        try {
          servico = JSON.parse(servicoSelect.value || '{}');
        } catch (e) {
          console.error('Erro ao parsear serviço editado:', e);
          return;
        }
        const funcionario = funcionarioSelect.value;
        if (servico.nome && funcionario) {
          const comissaoServico = servico.comissao !== undefined ? servico.comissao : 50;
          servicosAtualizados.push({
            nome: servico.nome,
            funcionario,
            preco: servico.preco,
            comissaoServico
          });
          total += servico.preco;
        }
      });

      pagamentoItems.forEach((item) => {
        const metodoSelect = item.querySelector('.metodoModalSelect');
        const valorInput = item.querySelector('.valorModalInput');
        const metodo = metodoSelect.value;
        const valor = Number(valorInput.value || 0);
        if (metodo && valor) {
          pagamentos.push({ metodo, valor });
          totalPago += valor;
        }
      });

      if (servicosAtualizados.length === 0) {
        showAlert('Adicione pelo menos um serviço.', 'danger');
        return;
      }

      if (totalPago !== total) {
        showAlert('O total pago deve ser igual ao total da comanda.', 'danger');
        return;
      }

      try {
        await updateComanda(selectedComanda.id, {
          cliente: modalCliente,
          data: modalData,
          servicos: servicosAtualizados,
          total,
          status: 'aberta'
        });
        const funcionarios = await new Promise((resolve) => {
          listenFuncionarios((data) => resolve(data));
        });
        await closeComanda(selectedComanda.id, pagamentos, funcionarios);
        console.log('Comanda fechada:', selectedComanda.id);
        showAlert('Comanda fechada com sucesso!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('comandaModal')).hide();
        fecharComandaForm.reset();
        while (pagamentosContainer.children.length > 1) {
          pagamentosContainer.removeChild(pagamentosContainer.lastChild);
        }
        adicionarPagamentoItem();
      } catch (error) {
        console.error('Erro ao fechar comanda:', error);
        showAlert('Erro ao fechar comanda.', 'danger');
      }
    });

    function showAlert(message, type) {
      const alertContainer = document.getElementById('modalAlertContainer');
      alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 5000);
    }

    adicionarPagamentoButton.addEventListener('click', adicionarPagamentoItem);

    adicionarPagamentoItem();
  }
  
}