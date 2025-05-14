import { db, auth } from '../js/firebase.js';
import { doc, setDoc, getDoc, collection } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

class LojaModel {
    static async criarLoja(nome, endereco) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const lojaRef = doc(db, 'lojas', user.uid);
            const lojaData = {
                nome,
                endereco,
                dono: user.uid
            };
            await setDoc(lojaRef, lojaData);
            return lojaData;
        } catch (error) {
            console.error('Erro ao criar loja:', error);
            throw error;
        }
    }

    static async getLoja() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const lojaRef = doc(db, 'lojas', user.uid);
            const lojaSnap = await getDoc(lojaRef);
            if (lojaSnap.exists()) {
                return { id: lojaSnap.id, ...lojaSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar loja:', error);
            throw error;
        }
    }
}

export { LojaModel };