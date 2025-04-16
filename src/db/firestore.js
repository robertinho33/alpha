import { db } from "../firebase/firebase-init.js";
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function criarSalao(salaoId, dados) {
  try {
    const configRef = doc(db, `saloes/${salaoId}/config`, "geral");
    await setDoc(configRef, {
      admin: {
        nome: dados.nomeAdmin,
        email: dados.email
      },
      salao: {
        nome: dados.nomeSalao,
        endereco: dados.endereco || "",
        telefone: dados.telefone || ""
      },
      isAdmin: true,
      criadoEm: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao criar salão:", error);
    throw error;
  }
}

export async function buscarDadosSalao(salaoId) {
  try {
    const configRef = doc(db, `saloes/${salaoId}/config`, "geral");
    const docSnap = await getDoc(configRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error("Documento não encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do salão:", error);
    throw error;
  }
}

export async function adicionarCliente(salaoId, clienteData) {
  try {
    const clientesRef = collection(db, `saloes/${salaoId}/clientes`);
    const docRef = await addDoc(clientesRef, {
      ...clienteData,
      criadoEm: clienteData.criadoEm || new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error);
    throw error;
  }
}

export async function listarClientes(salaoId) {
  try {
    const clientesRef = collection(db, `saloes/${salaoId}/clientes`);
    const snapshot = await getDocs(clientesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }
}

export async function atualizarCliente(salaoId, clienteId, clienteData) {
  try {
    const clienteRef = doc(db, `saloes/${salaoId}/clientes`, clienteId);
    await updateDoc(clienteRef, clienteData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
}

export async function excluirCliente(salaoId, clienteId) {
  try {
    const clienteRef = doc(db, `saloes/${salaoId}/clientes`, clienteId);
    await deleteDoc(clienteRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    throw error;
  }
}

export async function adicionarServico(salaoId, servicoData) {
  try {
    const servicosRef = collection(db, `saloes/${salaoId}/servicos`);
    const docRef = await addDoc(servicosRef, {
      ...servicoData,
      criadoEm: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar serviço:", error);
    throw error;
  }
}

export async function listarServicos(salaoId) {
  try {
    const servicosRef = collection(db, `saloes/${salaoId}/servicos`);
    const snapshot = await getDocs(servicosRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    throw error;
  }
}

export async function atualizarServico(salaoId, servicoId, servicoData) {
  try {
    const servicoRef = doc(db, `saloes/${salaoId}/servicos`, servicoId);
    await updateDoc(servicoRef, servicoData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    throw error;
  }
}

export async function excluirServico(salaoId, servicoId) {
  try {
    const servicoRef = doc(db, `saloes/${salaoId}/servicos`, servicoId);
    await deleteDoc(servicoRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    throw error;
  }
}

export async function adicionarFuncionario(salaoId, funcionarioData) {
  try {
    const funcionariosRef = collection(db, `saloes/${salaoId}/funcionarios`);
    const docRef = await addDoc(funcionariosRef, {
      ...funcionarioData,
      criadoEm: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar funcionário:", error);
    throw error;
  }
}

export async function listarFuncionarios(salaoId) {
  try {
    const funcionariosRef = collection(db, `saloes/${salaoId}/funcionarios`);
    const snapshot = await getDocs(funcionariosRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    throw error;
  }
}

export async function atualizarFuncionario(salaoId, funcionarioId, funcionarioData) {
  try {
    const funcionarioRef = doc(db, `saloes/${salaoId}/funcionarios`, funcionarioId);
    await updateDoc(funcionarioRef, funcionarioData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    throw error;
  }
}

export async function excluirFuncionario(salaoId, funcionarioId) {
  try {
    const funcionarioRef = doc(db, `saloes/${salaoId}/funcionarios`, funcionarioId);
    await deleteDoc(funcionarioRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    throw error;
  }
}