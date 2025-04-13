// src/js/load-salons.js
import { db } from './firebase.js';
import { collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Função para buscar todos os salões
export async function buscarSaloesComAgendamentos() {
  const saloesRef = collection(db, 'salons');
  const snapshot = await getDocs(saloesRef);

  const resultados = [];

  for (const docSalon of snapshot.docs) {
    const salonData = docSalon.data();
    const salonId = docSalon.id;

    // Buscar agendamentos do salão
    const agendamentosSnapshot = await getDocs(collection(db, 'salons', salonId, 'agendamentos'));

    const agendamentos = agendamentosSnapshot.docs.map(agendamentoDoc => ({
      id: agendamentoDoc.id,
      ...agendamentoDoc.data()
    }));

    resultados.push({
      id: salonId,
      ...salonData,
      agendamentos
    });
  }

  return resultados;
}
