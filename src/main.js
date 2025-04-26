// src/main.js
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuário autenticado:', user.uid);
    loadDashboard(user.uid);
  } else {
    window.location.href = 'login.html';
  }
});

const loadDashboard = async (userId) => {
  try {
    const clientesRef = collection(db, 'clientes');
    const qClientes = query(clientesRef, where('ownerId', '==', userId));
    const clientesSnap = await getDocs(qClientes);
    document.getElementById('totalClientes').textContent = clientesSnap.size;

    const produtosRef = collection(db, 'comercios', userId, 'produtos');
    const produtosSnap = await getDocs(produtosRef);
    document.getElementById('totalProdutos').textContent = produtosSnap.size;

    const pedidosRef = collection(db, 'pedidos');
    const qPedidos = query(pedidosRef, where('ownerId', '==', userId));
    const pedidosSnap = await getDocs(qPedidos);
    document.getElementById('totalPedidos').textContent = pedidosSnap.size;
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
};