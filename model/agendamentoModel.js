import { db, auth } from '../js/firebase.js';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

class AgendamentoModel {
    static async getAgendamentos() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const agendamentosRef = collection(db, 'lojas', user.uid, 'agendamentos');
            const snapshot = await getDocs(agendamentosRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            return [];
        }
    }

    static async salvarAgendamento(agendamento) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const agendamentosRef = collection(db, 'lojas', user.uid, 'agendamentos');
            const docRef = await addDoc(agendamentosRef, agendamento);
            return { id: docRef.id, ...agendamento };
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            throw error;
        }
    }

    static async atualizarAgendamento(agendamentoId, dados) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const agendamentoRef = doc(db, 'lojas', user.uid, 'agendamentos', agendamentoId);
            await updateDoc(agendamentoRef, dados);
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            throw error;
        }
    }

    static async excluirAgendamento(agendamentoId) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const agendamentoRef = doc(db, 'lojas', user.uid, 'agendamentos', agendamentoId);
            await deleteDoc(agendamentoRef);
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            throw error;
        }
    }

    static async isHorarioDisponivel(data, horario) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const agendamentosRef = collection(db, 'lojas', user.uid, 'agendamentos');
            const q = query(agendamentosRef, where('data', '==', data), where('horario', '==', horario));
            const snapshot = await getDocs(q);
            return snapshot.empty;
        } catch (error) {
            console.error('Erro ao verificar horário:', error);
            return false;
        }
    }
}

export { AgendamentoModel };