import { db } from "../firebase/firebase-init.js";
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Função para sanitizar texto (remove tags HTML)
function sanitizarTexto(texto) {
  if (!texto) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = texto;
  return tempDiv.textContent.trim();
}

// Função para validar dados genéricos
function validarDados(dados, camposObrigatorios = [], maxLength = 100) {
  for (const campo of camposObrigatorios) {
    if (!dados[campo] || typeof dados[campo] !== "string" || dados[campo].length > maxLength) {
      throw new Error(`Campo ${campo} é obrigatório e deve ter até ${maxLength} caracteres.`);
    }
  }
}

export async function criarSalao(salaoId, dados) {
  try {
    validarDados(dados, ["nomeAdmin", "email", "nomeSalao"], 100);
    const configRef = doc(db, `saloes/${salaoId}/config`, "geral");
    await setDoc(configRef, {
      admin: {
        nome: sanitizarTexto(dados.nomeAdmin),
        email: sanitizarTexto(dados.email)
      },
      salao: {
        nome: sanitizarTexto(dados.nomeSalao),
        endereco: sanitizarTexto(dados.endereco || ""),
        telefone: sanitizarTexto(dados.telefone || "")
      },
      isAdmin: true,
      criadoEm: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Erro ao criar salão ${salaoId}:`, error);
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
      console.error(`Documento não encontrado para salão ${salaoId}.`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar dados do salão ${salaoId}:`, error);
    throw error;
  }
}

export async function adicionarCliente(salaoId, clienteData) {
  try {
    validarDados(clienteData, ["nome"], 100);
    const clienteSanitizado = {
      nome: sanitizarTexto(clienteData.nome),
      telefone: clienteData.telefone ? sanitizarTexto(clienteData.telefone) : null,
      email: clienteData.email ? sanitizarTexto(clienteData.email) : null,
      aniversario: clienteData.aniversario ? sanitizarTexto(clienteData.aniversario) : null,
      observacoes: clienteData.observacoes ? sanitizarTexto(clienteData.observacoes) : null,
      ativo: clienteData.ativo !== undefined ? clienteData.ativo : true,
      criadoEm: clienteData.criadoEm || new Date().toISOString()
    };
    const clientesRef = collection(db, `saloes/${salaoId}/clientes`);
    const docRef = await addDoc(clientesRef, clienteSanitizado);
    return docRef.id;
  } catch (error) {
    console.error(`Erro ao adicionar cliente no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function listarClientes(salaoId) {
  try {
    const clientesRef = collection(db, `saloes/${salaoId}/clientes`);
    const snapshot = await getDocs(clientesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erro ao listar clientes do salão ${salaoId}:`, error);
    throw error;
  }
}

export async function atualizarCliente(salaoId, clienteId, clienteData) {
  try {
    validarDados(clienteData, ["nome"], 100);
    const clienteSanitizado = {
      nome: sanitizarTexto(clienteData.nome),
      telefone: clienteData.telefone ? sanitizarTexto(clienteData.telefone) : null,
      email: clienteData.email ? sanitizarTexto(clienteData.email) : null,
      aniversario: clienteData.aniversario ? sanitizarTexto(clienteData.aniversario) : null,
      observacoes: clienteData.observacoes ? sanitizarTexto(clienteData.observacoes) : null,
      ativo: clienteData.ativo !== undefined ? clienteData.ativo : true
    };
    const clienteRef = doc(db, `saloes/${salaoId}/clientes`, clienteId);
    await updateDoc(clienteRef, clienteSanitizado);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${clienteId} no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function excluirCliente(salaoId, clienteId) {
  try {
    const clienteRef = doc(db, `saloes/${salaoId}/clientes`, clienteId);
    await deleteDoc(clienteRef);
    return true;
  } catch (error) {
    console.error(`Erro ao excluir cliente ${clienteId} no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function adicionarServico(salaoId, servicoData) {
  try {
    validarDados(servicoData, ["nome", "tipo", "tipoProfissional"], 100);
    const servicoSanitizado = {
      nome: sanitizarTexto(servicoData.nome),
      tipo: sanitizarTexto(servicoData.tipo),
      preco: servicoData.preco,
      duracaoMinutos: servicoData.duracaoMinutos,
      comissaoPercentual: servicoData.comissaoPercentual,
      tipoProfissional: sanitizarTexto(servicoData.tipoProfissional),
      ativo: servicoData.ativo !== undefined ? servicoData.ativo : true,
      criadoEm: new Date().toISOString()
    };
    const servicosRef = collection(db, `saloes/${salaoId}/servicos`);
    const docRef = await addDoc(servicosRef, servicoSanitizado);
    return docRef.id;
  } catch (error) {
    console.error(`Erro ao adicionar serviço no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function listarServicos(salaoId) {
  try {
    const servicosRef = collection(db, `saloes/${salaoId}/servicos`);
    const snapshot = await getDocs(servicosRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erro ao listar serviços do salão ${salaoId}:`, error);
    throw error;
  }
}

export async function atualizarServico(salaoId, servicoId, servicoData) {
  try {
    validarDados(servicoData, ["nome", "tipo", "tipoProfissional"], 100);
    const servicoSanitizado = {
      nome: sanitizarTexto(servicoData.nome),
      tipo: sanitizarTexto(servicoData.tipo),
      preco: servicoData.preco,
      duracaoMinutos: servicoData.duracaoMinutos,
      comissaoPercentual: servicoData.comissaoPercentual,
      tipoProfissional: sanitizarTexto(servicoData.tipoProfissional),
      ativo: servicoData.ativo !== undefined ? servicoData.ativo : true
    };
    const servicoRef = doc(db, `saloes/${salaoId}/servicos`, servicoId);
    await updateDoc(servicoRef, servicoSanitizado);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar serviço ${servicoId} no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function excluirServico(salaoId, servicoId) {
  try {
    const servicoRef = doc(db, `saloes/${salaoId}/servicos`, servicoId);
    await deleteDoc(servicoRef);
    return true;
  } catch (error) {
    console.error(`Erro ao excluir serviço ${servicoId} no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function adicionarFuncionario(salaoId, funcionarioData) {
  try {
    validarDados(funcionarioData, ["nome", "tipoProfissional"], 100);
    const funcionarioSanitizado = {
      nome: sanitizarTexto(funcionarioData.nome),
      tipoProfissional: sanitizarTexto(funcionarioData.tipoProfissional),
      telefone: funcionarioData.telefone ? sanitizarTexto(funcionarioData.telefone) : null,
      email: funcionarioData.email ? sanitizarTexto(funcionarioData.email) : null,
      ativo: funcionarioData.ativo !== undefined ? funcionarioData.ativo : true,
      criadoEm: new Date().toISOString()
    };
    const funcionariosRef = collection(db, `saloes/${salaoId}/funcionarios`);
    const docRef = await addDoc(funcionariosRef, funcionarioSanitizado);
    return docRef.id;
  } catch (error) {
    console.error(`Erro ao adicionar funcionário no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function listarFuncionarios(salaoId) {
  try {
    const funcionariosRef = collection(db, `saloes/${salaoId}/funcionarios`);
    const snapshot = await getDocs(funcionariosRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erro ao listar funcionários do salão ${salaoId}:`, error);
    throw error;
  }
}

export async function atualizarFuncionario(salaoId, funcionarioId, funcionarioData) {
  try {
    validarDados(funcionarioData, ["nome", "tipoProfissional"], 100);
    const funcionarioSanitizado = {
      nome: sanitizarTexto(funcionarioData.nome),
      tipoProfissional: sanitizarTexto(funcionarioData.tipoProfissional),
      telefone: funcionarioData.telefone ? sanitizarTexto(funcionarioData.telefone) : null,
      email: funcionarioData.email ? sanitizarTexto(funcionarioData.email) : null,
      ativo: funcionarioData.ativo !== undefined ? funcionarioData.ativo : true
    };
    const funcionarioRef = doc(db, `saloes/${salaoId}/funcionarios`, funcionarioId);
    await updateDoc(funcionarioRef, funcionarioSanitizado);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar funcionário ${funcionarioId} no salão ${salaoId}:`, error);
    throw error;
  }
}

export async function excluirFuncionario(salaoId, funcionarioId) {
  try {
    const funcionarioRef = doc(db, `saloes/${salaoId}/funcionarios`, funcionarioId);
    await deleteDoc(funcionarioRef);
    return true;
  } catch (error) {
    console.error(`Erro ao excluir funcionário ${funcionarioId} no salão ${salaoId}:`, error);
    throw error;
  }
}