import { db } from "../firebase/firebase-init.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const clientesRef = collection(db, "clientes");

export async function adicionarCliente(dados) {
  await addDoc(clientesRef, dados);
}

export async function listarClientes() {
  const snapshot = await getDocs(clientesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
