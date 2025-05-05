// src/firebase-init.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDzylvosmV2bYC1HyA84qqe47bbXMH2KQQ",
  authDomain: "base-total.firebaseapp.com",
  projectId: "base-total",
  storageBucket: "base-total.firebasestorage.app",
  messagingSenderId: "1052334488431",
  appId: "1:1052334488431:web:b6c3e1b5ed72144f2e469a",
  measurementId: "G-QVP2T2RGL0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
