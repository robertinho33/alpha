import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { ComandaManager } from './comandas.js';
import { ModalPagamento } from './modal.js';
import { ServicoManager } from './servicos.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3785y6GPsFH7xuwfwjcBoPjvUfE3kSMw",
    authDomain: "alphaglamstart.firebaseapp.com",
    projectId: "alphaglamstart",
    storageBucket: "alphaglamstart.appspot.com",
    messagingSenderId: "885178660314",
    appId: "1:885178660314:web:1bb3a78be9fa7fdcdefce3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicialização
function inicializar() {
    // Configurar eventos de comandas
    document.querySelectorAll('.fecharComanda').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.status === "aberta") {
                ModalPagamento.abrir(doc(db, "comandas", btn.dataset.id), db);
            }
        });
    });

    // Eventos do formulário
    document.getElementById('addServiceBtn').addEventListener('click', () => {
        ServicoManager.adicionarServico(document.getElementById("servicos-container"));
    });

    document.getElementById('registroForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            cliente: document.getElementById("cliente").value,
            data: document.getElementById("data").value,
            observacoes: document.getElementById("observacoes").value,
            total: parseFloat(document.getElementById("total").value),
            servicos: ServicoManager.getServicos()
        };

        const sucesso = await ComandaManager.registrarComanda(db, formData);
        if (sucesso) {
            alert("Comanda registrada com sucesso!");
            document.getElementById("registroForm").reset();
            document.getElementById("servicos-container").innerHTML = "";
            await ComandaManager.carregarComandas(db);
        } else {
            alert("Erro ao registrar comanda.");
        }
    });

    document.getElementById('cancelPaymentBtn').addEventListener('click', () => ModalPagamento.fechar());

    // Carregar comandas iniciais
    ComandaManager.carregarComandas(db);
}

window.onload = inicializar;