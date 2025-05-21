import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import firebaseConfig from './firebaseConfig.js';

console.log('Carregando auth.js...');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('Exportando auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut');

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };