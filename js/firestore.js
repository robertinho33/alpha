// firestore.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, collection, addDoc, serverTimestamp };