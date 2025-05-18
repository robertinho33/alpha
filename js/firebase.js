import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

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
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

