import { app } from './js/firebase.js'; 

// Configuração Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "ID",
    appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referências DOM
const tabelaBody = document.querySelector("#tabelaRelatorio tbody");
let dadosRelatorio = [];

// Buscar dados filtrados
async function buscarRelatorio() {
    const dataFiltro = document.getElementById("dataFiltro").value;
    const nomeFiltro = document.getElementById("nomeFiltro").value.toLowerCase();
    const responsavelFiltro = document.getElementById("responsavelFiltro").value.toLowerCase();

    tabelaBody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';

    const snapshot = await db.collection('criancas').get();
    dadosRelatorio = [];

    snapshot.forEach(doc => {
        const d = doc.data();

        // Verifica filtros
        let atendeFiltro = true;

        // Filtro por data
        if (dataFiltro) {
            const entrada = new Date(d.inicio);
            const dataSelecionada = new Date(dataFiltro);
            entrada.setHours(0, 0, 0, 0);
            dataSelecionada.setHours(0, 0, 0, 0);
            if (entrada.getTime() !== dataSelecionada.getTime()) {
                atendeFiltro = false;
            }
        }

        // Filtro por nome da criança
        if (nomeFiltro && !d.nome.toLowerCase().includes(nomeFiltro)) {
            atendeFiltro = false;
        }

        // Filtro por nome do responsável
        if (responsavelFiltro && !d.responsavel.toLowerCase().includes(responsavelFiltro)) {
            atendeFiltro = false;
        }

        if (atendeFiltro) {
            dadosRelatorio.push({
                nome: d.nome,
                idade: d.idade,
                responsavel: d.responsavel,
                telefone: d.telefone,
                quemBusca: d.buscarResponsavel === 'sim' ? 'Responsável' : d.nomeBusca,
                entrada: new Date(d.inicio).toLocaleTimeString(),
                duracao: `${d.tempo} min`
            });
        }
    });

    atualizarTabela();
}

// Atualiza tabela com os dados
function atualizarTabela() {
    if (dadosRelatorio.length === 0) {
        tabelaBody.innerHTML = '<tr><td colspan="7">Nenhum registro encontrado</td></tr>';
        return;
    }

    tabelaBody.innerHTML = '';
    dadosRelatorio.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.idade}</td>
            <td>${item.responsavel}</td>
            <td>${item.telefone}</td>
            <td>${item.quemBusca}</td>
            <td>${item.entrada}</td>
            <td>${item.duracao}</td>
        `;
        tabelaBody.appendChild(tr);
    });
}

// Exportar para PDF
function exportarPDF() {
    if (dadosRelatorio.length === 0) {
        alert("Nenhum dado para exportar!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Crianças", 14, 20);
    doc.setFontSize(12);
    doc.text(`Data: ${document.getElementById("dataFiltro").value}`, 14, 30);

    doc.autoTable({
        startY: 40,
        head: [['Nome', 'Idade', 'Responsável', 'Telefone', 'Quem Busca', 'Entrada', 'Duração']],
        body: dadosRelatorio.map(item => [
            item.nome,
            item.idade,
            item.responsavel,
            item.telefone,
            item.quemBusca,
            item.entrada,
            item.duracao
        ]),
        styles: { fontSize: 10 }
    });

    doc.save(`Relatorio_${document.getElementById("dataFiltro").value}.pdf`);
}

// NOVO: Limpar filtros
function limparFiltros() {
    document.getElementById("dataFiltro").value = "";
    document.getElementById("nomeFiltro").value = "";
    document.getElementById("responsavelFiltro").value = "";

    buscarRelatorio(); // Recarrega a tabela com todos os dados
}
