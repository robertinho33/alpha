import { auth, onAuthStateChanged } from '../auth.js';
import { db, collection, query, where, getDocs, updateDoc, deleteDoc, doc } from '../firestore.js';

const storesTable = document.getElementById('stores-table');
const noStoresMessage = document.getElementById('no-stores-message');
const authMessage = document.getElementById('auth-message');
const editModal = document.getElementById('edit-modal');
const editStoreForm = document.getElementById('edit-store-form');
const cancelEditButton = document.getElementById('cancel-edit');
const editError = document.getElementById('edit-error');
const editSuccess = document.getElementById('edit-success');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        authMessage.classList.remove('hidden');
        storesTable.parentElement.classList.add('hidden');
        noStoresMessage.classList.add('hidden');
        window.location.href = '/view/comecar.html';
        return;
    }

    authMessage.classList.add('hidden');
    await loadStores(user.uid);
});

async function loadStores(adminId) {
    try {
        const q = query(collection(db, 'lojas'), where('adminId', '==', adminId));
        const querySnapshot = await getDocs(q);
        storesTable.innerHTML = '';

        if (querySnapshot.empty) {
            noStoresMessage.classList.remove('hidden');
            storesTable.parentElement.classList.add('hidden');
            return;
        }

        noStoresMessage.classList.add('hidden');
        storesTable.parentElement.classList.remove('hidden');

        querySnapshot.forEach((doc) => {
            const store = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-3">${store.nome}</td>
                <td class="p-3">${store.email}</td>
                <td class="p-3">${store.telefone}</td>
                <td class="p-3">${store.negocio}</td>
                <td class="p-3">${store.bairro}</td>
                <td class="p-3">
                    <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" data-id="${doc.id}">Editar</button>
                    <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${doc.id}">Excluir</button>
                </td>
            `;
            storesTable.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteStore(btn.dataset.id));
        });

    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        noStoresMessage.innerHTML = `Erro ao carregar lojas: ${error.message}`;
        noStoresMessage.classList.remove('hidden');
    }
}

async function openEditModal(storeId) {
    try {
        const storeRef = doc(db, 'lojas', storeId);
        const storeDoc = await getDocs(query(collection(db, 'lojas'), where('__name__', '==', storeId)));
        const store = storeDoc.docs[0].data();

        editStoreForm.storeId.value = storeId;
        editStoreForm.nome.value = store.nome;
        editStoreForm.email.value = store.email;
        editStoreForm.telefone.value = store.telefone;
        editStoreForm.negocio.value = store.negocio;
        editStoreForm.bairro.value = store.bairro;

        editModal.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        editError.textContent = `Erro: ${error.message}`;
    }
}

editStoreForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const storeId = editStoreForm.storeId.value;
    const updatedData = {
        nome: editStoreForm.nome.value,
        email: editStoreForm.email.value,
        telefone: editStoreForm.telefone.value,
        negocio: editStoreForm.negocio.value,
        bairro: editStoreForm.bairro.value
    };

    try {
        const storeRef = doc(db, 'lojas', storeId);
        await updateDoc(storeRef, updatedData);

        editSuccess.textContent = 'Loja atualizada com sucesso!';
        editError.textContent = '';
        editModal.classList.add('hidden');
        editStoreForm.reset();
        await loadStores(auth.currentUser.uid);

    } catch (error) {
        console.error('Erro ao atualizar loja:', error);
        editError.textContent = `Erro: ${error.message}`;
        editSuccess.textContent = '';
    }
});

cancelEditButton.addEventListener('click', () => {
    editModal.classList.add('hidden');
    editStoreForm.reset();
    editError.textContent = '';
    editSuccess.textContent = '';
});

async function deleteStore(storeId) {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;

    try {
        const storeRef = doc(db, 'lojas', storeId);
        await deleteDoc(storeRef);

        await loadStores(auth.currentUser.uid);
    } catch (error) {
        console.error('Erro ao excluir loja:', error);
        noStoresMessage.innerHTML = `Erro ao excluir loja: ${error.message}`;
        noStoresMessage.classList.remove('hidden');
    }
}