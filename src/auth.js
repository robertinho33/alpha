// src/auth.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export async function registerUser(email, password, nome, role = "funcionario", profession = "outro") {
    try {
        console.log('Iniciando cadastro do usuário:', { email, nome, role, profession });
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Usuário criado no Authentication:', user.uid);

        const userDoc = doc(db, "users", user.uid);
        await setDoc(userDoc, {
            email: email,
            nome: nome,
            role: role,
            profession: profession, // Novo campo
            createdAt: new Date().toISOString()
        }, { merge: true });
        console.log('Dados salvos no Firestore para UID:', user.uid);

        return user;
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.code, error.message);
        throw error;
    }
}

// Ajustar registerFirstAdmin também
export async function registerFirstAdmin(email, password, nome, profession = "outro") {
    return registerUser(email, password, nome, "admin", profession);
}

// Outras funções permanecem iguais
export function loginUser(email, password) { /* ... */ }
export function logoutUser() { /* ... */ }
export async function getUserRole(uid) { /* ... */ }
export async function getUserData(uid) { /* ... */ }
export async function updateUserPassword(newPassword) { /* ... */ }
export async function hasUsers() { /* ... */ }
export { onAuthStateChanged };

export async function registerFirstAdmin(email, password, nome) {
    return registerUser(email, password, nome, "admin");
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
    return signOut(auth);
}

export async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
}

export async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUserPassword(newPassword) {
    const user = auth.currentUser;
    if (user) {
        await updatePassword(user, newPassword);
    } else {
        throw new Error("Nenhum usuário logado.");
    }
}

export async function hasUsers() {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return !usersSnapshot.empty;
}

export { onAuthStateChanged };