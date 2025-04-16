import { db } from '../firebase/firebase-init.js';
import { collection, addDoc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const servicosRef = collection(db, 'servicos');

// Adiciona um novo serviço
export async function adicionarServico(servico) {
  try {
    await addDoc(servicosRef, servico);
    console.log('Serviço adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    throw error;
  }
}

// Escuta em tempo real os serviços
export function ouvirServicos(callback) {
  const q = query(servicosRef, orderBy('nome'));
  return onSnapshot(q, snapshot => {
    const servicos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(servicos);
  });
}
