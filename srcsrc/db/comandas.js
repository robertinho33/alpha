// db/comandas.js
import { db, collection, addDoc, onSnapshot, doc, updateDoc, getDocs } from './firestore.js'; // Correto: firestore.js está no mesmo diretório db/
// ... (restante do código)
export async function addComanda(comandaData) {
  try {
    const docRef = await addDoc(collection(db, 'comandas'), comandaData);
    console.log('Comanda adicionada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar comanda:', error);
    throw error;
  }
}

export async function closeComanda(comandaId, pagamentos, funcionarios) {
  try {
    const comandaRef = doc(db, 'comandas', comandaId);
    await updateDoc(comandaRef, {
      status: 'fechada',
      pagamentos
    });

    const comandaSnapshot = await getDocs(collection(db, 'comandas'));
    let comandaData;
    comandaSnapshot.forEach((doc) => {
      if (doc.id === comandaId) comandaData = doc.data();
    });

    for (const servico of comandaData.servicos) {
      const comissaoFuncionario = funcionarios[servico.funcionario] || 50;
      const comissaoServico = servico.comissaoServico || 50;
      const comissaoPercentual = Math.max(comissaoFuncionario, comissaoServico);
      const valorComissao = (servico.preco * comissaoPercentual) / 100;

      await addDoc(collection(db, 'comissoes'), {
        funcionario: servico.funcionario,
        servico: servico.nome,
        valorComissao,
        data: comandaData.data,
        comandaId
      });
      console.log(`Comissão registrada: ${servico.funcionario} - ${servico.nome} - R$${valorComissao}`);
    }
  } catch (error) {
    console.error('Erro ao fechar comanda:', error);
    throw error;
  }
}

export function listenComandasAbertas(callback) {
  return onSnapshot(collection(db, 'comandas'), (snapshot) => {
    const comandas = [];
    snapshot.forEach((doc) => {
      const comanda = { id: doc.id, ...doc.data() };
      if (comanda.status === 'aberta') comandas.push(comanda);
    });
    callback(comandas);
  }, (error) => {
    console.error('Erro ao escutar comandas abertas:', error);
  });
}

export function listenComandasFechadas(callback) {
  return onSnapshot(collection(db, 'comandas'), (snapshot) => {
    const comandas = [];
    snapshot.forEach((doc) => {
      const comanda = doc.data();
      if (comanda.status === 'fechada') comandas.push(comanda);
    });
    callback(comandas);
  }, (error) => {
    console.error('Erro ao escutar comandas fechadas:', error);
  });
}

// eco/src/db/comandas.js (exemplo esperado)
export function listenFuncionarios(callback) {
  onSnapshot(collection(db, 'funcionarios'), (snapshot) => {
    const funcionarios = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      funcionarios[data.nome] = { funcao: data.funcao, comissao: data.comissao };
    });
    callback(funcionarios);
  }, (error) => {
    console.error('Erro ao escutar funcionários:', error);
  });
}

export function listenServicos(callback) {
  onSnapshot(collection(db, 'servicos'), (snapshot) => {
    const servicos = [];
    snapshot.forEach((doc) => {
      servicos.push({ id: doc.id, ...doc.data() });
    });
    callback(servicos);
  }, (error) => {
    console.error('Erro ao escutar serviços:', error);
  });
}
export async function updateComanda(comandaId, comandaData) {
  try {
    const comandaRef = doc(db, 'comandas', comandaId);
    await updateDoc(comandaRef, comandaData);
    console.log('Comanda atualizada:', comandaId);
  } catch (error) {
    console.error('Erro ao atualizar comanda:', error);
    throw error;
  }
}

export function listenClientes(callback) {
  return onSnapshot(collection(db, 'clientes'), (snapshot) => {
    const clientes = [];
    snapshot.forEach((doc) => {
      clientes.push(doc.data().nome);
    });
    callback(clientes);
  }, (error) => {
    console.error('Erro ao escutar clientes:', error);
  });
}

export function listenComissoes(callback) {
  return onSnapshot(collection(db, 'comissoes'), (snapshot) => {
    const comissoes = {};
    snapshot.forEach((doc) => {
      const comissao = doc.data();
      const funcionario = comissao.funcionario;
      if (!comissoes[funcionario]) comissoes[funcionario] = 0;
      comissoes[funcionario] += comissao.valorComissao;
    });
    callback(comissoes);
  }, (error) => {
    console.error('Erro ao escutar comissões:', error);
    callback(null);
  });
}