import { auth, db } from './firebase-init.js';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

const conteudoAgendamentos = document.getElementById('conteudo-agendamentos');

// Função para buscar dados do usuário logado
async function buscarDadosUsuario(uid) {
    const userRef = doc(db, 'users', uid);
    console.log("Buscando dados do usuário com UID:", uid); // Adicionado log
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            console.log("Dados do usuário encontrados:", userSnap.data()); // Adicionado log
            return userSnap.data();
        } else {
            console.log("Usuário não encontrado:", uid);
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        throw error; // Propagar o erro para ser tratado em inicializarPagina()
    }
}

// Função para buscar dados da loja do funcionário
async function buscarDadosLoja(uid) {
    const lojaRef = doc(db, 'lojas', uid);
     console.log("Buscando dados da loja com UID:", uid);
    try {
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
             console.log("Dados da loja encontrados:", lojaSnap.data());
            return lojaSnap.data();
        } else {
             console.log("Loja não encontrada:", uid);
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar dados da loja:", error);
        throw error;
    }
}

// Função para formatar a data
function formatarData(data) {
    if (!data) return "Data Inválida";
    let dataObj;
    if (typeof data === 'string') {
        dataObj = new Date(data);
    } else if (data instanceof Date) {
        dataObj = data;
    } else {
        try {
            dataObj = data.toDate();
        } catch (error) {
            console.error("Erro ao formatar data:", error);
            return "Data Inválida";
        }
    }
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para formatar a hora
function formatarHora(data) {
    if (!data) return "Hora Inválida";
     let dataObj;
    if (typeof data === 'string') {
        dataObj = new Date(data);
    } else if (data instanceof Date) {
        dataObj = data;
    } else {
         try {
            dataObj = data.toDate();
        } catch (error) {
            console.error("Erro ao formatar hora:", error);
            return "Hora Inválida";
        }
    }
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');
    return `${hora}:${minuto}`;
}

// Função para exibir a lista de agendamentos
function exibirListaAgendamentos(agendamentos, tipoUsuario) {
    let listaHTML = '<ul class="lista-agendamentos">';
    if (agendamentos.length === 0) {
        listaHTML += '<li>Nenhum agendamento encontrado.</li></ul>';
        conteudoAgendamentos.innerHTML = listaHTML;
        return;
    }

    agendamentos.forEach(agendamento => {
        let acoes = '';
        if (tipoUsuario === 'user_master' || tipoUsuario === 'funcionario_loja') {
            acoes = `
                <button class="btn btn-sm btn-primary me-2">Editar</button>
                <button class="btn btn-sm btn-danger">Cancelar</button>
            `;
        }
        listaHTML += `
            <li>
                <span>Cliente: ${agendamento.nomeCliente}</span>
                <span>Serviço: ${agendamento.nomeServico}</span>
                <span>Data: ${formatarData(agendamento.data)}</span>
                <span>Hora: ${formatarHora(agendamento.data)}</span>
                ${acoes}
            </li>
        `;
    });
    listaHTML += '</ul>';
    conteudoAgendamentos.innerHTML = listaHTML;
}

// Função para buscar agendamentos do cliente
async function buscarAgendamentosCliente(idCliente) {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, where('idCliente', '==', idCliente));
     console.log("Buscando agendamentos do cliente:", idCliente);
    try{
        const snapshot = await getDocs(q);
        const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         console.log("Agendamentos do cliente encontrados:", agendamentos);
        return agendamentos;
    }
    catch(error){
        console.error("Erro ao buscar agendamentos do cliente", error);
        throw error;
    }

}

// Função para buscar agendamentos da loja
async function buscarAgendamentosLoja(idLoja) {
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, where('idLoja', '==', idLoja));
     console.log("Buscando agendamentos da loja:", idLoja);
    try{
        const snapshot = await getDocs(q);
        const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         console.log("Agendamentos da loja encontrados:", agendamentos);
        return agendamentos;
    }
    catch(error){
         console.error("Erro ao buscar agendamentos da Loja", error);
        throw error;
    }
}

// Função para renderizar a página de agendamentos
async function renderizarPaginaAgendamentos(user, tipoUsuario) {
    conteudoAgendamentos.innerHTML = '<h1>Agendamentos</h1>';

    if (!user) {
        conteudoAgendamentos.innerHTML = '<p>Por favor, faça login para ver seus agendamentos.</p>';
        return;
    }

    try {
        let agendamentos = [];
        switch (tipoUsuario) {
            case 'user_master':
                conteudoAgendamentos.innerHTML += '<p>Todos os agendamentos do sistema:</p>';
                const todosAgendamentosRef = collection(db, 'agendamentos');
                const todosSnapshot = await getDocs(todosAgendamentosRef);
                agendamentos = todosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                exibirListaAgendamentos(agendamentos, tipoUsuario);
                break;
            case 'funcionario_loja':
                const lojaDoFuncionario = await buscarDadosLoja(user.uid);
                if (lojaDoFuncionario) {
                    conteudoAgendamentos.innerHTML += `<p>Agendamentos da sua Loja: ${lojaDoFuncionario.nome}</p>`;
                    agendamentos = await buscarAgendamentosLoja(user.uid);
                    exibirListaAgendamentos(agendamentos, tipoUsuario);
                } else {
                    conteudoAgendamentos.innerHTML = '<p>Você não está associado a nenhuma loja.</p>';
                }
                break;
            case 'cliente_loja':
                conteudoAgendamentos.innerHTML = '<p>Seus Agendamentos:</p>';
                agendamentos = await buscarAgendamentosCliente(user.uid);
                exibirListaAgendamentos(agendamentos, tipoUsuario);
                break;
            default:
                conteudoAgendamentos.innerHTML = '<p>Tipo de usuário não reconhecido.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        conteudoAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
    }
}

// Função principal para inicializar a página
async function inicializarPagina() {
    try {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userData = await buscarDadosUsuario(user.uid);
                    if (userData) {
                        const tipoUsuario = userData.tipo;
                        renderizarPaginaAgendamentos(user, tipoUsuario);
                    } else {
                        renderizarPaginaAgendamentos(user, null);
                    }
                } catch (error) {
                    // Trata o erro de buscarDadosUsuario
                    console.error("Erro ao obter dados do usuário:", error);
                    conteudoAgendamentos.innerHTML = `<p>Erro ao carregar página: ${error.message}</p>`;
                }
            } else {
                renderizarPaginaAgendamentos(null, null);
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar página de agendamentos:", error);
        conteudoAgendamentos.innerHTML = `<p>Erro ao carregar página: ${error.message}</p>`;
    }
}

inicializarPagina();

