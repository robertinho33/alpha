// src/db/transacoes.js
import { auth, db } from '../firebase-init.js';
import { doc, setDoc, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

document.getElementById('formulario-transacao')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return;
  }

  const transacao = {
    tipo: document.getElementById('tipo').value.trim(),
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    categoria: document.getElementById('categoria').value.trim(),
    descricao: document.getElementById('descricao').value.trim()
  };

  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const transacaoId = `transacao_${Date.now()}`;
    await setDoc(doc(db, 'transacoes', transacaoId), {
      ...transacao,
      ownerId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Transação cadastrada com sucesso!';
    formSuccess.classList.remove('d-none');
    e.target.reset();
    loadFinancialChart();
  } catch (error) {
    console.error('Erro no cadastro de transação:', error);
    formError.textContent = 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});

const loadFinancialChart = async () => {
  const canvas = document.getElementById('financialChart');
  if (!canvas) return;

  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const transacoesRef = collection(db, 'transacoes');
    const qReceitas = query(transacoesRef, where('tipo', '==', 'receita'), where('ownerId', '==', auth.currentUser.uid));
    const qDespesas = query(transacoesRef, where('tipo', '==', 'despesa'), where('ownerId', '==', auth.currentUser.uid));

    const [receitasSnap, despesasSnap] = await Promise.all([
      getDocs(qReceitas),
      getDocs(qDespesas)
    ]);

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitasPorMes = Array(12).fill(0);
    const despesasPorMes = Array(12).fill(0);

    receitasSnap.forEach(doc => {
      const data = doc.data();
      const mes = new Date(data.data).getMonth();
      receitasPorMes[mes] += data.valor;
    });

    despesasSnap.forEach(doc => {
      const data = doc.data();
      const mes = new Date(data.data).getMonth();
      despesasPorMes[mes] += data.valor;
    });

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receitas',
            data: receitasPorMes,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Despesas',
            data: despesasPorMes,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Receitas vs Despesas por Mês' }
        }
      }
    });
  } catch (error) {
    console.error('Erro ao carregar gráfico financeiro:', error);
  }
};

if (document.getElementById('financialChart')) {
  loadFinancialChart();
}