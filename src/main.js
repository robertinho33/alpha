import { auth, db } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { setDoc, doc, getDoc, collection, addDoc, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

// Funções auxiliares
function showError(form, message) {
    const formError = form.querySelector('#formError');
    if (formError) {
        formError.textContent = message;
        formError.classList.remove('d-none');
    }
    const formSuccess = form.querySelector('#formSuccess');
    if (formSuccess) formSuccess.classList.add('d-none');
}

function showSuccess(form, message) {
    const formSuccess = form.querySelector('#formSuccess');
    if (formSuccess) {
        formSuccess.textContent = message;
        formSuccess.classList.remove('d-none');
    }
    const formError = form.querySelector('#formError');
    if (formError) formError.classList.add('d-none');
}

// Função para exibir dados da loja no header
function exibirDadosLojaNoHeader(loja) {
    const nomeLojaHeader = document.getElementById('nome-loja-header');
    if (nomeLojaHeader && loja && loja.nome) {
        nomeLojaHeader.textContent = loja.nome;
    } else {
        console.warn('Não foi possível exibir dados da loja no header:', { nomeLojaHeader, loja });
    }
}

// Função para cadastrar um salão
async function cadastrarSalao(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const nomeSalao = document.getElementById('nomeSalao').value.trim();
    const enderecoSalao = document.getElementById('enderecoSalao').value.trim();
    const cnpjSalao = document.getElementById('cnpjSalao').value.trim();
    const cidadeSalao = document.getElementById('cidadeSalao').value.trim();
    const estadoSalao = document.getElementById('estadoSalao').value;
    const telefoneSalao = document.getElementById('telefoneSalao').value.trim();
    const email = document.getElementById('emailSalao').value.trim();
    const senha = document.getElementById('senhaSalao').value.trim();
    const isMaster = document.getElementById('usuarioMaster').checked;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        if (user) {
            const lojaRef = doc(db, 'lojas', user.uid);
            await setDoc(lojaRef, {
                nome: nomeSalao,
                endereco: enderecoSalao,
                cnpj: cnpjSalao,
                cidade: cidadeSalao,
                estado: estadoSalao,
                telefone: telefoneSalao,
                email: email,
                isMaster: isMaster,
                ownerId: user.uid,
                criadoEm: new Date()
            });
            showSuccess(form, 'Salão cadastrado com sucesso! Você será redirecionado para o login.');
            form.reset();
            form.classList.remove('was-validated');
            setTimeout(() => window.location.href = 'login.html', 2000);
        }
    } catch (error) {
        console.error("Erro ao cadastrar o salão: ", error);
        showError(form, `Erro ao cadastrar: ${error.message}`);
    }
}

// Função para cadastrar um funcionário
async function cadastrarFuncionario(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const nomeFuncionario = document.getElementById('nome-funcionario').value.trim();
    const cargoFuncionario = document.getElementById('cargo-funcionario').value.trim();
    const emailFuncionario = document.getElementById('email-funcionario').value.trim();
    const telefoneFuncionario = document.getElementById('telefone-funcionario').value.trim();
    const comissaoFuncionario = parseFloat(document.getElementById('comissao-funcionario').value);

    const user = auth.currentUser;
    if (user) {
        try {
            console.log('Cadastrando funcionário para loja:', user.uid);
            const funcionariosRef = collection(db, 'lojas', user.uid, 'funcionarios');
            await addDoc(funcionariosRef, {
                nome: nomeFuncionario,
                cargo: cargoFuncionario,
                email: emailFuncionario,
                telefone: telefoneFuncionario,
                comissao: comissaoFuncionario,
                criadoEm: new Date()
            });
            showSuccess(form, 'Funcionário cadastrado com sucesso!');
            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            console.error("Erro ao cadastrar o funcionário: ", error);
            showError(form, `Erro ao cadastrar o funcionário: ${error.message}`);
        }
    } else {
        showError(form, 'Usuário não autenticado. Faça login primeiro.');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

// Função para cadastrar um serviço
async function cadastrarServico(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const nomeServico = document.getElementById('nomeServico').value.trim();
    const categoriaServico = document.getElementById('categoriaServico').value;
    const tipoServico = document.getElementById(`tipo${categoriaServico.charAt(0).toUpperCase() + categoriaServico.slice(1)}`)?.value || '';
    const precoServico = parseFloat(document.getElementById('precoServico').value);
    const duracaoServico = parseInt(document.getElementById('duracaoServico').value);
    const descricaoServico = document.getElementById('descricaoServico').value.trim();

    const user = auth.currentUser;
    if (user) {
        try {
            console.log('Cadastrando serviço para loja:', user.uid);
            const servicosRef = collection(db, 'lojas', user.uid, 'servicos');
            await addDoc(servicosRef, {
                nome: nomeServico,
                categoria: categoriaServico,
                tipo: tipoServico,
                preco: precoServico,
                duracao: duracaoServico,
                descricao: descricaoServico,
                criadoEm: new Date()
            });
            showSuccess(form, 'Serviço cadastrado com sucesso!');
            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            console.error("Erro ao cadastrar o serviço: ", error);
            showError(form, `Erro ao cadastrar o serviço: ${error.message}`);
        }
    } else {
        showError(form, 'Usuário não autenticado. Faça login primeiro.');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

// Função para cadastrar um cliente
async function cadastrarCliente(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const nomeCliente = document.getElementById('nomeCliente').value.trim();
    const telefoneCliente = document.getElementById('telefoneCliente').value.trim();
    const emailCliente = document.getElementById('emailCliente').value.trim();
    const dataNascimentoCliente = document.getElementById('dataNascimentoCliente').value;
    const enderecoCliente = document.getElementById('enderecoCliente').value.trim();
    const cidadeCliente = document.getElementById('cidadeCliente').value.trim();
    const estadoCliente = document.getElementById('estadoCliente').value;
    const aceitoTermos = document.getElementById('aceitoTermos').checked;

    if (!aceitoTermos) {
        showError(form, 'Você deve aceitar os termos e condições.');
        return;
    }

    const user = auth.currentUser;
    if (user) {
        try {
            console.log('Tentando cadastrar cliente para loja com UID:', user.uid);
            const clientesRef = collection(db, 'lojas', user.uid, 'clientes');
            await addDoc(clientesRef, {
                nome: nomeCliente,
                telefone: telefoneCliente,
                email: emailCliente,
                dataNascimento: dataNascimentoCliente,
                endereco: enderecoCliente,
                cidade: cidadeCliente,
                estado: estadoCliente,
                criadoEm: new Date()
            });
            showSuccess(form, 'Cliente cadastrado com sucesso!');
            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            console.error("Erro ao cadastrar o cliente:", error);
            showError(form, `Erro ao cadastrar o cliente: ${error.message}`);
        }
    } else {
        showError(form, 'Usuário não autenticado. Faça login primeiro.');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

// Função para login de usuário
async function loginUsuario(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        if (user) {
            showSuccess(form, 'Login realizado com sucesso! Redirecionando...');
            // Redirecionamento condicional após o login
            const lojaRef = doc(db, 'lojas', user.uid);
            const docSnap = await getDoc(lojaRef);
            if (docSnap.exists()) {
                const lojaData = docSnap.data();
                console.log('Dados da loja carregados após o login:', lojaData);
                exibirDadosLojaNoHeader(lojaData);
                // Carrega os dados do dashboard APÓS obter os dados da loja
                carregarDadosGerais(user.uid); // Passa o UID do usuário para a função
                if (lojaData.isMaster) {
                    setTimeout(() => window.location.href = 'dashboard.html', 2000);
                } else {
                    setTimeout(() => window.location.href = 'agendamentos.html', 2000);
                }

            } else {
                console.warn('Nenhum documento de loja encontrado para UID:', user.uid);
                setTimeout(() => window.location.href = 'agendamentos.html', 2000);
            }
        }
    } catch (error) {
        console.error("Erro ao fazer login: ", error);
        showError(form, `Erro ao fazer login: ${error.message}`);
    }
}

// Função para carregar os dados gerais do dashboard
async function carregarDadosGerais(uid) { // Adiciona o parâmetro uid
    try {
        // Agora usamos o uid passado como argumento
        console.log('Carregando dados gerais para loja:', uid);
        const clientesRef = collection(db, 'lojas', uid, 'clientes');
        const servicosRef = collection(db, 'lojas', uid, 'servicos');

        // Obter total de clientes
        const clientesSnapshot = await getDocs(clientesRef);
        const totalClientes = clientesSnapshot.size;
        document.getElementById('total-clientes').textContent = totalClientes;

        // Obter total de serviços ativos (exemplo: serviços com status 'ativo')
        const servicosSnapshot = await getDocs(servicosRef);
        const servicosAtivos = servicosSnapshot.docs.filter(doc => doc.data().status === 'ativo').length; //Adaptar o campo status
        document.getElementById('servicos-ativos').textContent = servicosAtivos;

         // Obter total de serviços Concluidos (exemplo: serviços com status 'concluido')
        const servicosConcluidos = servicosSnapshot.docs.filter(doc => doc.data().status === 'concluido').length;  //Adaptar o campo status
        document.getElementById('servicos-concluidos').textContent = servicosConcluidos;

        // Obter novos clientes no período (exemplo: últimos 30 dias)
        const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const novosClientes = clientesSnapshot.docs.filter(doc => {
            const criadoEm = doc.data().criadoEm;
            return criadoEm && criadoEm.toDate() > trintaDiasAtras;
        }).length;
        document.getElementById('novos-clientes-periodo').textContent = novosClientes;

        // Obter receita total no período (exemplo: soma dos preços dos serviços concluídos nos últimos 30 dias)
        let receitaTotal = 0;
        servicosSnapshot.forEach(doc => {
            const servico = doc.data();
             const criadoEm = servico.criadoEm;
            if (servico.status === 'concluido' && criadoEm && criadoEm.toDate() > trintaDiasAtras) { //Adaptar o campo status e data
                receitaTotal += servico.preco; // Supondo que 'preco' seja o campo de preço do serviço
            }
        });
        document.getElementById('receita-total-periodo').textContent = `R$ ${receitaTotal.toFixed(2)}`;

        // Novos Pedidos/Agendamentos (exemplo: total de agendamentos criados nos últimos 30 dias)
        const agendamentosRef = collection(db, 'lojas', uid, 'agendamentos');  //Adaptar o nome da collection
        const agendamentosSnapshot = await getDocs(agendamentosRef);
        const novosAgendamentos = agendamentosSnapshot.docs.filter(doc => {
            const criadoEm = doc.data().criadoEm;
            return criadoEm && criadoEm.toDate() > trintaDiasAtras;
        }).length; //Adaptar o campo data
        document.getElementById('novos-pedidos-agendamentos').textContent = novosAgendamentos;

        // Produtos Mais Vendidos (exemplo: top 5 produtos com mais vendas)
        const produtosRef = collection(db, 'lojas', uid, 'produtos'); //Adaptar o nome da collection
        const produtosSnapshot = await getDocs(produtosRef);
        const vendasPorProduto = {};
        produtosSnapshot.forEach(doc => {
            const produto = doc.data();
            const nomeProduto = produto.nome; //Adaptar o campo nome
            const quantidadeVendida = produto.quantidadeVendida || 0;  //Adaptar o campo quantidadeVendida
            vendasPorProduto[nomeProduto] = quantidadeVendida;
        });

        const produtosOrdenados = Object.entries(vendasPorProduto).sort(([, a], [, b]) => b - a).slice(0, 5);
        const listaProdutos = document.getElementById('produtos-mais-vendidos');
        listaProdutos.innerHTML = ''; // Limpa o conteúdo anterior
        produtosOrdenados.forEach(([nome, quantidade]) => {
            const li = document.createElement('li');
            li.textContent = `${nome}: ${quantidade} vendas`;
            listaProdutos.appendChild(li);
        });

        // Status Financeiro Rápido (exemplo: gráfico de receita dos últimos 6 meses)
          const seisMesesAtras = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
          const receitaPorMes = {};
          servicosSnapshot.forEach(doc => {
            const servico = doc.data();
            const criadoEm = servico.criadoEm; // Obtém a data de criação
            if (criadoEm) { // Verifica se criadoEm existe
                const dataServico = criadoEm.toDate(); // Converte para Date
                if (dataServico > seisMesesAtras) {
                    const mesAno = `${dataServico.getMonth() + 1}/${dataServico.getFullYear()}`; // Formato MM/AAAA
                    if (!receitaPorMes[mesAno]) {
                        receitaPorMes[mesAno] = 0;
                    }
                    receitaPorMes[mesAno] += servico.preco; // Supondo que 'preco' seja o preço
                }
            }
        });
        const meses = Object.keys(receitaPorMes).sort(); // Ordena os meses
        const receitas = meses.map(mes => receitaPorMes[mes]);
        // Aqui você usaria uma biblioteca de gráficos (Chart.js, por exemplo) para exibir os dados
        const graficoDiv = document.getElementById('financeiro-grafico');
        if (graficoDiv) {
             graficoDiv.innerHTML = `<p>Receita nos últimos 6 meses: ${meses.map((mes, index) => `${mes}: R$${receitas[index].toFixed(2)}`).join(', ')}</p>`;
        }

    } catch (error) {
        console.error("Erro ao carregar dados gerais:", error);
    }
}



// Adicionar event listeners aos formulários quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const formCadastroSalao = document.getElementById('seuFormularioDeCadastroDeSalao');
    if (formCadastroSalao) {
        formCadastroSalao.addEventListener('submit', cadastrarSalao);
    }

    const formCadastroFuncionario = document.getElementById('form-funcionario');
    if (formCadastroFuncionario) {
        formCadastroFuncionario.addEventListener('submit', cadastrarFuncionario);
    }

    const formCadastroServico = document.getElementById('seuFormularioDeCadastroDeServico');
    if (formCadastroServico) {
        formCadastroServico.addEventListener('submit', cadastrarServico);
        const categoriaServico = document.getElementById('categoriaServico');
        categoriaServico.addEventListener('change', () => {
            const opcoes = ['opcoesCabeleireiro', 'opcoesManicurePedicure', 'opcoesMaquiagem', 'opcoesDepilacao'];
            opcoes.forEach(opcao => document.getElementById(opcao).style.display = 'none');
            if (categoriaServico.value) {
                document.getElementById(`opcoes${categoriaServico.value.charAt(0).toUpperCase() + categoriaServico.value.slice(1)}`).style.display = 'block';
            }
        });
    }

    const formCadastroCliente = document.getElementById('seuFormularioDeCadastroDeCliente');
    if (formCadastroCliente) {
        formCadastroCliente.addEventListener('submit', cadastrarCliente);
    }

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', loginUsuario);
    }
});

// Verificar estado de autenticação e carregar dados
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('Usuário logado:', user.uid, 'Email:', user.email);
        try {
            const lojaRef = doc(db, 'lojas', user.uid);
            const docSnap = await getDoc(lojaRef);
            if (docSnap.exists()) {
                const lojaData = docSnap.data();
                console.log('Dados da loja carregados:', lojaData);
                exibirDadosLojaNoHeader(lojaData);
                // Carregar dados do dashboard se na página correta
                if (window.location.pathname.includes('dashboard.html')) {
                    carregarDadosGerais(user.uid); // Passa o UID para a função
                }
            } else {
                console.warn('Nenhum documento de loja encontrado para UID:', user.uid);
            }
        } catch (error) {
            console.error('Erro ao buscar dados da loja:', error);
        }
    } else {
        console.log('Nenhum usuário logado.');
        // Redirecionar para login.html, exceto se já estiver na página de login ou cadastro
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('cadastro-salao.html')) {
            window.location.href = 'login.html';
        }
    }
});
