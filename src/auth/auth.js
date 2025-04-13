import { auth } from '../firebase/firebase-init.js'; // Correto
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export function login(email, senha, callback) {
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(() => {
      callback('E-mail ou senha errados!');
    });
}

export function logout() {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
}

export function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('index.html')) {
      window.location.href = 'dashboard.html';
    } else if (!user && window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'index.html';
    }
  });
}