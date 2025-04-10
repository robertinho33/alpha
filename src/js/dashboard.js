import { db } from './firebase.js';
import { collection, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const usersTable = document.getElementById('usersTable');

async function loadUsers() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersTable.innerHTML = '';
    
    usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userData.email}</td>
            <td><input type="checkbox" ${userData.permissions?.products ? 'checked' : ''} data-user="${userDoc.id}" data-page="products"></td>
            <td><input type="checkbox" ${userData.permissions?.vendas ? 'checked' : ''} data-user="${userDoc.id}" data-page="vendas"></td>
            <td><input type="checkbox" ${userData.permissions?.relatorios ? 'checked' : ''} data-user="${userDoc.id}" data-page="relatorios"></td>
            <td><input type="checkbox" ${userData.permissions?.schedules ? 'checked' : ''} data-user="${userDoc.id}" data-page="schedules"></td>
            <td><input type="checkbox" ${userData.permissions?.services ? 'checked' : ''} data-user="${userDoc.id}" data-page="services"></td>
        `;
        usersTable.appendChild(row);
    });

    // Adicionar evento para atualizar permissões
    usersTable.addEventListener('change', async (e) => {
        const checkbox = e.target;
        const userId = checkbox.dataset.user;
        const page = checkbox.dataset.page;
        const isChecked = checkbox.checked;

        await updateDoc(doc(db, 'users', userId), {
            [`permissions.${page}`]: isChecked
        });
    });
}

loadUsers();