// js/data/adminSignup
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from '../auth.js';
import { db, doc, setDoc, serverTimestamp } from '../firestore.js';

const adminSignupForm = document.getElementById('admin-signup-form');
const adminLoginForm = document.getElementById('admin-login-form');
const adminSignupError = document.getElementById('admin-signup-error');
const adminSignupSuccess = document.getElementById('admin-signup-success');
const adminLoginError = document.getElementById('admin-login-error');
const adminLoginSuccess = document.getElementById('admin-login-success');
const storeSignupSection = document.getElementById('store-signup-section');

adminSignupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const adminNome = event.target.admin_nome.value;
    const adminEmail = event.target.admin_email.value;
    const adminSenha = event.target.admin_senha.value;
    const concordo = event.target.concordo.checked;

    if (!concordo) {
        adminSignupError.textContent = 'Você deve concordar com a Política de Privacidade.';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminSenha);
        const user = userCredential.user;

        await setDoc(doc(db, 'admins', user.uid), {
            nome: adminNome,
            email: adminEmail,
            uid: user.uid,
            role: 'admin',
            criadoEm: serverTimestamp()
        });

        adminSignupSuccess.textContent = 'Administrador cadastrado com sucesso! Agora cadastre sua loja.';
        adminSignupError.textContent = '';
        storeSignupSection.classList.remove('hidden');
        adminSignupForm.classList.add('hidden');

    } catch (error) {
        console.error("Erro ao cadastrar administrador:", error);
        adminSignupError.textContent = `Erro: ${error.message}`;
        adminSignupSuccess.textContent = '';
    }
});

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const adminEmail = event.target.admin_email.value;
    const adminSenha = event.target.admin_senha.value;

    try {
        await signInWithEmailAndPassword(auth, adminEmail, adminSenha);
        adminLoginSuccess.textContent = 'Login bem-sucedido! Agora cadastre ou gerencie sua loja.';
        adminLoginError.textContent = '';
        storeSignupSection.classList.remove('hidden');
        adminLoginForm.classList.add('hidden');

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        adminLoginError.textContent = `Erro: ${error.message}`;
        adminLoginSuccess.textContent = '';
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        storeSignupSection.classList.remove('hidden');
    } else {
        storeSignupSection.classList.add('hidden');
    }
});