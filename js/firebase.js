import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAgZNo-qxmw5ZVYDZyGfY1VRl1X2oZtfnc",
  authDomain: "shopp-31204.firebaseapp.com",
  projectId: "shopp-31204",
  storageBucket: "shopp-31204.firebasestorage.app",
  messagingSenderId: "29785147500",
  appId: "1:29785147500:web:079e0004c15233b5b07049",
  measurementId: "G-MB1LYDF3EX"
};
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };



