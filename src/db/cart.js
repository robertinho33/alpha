// src/db/cart.js
import { auth, db } from '../firebase-init.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const addToCart = async (produtoId, quantidade) => {
  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const cartRef = doc(db, 'clientes', auth.currentUser.uid, 'carrinho', produtoId);
    await setDoc(cartRef, {
      produtoId,
      quantidade,
      addedAt: new Date().toISOString()
    });
    alert('Produto adicionado ao carrinho!');
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    alert('Erro: ' + error.message);
  }
};

document.getElementById('addToCart')?.addEventListener('click', async () => {
  const produtoId = document.getElementById('produtoId').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  await addToCart(produtoId, quantidade);
});