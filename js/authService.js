import { auth, onAuthStateChanged, signOut } from './auth.js';
import { db, collection, query, where, getDocs, functions, httpsCallable } from './firestore.js';
import { Utils } from './utils.js';

export const AuthService = {
  isAdmin: async (user) => {
    if (!user) return false;
    try {
      console.log('Verificando se o usuário é administrador via Cloud Function, UID:', user.uid);
      const checkAdminStatus = httpsCallable(functions, 'checkAdminStatus');
      const result = await checkAdminStatus();
      return result.data.isAdmin;
    } catch (error) {
      console.error('Erro ao verificar status de administrador:', error);
      return false;
    }
  },

  initializeAuthListener: (DOM_ELEMENTS, APP_STATE, loadStores) => {
    onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged chamado, usuário:', user ? user.uid : 'nenhum');
      APP_STATE.currentUser = user;

      if (!user) {
        console.log('Usuário não autenticado, redirecionando para vitrine.html');
        Utils.showElement(DOM_ELEMENTS.authMessage, true);
        Utils.showElement(DOM_ELEMENTS.storeFormContainer, false);
        Utils.showElement(DOM_ELEMENTS.storesTable?.parentElement, false);
        window.location.href = '/view/vitrine.html';
        return;
      }

      const isAdminUser = await AuthService.isAdmin(user);
      if (!isAdminUser) {
        console.log('Usuário autenticado, mas não é administrador, redirecionando para vitrine.html');
        Utils.showElement(DOM_ELEMENTS.authMessage, true);
        Utils.showElement(DOM_ELEMENTS.storeFormContainer, false);
        Utils.showElement(DOM_ELEMENTS.storesTable?.parentElement, false);
        window.location.href = '/view/vitrine.html';
        return;
      }

      console.log('Usuário é administrador, carregando dashboard');
      if (DOM_ELEMENTS.adminNameElement) {
        DOM_ELEMENTS.adminNameElement.textContent = `Bem-vindo, ${user.displayName || 'Admin'}`;
      }
      if (DOM_ELEMENTS.logoutButton) {
        DOM_ELEMENTS.logoutButton.classList.remove('hidden');
      }
      if (DOM_ELEMENTS.authMessage) {
        DOM_ELEMENTS.authMessage.classList.add('hidden');
      }
      loadStores();
    });
  },

  handleLogout: async () => {
    try {
      await signOut(auth);
      window.location.href = '/view/comecar.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout: ' + error.message);
    }
  }
};