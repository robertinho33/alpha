import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, setDoc, collection, addDoc, getDoc, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const configForm = document.getElementById('configForm');
  const logoutButton = document.getElementById('logoutButton');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const nomeComercioElements = document.querySelectorAll('#nomeComercio');
  const addServicoButton = document.getElementById('addServico');
  const servicosList = document.getElementById('servicosList');

  if (!configForm || !logoutButton || !errorDiv || !successDiv || nomeComercioElements.length === 0 || !addServicoButton || !servicosList) {
    console.error('Elementos DOM não encontrados:', {
      configForm: !!configForm,
      logoutButton: !!logoutButton,
      errorDiv: !!errorDiv,
      successDiv: !!successDiv,
      nomeComercioElements: nomeComercioElements.length,
      addServicoButton: !!addServicoButton,
      servicosList: !!servicosList
    });
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      errorDiv.textContent = 'Você precisa estar autenticado. Redirecionando...';
      errorDiv.classList.remove('d-none');
      setTimeout(() => window.location.href = '../pages/login.html', 2000);
      return;
    }

    const userId = user.uid;
    const comercioRef = doc(db, 'comercios', userId);
    const colaboradoresRef = collection(db, 'comercios', userId, 'colaboradores');
    const servicosRef = collection(db, 'comercios', userId, 'servicos');
    const produtosRef = collection(db, 'comercios', userId, 'produtos');
    const formasPagamentoRef = collection(db, 'comercios', userId, 'formasPagamento');

    const loadData = async () => {
      try {
        console.log('Carregando dados para userId:', userId);
        const docSnap = await getDoc(comercioRef);
        console.log('Caminho do documento:', comercioRef.path);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Dados do comércio:', data);
          document.getElementById('nomeFantasia').value = data.nomeFantasia || '';
          document.getElementById('telefoneComercial').value = data.telefoneComercial || '';
          document.getElementById('email').value = data.email || user.email;
          document.getElementById('segmento').value = data.segmento || '';
          document.getElementById('cidade').value = data.cidade || '';
          document.getElementById('estado').value = data.estado || '';
          document.getElementById('status').value = data.status || 'Aberto';
          document.getElementById('logo').value = data.logo || '';
          nomeComercioElements.forEach(el => {
            el.textContent = data.nomeFantasia || 'Estabelecimento';
          });
          document.getElementById('telefoneComercio').textContent = data.telefoneComercial || 'Não informado';
          document.getElementById('emailComercio').textContent = data.email || user.email;
        } else {
          console.warn('Documento não existe em comercios/', userId);
          errorDiv.textContent = 'Nenhum dado encontrado. Configure o estabelecimento.';
          errorDiv.classList.remove('d-none');
          nomeComercioElements.forEach(el => {
            el.textContent = 'Estabelecimento';
          });
          document.getElementById('telefoneComercio').textContent = 'Não informado';
          document.getElementById('emailComercio').textContent = user.email || 'Não informado';
        }

        // Carregar serviços
        servicosList.innerHTML = '';
        const servicosSnap = await getDocs(servicosRef);
        servicosSnap.forEach(doc => {
          const servico = doc.data();
          const div = document.createElement('div');
          div.className = 'input-group mb-2';
          div.innerHTML = `
            <input type="text" class="form-control" placeholder="Nome do serviço" value="${servico.nome}">
            <input type="number" class="form-control" placeholder="Preço" value="${servico.preco}">
            <input type="number" class="form-control" placeholder="Duração (min)" value="${servico.duracao || ''}">
            <button type="button" class="btn btn-outline-danger remove-servico">Remover</button>
          `;
          servicosList.appendChild(div);
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        errorDiv.textContent = error.code === 'permission-denied'
          ? 'Permissões insuficientes. Verifique as regras do Firestore.'
          : 'Erro ao carregar dados do comércio: ' + error.message;
        errorDiv.classList.remove('d-none');
        nomeComercioElements.forEach(el => {
          el.textContent = 'Estabelecimento';
        });
        document.getElementById('telefoneComercio').textContent = 'Não informado';
        document.getElementById('emailComercio').textContent = user.email || 'Não informado';
      }
    };

    await loadData();

    // Adicionar serviço
    addServicoButton.addEventListener('click', () => {
      const div = document.createElement('div');
      div.className = 'input-group mb-2';
      div.innerHTML = `
        <input type="text" class="form-control" placeholder="Nome do serviço">
        <input type="number" class="form-control" placeholder="Preço">
        <input type="number" class="form-control" placeholder="Duração (min)">
        <button type="button" class="btn btn-outline-danger remove-servico">Remover</button>
      `;
      servicosList.appendChild(div);
    });

    // Remover serviço
    servicosList.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-servico')) {
        event.target.parentElement.remove();
      }
    });

    // Salvar configuração
    configForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');

      if (!configForm.checkValidity()) {
        configForm.classList.add('was-validated');
        return;
      }

      try {
        // Salvar metadados
        await setDoc(comercioRef, {
          nomeFantasia: document.getElementById('nomeFantasia').value.trim(),
          razaoSocial: null,
          cnpj: null,
          email: document.getElementById('email').value.trim() || user.email,
          emailGestor: document.getElementById('emailGestor').value.trim() || null,
          telefoneComercial: document.getElementById('telefoneComercial').value.trim() || null,
          enderecoComercial: null,
          cidade: document.getElementById('cidade').value.trim(),
          estado: document.getElementById('estado').value.trim(),
          segmento: document.getElementById('segmento').value.trim(),
          status: document.getElementById('status').value,
          logo: document.getElementById('logo').value.trim() || null,
          createdAt: new Date().toISOString(),
          descricao: null
        }, { merge: true });

        // Salvar serviços
        await Promise.all((await getDocs(servicosRef)).docs.map(doc => deleteDoc(doc.ref)));
        const servicosInputs = servicosList.querySelectorAll('.input-group');
        for (const inputGroup of servicosInputs) {
          const nome = inputGroup.querySelector('input:nth-child(1)').value.trim();
          const preco = parseFloat(inputGroup.querySelector('input:nth-child(2)').value);
          const duracao = parseInt(inputGroup.querySelector('input:nth-child(3)').value) || null;
          if (nome && preco) {
            await addDoc(servicosRef, { nome, preco, duracao });
          }
        }

        // Salvar colaboradores (estático)
        await Promise.all((await getDocs(colaboradoresRef)).docs.map(doc => deleteDoc(doc.ref)));
        const colaboradores = [
          { nome: "Michael J.", funcao: "Recepção", telefone: "(11) 98765-4654" },
          { nome: "Elves Sogro Dele", funcao: "Cabeleireiro", telefone: "(11) 78945-6126" }
        ];
        for (const colaborador of colaboradores) {
          await addDoc(colaboradoresRef, colaborador);
        }

        // Salvar produtos (estático)
        await Promise.all((await getDocs(produtosRef)).docs.map(doc => deleteDoc(doc.ref)));
        const produtos = [
          { nome: "Shampoo", preco: 60, estoque: 3 },
          { nome: "Condicionador", preco: 78, estoque: 3 }
        ];
        for (const produto of produtos) {
          await addDoc(produtosRef, produto);
        }

        // Salvar formas de pagamento (estático)
        await Promise.all((await getDocs(formasPagamentoRef)).docs.map(doc => deleteDoc(doc.ref)));
        const formasPagamento = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"];
        for (const forma of formasPagamento) {
          await addDoc(formasPagamentoRef, { nome: forma });
        }

        successDiv.textContent = 'Configuração salva com sucesso!';
        successDiv.classList.remove('d-none');
        await loadData();
      } catch (error) {
        console.error('Erro ao salvar:', error);
        errorDiv.textContent = error.code === 'permission-denied'
          ? 'Permissões insuficientes. Verifique as regras do Firestore.'
          : 'Erro ao salvar configuração: ' + error.message;
        errorDiv.classList.remove('d-none');
      }
    });

    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        successDiv.textContent = 'Logout realizado com sucesso!';
        successDiv.classList.remove('d-none');
        setTimeout(() => window.location.href = '../pages/login.html', 2000);
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        errorDiv.textContent = 'Erro ao sair: ' + error.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
});