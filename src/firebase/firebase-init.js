import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzylvosmV2bYC1HyA84qqe47bbXMH2KQQ",
    authDomain: "base-total.firebaseapp.com",
    projectId: "base-total",
    storageBucket: "base-total.firebasestorage.app",
    messagingSenderId: "1052334488431",
    appId: "1:1052334488431:web:c679426fa5649c022e469a",
    measurementId: "G-S1JJ6JTD8N"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);