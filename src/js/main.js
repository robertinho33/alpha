// src/js/main.js
import { auth, db } from './firebase.js'; // O caminho relativo funciona porque estão na mesma pasta
import { registerUser, registerFirstAdmin, loginUser, logoutUser, onAuthStateChanged, getUserRole, getUserData, hasUsers, updateUserPassword } from './auth.js';
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

            if (!role) {
                console.error('Usuário autenticado mas sem documento no Firestore:', user.uid);
                alert('Seu perfil não está configurado. Entre em contato com o administrador.');
                await logoutUser();
                window.location.href = 'index.html';
                return;
            }

            if (!defaultPages[role]) {
                console.error('Papel do usuário não mapeado:', role);
                window.location.href = 'acesso-negado.html';
                return;
            }

            if (userInfo) {
                userInfo.textContent = userData && userData.nome ? `${userData.nome} (${role})` : `Usuário sem nome (${role})`;
            }
            if (logoutButton) logoutButton.classList.remove('d-none');
            if (loginButton) loginButton.classList.add('d-none');

            document.getElementById('comandasLink')?.classList[role === 'admin' || role === 'funcionario' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('produtosLink')?.classList[role === 'admin' ? 'remove' : 'add']('d-none');
            document.getElementById('vendasLink')?.classList[role === 'admin' || role === 'funcionario' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('relatoriosLink')?.classList[role === 'admin' || role === 'caixa' ? 'remove' : 'add']('d-none');
            document.getElementById('cadastroUsuarioLink')?.classList[role === 'admin' ? 'remove' : 'add']('d-none');

            if (!allowedPages[page]?.includes(role) && !allowedPages[page]?.includes('todos')) {
                console.log('Acesso negado. Redirecionando para página padrão:', defaultPages[role]);
                window.location.href = defaultPages[role];
                return;
            }

            if (page === 'index.html' || page === 'register.html') {
                console.log('Redirecionando para página padrão:', defaultPages[role]);
                window.location.href = defaultPages[role];
                return;
            }

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

    // Eventos de formulários (mantidos como estão)
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
            const profession = document.getElementById('cadastroProfissao').value;

            console.log('Dados do formulário:', { nome, email, password, role, profession });

            if (!nome || !email || !password || !role || !profession) {
                console.error('Campos obrigatórios estão vazios');
                alert('Por favor, preencha todos os campos.');
                return;
            }

            try {
                const user = await registerUser(email, password, nome, role, profession);
                console.log('Usuário cadastrado com UID:', user.uid);
                alert('Usuário cadastrado com sucesso!');
                cadastroForm.reset();
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    alert('Este email já está em uso. Por favor, use um email diferente ou faça login.');
                } else if (error.code === 'auth/weak-password') {
                    alert('A senha é muito fraca. Use pelo menos 6 caracteres.');
                } else if (error.code === 'auth/invalid-email') {
                    alert('O email fornecido é inválido. Verifique o formato.');
                } else {
                    alert('Erro ao cadastrar: ' + error.message);
                }
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

    // Formulários adicionais (serviceForm, productForm, scheduleForm) mantidos como estão
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('serviceName').value;
            const description = document.getElementById('serviceDescription').value;
            const price = parseFloat(document.getElementById('servicePrice').value);
            const duration = parseInt(document.getElementById('serviceDuration').value);
            const professionalType = document.getElementById('serviceProfessionalType').value;

            try {
                await addDoc(collection(db, 'services'), {
                    name,
                    description,
                    price,
                    duration,
                    professionalType,
                    createdAt: new Date().toISOString(),
                    createdBy: auth.currentUser.uid
                });
                alert('Serviço cadastrado com sucesso!');
                serviceForm.reset();
            } catch (error) {
                console.error('Erro ao cadastrar serviço:', error);
                alert('Erro ao cadastrar serviço: ' + error.message);
            }
        });
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const stock = parseInt(document.getElementById('productStock').value);

            try {
                await addDoc(collection(db, 'products'), {
                    name,
                    description,
                    price,
                    stock,
                    createdAt: new Date().toISOString(),
                    createdBy: auth.currentUser.uid
                });
                alert('Produto cadastrado com sucesso!');
                productForm.reset();
            } catch (error) {
                console.error('Erro ao cadastrar produto:', error);
                alert('Erro ao cadastrar produto: ' + error.message);
            }
        });
    }

    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const serviceId = document.getElementById('scheduleService').value;
            const professionalId = document.getElementById('scheduleProfessional').value;
            const clientName = document.getElementById('scheduleClient').value;
            const dateTime = document.getElementById('scheduleDateTime').value;

            try {
                await addDoc(collection(db, 'schedules'), {
                    serviceId,
                    professionalId,
                    clientName,
                    dateTime: new Date(dateTime).toISOString(),
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    createdBy: auth.currentUser.uid
                });
                alert('Agendamento realizado com sucesso!');
                scheduleForm.reset();
            } catch (error) {
                console.error('Erro ao cadastrar agendamento:', error);
                alert('Erro ao cadastrar agendamento: ' + error.message);
            }
        });
    }
});

// Funções de carregamento
async function carregarDashboard(user, role) { /* ... */ }
async function carregarComandas(user, role) {
    const serviceSelect = document.getElementById('comandaService');
    const productSelect = document.getElementById('comandaProduct');
    const addServiceBtn = document.getElementById('addService');
    const addProductBtn = document.getElementById('addProduct');
    const comandaItems = document.getElementById('comandaItems');
    const comandaTotal = document.getElementById('comandaTotal');
    const saveComandaBtn = document.getElementById('saveComanda');

    if (!serviceSelect || !productSelect || !addServiceBtn || !addProductBtn || !comandaItems || !comandaTotal || !saveComandaBtn) {
        console.error('Elementos necessários para carregar comandas não encontrados no DOM');
        return;
    }

    let items = [];
    let total = 0;

    const servicesSnapshot = await getDocs(collection(db, 'services'));
    servicesSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${doc.data().name} (R$${doc.data().price.toFixed(2)})`;
        option.dataset.price = doc.data().price;
        serviceSelect.appendChild(option);
    });

    const productsSnapshot = await getDocs(collection(db, 'products'));
    productsSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${doc.data().name} (R$${doc.data().price.toFixed(2)})`;
        option.dataset.price = doc.data().price;
        productSelect.appendChild(option);
    });

    addServiceBtn.addEventListener('click', () => {
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        items.push({ type: 'service', id: selectedOption.value, name: selectedOption.textContent.split(' (')[0], price });
        updateComanda();
    });

    addProductBtn.addEventListener('click', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        items.push({ type: 'product', id: selectedOption.value, name: selectedOption.textContent.split(' (')[0], price });
        updateComanda();
    });

    function updateComanda() {
        comandaItems.innerHTML = '';
        total = 0;
        items.forEach((item, index) => {
            total += item.price;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.type === 'service' ? 'Serviço' : 'Produto'}</td>
                <td>${item.name}</td>
                <td>R$${item.price.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" data-index="${index}">Remover</button></td>
            `;
            comandaItems.appendChild(row);
        });
        comandaTotal.textContent = total.toFixed(2);

        comandaItems.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                items.splice(index, 1);
                updateComanda();
            });
        });
    }

    saveComandaBtn.addEventListener('click', async () => {
        try {
            await addDoc(collection(db, 'comandas'), {
                items,
                total,
                createdAt: new Date().toISOString(),
                createdBy: user.uid
            });
            alert('Comanda salva com sucesso!');
            items = [];
            updateComanda();
        } catch (error) {
            console.error('Erro ao salvar comanda:', error);
            alert('Erro ao salvar comanda: ' + error.message);
        }
    });
}
async function carregarProdutos(user, role) { /* ... */ }
async function carregarVendas(user, role) { /* ... */ }
async function carregarRelatorios(user, role) { /* ... */ }
async function carregarPerfil(user, role) { /* ... */ }
async function carregarCadastroUsuario(user, role) { /* ... */ }