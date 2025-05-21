// js/data/vitrine.js
import { auth, onAuthStateChanged, signOut } from '../auth.js';
import { db, collection, getDocs } from '../firestore.js';

console.log('Carregando vitrine.js...');

const lojasContainer = document.getElementById('lojasContainer');
const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('search-input');
const cartButton = document.getElementById('cart-button');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const closeCart = document.getElementById('close-cart');
const checkoutCart = document.getElementById('checkout-cart');
const clientNameElement = document.getElementById('client-name');
const logoutButton = document.getElementById('logout-button');
const categoryButtons = document.querySelectorAll('.category-card');
const clearStoreFilterButton = document.getElementById('clear-store-filter');

let cart = [];
let allProducts = [];
let allStores = [];
let currentStoreFilter = null; // Armazena o storeId da loja filtrada, ou null se não houver filtro

async function loadData() {
  try {
    // Carregar lojas
    const storesSnapshot = await getDocs(collection(db, 'lojas'));
    allStores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Carregar produtos
    const productsSnapshot = await getDocs(collection(db, 'produtos'));
    allProducts = productsSnapshot.docs.map(doc => {
      const product = { id: doc.id, ...doc.data() };
      const store = allStores.find(s => s.id === product.storeId);
      product.lojaNome = store ? store.nome : 'Loja Desconhecida';
      return product;
    });

    renderStores(allStores);
    renderProducts(allProducts);

    // Configurar busca
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        let filteredProducts = allProducts;
        
        // Aplicar filtro de loja, se ativo
        if (currentStoreFilter) {
          filteredProducts = filteredProducts.filter(p => p.storeId === currentStoreFilter);
        }

        // Aplicar filtro de busca
        filteredProducts = filteredProducts.filter(p => 
          p.nome.toLowerCase().includes(query) || 
          p.lojaNome.toLowerCase().includes(query)
        );

        const filteredStores = allStores.filter(s => 
          s.nome.toLowerCase().includes(query)
        );

        renderProducts(filteredProducts);
        renderStores(filteredStores);
      });
    }

    // Configurar filtros de categoria
    if (categoryButtons) {
      categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
          const categoria = button.dataset.categoria;
          let filteredProducts = allProducts;

          // Aplicar filtro de loja, se ativo
          if (currentStoreFilter) {
            filteredProducts = filteredProducts.filter(p => p.storeId === currentStoreFilter);
          }

          // Aplicar filtro de categoria
          filteredProducts = categoria 
            ? filteredProducts.filter(p => p.categoria === categoria) 
            : filteredProducts;

          renderProducts(filteredProducts);
          renderStores(allStores); // Mantém todas as lojas visíveis
        });
      });
    }

    // Configurar botão de limpar filtro de loja
    if (clearStoreFilterButton) {
      clearStoreFilterButton.addEventListener('click', () => {
        currentStoreFilter = null;
        showElement(clearStoreFilterButton, false);
        renderProducts(allProducts);
        renderStores(allStores);
        if (searchInput) searchInput.value = ''; // Limpa a busca para consistência
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    if (lojasContainer) {
      lojasContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar lojas. Tente novamente.</p>';
    }
    if (productsContainer) {
      productsContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar produtos. Tente novamente.</p>';
    }
  }
}

function renderStores(stores) {
  if (!lojasContainer) return;
  lojasContainer.innerHTML = '';
  stores.slice(0, 4).forEach(store => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow hover:shadow-md transition overflow-hidden cursor-pointer';
    card.dataset.storeId = store.id; // Adiciona o storeId ao card
    card.innerHTML = `
      <img src="${store.imagem || 'https://source.unsplash.com/300x200/?store'}" alt="${store.nome}" class="w-full h-40 object-cover">
      <div class="p-4">
        <h4 class="font-semibold text-lg">${store.nome}</h4>
        <p class="text-sm text-gray-600">${store.bairro || 'Endereço não informado'}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      currentStoreFilter = store.id;
      showElement(clearStoreFilterButton, true);
      let filteredProducts = allProducts.filter(p => p.storeId === store.id);
      
      // Aplicar filtro de busca, se houver
      if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.nome.toLowerCase().includes(query) || 
          p.lojaNome.toLowerCase().includes(query)
        );
      }

      renderProducts(filteredProducts);
      renderStores(allStores); // Mantém todas as lojas visíveis
    });
    lojasContainer.appendChild(card);
  });
}

function renderProducts(products) {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow hover:shadow-md transition overflow-hidden';
    card.innerHTML = `
      <img src="${product.imagem || 'https://via.placeholder.com/150'}" alt="${product.nome}" class="w-full h-40 object-cover">
      <div class="p-4">
        <h4 class="font-semibold text-lg">${product.nome}</h4>
        <p class="text-sm text-gray-600">${product.descricao || 'Sem descrição'}</p>
        <p class="text-sm text-gray-600">Loja: ${product.lojaNome}</p>
        <p class="font-bold">R$ ${product.preco.toFixed(2)}</p>
        <button class="add-to-cart bg-blue-900 text-white p-2 rounded mt-2" data-id="${product.id}" aria-label="Adicionar ${product.nome} ao carrinho">Adicionar ao Carrinho</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        cart.push(product);
        updateCart();
      }
    });
  });
}

function updateCart() {
  if (cartCount && cartItems && cartTotal) {
    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
      total += item.preco;
      const cartItem = document.createElement('div');
      cartItem.className = 'flex justify-between items-center border-b py-2';
      cartItem.innerHTML = `
        <p>${item.nome} - R$ ${item.preco.toFixed(2)} (Loja: ${item.lojaNome})</p>
        <button class="remove-from-cart text-red-500" data-index="${index}" aria-label="Remover ${item.nome} do carrinho">Remover</button>
      `;
      cartItems.appendChild(cartItem);
    });
    cartTotal.textContent = total.toFixed(2);

    document.querySelectorAll('.remove-from-cart').forEach(button => {
      button.addEventListener('click', () => {
        const index = parseInt(button.dataset.index);
        cart.splice(index, 1);
        updateCart();
      });
    });
  }
}

function showElement(element, show) {
  if (element) {
    element.classList.toggle('hidden', !show);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      showElement(cartModal, true);
    });
  }
  if (closeCart) {
    closeCart.addEventListener('click', () => {
      showElement(cartModal, false);
    });
  }
  if (checkoutCart) {
    checkoutCart.addEventListener('click', () => {
      alert('Funcionalidade de finalização em desenvolvimento!');
    });
  }
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = '/view/comecar.html';
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout: ' + error.message);
      }
    });
  }
  onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged chamado, usuário:', user ? user.uid : 'nenhum');
    if (clientNameElement) {
      clientNameElement.textContent = user ? `Bem-vindo, ${user.displayName || 'Cliente'}` : 'Bem-vindo, Cliente';
      showElement(logoutButton, !!user);
    }
    loadData();
  });
});