import { LojaModel } from '../model/lojaModel.js';
import { AgendamentoModel } from '../model/agendamentoModel.js';
import { auth } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

class LojaController {
    constructor() {
        this.initAuth();
    }

    initAuth() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.carregarLoja();
                this.preencherDatas();
                this.preencherHorarios();
                this.carregarAgendamentos();
            } else {
                window.location.href = 'login.html'; // Redireciona se não logado
            }
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => window.location.href = 'login.html');
            });
        }
    }

    async carregarLoja() {
        try {
            const loja = await LojaModel.getLoja();
            const lojaInfo = document.getElementById('loja-info');
            if (loja) {
                lojaInfo.innerHTML = '';
                const h2 = document.createElement('h2');
                h2.textContent = loja.nome;
                const p = document.createElement('p');
                p.textContent = `Endereço: ${loja.endereco}`;
                lojaInfo.append(h2, p);
                
            } else {
                lojaInfo.innerHTML = `
                    <form id="loja-form">
                        <div class="mb-3">
                            <label for="nome-loja" class="form-label">Nome da Loja:</label>
                            <input type="text" class="form-control" id="nome-loja" required>
                        </div>
                       <div class="mb-3">
                        <label for="endereco" class="form-label">Endereço:</label>
                        <input type="text" class="form-control" id="endereco" required>
                       </div>
                        <button type="submit" class="btn btn-primary">Criar Loja</button>
                    </form>
                `;
                document.getElementById('loja-form').addEventListener('submit', (e) => this.handleCriarLoja(e));
            }
        } catch (error) {
            this.mostrarErro('Erro ao carregar loja. Tente novamente.');
        }
    }

    async handleCriarLoja(event) {
        event.preventDefault();
        const nome = document.getElementById('nome-loja').value;
        const endereco = document.getElementById('endereco').value;

        try {
            await LojaModel.criarLoja(nome, endereco);
            alert('Loja criada com sucesso!');
            this.carregarLoja();
            this.preencherDatas();
        } catch (error) {
            this.mostrarErro('Erro ao criar loja. Tente novamente.');
        }
    }
    async carregarAgendamentos() {
        const tbody = document.querySelector('#tabela-agendamentos tbody');
        tbody.innerHTML = '';
        try {
            const agendamentos = await AgendamentoModel.getAgendamentos();
            agendamentos.forEach(agendamento => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${agendamento.nome}</td>
                    <td>${agendamento.telefone}</td>
                    <td>${agendamento.servico}</td>
                    <td>${agendamento.data}</td>
                    <td>${agendamento.horario}</td>
                    <td>
                        <button class="btn btn-sm btn-editar me-2" title="Editar"  aria-label="Editar agendamento" onclick="lojaController.editarAgendamento('${agendamento.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" title="Excluir" onclick="lojaController.excluirAgendamento('${agendamento.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            this.mostrarErro('Erro ao carregar agendamentos.');
        }
    }
    

    preencherDatas() {
        const selectData = document.getElementById('data');
        selectData.innerHTML = '<option value="" disabled selected>Selecione</option>';
        const hoje = new Date();
        for (let i = 0; i < 7; i++) {
            const data = new Date(hoje.getTime() + i * 24 * 60 * 60 * 1000);
            const dataStr = data.toLocaleDateString('pt-BR');
            const option = document.createElement('option');
            option.value = dataStr;
            option.textContent = dataStr;
            selectData.appendChild(option);
        }
    }

    async preencherHorarios() {
        const selectHorario = document.getElementById('horario');
        const dataSelecionada = document.getElementById('data').value;
        selectHorario.innerHTML = '<option value="" disabled selected>Selecione</option>';
        
        try {
            for (let h = 9; h <= 18; h++) {
                const horario = `${String(h).padStart(2, '0')}:00`;
                const disponivel = await AgendamentoModel.isHorarioDisponivel(dataSelecionada, horario);
                if (disponivel) {
                    const option = document.createElement('option');
                    option.value = horario;
                    option.textContent = horario;
                    selectHorario.appendChild(option);
                }
            }
        } catch (error) {
            this.mostrarErro('Erro ao carregar horários.');
        }
    }

    async handleAgendamento(event) {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const servico = document.getElementById('servico').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;

        if (!nome || !telefone || !servico || !data || !horario) {
            this.mostrarErro('Preencha todos os campos!');
            return;
        }

        try {
            const agendamento = { nome, telefone, servico, data, horario };
            await AgendamentoModel.salvarAgendamento(agendamento);
            alert(`Agendamento confirmado!\nNome: ${nome}\nServiço: ${servico}\nData: ${data}\nHorário: ${horario}`);
            document.getElementById('agendamento-form').reset();
            this.carregarAgendamentos();
        } catch (error) {
            this.mostrarErro('Erro ao salvar agendamento.');
        }
    }

    async editarAgendamento(agendamentoId) {
        try {
            const agendamentos = await AgendamentoModel.getAgendamentos();
            const agendamento = agendamentos.find(a => a.id === agendamentoId);
            if (!agendamento) {
                this.mostrarErro('Agendamento não encontrado.');
                return;
            }

            document.getElementById('nome').value = agendamento.nome;
            document.getElementById('telefone').value = agendamento.telefone;
            document.getElementById('servico').value = agendamento.servico;
            document.getElementById('data').value = agendamento.data;
            this.preencherHorarios();
            document.getElementById('horario').value = agendamento.horario;

            const form = document.getElementById('agendamento-form');
            form.onsubmit = async (e) => {
                e.preventDefault();
                const updatedData = {
                    nome: document.getElementById('nome').value,
                    telefone: document.getElementById('telefone').value,
                    servico: document.getElementById('servico').value,
                    data: document.getElementById('data').value,
                    horario: document.getElementById('horario').value
                };
                try {
                    await AgendamentoModel.atualizarAgendamento(agendamentoId, updatedData);
                    alert('Agendamento atualizado com sucesso!');
                    form.reset();
                    form.onsubmit = (e) => this.handleAgendamento(e);
                    this.carregarAgendamentos();
                } catch (error) {
                    this.mostrarErro('Erro ao atualizar agendamento.');
                }
            };
        } catch (error) {
            this.mostrarErro('Erro ao carregar agendamento para edição.');
        }
    }

    async excluirAgendamento(agendamentoId) {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
        try {
            await AgendamentoModel.excluirAgendamento(agendamentoId);
            alert('Agendamento excluído com sucesso!');
            this.carregarAgendamentos();
        } catch (error) {
            this.mostrarErro('Erro ao excluir agendamento.');
        }
    }

    mostrarErro(mensagem) {
        const erroDiv = document.getElementById('erro-mensagem');
        erroDiv.innerHTML = `<div class="alert alert-danger">${mensagem}</div>`;
        setTimeout(() => erroDiv.innerHTML = '', 5000);
    }
}

const lojaController = new LojaController();
window.lojaController = lojaController; // Para acesso nos botões de editar/excluir

