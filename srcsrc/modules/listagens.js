// src/modules/listagens.js
import { renderList, renderSelect } from '../ui/render.js';
import { listenFuncionarios, listenClientes, listenServicos, listenComandasAbertas, listenComandasFechadas, listenComissoes } from '../db/comandas.js';
import { formatDate } from '../utils/helpers.js';

export function initListagens() {
  if (document.getElementById('listaFuncionarios')) {
    listenFuncionarios((funcionarios) => {
      console.log('Funcionários recebidos:', funcionarios);
      renderList('listaFuncionarios', Object.entries(funcionarios), ([nome, data]) => `${nome} - ${data.funcao} - Comissão: ${data.comissao}%`);
      const funcionarioSelects = document.querySelectorAll('.funcionarioSelect');
      funcionarioSelects.forEach((select) => {
        renderSelect(select.id, Object.keys(funcionarios), null, null);
      });
    });
  }

  if (document.getElementById('listaClientes') || document.getElementById('cliente')) {
    listenClientes((clientes) => {
      console.log('Clientes recebidos:', clientes);
      renderList('listaClientes', clientes, (nome) => nome);
      renderSelect('cliente', clientes, null, null);
    });
  }

  if (document.getElementById('listaServicos') || document.querySelector('.servicoSelect')) {
    listenServicos((servicos) => {
      console.log('Serviços recebidos:', servicos);
      renderList('listaServicos', servicos, (s) => `${s.nome} - R$${s.preco} (${s.funcao}) - Comissão: ${s.comissao}%`);
      const servicoSelects = document.querySelectorAll('.servicoSelect');
      console.log('Selects de serviço encontrados:', servicoSelects.length);
      servicoSelects.forEach((select) => {
        renderSelect(select.id, servicos, JSON.stringify, (s) => s.nome);
      });
    });
  }

  // src/modules/listagens.js
if (document.getElementById('comandasAbertas') || document.getElementById('comandaSelect')) {
  listenComandasAbertas((comandas) => {
    console.log('Comandas abertas recebidas:', comandas); // Log 1: comandas cruas
    const comandasValidas = comandas.filter((c) => c.id && c.cliente && c.data && Array.isArray(c.servicos));
    console.log('Comandas válidas filtradas:', comandasValidas); // Log 2: comandas filtradas
    renderList('comandasAbertas', comandasValidas, (c) => {
      const servicosText = c.servicos.map(s => `${s.nome} com ${s.funcionario}`).join(', ');
      return `${c.cliente} - ${servicosText} em ${formatDate(c.data)} - Total: R$${c.total}`;
    });
    const comandaSelect = document.getElementById('comandaSelect');
    if (comandaSelect) {
      renderSelect('comandaSelect', comandasValidas, (c) => {
        const value = JSON.stringify(c);
        console.log('Valor do option:', value); // Log 3: cada value
        return value;
      }, (c) => `${c.cliente} - ${formatDate(c.data)} - R$${c.total}`);
      console.log('comandaSelect atualizado com:', comandasValidas.length, 'comandas');
    }
  });
}

  if (document.getElementById('comandasFechadas')) {
    listenComandasFechadas((comandas) => {
      console.log('Comandas fechadas recebidas:', comandas);
      renderList('comandasFechadas', comandas, (c) => {
        const servicosText = c.servicos.map(s => `${s.nome} com ${s.funcionario}`).join(', ');
        const pagamentosText = c.pagamentos.map(p => `${p.metodo}: R$${p.valor}`).join(', ');
        return `${c.cliente} - ${servicosText} em ${formatDate(c.data)} - Total: R$${c.total} (${pagamentosText})`;
      });
    });
  }

  if (document.getElementById('listaComissoes')) {
    listenComissoes((comissoes) => {
      console.log('Comissões recebidas:', comissoes);
      if (comissoes) {
        renderList('listaComissoes', Object.entries(comissoes), ([funcionario, valor]) => `${funcionario} - Comissão: R$${valor.toFixed(2)}`);
      } else {
        document.getElementById('listaComissoes').innerHTML = '<li class="list-group-item">Erro ao carregar comissões.</li>';
      }
    });
  }
}