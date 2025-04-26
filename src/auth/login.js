// src/auth/login.js
import { auth } from '../firebase-init.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

document.getElementById('formulario-login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('password').value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    formSuccess.textContent = 'Login realizado com sucesso! Redirecionando...';
    formSuccess.classList.remove('d-none');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
  } catch (error) {
    console.error('Erro no login:', error);
    formError.textContent = error.code === 'auth/wrong-password'
      ? 'Senha incorreta.'
      : 'Erro ao fazer login: ' + error.message;
    formError.classList.remove('d-none');
  }
});