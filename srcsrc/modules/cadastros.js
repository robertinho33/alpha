// src/modules/cadastros.js
import { db, collection, addDoc } from '../db/firestore.js';

export function initCadastros() {
  const funcionarioForm = document.getElementById('funcionarioForm');
  if (funcionarioForm) {
    funcionarioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('nomeFuncionario').value;
      const funcao = document.getElementById('funcaoFuncionario').value;
      const comissao = Number(document.getElementById('comissaoFuncionario').value);
      if (nome && funcao && comissao >= 0 && comissao <= 100) {
        await addDoc(collection(db, 'funcionarios'), { nome, funcao, comissao });
        funcionarioForm.reset();
      }
    });
  }

  const clienteForm = document.getElementById('clienteForm');
  if (clienteForm) {
    clienteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('nomeCliente').value;
      if (nome) {
        await addDoc(collection(db, 'clientes'), { nome });
        clienteForm.reset();
      }
    });
  }

  const servicoForm = document.getElementById('servicoForm');
  if (servicoForm) {
    servicoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('nomeServico').value;
      const preco = Number(document.getElementById('precoServico').value);
      const funcao = document.getElementById('funcaoServico').value;
      const comissao = Number(document.getElementById('comissaoServico').value);
      if (nome && preco && funcao && comissao >= 0 && comissao <= 100) {
        await addDoc(collection(db, 'servicos'), { nome, preco, funcao, comissao });
        servicoForm.reset();
      }
    });
  }
}