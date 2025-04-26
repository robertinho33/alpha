// src/db/products.js
import { auth, db } from '../firebase-init.js';
import { doc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.getElementById('formulario-produto')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return;
  }

  const produto = {
    nome: document.getElementById('nome').value.trim(),
    sku: document.getElementById('sku').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    categoria: document.getElementById('categoria').value.trim(),
    preco: parseFloat(document.getElementById('preco').value),
    estoque: parseInt(document.getElementById('estoque').value),
    createdBy: auth.currentUser.uid
  };

  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const produtoId = `produto_${Date.now()}`;
    await setDoc(doc(db, 'comercios', auth.currentUser.uid, 'produtos', produtoId), {
      ...produto,
      ownerId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Produto cadastrado com sucesso!';
    formSuccess.classList.remove('d-none');
    e.target.reset();
  } catch (error) {
    console.error('Erro no cadastro de produto:', error);
    formError.textContent = 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});

const loadProdutos = async () => {
  const produtosList = document.getElementById('produtosList');
  if (!produtosList) return;

  try {
    const produtosRef = collection(db, 'comercios', auth.currentUser.uid, 'produtos');
    const produtosSnap = await getDocs(produtosRef);
    produtosList.innerHTML = '';
    produtosSnap.forEach(doc => {
      const data = doc.data();
      produtosList.innerHTML += `
        <div class="border p-4 mb-2">
          <h3>${data.nome}</h3>
          <p>SKU: ${data.sku}</p>
          <p>Preço: R$${data.preco.toFixed(2)}</p>
          <p>Estoque: ${data.estoque}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
};

if (document.getElementById('produtosList')) {
  loadProdutos();
}