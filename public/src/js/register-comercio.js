import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('cadastroForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');

  if (!cadastroForm || !errorDiv || !successDiv) {
    console.error('Elementos DOM não encontrados:', {
      cadastroForm: !!cadastroForm,
      errorDiv: !!errorDiv,
      successDiv: !!successDiv
    });
    return;
  }

  cadastroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');

    if (!cadastroForm.checkValidity()) {
      cadastroForm.classList.add('was-validated');
      return;
    }

    const nomeFantasia = document.getElementById('nomeFantasia').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const telefoneComercial = document.getElementById('telefoneComercial').value.trim() || null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      await setDoc(doc(db, 'comercios', user.uid), {
        nomeFantasia,
        email,
        telefoneComercial,
        createdAt: new Date().toISOString()
      });
      successDiv.textContent = 'Comércio cadastrado com sucesso! Redirecionando...';
      successDiv.classList.remove('d-none');
      setTimeout(() => window.location.href = 'login.html', 2000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      errorDiv.textContent = error.code === 'auth/email-already-in-use'
        ? 'E-mail já está em uso.'
        : 'Erro ao cadastrar: ' + error.message;
      errorDiv.classList.remove('d-none');
    }
  });
});