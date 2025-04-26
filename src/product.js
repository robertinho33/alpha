// src/product.js
import { products } from './products.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const id = parseInt(getQueryParam('id'), 10);
const produto = products.find(p => p.id === id);
const container = document.getElementById('detalhes');

if (!produto) {
  container.innerHTML = '<p>Produto não encontrado.</p>';
} else {
  container.innerHTML = `
    <div class="produto-detalhe">
      <img src="${produto.img}" alt="${produto.nome}" style="max-width:300px;height:auto;">
      <h2>${produto.nome}</h2>
      <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
      <p>${produto.descricao}</p>
      <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
    </div>
  `;
}

window.adicionarAoCarrinho = function(id) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const p = products.find(x => x.id === id);
  carrinho.push(p);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert("Produto adicionado ao carrinho!");
}
