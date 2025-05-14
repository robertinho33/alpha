// js/router.js

import homeController from '../controllers/HomeController.js';
import servicosController from '../controllers/ServicosController.js';
import agendamentosController from '../controllers/AgendamentosController.js';
import clientesController from '../controllers/ClientesController.js';

const routes = {
  '/': homeController.exibirPaginaInicial, // Supondo um método no HomeController
  '/home': homeController.exibirPaginaInicial,
  '/servicos': servicosController.exibirPaginaDeServicos,
  '/agendamentos': agendamentosController.exibirPaginaDeAgendamentos, // Supondo um método no AgendamentosController
  '/clientes': clientesController.exibirPaginaDeClientes // Supondo um método no ClientesController
};

function rotear() {
  const path = window.location.pathname;
  const routeHandler = routes[path];

  if (routeHandler) {
    // Aqui, em vez de apenas carregar o HTML, você chamaria a função do controller
    routeHandler();
  } else {
    // Lógica para lidar com rotas não encontradas
    console.log(`Rota não encontrada: ${path}`);
    // Talvez carregar uma página de erro 404
  }
}

// Evento para lidar com mudanças de rota (se você ainda estiver usando navegação no lado do cliente)
window.addEventListener('popstate', rotear);

// Chamar rotear na carga inicial da página
document.addEventListener('DOMContentLoaded', rotear);

// Função para navegar para uma nova rota (em vez de usar links <a> diretamente)
export function navigateTo(path) {
  history.pushState(null, '', path);
  rotear();
}