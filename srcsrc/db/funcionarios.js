// src/db/funcionarios.js
import { db } from '../firebase/firebase-init.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const funcionariosRef = collection(db, 'funcionarios'); // Isso agora funciona
await addDoc(funcionariosRef, { nome: 'Maria', funcao: 'Cabelereira' });
