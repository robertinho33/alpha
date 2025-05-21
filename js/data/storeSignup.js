// js/data/storeSignup.js
import { auth, createUserWithEmailAndPassword } from '../auth.js';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs } from '../firestore.js';

console.log('Carregando storeSignup.js...');

if (window.location.pathname.includes('comecar.html')) {
    const storeSignupForm = document.getElementById('store-signup-form');
    const storeSignupError = document.getElementById('store-signup-error');
    const storeSignupSuccess = document.getElementById('store-signup-success');

    if (storeSignupForm) {
        storeSignupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = event.target.nome.value;
            const email = event.target.email.value;
            const telefone = event.target.telefone.value;
            const negocio = event.target.negocio.value;
            const bairro = event.target.bairro.value;
            const concordo = event.target.concordo.checked;
            const senha = 'defaultPassword123'; // Substitua por um campo de senha ou geração segura

            if (!concordo) {
                storeSignupError.textContent = 'Você deve concordar com a Política de Privacidade.';
                storeSignupSuccess.textContent = '';
                return;
            }

            try {
                // Validar formato do email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    storeSignupError.textContent = 'Por favor, insira um email válido.';
                    storeSignupSuccess.textContent = '';
                    return;
                }

                // Verificar se o email já existe na coleção 'lojas'
                console.log('Verificando email na coleção lojas:', email);
                const lojasQuery = query(collection(db, 'lojas'), where('email', '==', email));
                const lojasSnapshot = await getDocs(lojasQuery);
                console.log('Documentos encontrados:', lojasSnapshot.docs.length);
                if (!lojasSnapshot.empty) {
                    storeSignupError.textContent = 'Este email já está registrado para uma loja.';
                    storeSignupSuccess.textContent = '';
                    return;
                }

                // Criar usuário na autenticação
                console.log('Criando usuário na autenticação:', email);
                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                const user = userCredential.user;
                console.log('Usuário criado com sucesso, UID:', user.uid);

                // Adicionar loja na coleção 'lojas'
                console.log('Adicionando loja à coleção lojas...');
                await addDoc(collection(db, 'lojas'), {
                    nome,
                    email,
                    telefone,
                    negocio,
                    bairro,
                    adminId: user.uid,
                    criadoEm: serverTimestamp()
                });
                console.log('Loja adicionada à coleção lojas.');

                storeSignupSuccess.textContent = 'Loja cadastrada com sucesso! Faça login para continuar.';
                storeSignupError.textContent = '';
                storeSignupForm.reset();
            } catch (error) {
                console.error('Erro ao cadastrar loja:', error);
                if (error.code === 'auth/email-already-in-use') {
                    storeSignupError.textContent = 'Este email já está registrado na autenticação. Tente fazer login.';
                } else if (error.code === 'permission-denied') {
                    storeSignupError.textContent = 'Permissões insuficientes para acessar a coleção de lojas. Contate o suporte.';
                } else {
                    storeSignupError.textContent = `Erro: ${error.message}`;
                }
                storeSignupSuccess.textContent = '';
            }
        });
    }
}