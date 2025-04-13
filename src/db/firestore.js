import { db } from '../firebase/firebase-init.js'; // Correto
import { collection, addDoc, onSnapshot, doc, updateDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export { collection, addDoc, onSnapshot, doc, updateDoc, getDocs, db };