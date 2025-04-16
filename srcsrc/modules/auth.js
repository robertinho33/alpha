// src/modules/auth.js
import { login, logout, checkAuth } from '../auth/auth.js';

export function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const mensagem = document.getElementById('mensagem');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      login(email, senha, (error) => {
        mensagem.textContent = error;
      });
    });
  }

  const sairButton = document.getElementById('sair');
  if (sairButton) {
    sairButton.addEventListener('click', logout);
  }

  checkAuth();
}