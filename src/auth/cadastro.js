// src/auth/cadastro.js
import { auth, db } from '../firebase-init.js';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

// Auto preencher com ViaCEP
document.getElementById('cep')?.addEventListener('blur', async function () {
  const cep = this.value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
      } else {
        alert('CEP não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    }
  }
});

// Cadastro de gestor e comércio
document.getElementById('formulario-comercio')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return;
  }

  const gestor = {
    nome: document.getElementById('nomeCompleto').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    email: document.getElementById('email').value.trim(),
    senha: document.getElementById('password').value.trim(),
    role: 'admin'
  };

  const comercio = {
    nome: document.getElementById('nomeComercio').value.trim(),
    cep: document.getElementById('cep').value.trim(),
    rua: document.getElementById('rua').value.trim(),
    numero: document.getElementById('num_casa').value.trim(),
    bairro: document.getElementById('bairro').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value.trim(),
    segmento: document.getElementById('segmento').value.trim()
  };

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, gestor.email, gestor.senha);
    const userId = userCredential.user.uid;

    await setDoc(doc(db, 'users', userId), {
      ...gestor,
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'comercios', userId), {
      ...comercio,
      ownerId: userId,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Cadastro realizado com sucesso! Redirecionando para login...';
    formSuccess.classList.remove('d-none');
    setTimeout(() => window.location.href = 'login.html', 2000);
  } catch (error) {
    console.error('Erro no cadastro:', error);
    formError.textContent = error.code === 'auth/email-already-in-use'
      ? 'E-mail já está em uso.'
      : 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});