import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

export class ComandaManager {
    static async carregarComandas(db) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
            const q = query(
                collection(db, "comandas"), 
                where("criadoEm", ">=", startOfDay), 
                where("criadoEm", "<=", endOfDay)
            );
            const querySnapshot = await getDocs(q);
            const tabela = document.getElementById("tabelaComandas");
            tabela.innerHTML = "";

            querySnapshot.forEach(docSnap => {
                const comanda = docSnap.data();
                const row = this.criarLinhaComanda(docSnap.id, comanda);
                tabela.appendChild(row);
            });
        } catch (error) {
            console.error("Erro ao carregar comandas:", error);
        }
    }

    static criarLinhaComanda(id, comanda) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comanda.cliente}</td>
            <td>${comanda.data}</td>
            <td>${this.formatarServicos(comanda.servicos)}</td>
            <td>R$${comanda.total?.toFixed(2) || '0.00'}</td>
            <td>${comanda.status || 'Pendente'}</td>
            <td><button class="btn btn-success fecharComanda" data-id="${id}" data-status="${comanda.status}">Fechar</button></td>
        `;
        return row;
    }

    static formatarServicos(servicos) {
        return servicos?.map(s => `${s.profissional} - ${s.servico} (R$${s.valor?.toFixed(2) || '0.00'})`).join('<br>') || 'N/A';
    }

    static async registrarComanda(db, formData) {
        try {
            await addDoc(collection(db, "comandas"), {
                ...formData,
                status: "aberta",
                criadoEm: new Date()
            });
            return true;
        } catch (error) {
            console.error("Erro ao salvar no Firestore:", error);
            return false;
        }
    }
}