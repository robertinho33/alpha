
// js/data/lojas.js
import { auth, onAuthStateChanged, signOut } from '../auth.js';
import { db, collection, getDocs } from '../firestore.js';

console.log('Carregando lojas.js...');

function init() {
  const productsContainer = document.getElementById('products-container');
  const storesContainer = document.querySelector('.grid') || document.getElementById('stores-container');
  const searchInput = document.getElementById('search-input');
  const searchInputMobile = document.getElementById('search-input-mobile');
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

  let cart = [];
  let allProducts = [];
  let allStores = [];
  const container = document.getElementById('lojasContainer');

if (!container) {
  console.error('Contêiner de lojas não encontrado');
} else {
  // Suponha que você tenha um array de lojas
  const lojas = [
    { nome: "Loja da Esquina", endereco: "Rua das Flores, 123", imagem: "https://source.unsplash.com/300x200/?store,local" },
    { nome: "Mercado Popular", endereco: "Av. Central, 456", imagem: "https://source.unsplash.com/300x200/?market,local" },
    // ...
  ];

  lojas.forEach(loja => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow hover:shadow-md transition overflow-hidden';
    card.innerHTML = `
      <img src="${loja.imagem}" alt="${loja.nome}" class="w-full h-40 object-cover">
      <div class="p-4">
        <h4 class="font-semibold text-lg">${loja.nome}</h4>
        <p class="text-sm text-gray-600">${loja.endereco}</p>
      </div>
    `;
    container.appendChild(card);
  });
}


  if (!productsContainer || !storesContainer) {
    console.error('Contêineres de produtos ou lojas não encontrados.');
    productsContainer && (productsContainer.innerHTML = '<p class="text-red-500 text-center">Erro: Contêiner de produtos não encontrado.</p>');
    storesContainer && (storesContainer.innerHTML = '<p class="text-red-500 text-center">Erro: Contêiner de lojas não encontrado.</p>');
    return;
  }

  console.log({
    searchInput: !!searchInput,
    searchInputMobile: !!searchInputMobile,
    cartButton: !!cartButton,
    cartCount: !!cartCount,
    cartModal: !!cartModal,
    cartItems: !!cartItems,
    cartTotal: !!cartTotal,
    closeCart: !!closeCart,
    checkoutCart: !!checkoutCart,
    clientNameElement: !!clientNameElement,
    logoutButton: !!logoutButton
  });

  async function buscarLojas() {
    const lojasRef = collection(db, 'lojas');
    const snapshot = await getDocs(lojasRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function loadData() {
    console.log('Carregando dados...');
    try {
      const productsSnapshot = await getDocs(collection(db, 'produtos'));
      allProducts = [];
      productsSnapshot.forEach((doc) => {
        allProducts.push({ id: doc.id, ...doc.data() });
      });

      const storesSnapshot = await getDocs(collection(db, 'lojas'));
      allStores = [];
      storesSnapshot.forEach((doc) => {
        allStores.push({ id: doc.id, ...doc.data() });
      });

      renderStores();
      renderProducts(allProducts);

      [searchInput, searchInputMobile].forEach(input => {
        if (input) {
          input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            const filteredProducts = allProducts.filter(p => p.nome.toLowerCase().includes(query));
            renderProducts(filteredProducts);
          });
        }
      });

      categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
          const categoria = button.dataset.categoria;
          const filteredProducts = categoria ? allProducts.filter(p => p.categoria === categoria) : allProducts;
          renderProducts(filteredProducts);
        });
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (productsContainer) {
        productsContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar produtos. Tente novamente.</p>';
      }
      if (storesContainer) {
        storesContainer.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar lojas. Tente novamente.</p>';
      }
    }
  }

  function renderProducts(products) {
    productsContainer.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300';
      card.innerHTML = `
        <div class="relative">
          <img src="${product.imagem || 'https://via.placeholder.com/150'}" alt="${product.nome}" class="w-full h-48 object-cover">
          <div class="absolute top-2 right-2 bg-white rounded-full p-2 shadow">
            <i class="fas fa-heart text-gray-400 hover:text-red-500 cursor-pointer"></i>
          </div>
          ${product.desconto ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">-${product.desconto}%</span>` : ''}
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold">${product.nome}</h3>
            <div class="flex items-center">
              <i class="fas fa-store text-gray-400 text-sm mr-1"></i>
              <span class="text-gray-500 text-sm">${product.lojaNome || 'Loja'}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-2">${product.descricao || 'Sem descrição'}</p>
          <div class="flex items-center mb-3">
            <div class="flex text-yellow-400 text-sm">
              ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating || 4))}
              ${product.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
              ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rating || 4))}
            </div>
            <span class="text-gray-500 text-xs ml-1">(${product.reviews || 0})</span>
          </div>
          <div class="flex justify-between items-center">
            <div>
              ${product.desconto ? `<span class="text-gray-400 text-sm line-through">R$ ${(product.preco / (1 - product.desconto / 100)).toFixed(2)}</span>` : ''}
              <span class="text-blue-900 font-bold block">R$ ${product.preco.toFixed(2)}</span>
            </div>
            <button class="add-to-cart bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition" data-id="${product.id}" aria-label="Adicionar ${product.nome} ao carrinho">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
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

  function renderStores() {
    storesContainer.innerHTML = '';
    allStores.slice(0, 4).forEach(store => {
      const card = document.createElement('div');
      card.className = 'store-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300';
      card.innerHTML = `
        <div class="relative h-40 bg-blue-100 flex items-center justify-center">
          <img src="${store.imagem || 'https://via.placeholder.com/150'}" alt="${store.nome}" class="h-full w-full object-cover">
          <div class="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
            <i class="fas fa-heart text-gray-400 hover:text-red-500 cursor-pointer"></i>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-1">${store.nome}</h3>
          <div class="flex items-center mb-2">
            <div class="flex text-yellow-400">
              ${'<i class="fas fa-star"></i>'.repeat(Math.floor(store.rating || 4))}
              ${store.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
              ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(store.rating || 4))}
            </div>
            <span class="text-gray-500 text-sm ml-1">(${store.reviews || 0})</span>
          </div>
          <p class="text-gray-600 text-sm mb-3">${store.descricao || store.negocio || 'Sem descrição'}</p>
          <a href="#" class="text-yellow-500 font-medium text-sm hover:underline">Visitar loja</a>
        </div>
      `;
      storesContainer.appendChild(card);
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
          <p>${item.nome} - R$ ${item.preco.toFixed(2)}</p>
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
    if (user && clientNameElement) {
      clientNameElement.textContent = `Bem-vindo, ${user.displayName || 'Cliente'}`;
      showElement(logoutButton, true);
    } else if (clientNameElement) {
      clientNameElement.textContent = 'Bem-vindo, Cliente';
      showElement(logoutButton, false);
    }
    loadData();
  });
}

window.addEventListener('DOMContentLoaded', init);