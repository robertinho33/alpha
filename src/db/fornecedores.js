// src/db/fornecedores.js
import { auth, db } from '../firebase-init.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.getElementById('formulario-fornecedor')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return;
  }

  const fornecedor = {
    nome: document.getElementById('nome').value.trim(),
    cnpj: document.getElementById('cnpj').value.trim(),
    contato: {
      nome: document.getElementById('contatoNome').value.trim(),
      email: document.getElementById('contatoEmail').value.trim(),
      telefone: document.getElementById('contatoTelefone').value.trim()
    },
    endereco: {
      cep: document.getElementById('cep').value.trim(),
      rua: document.getElementById('rua').value.trim(),
      numero: document.getElementById('num_casa').value.trim(),
      bairro: document.getElementById('bairro').value.trim(),
      cidade: document.getElementById('cidade').value.trim(),
      estado: document.getElementById('estado').value.trim()
    }
  };

  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const fornecedorId = `fornecedor_${Date.now()}`;
    await setDoc(doc(db, 'fornecedores', fornecedorId), {
      ...fornecedor,
      ownerId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Fornecedor cadastrado com sucesso!';
    formSuccess.classList.remove('d-none');
    e.target.reset();
  } catch (error) {
    console.error('Erro no cadastro de fornecedor:', error);
    formError.textContent = 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});