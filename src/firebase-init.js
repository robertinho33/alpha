// src/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkdlfzSmScKp4UDl-U3NEQIm43licP7uQ", // Substitua pela nova chave
  authDomain: "comerciosdomeubairrostart.firebaseapp.com",
  projectId: "comerciosdomeubairrostart",
  storageBucket: "comerciosdomeubairrostart.firebasestorage.app",
  messagingSenderId: "867647469844",
  appId: "1:867647469844:web:539da0e8785f936c2dea01",
  measurementId: "G-3BQWEFHNQG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };