// src/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCVenp_Ev_M0cPa_IGoEuPDNBfgz26dAUU",
    authDomain: "novo-b4adb.firebaseapp.com",
    projectId: "novo-b4adb",
    storageBucket: "novo-b4adb.firebasestorage.app",
    messagingSenderId: "578134453072",
    appId: "1:578134453072:web:1238e881ae7d83b89b9a55",
    measurementId: "G-VH9CKYTS9N"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    where 
};