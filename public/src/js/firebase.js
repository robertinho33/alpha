import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDkdlfzSmScKp4UDl-U3NEQIm43licP7uQ",
  authDomain: "comerciosdomeubairrostart.firebaseapp.com",
  projectId: "comerciosdomeubairrostart",
  storageBucket: "comerciosdomeubairrostart.firebasestorage.app",
  messagingSenderId: "867647469844",
  appId: "1:867647469844:web:c4408a456bb535162dea01",
  measurementId: "G-V51B31B0KG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configurar persistência da sessão
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistência da sessão configurada para browserLocalPersistence');
  })
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });

export { auth, db };