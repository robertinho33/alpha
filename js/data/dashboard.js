// js/data/dashboard.js
import { auth, onAuthStateChanged, signOut } from '../auth.js';
import { 
  db, collection, query, where, getDocs, doc, 
  updateDoc, deleteDoc, getDoc, addDoc, serverTimestamp 
} from '../firestore.js';

console.log('Carregando dashboard.js...');

// Constantes DOM
const DOM_ELEMENTS = {
  storesTable: document.getElementById('stores-table'),
  noStoresMessage: document.getElementById('no-stores-message'),
  authMessage: document.getElementById('auth-message'),
  editModal: document.getElementById('edit-modal'),
  editStoreForm: document.getElementById('edit-store-form'),
  cancelEditButton: document.getElementById('cancel-edit'),
  editError: document.getElementById('edit-error'),
  editSuccess: document.getElementById('edit-success'),
  adminNameElement: document.getElementById('admin-name'),
  addProductForm: document.getElementById('add-product-form'),
  addProductError: document.getElementById('add-product-error'),
  addProductSuccess: document.getElementById('add-product-success'),
  productsContainer: document.getElementById('products-container'),
  storeSignupForm: document.getElementById('store-signup-form'),
  storeSignupError: document.getElementById('store-signup-error'),
  storeSignupSuccess: document.getElementById('store-signup-success'),
  logoutButton: document.getElementById('logout-button'),
  toggleStoreForm: document.getElementById('toggle-store-form'),
  storeFormContainer: document.getElementById('store-form-container')
};

// Estado da aplicação
const APP_STATE = {
  currentUser: null,
  stores: [],
  products: []
};

// Utilitários
const Utils = {
  showElement: (element, show) => {
    if (element) element.classList.toggle('hidden', !show);
  },

  resetFormMessages: (formContainer) => {
    if (!formContainer) return;
    const errorElement = formContainer.querySelector('.error-message');
    const successElement = formContainer.querySelector('.success-message');
    if (errorElement) errorElement.textContent = '';
    if (successElement) successElement.textContent = '';
  },

  showSuccessMessage: (formContainer, message) => {
    if (!formContainer) return;
    const successElement = formContainer.querySelector('.success-message');
    if (successElement) successElement.textContent = message;
  },

  showErrorMessage: (formContainer, message) => {
    if (!formContainer) return;
    const errorElement = formContainer.querySelector('.error-message');
    if (errorElement) errorElement.textContent = message;
  }
};

// Serviços de Autenticação
const AuthService = {
  initializeAuthListener: () => {
    onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged chamado, usuário:', user ? user.uid : 'nenhum');
      APP_STATE.currentUser = user;
      
      if (!user) {
        Utils.showElement(DOM_ELEMENTS.authMessage, true);
        Utils.showElement(DOM_ELEMENTS.storesTable?.parentElement, false);
        Utils.showElement(DOM_ELEMENTS.noStoresMessage, false);
        Utils.showElement(DOM_ELEMENTS.productsContainer?.parentElement, false);
        window.location.href = '/view/comecar.html';
        return;
      }

      Utils.showElement(DOM_ELEMENTS.authMessage, false);
      await AdminService.loadAdminName(user);
      await StoreService.loadStores(user);
    });
  },

  handleLogout: async () => {
    try {
      await signOut(auth);
      window.location.href = '/view/comecar.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout: ' + error.message);
    }
  }
};

// Serviços de Admin
const AdminService = {
  loadAdminName: async (user) => {
    console.log('Carregando nome do administrador:', user.uid);
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        DOM_ELEMENTS.adminNameElement.textContent = `Bem-vindo, ${adminData.nome}`;
        DOM_ELEMENTS.adminNameElement.setAttribute('aria-live', 'polite');
      } else {
        console.warn('Administrador não encontrado em admins.');
        DOM_ELEMENTS.adminNameElement.textContent = 'Bem-vindo, Administrador';
      }
    } catch (error) {
      console.error('Erro ao carregar nome do administrador:', error);
      DOM_ELEMENTS.adminNameElement.textContent = 'Bem-vindo, Administrador';
    }
  }
};

// Serviços de Loja
const StoreService = {
  loadStores: async (user) => {
    console.log('Carregando lojas para usuário:', user.uid);
    try {
      const q = query(collection(db, 'lojas'), where('adminId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      DOM_ELEMENTS.storesTable.innerHTML = '';

      if (querySnapshot.empty) {
        console.log('Nenhuma loja encontrada.');
        Utils.showElement(DOM_ELEMENTS.noStoresMessage, true);
        Utils.showElement(DOM_ELEMENTS.storesTable?.parentElement, false);
        Utils.showElement(DOM_ELEMENTS.productsContainer?.parentElement, false);
        APP_STATE.stores = [];
        return [];
      }

      Utils.showElement(DOM_ELEMENTS.noStoresMessage, false);
      Utils.showElement(DOM_ELEMENTS.storesTable?.parentElement, true);
      Utils.showElement(DOM_ELEMENTS.productsContainer?.parentElement, true);

      APP_STATE.stores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      StoreService.renderStores(APP_STATE.stores);
      ProductService.loadProducts(user, APP_STATE.stores);

      return APP_STATE.stores;
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      Utils.showElement(DOM_ELEMENTS.noStoresMessage, true);
      DOM_ELEMENTS.noStoresMessage.innerHTML = 'Erro ao carregar lojas. Tente novamente.';
      return [];
    }
  },

  renderStores: (stores) => {
    DOM_ELEMENTS.storesTable.innerHTML = '';
    
    stores.forEach(store => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-3">${store.nome}</td>
        <td class="p-3">${store.email}</td>
        <td class="p-3">${store.telefone}</td>
        <td class="p-3">${store.negocio}</td>
        <td class="p-3">${store.bairro}</td>
        <td class="p-3">
          <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" 
                  aria-label="Editar loja ${store.nome}" data-id="${store.id}">
            Editar
          </button>
          <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2" 
                  aria-label="Excluir loja ${store.nome}" data-id="${store.id}">
            Excluir
          </button>
        </td>
      `;
      DOM_ELEMENTS.storesTable.appendChild(row);
    });

    // Preencher o select de lojas no formulário de produtos
    if (DOM_ELEMENTS.addProductForm) {
      const storeSelect = DOM_ELEMENTS.addProductForm.querySelector('select[name="storeId"]');
      storeSelect.innerHTML = '<option value="">Selecione uma Loja</option>';
      stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.id;
        option.textContent = store.nome;
        storeSelect.appendChild(option);
      });
    }
  },

  openEditModal: (storeId) => {
    const store = APP_STATE.stores.find(s => s.id === storeId);
    if (!store) return;

    console.log('Abrindo modal para loja:', storeId);
    DOM_ELEMENTS.editStoreForm.storeId.value = storeId;
    DOM_ELEMENTS.editStoreForm.nome.value = store.nome;
    DOM_ELEMENTS.editStoreForm.email.value = store.email;
    DOM_ELEMENTS.editStoreForm.telefone.value = store.telefone;
    DOM_ELEMENTS.editStoreForm.negocio.value = store.negocio;
    DOM_ELEMENTS.editStoreForm.bairro.value = store.bairro;
    Utils.showElement(DOM_ELEMENTS.editModal, true);
  },

  deleteStore: async (storeId) => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
    console.log('Excluindo loja:', storeId);
    try {
      await deleteDoc(doc(db, 'lojas', storeId));
      console.log('Loja excluída com sucesso.');
      await StoreService.loadStores(APP_STATE.currentUser);
    } catch (error) {
      console.error('Erro ao excluir loja:', error);
      alert('Erro ao excluir loja: ' + error.message);
    }
  },

  handleStoreFormSubmit: async (event) => {
    event.preventDefault();
    const storeId = DOM_ELEMENTS.editStoreForm.storeId.value;
    const updatedStore = {
      nome: DOM_ELEMENTS.editStoreForm.nome.value,
      email: DOM_ELEMENTS.editStoreForm.email.value,
      telefone: DOM_ELEMENTS.editStoreForm.telefone.value,
      negocio: DOM_ELEMENTS.editStoreForm.negocio.value,
      bairro: DOM_ELEMENTS.editStoreForm.bairro.value,
      adminId: APP_STATE.currentUser.uid
    };

    console.log('Salvando alterações na loja:', storeId);
    try {
      await updateDoc(doc(db, 'lojas', storeId), updatedStore);
      Utils.showSuccessMessage(DOM_ELEMENTS.editModal, 'Loja atualizada com sucesso!');
      Utils.showElement(DOM_ELEMENTS.editModal, false);
      DOM_ELEMENTS.editStoreForm.reset();
      await StoreService.loadStores(APP_STATE.currentUser);
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      Utils.showErrorMessage(DOM_ELEMENTS.editModal, `Erro: ${error.message}`);
    }
  },

  handleStoreSignup: async (event) => {
    event.preventDefault();

    const formData = new FormData(DOM_ELEMENTS.storeSignupForm);
    const formValues = Object.fromEntries(formData.entries());
    const { nome, email, telefone, negocio, bairro, concordo } = formValues;

    if (!concordo) {
      Utils.showErrorMessage(DOM_ELEMENTS.storeSignupForm, 'Você deve concordar com a Política de Privacidade.');
      return;
    }

    try {
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Utils.showErrorMessage(DOM_ELEMENTS.storeSignupForm, 'Por favor, insira um email válido.');
        return;
      }

      // Verificar se o email já existe
      const lojasQuery = query(collection(db, 'lojas'), where('email', '==', email));
      const lojasSnapshot = await getDocs(lojasQuery);
      if (!lojasSnapshot.empty) {
        Utils.showErrorMessage(DOM_ELEMENTS.storeSignupForm, 'Este email já está registrado para uma loja.');
        return;
      }

      // Adicionar loja
      await addDoc(collection(db, 'lojas'), {
        nome,
        email,
        telefone,
        negocio,
        bairro,
        adminId: APP_STATE.currentUser.uid,
        criadoEm: serverTimestamp()
      });

      Utils.showSuccessMessage(DOM_ELEMENTS.storeSignupForm, 'Loja cadastrada com sucesso!');
      DOM_ELEMENTS.storeSignupForm.reset();
      Utils.showElement(DOM_ELEMENTS.storeFormContainer, false);
      DOM_ELEMENTS.toggleStoreForm.textContent = 'Cadastrar Nova Loja';
      
      await StoreService.loadStores(APP_STATE.currentUser);
    } catch (error) {
      console.error('Erro ao cadastrar loja:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permissões insuficientes para cadastrar a loja. Contate o suporte.' 
        : `Erro: ${error.message}`;
      Utils.showErrorMessage(DOM_ELEMENTS.storeSignupForm, errorMessage);
    }
  },

  toggleStoreForm: () => {
    const isHidden = DOM_ELEMENTS.storeFormContainer.classList.contains('hidden');
    DOM_ELEMENTS.storeFormContainer.classList.toggle('hidden');
    DOM_ELEMENTS.toggleStoreForm.textContent = isHidden 
      ? 'Esconder Formulário de Cadastro' 
      : 'Cadastrar Nova Loja';
  }
};

// Serviços de Produto
const ProductService = {
  loadProducts: async (user, stores) => {
    console.log('Carregando produtos para usuário:', user.uid);
    try {
      const storeIds = stores.map(store => store.id);
      const q = query(
        collection(db, 'produtos'), 
        where('storeId', 'in', storeIds.length ? storeIds : [''])
      );
      const querySnapshot = await getDocs(q);
      
      APP_STATE.products = querySnapshot.docs.map(doc => {
        const product = { id: doc.id, ...doc.data() };
        const store = stores.find(s => s.id === product.storeId);
        product.lojaNome = store ? store.nome : 'Loja Desconhecida';
        return product;
      });
      
      ProductService.renderProducts(APP_STATE.products);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      DOM_ELEMENTS.productsContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar produtos. Tente novamente.</p>';
    }
  },

  renderProducts: (products) => {
    DOM_ELEMENTS.productsContainer.innerHTML = '';
    
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
          <button class="edit-product-btn bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600" 
                  data-id="${product.id}" aria-label="Editar produto ${product.nome}">
            Editar
          </button>
          <button class="delete-product-btn bg-red-500 text-white p-2 rounded mt-2 ml-2 hover:bg-red-600" 
                  data-id="${product.id}" aria-label="Excluir produto ${product.nome}">
            Excluir
          </button>
        </div>
      `;
      DOM_ELEMENTS.productsContainer.appendChild(card);
    });
  },

  openEditProductModal: (productId) => {
    const product = APP_STATE.products.find(p => p.id === productId);
    if (!product) return;

    // Criar ou reutilizar modal
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
            <input type="text" name="nome" placeholder="Nome do Produto" required 
                   class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <textarea name="descricao" placeholder="Descrição do Produto" 
                      class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
            <input type="number" name="preco" placeholder="Preço (ex.: 29.90)" step="0.01" required 
                   class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <input type="url" name="imagem" placeholder="URL da Imagem (opcional)" 
                   class="w-full p-3 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <select name="categoria" required 
                    class="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Selecione uma Categoria</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Casa">Casa</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Saúde">Saúde</option>
              <option value="Presentes">Presentes</option>
            </select>
            <div class="flex space-x-4">
              <button type="submit" class="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition">
                Salvar
              </button>
              <button type="button" id="cancel-edit-product" class="w-full bg-gray-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition">
                Cancelar
              </button>
            </div>
            <div class="error-message text-red-500 text-sm"></div>
            <div class="success-message text-green-500 text-sm"></div>
          </form>
        </div>
      `;
      document.body.appendChild(editProductModal);
    }

    // Preencher formulário
    const editProductForm = editProductModal.querySelector('#edit-product-form');
    editProductForm.productId.value = productId;
    editProductForm.nome.value = product.nome;
    editProductForm.descricao.value = product.descricao || '';
    editProductForm.preco.value = product.preco;
    editProductForm.imagem.value = product.imagem || '';
    editProductForm.categoria.value = product.categoria || '';

    // Preencher select de lojas
    const storeSelect = editProductForm.querySelector('select[name="storeId"]');
    storeSelect.innerHTML = '<option value="">Selecione uma Loja</option>';
    APP_STATE.stores.forEach(store => {
      const option = document.createElement('option');
      option.value = store.id;
      option.textContent = store.nome;
      storeSelect.appendChild(option);
    });
    storeSelect.value = product.storeId;

    Utils.showElement(editProductModal, true);

    // Event listeners
    const cancelButton = editProductModal.querySelector('#cancel-edit-product');
    cancelButton.onclick = () => {
      Utils.showElement(editProductModal, false);
      editProductForm.reset();
      Utils.resetFormMessages(editProductModal);
    };

    editProductForm.onsubmit = async (e) => {
      e.preventDefault();
      const updatedProduct = {
        storeId: editProductForm.storeId.value,
        nome: editProductForm.nome.value,
        descricao: editProductForm.descricao.value || null,
        preco: parseFloat(editProductForm.preco.value),
        imagem: editProductForm.imagem.value || null,
        categoria: editProductForm.categoria.value,
        adminId: APP_STATE.currentUser.uid
      };

      try {
        await updateDoc(doc(db, 'produtos', productId), updatedProduct);
        Utils.showSuccessMessage(editProductModal, 'Produto atualizado com sucesso!');
        setTimeout(() => {
          Utils.showElement(editProductModal, false);
          editProductForm.reset();
          StoreService.loadStores(APP_STATE.currentUser);
        }, 1500);
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        Utils.showErrorMessage(editProductModal, `Erro: ${error.message}`);
      }
    };
  },

  deleteProduct: async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    console.log('Excluindo produto:', productId);
    try {
      await deleteDoc(doc(db, 'produtos', productId));
      await StoreService.loadStores(APP_STATE.currentUser);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto: ' + error.message);
    }
  },

  handleAddProduct: async (event) => {
    event.preventDefault();
    const formData = new FormData(DOM_ELEMENTS.addProductForm);
    const formValues = Object.fromEntries(formData.entries());
    
    const newProduct = {
      storeId: formValues.storeId,
      nome: formValues.nome,
      descricao: formValues.descricao || null,
      preco: parseFloat(formValues.preco),
      imagem: formValues.imagem || null,
      categoria: formValues.categoria,
      adminId: APP_STATE.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'produtos'), newProduct);
      Utils.showSuccessMessage(DOM_ELEMENTS.addProductForm, 'Produto adicionado com sucesso!');
      DOM_ELEMENTS.addProductForm.reset();
      await StoreService.loadStores(APP_STATE.currentUser);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      Utils.showErrorMessage(DOM_ELEMENTS.addProductForm, `Erro: ${error.message}`);
    }
  }
};

// Inicialização de Event Listeners
const initEventListeners = () => {
  // Event delegation para botões de loja
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      StoreService.openEditModal(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-btn')) {
      StoreService.deleteStore(e.target.dataset.id);
    } else if (e.target.classList.contains('edit-product-btn')) {
      ProductService.openEditProductModal(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-product-btn')) {
      ProductService.deleteProduct(e.target.dataset.id);
    }
  });

  // Formulários
  if (DOM_ELEMENTS.editStoreForm) {
    DOM_ELEMENTS.editStoreForm.addEventListener('submit', StoreService.handleStoreFormSubmit);
  }

  if (DOM_ELEMENTS.cancelEditButton) {
    DOM_ELEMENTS.cancelEditButton.addEventListener('click', () => {
      Utils.showElement(DOM_ELEMENTS.editModal, false);
      DOM_ELEMENTS.editStoreForm.reset();
      Utils.resetFormMessages(DOM_ELEMENTS.editModal);
    });
  }

  if (DOM_ELEMENTS.addProductForm) {
    DOM_ELEMENTS.addProductForm.addEventListener('submit', ProductService.handleAddProduct);
  }

  if (DOM_ELEMENTS.storeSignupForm) {
    DOM_ELEMENTS.storeSignupForm.addEventListener('submit', StoreService.handleStoreSignup);
  }

  if (DOM_ELEMENTS.toggleStoreForm) {
    DOM_ELEMENTS.toggleStoreForm.addEventListener('click', StoreService.toggleStoreForm);
  }

  if (DOM_ELEMENTS.logoutButton) {
    DOM_ELEMENTS.logoutButton.addEventListener('click', AuthService.handleLogout);
  }
};

// Inicialização da Aplicação
const initApp = () => {
  initEventListeners();
  AuthService.initializeAuthListener();
};

// Iniciar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);
// Verificar se o usuário é administrador
async function isAdmin(user) {
  if (!user) return false;
  try {
      console.log('Verificando se o usuário é administrador, UID:', user.uid);
      const adminQuery = query(
          collection(db, 'admins'),
          where('uid', '==', user.uid)
      );
      const adminSnapshot = await getDocs(adminQuery);
      console.log('Documentos de admin encontrados:', adminSnapshot.docs.length);
      return !adminSnapshot.empty;
  } catch (error) {
      console.error('Erro ao verificar status de administrador:', error);
      return false;
  }
}

// Autenticação e Redirecionamento
onAuthStateChanged(auth, async (user) => {
  console.log('onAuthStateChanged chamado, usuário:', user ? user.uid : 'nenhum');
  if (!user) {
      console.log('Usuário não autenticado, redirecionando para vitrine.html');
      if (authMessage) authMessage.classList.remove('hidden');
      if (storeFormContainer) storeFormContainer.classList.add('hidden');
      if (storesTable) storesTable.parentElement.classList.add('hidden');
      window.location.href = '/view/vitrine.html';
      return;
  }

  const isAdminUser = await isAdmin(user);
  if (!isAdminUser) {
      console.log('Usuário autenticado, mas não é administrador, redirecionando para vitrine.html');
      if (authMessage) authMessage.classList.remove('hidden');
      if (storeFormContainer) storeFormContainer.classList.add('hidden');
      if (storesTable) storesTable.parentElement.classList.add('hidden');
      window.location.href = '/view/vitrine.html';
      return;
  }

  console.log('Usuário é administrador, carregando dashboard');
  if (DOM_ELEMENTS.adminNameElement) {
    DOM_ELEMENTS.adminNameElement.textContent = `Bem-vindo, ${user.displayName || 'Admin'}`;
  }

  if (DOM_ELEMENTS.logoutButton) {
    DOM_ELEMENTS.logoutButton.classList.remove('hidden');
}

  if (DOM_ELEMENTS.authMessage) {
      DOM_ELEMENTS.authMessage.classList.add('hidden');
  }
});