import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroComercioForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');

  if (!form) {
    console.warn('Formulário de cadastro não encontrado.');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const nomeFantasia = form.querySelector('#nomeFantasia').value.trim();
    const razaoSocial = form.querySelector('#razaoSocial').value.trim();
    const email = form.querySelector('#email').value.trim();
    const emailGestor = form.querySelector('#emailGestor').value.trim();
    const senha = form.querySelector('#senha').value;
    const cnpj = form.querySelector('#cnpj').value.trim();
    const telefoneComercial = form.querySelector('#telefoneComercial').value.trim();
    const telefoneGestor = form.querySelector('#telefoneGestor').value.trim();
    const enderecoComercial = form.querySelector('#enderecoComercial').value.trim();
    const segmento = form.querySelector('#segmento').value;
    const cidade = form.querySelector('#cidade').value.trim();
    const estado = form.querySelector('#estado').value.trim().toUpperCase();
    const horarioFuncionamento = form.querySelector('#horarioFuncionamento').value.trim();
    const descricao = form.querySelector('#descricao').value.trim();

    // Validação adicional
    if (descricao.length > 200) {
      errorDiv.textContent = 'A descrição deve ter no máximo 200 caracteres.';
      errorDiv.classList.remove('d-none');
      return;
    }

    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, 'comercios', user.uid), {
        nomeFantasia,
        razaoSocial: razaoSocial || null,
        email,
        emailGestor: emailGestor || null,
        cnpj: cnpj || null,
        telefoneComercial: telefoneComercial || null,
        telefoneGestor: telefoneGestor || null,
        enderecoComercial: enderecoComercial || null,
        segmento,
        cidade,
        estado,
        horarioFuncionamento: horarioFuncionamento || null,
        descricao: descricao || null,
        createdAt: new Date().toISOString()
      });

      successDiv.textContent = 'Comércio cadastrado com sucesso! Redirecionando...';
      successDiv.classList.remove('d-none');

      setTimeout(() => {
        window.location.href = 'configuracao-estabelecimento.html';
      }, 2000);
    } catch (error) {
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      }

      errorDiv.textContent = errorMessage;
      errorDiv.classList.remove('d-none');
      console.error('Erro ao cadastrar comércio:', error);
    }
  });
});