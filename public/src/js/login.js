import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');

  if (!form) {
    console.warn('Formulário de login não encontrado.');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const email = form.querySelector('#email').value.trim();
    const senha = form.querySelector('#senha').value;

    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      successDiv.textContent = 'Login realizado com sucesso! Redirecionando...';
      successDiv.classList.remove('d-none');

      // Aguarda a confirmação do estado de autenticação
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setTimeout(() => {
            window.location.href = 'configuracao-estabelecimento.html';
          }, 2000);
        }
      }, (error) => {
        errorDiv.textContent = 'Erro ao verificar autenticação.';
        errorDiv.classList.remove('d-none');
        console.error('Erro:', error);
      });
    } catch (error) {
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }
      errorDiv.textContent = errorMessage;
      errorDiv.classList.remove('d-none');
      console.error('Erro ao fazer login:', error);
    }
  });
});