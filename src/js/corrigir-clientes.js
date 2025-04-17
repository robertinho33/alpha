import { db } from "../firebase/firebase-init.js";
import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Função para sanitizar texto
function sanitizarTexto(texto) {
  if (!texto) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = texto;
  return tempDiv.textContent.trim();
}

async function corrigirClientes(uid) {
  try {
    const clientesRef = collection(db, `saloes/${uid}/clientes`);
    const snapshot = await getDocs(clientesRef);
    for (const clienteDoc of snapshot.docs) {
      const data = clienteDoc.data();
      if (data.nome.includes("<")) {
        const nomeLimpo = sanitizarTexto(data.nome);
        await updateDoc(doc(db, `saloes/${uid}/clientes`, clienteDoc.id), {
          nome: nomeLimpo
        });
        console.log(`Corrigido: ${data.nome} -> ${nomeLimpo}`);
      }
    }
    console.log("Correção concluída!");
  } catch (error) {
    console.error("Erro ao corrigir clientes:", error);
  }
}

// Substitua pelo seu UID
corrigirClientes("clientes");