// src/comandas.js
import { db } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export const ComandaManager = {
    async carregarComandas() {
        const tabelaComandas = document.getElementById('tabelaComandas');
        if (!tabelaComandas) {
            console.error("Elemento 'tabelaComandas' não encontrado no DOM");
            return null;
        }

        tabelaComandas.innerHTML = ""; // Limpa a tabela
        const q = query(collection(db, "comandas"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("Nenhuma comanda encontrada.");
            return null;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr>
                    <td>${data.cliente}</td>
                    <td>${data.data}</td>
                    <td>${data.servicos.map(s => s.nome).join(", ")}</td>
                    <td>${data.total.toFixed(2)}</td>
                    <td>${data.status || "aberta"}</td>
                    <td><button class="fecharComanda" data-id="${doc.id}" data-status="${data.status || 'aberta'}">Fechar</button></td>
                </tr>
            `;
            tabelaComandas.insertAdjacentHTML('beforeend', row);
        });
        return querySnapshot;
    },

    async registrarComanda(formData) {
        try {
            await addDoc(collection(db, "comandas"), { ...formData, status: "aberta" });
            return true;
        } catch (error) {
            console.error("Erro ao registrar comanda:", error);
            return false;
        }
    },

    // Outras funções como fecharCaixaDia, consultarFaturamentoMensal, etc.
};