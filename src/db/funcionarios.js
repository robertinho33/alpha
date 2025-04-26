// src/db/funcionarios.js
import { auth, db } from '../firebase-init.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.getElementById('formulario-funcionario')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  formError.classList.add('d-none');
  formSuccess.classList.add('d-none');

  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return;
  }

  const funcionario = {
    nome: document.getElementById('nome').value.trim(),
    cpf: document.getElementById('cpf').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    cargo: document.getElementById('cargo').value.trim(),
    salario: parseFloat(document.getElementById('salario').value),
    dataAdmissao: document.getElementById('dataAdmissao').value
  };

  try {
    if (!auth.currentUser) throw new Error('Usuário não autenticado.');
    const funcionarioId = `funcionario_${Date.now()}`;
    await setDoc(doc(db, 'funcionarios', funcionarioId), {
      ...funcionario,
      ownerId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });

    formSuccess.textContent = 'Funcionário cadastrado com sucesso!';
    formSuccess.classList.remove('d-none');
    e.target.reset();
  } catch (error) {
    console.error('Erro no cadastro de funcionário:', error);
    formError.textContent = 'Erro ao cadastrar: ' + error.message;
    formError.classList.remove('d-none');
  }
});