// js/data/dashboard.js
import { auth, onAuthStateChanged } from '../auth.js';
import { db, collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, addDoc } from '../firestore.js';

console.log('Carregando dashboard.js...');

const storesTable = document.getElementById('stores-table');
const noStoresMessage = document.getElementById('no-stores-message');
const authMessage = document.getElementById('auth-message');
const editModal = document.getElementById('edit-modal');
const editStoreForm = document.getElementById('edit-store-form');
const cancelEditButton = document.getElementById('cancel-edit');
const editError = document.getElementById('edit-error');
const editSuccess = document.getElementById('edit-success');
const adminNameElement = document.getElementById('admin-name');
const addProductForm = document.getElementById('add-product-form');
const addProductError = document.getElementById('add-product-error');
const addProductSuccess = document.getElementById('add-product-success');
const productsContainer = document.getElementById('products-container');

let allProducts = [];

function showElement(element, show) {
  element.classList.toggle('hidden', !show);
}

async function loadAdminName(user) {
  console.log('Carregando nome do administrador:', user.uid);
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      adminNameElement.textContent = `Bem-vindo, ${adminData.nome}`;
      adminNameElement.setAttribute('aria-live', 'polite');
    } else {
      console.warn('Administrador não encontrado em admins.');
      adminNameElement.textContent = 'Bem-vindo, Administrador';
    }
  } catch (error) {
    console.error('Erro ao carregar nome do administrador:', error);
    adminNameElement.textContent = 'Bem-vindo, Administrador';
  }
}

async function loadStores(user) {
  console.log('Carregando lojas para usuário:', user.uid);
  try {
    const q = query(collection(db, 'lojas'), where('adminId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    storesTable.innerHTML = '';

    if (querySnapshot.empty) {
      console.log('Nenhuma loja encontrada.');
      showElement(noStoresMessage, true);
      showElement(storesTable.parentElement, false);
      showElement(productsContainer.parentElement, false);
      return [];
    }

    showElement(noStoresMessage, false);
    showElement(storesTable.parentElement, true);
    showElement(productsContainer.parentElement, true);

    const stores = [];
    querySnapshot.forEach((doc) => {
      const store = { id: doc.id, ...doc.data() };
      stores.push(store);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-3">${store.nome}</td>
        <td class="p-3">${store.email}</td>
        <td class="p-3">${store.telefone}</td>
        <td class="p-3">${store.negocio}</td>
        <td class="p-3">${store.bairro}</td>
        <td class="p-3">
          <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" aria-label="Editar loja ${store.nome}">Editar</button>
          <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2" aria-label="Excluir loja ${store.nome}">Excluir</button>
        </td>
      `;
      row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(doc.id, store));
      row.querySelector('.delete-btn').addEventListener('click', () => deleteStore(doc.id));
      storesTable.appendChild(row);
    });

    // Preencher o select de lojas no formulário de produtos
    const storeSelect = addProductForm.querySelector('select[name="storeId"]');
    storeSelect.innerHTML = '<option value="">Selecione uma Loja</option>';
    stores.forEach(store => {
      const option = document.createElement('option');
      option.value = store.id;
      option.textContent = store.nome;
      storeSelect.appendChild(option);
    });

    return stores;
  } catch (error) {
    console.error('Erro ao carregar lojas:', error);
    showElement(noStoresMessage, true);
    noStoresMessage.innerHTML = 'Erro ao carregar lojas. Tente novamente.';
    return [];
  }
}

async function loadProducts(user, stores) {
  console.log('Carregando produtos para usuário:', user.uid);
  try {
    const storeIds = stores.map(store => store.id);
    const q = query(collection(db, 'produtos'), where('storeId', 'in', storeIds.length ? storeIds : ['']));
    const querySnapshot = await getDocs(q);
    allProducts = [];
    querySnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      const store = stores.find(s => s.id === product.storeId);
      product.lojaNome = store ? store.nome : 'Loja Desconhecida';
      allProducts.push(product);
    });
    renderProducts(allProducts);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    productsContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar produtos. Tente novamente.</p>';
  }
}

function renderProducts(products) {
  productsContainer.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow hover:shadow-md transition overflow-hidden';
    card.innerHTML = `
      <img src="${product.imagem || 'https://via.placeholder.com/150'}" alt="${product.nome}" class="w-full h-40 object-cover">
      <div class="p-4">
        <h4 class="font-semibold text-lg">${product.nome}</h4>
        <p class="text-sm text-gray-600">${product.descricao || 'Sem descrição'}</p>
        <p class="font-bold">R$ ${product.preco.toFixed(2)}</p>
        <p class="text-sm text-gray-600">Loja: ${product.lojaNome}</p>
        <p class="text-sm text-gray-600">Categoria: ${product.categoria || 'Sem categoria'}</p>
        <button class="edit-product-btn bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600" data-id="${product.id}" aria-label="Editar produto ${product.nome}">Editar</button>
        <button class="delete-product-btn bg-red-500 text-white p-2 rounded mt-2 ml-2 hover:bg-red-600" data-id="${product.id}" aria-label="Excluir produto ${product.nome}">Excluir</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  // Adicionar eventos para botões de edição e exclusão de produtos
  document.querySelectorAll('.edit-product-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      const product = allProducts.find(p => p.id === productId);
      openEditProductModal(productId, product);
    });
  });

  document.querySelectorAll('.delete-product-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      deleteProduct(productId);
    });
  });
}

function openEditModal(storeId, store) {
  console.log('Abrindo modal para loja:', storeId);
  editStoreForm.storeId.value = storeId;
  editStoreForm.nome.value = store.nome;
  editStoreForm.email.value = store.email;
  editStoreForm.telefone.value = store.telefone;
  editStoreForm.negocio.value = store.negocio;
  editStoreForm.bairro.value = store.bairro;
  showElement(editModal, true);
}

async function deleteStore(storeId) {
  if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
  console.log('Excluindo loja:', storeId);
  try {
    await deleteDoc(doc(db, 'lojas', storeId));
    console.log('Loja excluída com sucesso.');
    const user = auth.currentUser;
    if (user) {
      const stores = await loadStores(user);
      loadProducts(user, stores);
    }
  } catch (error) {
    console.error('Erro ao excluir loja:', error);
    alert('Erro ao excluir loja: ' + error.message);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  console.log('Excluindo produto:', productId);
  try {
    await deleteDoc(doc(db, 'produtos', productId));
    console.log('Produto excluído com sucesso.');
    const user = auth.currentUser;
    if (user) {
      const stores = await loadStores(user);
      loadProducts(user, stores);
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    alert('Erro ao excluir produto: ' + error.message);
  }
}

function openEditProductModal(productId, product) {
  // Criar um modal dinamicamente se não existir
  let editProductModal = document.getElementById('edit-product-modal');
  if (!editProductModal) {
    editProductModal = document.createElement('div');
    editProductModal.id = 'edit-product-modal';
    editProductModal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    editProductModal.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 class="text-2xl font-semibold text-blue-900 mb-4">Editar Produto</h2>
        <form id="edit-product-form" class="space-y-4">
          <input type="hidden" name="productId">
          <select name="storeId" required class="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option value="">Selecione uma Loja</option>
          </select>
          <input type="text" name="nome" placeholder="Nome do Produto" required class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
          <textarea name="descricao" placeholder="Descrição do Produto" class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
          <input type="number" name="preco" placeholder="Preço (ex.: 29.90)" step="0.01" required class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
          <input type="url" name="imagem" placeholder="URL da Imagem (opcional)" class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
          <select name="categoria" required class="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option value="">Selecione uma Categoria</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Casa">Casa</option>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Saúde">Saúde</option>
            <option value="Presentes">Presentes</option>
          </select>
          <div class="flex space-x-4">
            <button type="submit" class="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition">Salvar</button>
            <button type="button" id="cancel-edit-product" class="w-full bg-gray-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition">Cancelar</button>
          </div>
          <div id="edit-product-error" class="text-red-500 text-sm"></div>
          <div id="edit-product-success" class="text-green-500 text-sm"></div>
        </form>
      </div>
    `;
    document.body.appendChild(editProductModal);
  }

  // Preencher o formulário de edição
  const editProductForm = editProductModal.querySelector('#edit-product-form');
  editProductForm.productId.value = productId;
  editProductForm.nome.value = product.nome;
  editProductForm.descricao.value = product.descricao || '';
  editProductForm.preco.value = product.preco;
  editProductForm.imagem.value = product.imagem || '';
  editProductForm.categoria.value = product.categoria || '';
  editProductForm.storeId.value = product.storeId;

  // Preencher o select de lojas
  const storeSelect = editProductForm.querySelector('select[name="storeId"]');
  storeSelect.innerHTML = '<option value="">Selecione uma Loja</option>';
  const stores = allProducts.reduce((acc, p) => {
    if (p.storeId && !acc.find(s => s.id === p.storeId)) {
      acc.push({ id: p.storeId, nome: p.lojaNome });
    }
    return acc;
  }, []);
  loadStores(auth.currentUser).then(stores => {
    stores.forEach(store => {
      const option = document.createElement('option');
      option.value = store.id;
      option.textContent = store.nome;
      storeSelect.appendChild(option);
    });
    storeSelect.value = product.storeId;
  });

  showElement(editProductModal, true);

  // Adicionar evento de cancelar
  const cancelEditProductButton = editProductModal.querySelector('#cancel-edit-product');
  cancelEditProductButton.addEventListener('click', () => {
    showElement(editProductModal, false);
    editProductForm.reset();
    editProductModal.querySelector('#edit-product-error').textContent = '';
    editProductModal.querySelector('#edit-product-success').textContent = '';
  });

  // Adicionar evento de envio do formulário
  editProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const updatedProduct = {
      storeId: editProductForm.storeId.value,
      nome: editProductForm.nome.value,
      descricao: editProductForm.descricao.value || null,
      preco: parseFloat(editProductForm.preco.value),
      imagem: editProductForm.imagem.value || null,
      categoria: editProductForm.categoria.value,
      adminId: auth.currentUser.uid
    };
    console.log('Salvando alterações no produto:', productId);
    try {
      await updateDoc(doc(db, 'produtos', productId), updatedProduct);
      editProductModal.querySelector('#edit-product-success').textContent = 'Produto atualizado com sucesso!';
      editProductModal.querySelector('#edit-product-error').textContent = '';
      showElement(editProductModal, false);
      editProductForm.reset();
      const stores = await loadStores(auth.currentUser);
      loadProducts(auth.currentUser, stores);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      editProductModal.querySelector('#edit-product-error').textContent = `Erro: ${error.message}`;
      editProductModal.querySelector('#edit-product-success').textContent = '';
    }
  });
}

onAuthStateChanged(auth, (user) => {
  console.log('onAuthStateChanged chamado, usuário:', user ? user.uid : 'nenhum');
  if (!user) {
    showElement(authMessage, true);
    showElement(storesTable.parentElement, false);
    showElement(noStoresMessage, false);
    showElement(productsContainer.parentElement, false);
    window.location.href = '/view/comecar.html';
    return;
  }
  showElement(authMessage, false);
  loadAdminName(user);
  loadStores(user).then(stores => {
    loadProducts(user, stores);
  });
});

if (editStoreForm) {
  editStoreForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const storeId = editStoreForm.storeId.value;
    const updatedStore = {
      nome: editStoreForm.nome.value,
      email: editStoreForm.email.value,
      telefone: editStoreForm.telefone.value,
      negocio: editStoreForm.negocio.value,
      bairro: editStoreForm.bairro.value,
      adminId: auth.currentUser.uid
    };
    console.log('Salvando alterações na loja:', storeId);
    try {
      await updateDoc(doc(db, 'lojas', storeId), updatedStore);
      editSuccess.textContent = 'Loja atualizada com sucesso!';
      editError.textContent = '';
      showElement(editModal, false);
      editStoreForm.reset();
      const stores = await loadStores(auth.currentUser);
      loadProducts(auth.currentUser, stores);
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      editError.textContent = `Erro: ${error.message}`;
      editSuccess.textContent = '';
    }
  });
}

if (cancelEditButton) {
  cancelEditButton.addEventListener('click', () => {
    console.log('Cancelando edição.');
    showElement(editModal, false);
    editStoreForm.reset();
    editError.textContent = '';
    editSuccess.textContent = '';
  });
}

if (addProductForm) {
  addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const newProduct = {
      storeId: addProductForm.storeId.value,
      nome: addProductForm.nome.value,
      descricao: addProductForm.descricao.value || null,
      preco: parseFloat(addProductForm.preco.value),
      imagem: addProductForm.imagem.value || null,
      categoria: addProductForm.categoria.value,
      adminId: auth.currentUser.uid
    };
    console.log('Adicionando produto:', newProduct);
    try {
      await addDoc(collection(db, 'produtos'), newProduct);
      addProductSuccess.textContent = 'Produto adicionado com sucesso!';
      addProductError.textContent = '';
      addProductForm.reset();
      const stores = await loadStores(auth.currentUser);
      loadProducts(auth.currentUser, stores);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      addProductError.textContent = `Erro: ${error.message}`;
      addProductSuccess.textContent = '';
    }
  });
}