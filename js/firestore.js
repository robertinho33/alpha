// firestore.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

import firebaseConfig from './firebaseConfig.js';

console.log('Carregando firestore.js...');

// Inicializa o Firebase App e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta o Firestore e os métodos mais utilizados
export {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  serverTimestamp
};
