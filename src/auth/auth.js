import { auth } from "../firebase/firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

export async function registrarUsuario(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(`Erro ao registrar: ${error.message}`);
  }
}

export async function loginUsuario(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(`Erro ao logar: ${error.message}`);
  }
}

export async function logoutUsuario() {
  try {
    console.log("Iniciando logout no auth.js...");
    await signOut(auth);
    console.log("Logout concluído com sucesso.");
  } catch (error) {
    console.error("Erro no logout:", error);
    throw new Error(`Erro ao deslogar: ${error.message}`);
  }
}