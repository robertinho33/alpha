import { auth, db } from '../src/js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const errorDiv = document.getElementById('formError');
  const logoutButton = document.getElementById('logoutButton');
  const nomeComercioElements = document.querySelectorAll('#nomeComercio');

  if (!errorDiv || !logoutButton || nomeComercioElements.length === 0) {
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
    const atendimentosRef = collection(db, 'atendimentos', userId, 'registros');

    const loadDashboard = async () => {
      try {
        // Nome do comércio
        const docSnap = await getDoc(comercioRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          nomeComercioElements.forEach(el => el.textContent = data.nomeFantasia || 'Estabelecimento');
        }

        // Clientes totais
        const clientesSnap = await getDocs(clientesRef);
        document.getElementById('clientesTotal').textContent = clientesSnap.size;

        // Atendimentos hoje
        const hoje = new Date().toISOString().split('T')[0];
        const atendimentosSnap = await getDocs(atendimentosRef);
        let atendimentosHoje = 0;
        let receitaMes = 0;
        atendimentosSnap.forEach(doc => {
          const atendimento = doc.data();
          const dataAtendimento = new Date(atendimento.entrada).toISOString().split('T')[0];
          if (dataAtendimento === hoje) atendimentosHoje++;
          if (new Date(atendimento.entrada).getMonth() === new Date().getMonth()) {
            const totalServicos = atendimento.servicos.reduce((sum, s) => sum + s.preco, 0);
            const totalProdutos = atendimento.produtos.reduce((sum, p) => sum + (p.preco * p.quantidade), 0);
            receitaMes += totalServicos + totalProdutos;
          }
        });
        document.getElementById('atendimentosHoje').textContent = atendimentosHoje;
        document.getElementById('receitaMes').textContent = `R$ ${receitaMes.toFixed(2)}`;
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        errorDiv.textContent = 'Erro ao carregar dados.';
        errorDiv.classList.remove('d-none');
      }
    };

    await loadDashboard();

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