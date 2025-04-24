import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorDiv = document.getElementById('formError');

  // Redirecionar se já autenticado
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = 'atendimento-cliente.html';
    }
  });

  // Login
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorDiv.classList.add('d-none');

    if (!loginForm.checkValidity()) {
      loginForm.classList.add('was-validated');
      return;
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'atendimento-cliente.html';
    } catch (error) {
      errorDiv.textContent = 'E-mail ou senha inválidos. Tente novamente.';
      errorDiv.classList.remove('d-none');
      console.error('Erro ao fazer login:', error);
    }
  });
});