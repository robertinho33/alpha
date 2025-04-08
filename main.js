// src/main.js
import { auth, db } from './firebase.js';
import { registerUser, registerFirstAdmin, loginUser, logoutUser, onAuthStateChanged, getUserRole, getUserData, hasUsers } from './auth.js';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada:', window.location.pathname);
    const logoutButton = document.getElementById('logoutButton');
    const userInfo = document.getElementById('userInfo');
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal') ? new bootstrap.Modal(document.getElementById('loginModal')) : null;

    onAuthStateChanged(auth, async (user) => {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        console.log('Página atual:', page, 'Usuário logado:', user ? user.uid : 'Nenhum');

        const allowedPages = {
            'index.html': ['todos'],
            'register.html': ['todos'],
            'cadastro-usuario.html': ['admin'],
            'dashboard.html': ['admin', 'funcionario', 'caixa'],
            'comandas.html': ['admin', 'funcionario', 'caixa'],
            'produtos.html': ['admin'],
            'vendas.html': ['admin', 'funcionario', 'caixa'],
            'relatorios.html': ['admin', 'caixa'],
            'perfil.html': ['admin', 'funcionario', 'caixa'],
            'cliente.html': ['admin', 'funcionario'],
            'acesso-negado.html': ['todos']
        };

        const defaultPages = {
            'admin': 'dashboard.html',
            'funcionario': 'comandas.html',
            'caixa': 'vendas.html'
        };

        if (user) {
            const role = await getUserRole(user.uid);
            const userData = await getUserData(user.uid);
            console.log('Role:', role, 'Dados do usuário:', userData);

            if (userInfo) {
                userInfo.textContent = userData && userData.nome ? `${userData.nome} (${role})` : `Usuário sem nome (${role})`;
            }
            if (logoutButton) logoutButton.classList.remove('d-none');
            if (loginButton) loginButton.classList.add('d-none');

            // Exibir/esconder links na navbar conforme o papel
            document.getElementById('comandasLink')?.classList[role === 'admin' || role === 'funcionario' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('produtosLink')?.classList[role === 'admin' ? 'remove' : 'add']('d-none');
            document.getElementById('vendasLink')?.classList[role === 'admin' || role === 'funcionario' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('relatoriosLink')?.classList[role === 'admin' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('cadastroUsuarioLink')?.classList[role === 'admin' ? 'remove' : 'add']('d-none');

            // Verificar permissões
            if (!allowedPages[page]?.includes(role) && !allowedPages[page]?.includes('todos')) {
                console.log('Acesso negado. Redirecionando para página padrão:', defaultPages[role]);
                window.location.href = defaultPages[role] || 'acesso-negado.html';
                return;
            }

            // Redirecionar para a página padrão apenas se estiver em index.html
            if (page === 'index.html' || page === 'register.html') {
                console.log('Redirecionando para página padrão:', defaultPages[role]);
                window.location.href = defaultPages[role];
                return;
            }

            // Carregar conteúdo da página atual
            if (page === 'dashboard.html') carregarDashboard(user, role);
            if (page === 'comandas.html') carregarComandas(user, role);
            if (page === 'produtos.html') carregarProdutos(user, role);
            if (page === 'vendas.html') carregarVendas(user, role);
            if (page === 'relatorios.html') carregarRelatorios(user, role);
            if (page === 'perfil.html') carregarPerfil(user, role);
            if (page === 'cadastro-usuario.html') carregarCadastroUsuario(user, role);
        } else {
            if (logoutButton) logoutButton.classList.add('d-none');
            if (loginButton) loginButton.classList.remove('d-none');

            if (!allowedPages[page]?.includes('todos')) {
                console.log('Redirecionando para index.html: Nenhum usuário logado');
                window.location.href = 'index.html';
            }
        }
    });

    if (logoutButton) logoutButton.addEventListener('click', () => logoutUser().then(() => window.location.href = 'index.html'));
    if (loginButton) loginButton.addEventListener('click', () => loginModal.show());

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const loginError = document.getElementById('loginError');
            try {
                await loginUser(email, password);
                loginModal.hide();
                if (loginError) loginError.classList.add('d-none');
            } catch (error) {
                console.error('Erro ao logar:', error);
                if (loginError) loginError.classList.remove('d-none');
                else alert('Erro ao logar: ' + error.message);
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('registerNome').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const companyNome = document.getElementById('companyNome').value;
            const companyCNPJ = document.getElementById('companyCNPJ').value;
            const companyTelefone = document.getElementById('companyTelefone').value;

            try {
                const user = await registerFirstAdmin(email, password, nome);
                await updateDoc(doc(db, 'users', user.uid), {
                    company: { nome: companyNome, cnpj: companyCNPJ, telefone: companyTelefone }
                });
                alert('Administrador registrado com sucesso!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Erro ao registrar admin:', error);
                alert('Erro ao registrar: ' + error.message);
            }
        });
    }

    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('cadastroNome').value;
            const email = document.getElementById('cadastroEmail').value;
            const password = document.getElementById('cadastroPassword').value;
            const role = document.getElementById('cadastroTipo').value;

            try {
                await registerUser(email, password, nome, role);
                alert('Usuário cadastrado com sucesso!');
                cadastroForm.reset();
                // Não redireciona aqui, deixa o usuário na página de cadastro
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                alert('Erro ao cadastrar: ' + error.message);
            }
        });
    }

    const alterarSenhaForm = document.getElementById('alterarSenhaForm');
    if (alterarSenhaForm) {
        alterarSenhaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novaSenha = document.getElementById('novaSenha').value;
            await updateUserPassword(novaSenha);
            alert('Senha alterada com sucesso!');
            alterarSenhaForm.reset();
        });
    }
});

// Funções de carregamento permanecem iguais
async function carregarDashboard(user, role) { /* ... */ }
async function carregarComandas(user, role) { /* ... */ }
async function carregarProdutos(user, role) { /* ... */ }
async function carregarVendas(user, role) { /* ... */ }
async function carregarRelatorios(user, role) { /* ... */ }
async function carregarPerfil(user, role) { /* ... */ }
async function carregarCadastroUsuario(user, role) { /* ... */ }