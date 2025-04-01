import { updateDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { ComandaManager } from './comandas.js';

export class ModalPagamento {
    static modal = document.getElementById('modalPagamento');
    static form = document.getElementById('formPagamento');

    static abrir(docRef, db) {
        this.modal.style.display = 'block';
        this.form.onsubmit = async (event) => {
            event.preventDefault();
            await this.fecharComanda(docRef, db);
        };
    }

    static async fecharComanda(docRef, db) {
        try {
            await updateDoc(docRef, {
                status: "fechada",
                formaPagamento: document.getElementById('formaPagamento').value,
                fechadoEm: new Date()
            });
            this.modal.style.display = 'none';
            await ComandaManager.carregarComandas(db);
        } catch (error) {
            console.error("Erro ao fechar comanda:", error);
        }
    }

    static fechar() {
        this.modal.style.display = 'none';
    }
}