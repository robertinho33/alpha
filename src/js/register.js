import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const salonName = document.getElementById('salonName').value;

    try {
        // Cria o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Garante que o usuário está autenticado antes de prosseguir
        await signInWithEmailAndPassword(auth, email, password); // Força login imediato

        // Cria um documento no Firestore para o salão
        const salonId = user.uid; // Usa o UID do usuário como ID do salão
        await setDoc(doc(db, 'salons', salonId), {
            name: salonName,
            adminId: user.uid,
            createdAt: new Date().toISOString()
        });

        // Cria um documento de usuário com permissões de admin
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            salonId: salonId,
            permissions: {
                products: true,
                vendas: true,
                relatorios: true,
                comandas: true,
                cadastroUsuario: true,
                services: true
            },
            isAdmin: true
        });

        console.log('Administrador cadastrado com sucesso!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        const errorMessage = document.getElementById('registerError');
        errorMessage.textContent = 'Erro ao cadastrar: ' + error.message;
        errorMessage.classList.remove('d-none');
    }
});