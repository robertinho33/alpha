import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const atendimentoForm = document.getElementById('atendimentoForm');
  const iniciarAtendimentoBtn = document.getElementById('iniciarAtendimento');
  const logoutButton = document.getElementById('logoutButton');
  const cadastroClienteForm = document.getElementById('cadastroClienteForm');
  const clienteErrorDiv = document.getElementById('clienteError');
  const clienteSuccessDiv = document.getElementById('clienteSuccess');
  let horaEntrada = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      errorDiv.textContent = 'Você precisa estar autenticado. Redirecionando...';
      errorDiv.classList.remove('d-none');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    const userId = user.uid;
    const comercioRef = doc(db, 'comercios', userId);
    const clientesRef = collection(db, 'clientes', userId, 'registros');
    const atendimentosRef = collection(db, 'atendimentos', userId, 'registros');
    const servicosRef = collection(db, 'comercios', userId, 'servicos');
    const produtosRef = collection(db, 'comercios', userId, 'produtos');
    const formasPagamentoRef = collection(db, 'comercios', userId, 'formasPagamento');

    // Carregar dados do estabelecimento
    const loadData = async () => {
      try {
        // Metadados
        const docSnap = await getDoc(comercioRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          document.getElementById('nomeComercio').textContent = data.nomeFantasia || 'Estabelecimento';
          document.getElementById('statusComercio').textContent = data.status || 'Indefinido';
          const logoImg = document.getElementById('comercioLogo');
          logoImg.src = data.logo || 'images/logo.png';
        } else {
          errorDiv.textContent = 'Nenhum dado encontrado para este comércio.';
          errorDiv.classList.remove('d-none');
        }

        // Serviços
        const servicosCheckboxes = document.getElementById('servicosCheckboxes');
        const servicosSnap = await getDocs(servicosRef);
        if (!servicosSnap.empty) {
          servicosSnap.forEach(doc => {
            const servico = doc.data();
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
              <input class="form-check-input" type="checkbox" name="servicos" value="${servico.nome}" id="servico-${servico.nome}" data-preco="${servico.preco}" data-duracao="${servico.duracao || ''}">
              <label class="form-check-label" for="servico-${servico.nome}">
                ${servico.nome} (R$${servico.preco.toFixed(2)}${servico.duracao ? `, ${servico.duracao} min` : ''})
              </label>
            `;
            servicosCheckboxes.appendChild(div);
          });
        } else {
          servicosCheckboxes.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
        }

        // Produtos
        const produtosCheckboxes = document.getElementById('produtosCheckboxes');
        const produtosSnap = await getDocs(produtosRef);
        if (!produtosSnap.empty) {
          produtosSnap.forEach(doc => {
            const produto = doc.data();
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
              <input class="form-check-input" type="checkbox" name="produtos" value="${produto.nome}" id="produto-${produto.nome}" data-preco="${produto.preco}" data-estoque="${produto.estoque || ''}">
              <label class="form-check-label" for="produto-${produto.nome}">
                ${produto.nome} (R$${produto.preco.toFixed(2)}${produto.estoque ? `, Estoque: ${produto.estoque}` : ''})
              </label>
            `;
            produtosCheckboxes.appendChild(div);
          });
        } else {
          produtosCheckboxes.innerHTML = '<p>Nenhum produto cadastrado.</p>';
        }

        // Formas de Pagamento
        const pagamentosCheckboxes = document.getElementById('pagamentosCheckboxes');
        const formasPagamentoSnap = await getDocs(formasPagamentoRef);
        if (!formasPagamentoSnap.empty) {
          formasPagamentoSnap.forEach(doc => {
            const forma = doc.data();
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
              <input class="form-check-input" type="checkbox" name="pagamentos" value="${forma.nome}" id="pagamento-${forma.nome}">
              <label class="form-check-label" for="pagamento-${forma.nome}">
                ${forma.nome}
              </label>
            `;
            pagamentosCheckboxes.appendChild(div);
          });
        } else {
          pagamentosCheckboxes.innerHTML = '<p>Nenhuma forma de pagamento cadastrada.</p>';
        }
      } catch (error) {
        errorDiv.textContent = 'Erro ao carregar dados do comércio.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    };

    // Carregar clientes
    const loadClientes = async () => {
      try {
        const clienteSelect = document.getElementById('clienteSelect');
        const querySnapshot = await getDocs(clientesRef);
        querySnapshot.forEach(doc => {
          const cliente = doc.data();
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = cliente.nome;
          clienteSelect.insertBefore(option, clienteSelect.querySelector('option[value="novo"]'));
        });
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };

    // Carregar atendimentos
    const loadAtendimentos = async () => {
      try {
        const querySnapshot = await getDocs(atendimentosRef);
        const atendimentosList = document.getElementById('atendimentosList');
        atendimentosList.innerHTML = '';
        querySnapshot.forEach(doc => {
          const atendimento = doc.data();
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `
            <strong>${atendimento.clienteNome}</strong><br>
            Serviços: ${atendimento.servicos.map(s => `${s.nome} (R$${s.preco.toFixed(2)})`).join(', ') || 'Nenhum'}<br>
            Produtos: ${atendimento.produtos.map(p => `${p.nome} (R$${p.preco.toFixed(2)}, Qtd: ${p.quantidade})`).join(', ') || 'Nenhum'}<br>
            Pagamentos: ${atendimento.formasPagamento.join(', ')}<br>
            Próxima Visita: ${atendimento.proximaVisita ? new Date(atendimento.proximaVisita).toLocaleString('pt-BR') : 'Não agendado'}<br>
            Entrada: ${new Date(atendimento.entrada).toLocaleString('pt-BR')}<br>
            Saída: ${new Date(atendimento.saida).toLocaleString('pt-BR')}<br>
            Permanência: ${atendimento.permanencia} minutos
          `;
          atendimentosList.appendChild(li);
        });
      } catch (error) {
        console.error('Erro ao carregar atendimentos:', error);
      }
    };

    await loadData();
    await loadClientes();
    await loadAtendimentos();

    // Cadastrar cliente
    cadastroClienteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clienteErrorDiv.classList.add('d-none');
      clienteSuccessDiv.classList.add('d-none');

      if (!cadastroClienteForm.checkValidity()) {
        cadastroClienteForm.classList.add('was-validated');
        return;
      }

      const nome = document.getElementById('clienteNome').value.trim();
      const telefone = document.getElementById('clienteTelefone').value.trim();
      const email = document.getElementById('clienteEmail').value.trim();

      try {
        const docRef = await addDoc(clientesRef, {
          nome,
          telefone: telefone || null,
          email: email || null
        });

        const clienteSelect = document.getElementById('clienteSelect');
        const option = document.createElement('option');
        option.value = docRef.id;
        option.textContent = nome;
        clienteSelect.insertBefore(option, clienteSelect.querySelector('option[value="novo"]'));
        clienteSelect.value = docRef.id;

        clienteSuccessDiv.textContent = `Cliente ${nome} cadastrado com sucesso!`;
        clienteSuccessDiv.classList.remove('d-none');
        cadastroClienteForm.reset();
        cadastroClienteForm.classList.remove('was-validated');
        setTimeout(() => {
          document.querySelector('#cadastroClienteModal .btn-close').click();
        }, 2000);
      } catch (error) {
        clienteErrorDiv.textContent = 'Erro ao cadastrar cliente.';
        clienteErrorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Iniciar Atendimento
    iniciarAtendimentoBtn.addEventListener('click', () => {
      horaEntrada = new Date();
      atendimentoForm.classList.remove('d-none');
      iniciarAtendimentoBtn.classList.add('d-none');
      successDiv.textContent = `Atendimento iniciado em ${horaEntrada.toLocaleString('pt-BR')}`;
      successDiv.classList.remove('d-none');
    });

    // Registrar Atendimento
    atendimentoForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');

      if (!atendimentoForm.checkValidity()) {
        atendimentoForm.classList.add('was-validated');
        return;
      }

      if (!horaEntrada) {
        errorDiv.textContent = 'Por favor, inicie o atendimento primeiro.';
        errorDiv.classList.remove('d-none');
        return;
      }

      const clienteSelect = document.getElementById('clienteSelect');
      const clienteId = clienteSelect.value;
      let clienteNome = clienteSelect.options[clienteSelect.selectedIndex].text;

      if (clienteId === 'novo') {
        errorDiv.textContent = 'Por favor, cadastre o novo cliente antes de registrar o atendimento.';
        errorDiv.classList.remove('d-none');
        return;
      }

      const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(input => ({
        nome: input.value,
        preco: parseFloat(input.dataset.preco),
        duracao: input.dataset.duracao ? parseInt(input.dataset.duracao) : null
      }));
      const produtosSelecionados = Array.from(document.querySelectorAll('input[name="produtos"]:checked')).map(input => ({
        nome: input.value,
        preco: parseFloat(input.dataset.preco),
        quantidade: 1
      }));
      const formasPagamento = Array.from(document.querySelectorAll('input[name="pagamentos"]:checked')).map(input => input.value);
      const proximaVisita = document.getElementById('proximaVisita').value;
      const horaSaida = new Date();

      if (servicosSelecionados.length === 0 && produtosSelecionados.length === 0) {
        document.getElementById('servicosFeedback').style.display = 'block';
        return;
      }
      if (formasPagamento.length === 0) {
        document.getElementById('pagamentosFeedback').style.display = 'block';
        return;
      }

      const permanencia = Math.round((horaSaida - horaEntrada) / 1000 / 60);

      try {
        await addDoc(atendimentosRef, {
          clienteId,
          clienteNome,
          servicos: servicosSelecionados,
          produtos: produtosSelecionados,
          formasPagamento,
          proximaVisita: proximaVisita || null,
          entrada: horaEntrada.toISOString(),
          saida: horaSaida.toISOString(),
          permanencia
        });

        successDiv.textContent = `Atendimento de ${clienteNome} registrado com sucesso! Permanência: ${permanencia} minutos`;
        successDiv.classList.remove('d-none');
        atendimentoForm.reset();
        atendimentoForm.classList.add('d-none');
        iniciarAtendimentoBtn.classList.remove('d-none');
        document.getElementById('servicosFeedback').style.display = 'none';
        document.getElementById('pagamentosFeedback').style.display = 'none';
        horaEntrada = null;
        await loadAtendimentos();
      } catch (error) {
        errorDiv.textContent = 'Erro ao registrar atendimento.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      successDiv.textContent = 'Logout realizado com sucesso! Redirecionando...';
      successDiv.classList.remove('d-none');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } catch (error) {
      errorDiv.textContent = 'Erro ao sair. Tente novamente.';
      errorDiv.classList.remove('d-none');
      console.error('Erro ao fazer logout:', error);
    }
  });
});