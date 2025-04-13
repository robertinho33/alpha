// src/js/auth.js
import { auth, db } from './firebase.js'; // O caminho relativo ainda funciona porque estão na mesma pasta
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, getDoc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export function registerUser(email, password, nome, role, profession) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return setDoc(doc(db, 'users', user.uid), {
                nome,
                email,
                role,
                profession,
                createdAt: new Date().toISOString()
            }).then(() => userCredential);
        })
        .catch((error) => {
            console.error("Erro ao registrar usuário:", error);
            throw error;
        });
}

export function registerFirstAdmin(email, password, nome) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return setDoc(doc(db, 'users', user.uid), {
                nome,
                email,
                role: 'admin',
                createdAt: new Date().toISOString()
            }).then(() => userCredential);
        })
        .catch((error) => {
            console.error("Erro ao registrar primeiro admin:", error);
            throw error;
        });
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
    return signOut(auth);
}

export async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return userDoc.data().role;
    }
    return null;
}

export async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return userDoc.data();
    }
    return null;
}

export async function hasUsers() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return !usersSnapshot.empty;
}

export async function updateUserPassword(newPassword) {
    const user = auth.currentUser;
    if (user) {
        return updatePassword(user, newPassword);
    }
    throw new Error("Nenhum usuário autenticado");
}

export { onAuthStateChanged };