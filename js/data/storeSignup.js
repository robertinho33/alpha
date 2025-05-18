//js/data/storeSignup.js
import { db, collection, addDoc, serverTimestamp } from '../firestore.js';
import { auth } from '../auth.js';

const storeSignupForm = document.getElementById('store-signup-form');
const storeSignupError = document.getElementById('store-signup-error');
const storeSignupSuccess = document.getElementById('store-signup-success');

storeSignupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = event.target.nome.value;
    const email = event.target.email.value;
    const telefone = event.target.telefone.value;
    const negocio = event.target.negocio.value;
    const bairro = event.target.bairro.value;
    const concordo = event.target.concordo.checked;

    if (!concordo) {
        storeSignupError.textContent = 'Você deve concordar com a Política de Privacidade.';
        return;
    }

    try {
        const adminId = auth.currentUser?.uid;
        if (!adminId) {
            throw new Error('Nenhum administrador autenticado.');
        }

        await addDoc(collection(db, 'lojas'), {
            nome,
            email,
            telefone,
            negocio,
            bairro,
            adminId,
            criadoEm: serverTimestamp()
        });

        storeSignupSuccess.textContent = 'Loja cadastrada com sucesso!';
        storeSignupError.textContent = '';
        storeSignupForm.reset();

    } catch (error) {
        console.error("Erro ao cadastrar loja:", error);
        storeSignupError.textContent = `Erro: ${error.message}`;
        storeSignupSuccess.textContent = '';
    }
});