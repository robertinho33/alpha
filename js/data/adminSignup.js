// js/data/adminSignup.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../auth.js';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs } from '../firestore.js';

console.log('Carregando adminSignup.js...');

if (window.location.pathname.includes('comecar.html')) {
    const adminSignupForm = document.getElementById('admin-signup-form');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminSignupError = document.getElementById('admin-signup-error');
    const adminSignupSuccess = document.getElementById('admin-signup-success');
    const adminLoginError = document.getElementById('admin-login-error');
    const adminLoginSuccess = document.getElementById('admin-login-success');
    const showLoginLink = document.getElementById('show-login');
    const showSignupLink = document.getElementById('show-signup');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = adminSignupForm ? adminSignupForm.parentElement : null;

    if (!showLoginLink) console.error('Elemento show-login não encontrado.');
    if (!showSignupLink) console.error('Elemento show-signup não encontrado.');
    if (!loginFormContainer) console.error('Elemento login-form-container não encontrado.');
    if (!signupFormContainer) console.error('Elemento signup-form-container não encontrado.');

    if (showLoginLink && showSignupLink && signupFormContainer && loginFormContainer) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clicou em show-login');
            signupFormContainer.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');
        });

        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clicou em show-signup');
            loginFormContainer.classList.add('hidden');
            signupFormContainer.classList.remove('hidden');
        });
    } else {
        console.warn('Não inicializando eventos de alternância: um ou mais elementos não encontrados.');
    }

    if (adminSignupForm) {
        adminSignupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = event.target.nome.value;
            const email = event.target.email.value;
            const senha = event.target.senha.value;
            const concordo = event.target.concordo.checked;

            if (!concordo) {
                adminSignupError.textContent = 'Você deve concordar com a Política de Privacidade.';
                adminSignupSuccess.textContent = '';
                return;
            }

            try {
                // Validar formato do email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    adminSignupError.textContent = 'Por favor, insira um email válido.';
                    adminSignupSuccess.textContent = '';
                    return;
                }

                // Verificar se o email já existe na coleção 'admins'
                console.log('Verificando email na coleção admins:', email);
                const adminsQuery = query(collection(db, 'admins'), where('email', '==', email));
                const adminsSnapshot = await getDocs(adminsQuery);
                console.log('Documentos encontrados:', adminsSnapshot.docs.length);
                if (!adminsSnapshot.empty) {
                    adminSignupError.textContent = 'Este email já está registrado como administrador.';
                    adminSignupSuccess.textContent = '';
                    return;
                }

                // Tentar criar o usuário na autenticação do Firebase
                console.log('Criando usuário na autenticação:', email);
                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                const user = userCredential.user;
                console.log('Usuário criado com sucesso, UID:', user.uid);

                // Adicionar o administrador na coleção 'admins'
                console.log('Adicionando administrador à coleção admins...');
                await addDoc(collection(db, 'admins'), {
                    nome,
                    email,
                    uid: user.uid,
                    criadoEm: serverTimestamp()
                });
                console.log('Administrador adicionado à coleção admins.');

                adminSignupSuccess.textContent = 'Cadastro realizado com sucesso! Faça login para continuar.';
                adminSignupError.textContent = '';
                adminSignupForm.reset();

                signupFormContainer.classList.add('hidden');
                loginFormContainer.classList.remove('hidden');
            } catch (error) {
                console.error('Erro ao cadastrar administrador:', error);
                if (error.code === 'auth/email-already-in-use') {
                    adminSignupError.textContent = 'Este email já está registrado na autenticação. Tente fazer login.';
                } else if (error.code === 'permission-denied') {
                    adminSignupError.textContent = 'Permissões insuficientes para acessar a coleção de administradores. Contate o suporte.';
                } else {
                    adminSignupError.textContent = `Erro: ${error.message}`;
                }
                adminSignupSuccess.textContent = '';
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = event.target.email.value;
            const senha = event.target.senha.value;

            try {
                await signInWithEmailAndPassword(auth, email, senha);
                adminLoginSuccess.textContent = 'Login realizado com sucesso! Redirecionando...';
                adminLoginError.textContent = '';

                setTimeout(() => {
                    window.location.href = '/view/dashboard.html';
                }, 1000);
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                adminLoginError.textContent = `Erro: ${error.message}`;
                adminLoginSuccess.textContent = '';
            }
        });
    }
}