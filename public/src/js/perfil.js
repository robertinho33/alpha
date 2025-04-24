import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const perfilForm = document.getElementById('perfilForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  const logoutButton = document.getElementById('logoutButton');
  const nomeComercioElements = document.querySelectorAll('#nomeComercio');

  if (!perfilForm || !errorDiv || !successDiv || !logoutButton || nomeComercioElements.length === 0) {
    console.error('Elementos DOM não encontrados:', {
      perfilForm: !!perfilForm,
      errorDiv: !!errorDiv,
      successDiv: !!successDiv,
      logoutButton: !!logoutButton,
      nomeComercioElements: nomeComercioElements.length
    });
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      errorDiv.textContent = 'Você precisa estar autenticado. Redirecionando...';
      errorDiv.classList.remove('d-none');
      setTimeout(() => window.location.href = '../pages/login.html', 2000);
      return;
    }

    const userId = user.uid;
    const comercioRef = doc(db, 'comercios', userId);

    const loadData = async () => {
      try {
        console.log('Carregando dados para userId:', userId);
        console.log('Caminho do documento:', comercioRef.path);
        const docSnap = await getDoc(comercioRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Dados do comércio:', data);
          document.getElementById('nomeFantasia').value = data.nomeFantasia || '';
          document.getElementById('email').value = data.email || user.email;
          document.getElementById('telefoneComercial').value = data.telefoneComercial || '';
          nomeComercioElements.forEach(el => {
            el.textContent = data.nomeFantasia || 'Estabelecimento';
          });
        } else {
          console.warn('Documento não existe em comercios/', userId);
          errorDiv.textContent = 'Nenhum dado encontrado. Configure o estabelecimento em Configuração.';
          errorDiv.classList.remove('d-none');
          nomeComercioElements.forEach(el => {
            el.textContent = 'Estabelecimento';
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        errorDiv.textContent = error.code === 'permission-denied'
          ? 'Permissões insuficientes. Verifique as regras do Firestore.'
          : 'Erro ao carregar dados: ' + error.message;
        errorDiv.classList.remove('d-none');
        nomeComercioElements.forEach(el => {
          el.textContent = 'Estabelecimento';
        });
      }
    };

    await loadData();

    perfilForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorDiv.classList.add('d-none');
      successDiv.classList.add('d-none');

      if (!perfilForm.checkValidity()) {
        perfilForm.classList.add('was-validated');
        return;
      }

      try {
        await setDoc(comercioRef, {
          nomeFantasia: document.getElementById('nomeFantasia').value.trim(),
          email: document.getElementById('email').value.trim() || user.email,
          telefoneComercial: document.getElementById('telefoneComercial').value.trim() || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        successDiv.textContent = 'Perfil atualizado com sucesso!';
        successDiv.classList.remove('d-none');
        await loadData();
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        errorDiv.textContent = error.code === 'permission-denied'
          ? 'Permissões insuficientes. Verifique as regras do Firestore.'
          : 'Erro ao salvar perfil: ' + error.message;
        errorDiv.classList.remove('d-none');
      }
    });

    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        successDiv.textContent = 'Logout realizado com sucesso!';
        successDiv.classList.remove('d-none');
        setTimeout(() => window.location.href = '../pages/login.html', 2000);
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        errorDiv.textContent = 'Erro ao sair: ' + error.message;
        errorDiv.classList.remove('d-none');
      }
    });
  });
});