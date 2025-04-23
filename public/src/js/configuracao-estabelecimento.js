import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const horariosForm = document.getElementById('horariosForm');
  const colaboradoresForm = document.getElementById('colaboradoresForm');
  const servicosForm = document.getElementById('servicosForm');
  const produtosForm = document.getElementById('produtosForm');
  const pagamentosForm = document.getElementById('pagamentosForm');
  const statusForm = document.getElementById('statusForm');
  const logoutButton = document.getElementById('logoutButton');

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

    // Carregar dados existentes
    const loadData = async () => {
      try {
        const docSnap = await getDoc(comercioRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Horários
          if (data.horarios) {
            const horariosList = document.getElementById('horariosList');
            data.horarios.forEach(horario => {
              const li = document.createElement('li');
              li.className = 'list-group-item';
              li.textContent = `${horario.dia}: ${horario.abertura} - ${horario.fechamento}`;
              horariosList.appendChild(li);
            });
          }
          // Colaboradores
          if (data.colaboradores) {
            const colaboradoresList = document.getElementById('colaboradoresList');
            data.colaboradores.forEach(colaborador => {
              const li = document.createElement('li');
              li.className = 'list-group-item';
              li.textContent = `${colaborador.nome} (${colaborador.funcao})${colaborador.telefone ? ` - ${colaborador.telefone}` : ''}`;
              colaboradoresList.appendChild(li);
            });
          }
          // Serviços
          if (data.servicos) {
            const servicosList = document.getElementById('servicosList');
            data.servicos.forEach(servico => {
              const li = document.createElement('li');
              li.className = 'list-group-item';
              li.textContent = `${servico.nome} - R$${servico.preco.toFixed(2)}${servico.duracao ? ` (${servico.duracao} min)` : ''}`;
              servicosList.appendChild(li);
            });
          }
          // Produtos
          if (data.produtos) {
            const produtosList = document.getElementById('produtosList');
            data.produtos.forEach(produto => {
              const li = document.createElement('li');
              li.className = 'list-group-item';
              li.textContent = `${produto.nome} - R$${produto.preco.toFixed(2)}${produto.estoque ? ` (Estoque: ${produto.estoque})` : ''}`;
              produtosList.appendChild(li);
            });
          }
          // Formas de Pagamento
          if (data.formasPagamento) {
            const pagamentosList = document.getElementById('pagamentosList');
            data.formasPagamento.forEach(pagamento => {
              const li = document.createElement('li');
              li.className = 'list-group-item';
              li.textContent = pagamento;
              pagamentosList.appendChild(li);
            });
          }
          // Status
          if (data.status) {
            document.getElementById('statusEstabelecimento').value = data.status;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        errorDiv.textContent = 'Erro ao carregar dados do comércio.';
        errorDiv.classList.remove('d-none');
      }
    };
    await loadData();

    // Horários
    horariosForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!horariosForm.checkValidity()) {
        horariosForm.classList.add('was-validated');
        return;
      }
      const dia = document.getElementById('diaSemana').value;
      const abertura = document.getElementById('horaAbertura').value;
      const fechamento = document.getElementById('horaFechamento').value;
      try {
        await updateDoc(comercioRef, {
          horarios: arrayUnion({ dia, abertura, fechamento })
        });
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${dia}: ${abertura} - ${fechamento}`;
        document.getElementById('horariosList').appendChild(li);
        horariosForm.reset();
        successDiv.textContent = 'Horário adicionado com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao adicionar horário.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Colaboradores
    colaboradoresForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!colaboradoresForm.checkValidity()) {
        colaboradoresForm.classList.add('was-validated');
        return;
      }
      const nome = document.getElementById('nomeColaborador').value.trim();
      const funcao = document.getElementById('funcaoColaborador').value.trim();
      const telefone = document.getElementById('telefoneColaborador').value.trim();
      try {
        await updateDoc(comercioRef, {
          colaboradores: arrayUnion({ nome, funcao, telefone: telefone || null })
        });
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${nome} (${funcao})${telefone ? ` - ${telefone}` : ''}`;
        document.getElementById('colaboradoresList').appendChild(li);
        colaboradoresForm.reset();
        successDiv.textContent = 'Colaborador adicionado com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao adicionar colaborador.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Serviços
    servicosForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!servicosForm.checkValidity()) {
        servicosForm.classList.add('was-validated');
        return;
      }
      const nome = document.getElementById('nomeServico').value.trim();
      const preco = parseFloat(document.getElementById('precoServico').value);
      const duracao = parseInt(document.getElementById('duracaoServico').value) || null;
      try {
        await updateDoc(comercioRef, {
          servicos: arrayUnion({ nome, preco, duracao })
        });
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${nome} - R$${preco.toFixed(2)}${duracao ? ` (${duracao} min)` : ''}`;
        document.getElementById('servicosList').appendChild(li);
        servicosForm.reset();
        successDiv.textContent = 'Serviço adicionado com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao adicionar serviço.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Produtos
    produtosForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!produtosForm.checkValidity()) {
        produtosForm.classList.add('was-validated');
        return;
      }
      const nome = document.getElementById('nomeProduto').value.trim();
      const preco = parseFloat(document.getElementById('precoProduto').value);
      const estoque = parseInt(document.getElementById('estoqueProduto').value) || null;
      try {
        await updateDoc(comercioRef, {
          produtos: arrayUnion({ nome, preco, estoque })
        });
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${nome} - R$${preco.toFixed(2)}${estoque ? ` (Estoque: ${estoque})` : ''}`;
        document.getElementById('produtosList').appendChild(li);
        produtosForm.reset();
        successDiv.textContent = 'Produto adicionado com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao adicionar produto.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Formas de Pagamento
    pagamentosForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const checkboxes = document.querySelectorAll('#pagamentosForm input:checked');
      if (checkboxes.length === 0) {
        document.getElementById('pagamentosFeedback').style.display = 'block';
        return;
      }
      const formas = Array.from(checkboxes).map(cb => cb.value);
      try {
        await updateDoc(comercioRef, {
          formasPagamento: formas
        });
        const pagamentosList = document.getElementById('pagamentosList');
        pagamentosList.innerHTML = '';
        formas.forEach(forma => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.textContent = forma;
          pagamentosList.appendChild(li);
        });
        pagamentosForm.reset();
        document.getElementById('pagamentosFeedback').style.display = 'none';
        successDiv.textContent = 'Formas de pagamento salvas com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao salvar formas de pagamento.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Status
    statusForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!statusForm.checkValidity()) {
        statusForm.classList.add('was-validated');
        return;
      }
      const status = document.getElementById('statusEstabelecimento').value;
      try {
        await updateDoc(comercioRef, { status });
        successDiv.textContent = 'Status atualizado com sucesso!';
        successDiv.classList.remove('d-none');
      } catch (error) {
        errorDiv.textContent = 'Erro ao atualizar status.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      }
    });

    // Logout
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
});