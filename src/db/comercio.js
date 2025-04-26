// src/db/comercio.js
import { auth, db } from '../firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

// Cadastro de loja
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
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, 'esseaqui@esseaqui.com', 'SUA_SENHA_SEGURA');
      user = userCredential.user;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        const userCredential = await signInWithEmailAndPassword(auth, 'esseaqui@esseaqui.com', 'SUA_SENHA_SEGURA');
        user = userCredential.user;
      } else {
        throw error;
      }
    }

    await setDoc(doc(db, 'comercios', user.uid), {
      ...comercio,
      ownerId: user.uid,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Loja cadastrada com sucesso! Redirecionando para dashboard...';
    formSuccess.classList.remove('d-none');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
  } catch (error) {
    console.error('Erro no cadastro de loja:', error);
    formError.textContent = error.code === 'auth/email-already-in-use'
      ? 'E-mail já está em uso.'
      : 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});