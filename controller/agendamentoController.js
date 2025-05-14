import { AgendamentoModel } from '../model/agendamentoModel.js';

class AgendamentoController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    init() {
        this.preencherDatas();
        this.carregarAgendamentos();
        document.getElementById('data').addEventListener('change', () => this.preencherHorarios());
        document.getElementById('agendamento-form').addEventListener('submit', (e) => this.handleAgendamento(e));
    }

    preencherDatas() {
        const selectData = document.getElementById('data');
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
        
        for (let h = 9; h <= 18; h++) {
            const horario = `${h}:00`;
            const disponivel = await this.model.isHorarioDisponivel(dataSelecionada, horario);
            if (disponivel) {
                const option = document.createElement('option');
                option.value = horario;
                option.textContent = horario;
                selectHorario.appendChild(option);
            }
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
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            const agendamento = { nome, telefone, servico, data, horario };
            await this.model.salvarAgendamento(agendamento);
            alert(`Agendamento confirmado!\nNome: ${nome}\nServiço: ${servico}\nData: ${data}\nHorário: ${horario}`);
            document.getElementById('agendamento-form').reset();
            await this.carregarAgendamentos();
        } catch (error) {
            alert('Erro ao salvar agendamento. Tente novamente.');
        }
    }

    async carregarAgendamentos() {
        const tbody = document.querySelector('#tabela-agendamentos tbody');
        tbody.innerHTML = '';
        const agendamentos = await this.model.getAgendamentos();
        agendamentos.forEach(agendamento => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${agendamento.nome}</td>
                <td>${agendamento.telefone}</td>
                <td>${agendamento.servico}</td>
                <td>${agendamento.data}</td>
                <td>${agendamento.horario}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

const controller = new AgendamentoController(AgendamentoModel, null);