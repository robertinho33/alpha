import { auth, db } from '../src/js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const agendamentoForm = document.getElementById('agendamentoForm');
  const clienteSelect = document.getElementById('clienteSelect');
  const servicoSelect = document.getElementById('servicoSelect');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const logoutButton = document.getElementById('logoutButton');
  const nomeComercioElements = document.querySelectorAll('#nomeComercio');

  if (!agendamentoForm || !clienteSelect || !servicoSelect || !errorDiv || !successDiv || !logoutButton || nomeComercioElements.length === 0) {
    console.error('Elementos DOM não encontrados');
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      errorDiv.textContent = 'Você precisa estar autenticado. Redirecionando...';
      errorDiv.classList.remove('d-none');
      setTimeout(() => window.location.href = 'login.html', 2000);
      return;
    }

    const userId = user.uid;
    const comercioRef = doc(db, 'comercios', userId);
    const clientesRef = collection(db, 'clientes', userId, 'registros');
    const servicosRef = collection(db, 'comercios', userId, 'servicos');
    const agendamentosRef = collection(db, 'agendamentos', userId, 'registros');

    const loadData = async () => {
      try {
        // Nome do comércio
        const docSnap = await getDoc(comercioRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          nomeComercioElements.forEach(el => el.textContent = data.nomeFantasia || 'Estabelecimento');
        }

        // Carregar clientes
        const clientesSnap = await getDocs(clientesRef);
        clientesSnap.forEach(doc => {
          const cliente = doc.data();
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = cliente.nome;
          clienteSelect.insertBefore(option, clienteSelect.querySelector('option[value="novo"]'));
        });

        // Carregar serviços
        const servicosSnap = await getDocs(servicosRef);
        servicosSnap.forEach(doc => {
          const servico = doc.data();
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = `${servico.nome} (R$${servico.preco.toFixed(2)})`;
          servicoSelect.appendChild(option);
        });

        // Carregar agendamentos
        const agendamentosSnap = await getDocs(agendamentosRef);
        const agendamentosList = document.getElementById('agendamentosList');
        agendamentosList.innerHTML = '';
        agendamentosSnap.forEach(doc => {
          const agendamento = doc.data();
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.textContent = `${agendamento.clienteNome} - ${agendamento.servicoNome} - ${new Date(agendamento.dataHora).toLocaleString('pt-BR')}`;
          agendamentosList.appendChild(li);
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        errorDiv.textContent = 'Erro ao carregar dados.';
        errorDiv.classList.remove('d-none');
      }
    };

    await loadData();

    agendamentoForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');

      if (!agendamentoForm.checkValidity()) {
        agendamentoForm.classList.add('was-validated');
        return;
      }

      const clienteId = clienteSelect.value;
      const servicoId = servicoSelect.value;
      const dataHora = document.getElementById('dataHora').value;

      if (clienteId === 'novo') {
        errorDiv.textContent = 'Por favor, cadastre o cliente primeiro.';
        errorDiv.classList.remove('d-none');
        return;
      }

      try {
        const clienteSnap = await getDoc(doc(db, 'clientes', userId, 'registros', clienteId));
        const servicoSnap = await getDoc(doc(db, 'comercios', userId, 'servicos', servicoId));
        await addDoc(agendamentosRef, {
          clienteId,
          clienteNome: clienteSnap.data().nome,
          servicoId,
          servicoNome: servicoSnap.data().nome,
          dataHora: new Date(dataHora).toISOString(),
          createdAt: new Date().toISOString()
        });

        successDiv.textContent = 'Agendamento registrado com sucesso!';
        successDiv.classList.remove('d-none');
        agendamentoForm.reset();
        agendamentoForm.classList.remove('was-validated');
        await loadData();
      } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        errorDiv.textContent = 'Erro ao salvar agendamento.';
        errorDiv.classList.remove('d-none');
      }
    });

    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        errorDiv.textContent = 'Erro ao sair.';
        errorDiv.classList.remove('d-none');
      }
    });
  });
});