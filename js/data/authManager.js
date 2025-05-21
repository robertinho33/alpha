import { auth, onAuthStateChanged, signOut } from '../auth.js';

const logoutButton = document.getElementById('logout-button');

onAuthStateChanged(auth, (user) => {
    if (logoutButton) {
        logoutButton.classList.toggle('hidden', !user);
    }

    // Proteger dashboard
    if (window.location.pathname.includes('dashboard.html') && !user) {
        window.location.href = '/view/comecar.html';
    }

    // Mostrar tela de login em comecar.html se não logado
    if (window.location.pathname.includes('comecar.html') && !user) {
        const adminSignupForm = document.getElementById('admin-signup-form');
        const loginFormContainer = document.getElementById('login-form-container');
        if (adminSignupForm && loginFormContainer) {
            adminSignupForm.parentElement.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');
        }
    }
});

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = '/view/comecar.html';
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    });
}