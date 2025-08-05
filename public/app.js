// Configuração Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "ID",
    appId: "APP_ID"
};

document.getElementById("formEntrada").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const nome = document.getElementById("nome").value.trim();
    const tempo = document.getElementById("tempo").value.trim();
    const status = document.getElementById("status").value.trim();
    const dataHora = new Date().toISOString();
  
    if (nome && tempo && status) {
      firebase.database().ref("criancas").push({
        nome,
        tempo,
        status,
        entrada: dataHora
      }).then(() => {
        alert("Registro salvo com sucesso!");
        document.getElementById("formEntrada").reset();
      }).catch((error) => {
        alert("Erro ao salvar: " + error.message);
      });
    } else {
      alert("Preencha todos os campos!");
    }
});  

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referências DOM
const form = document.getElementById('cadastroForm');
const lista = document.getElementById('listaCriancas');
const responsavelSelect = document.getElementById('responsavelPais');
const buscarSelect = document.getElementById('buscarResponsavel');

const campoPais = document.getElementById('campoPais');
const campoOutroResponsavel = document.getElementById('campoOutroResponsavel');
const campoQuemBusca = document.getElementById('campoQuemBusca');

// Exibir campos conforme respostas
responsavelSelect.addEventListener('change', () => {
    if (responsavelSelect.value === 'sim') {
        campoPais.style.display = 'block';
        campoOutroResponsavel.style.display = 'none';
    } else if (responsavelSelect.value === 'nao') {
        campoPais.style.display = 'none';
        campoOutroResponsavel.style.display = 'block';
    } else {
        campoPais.style.display = 'none';
        campoOutroResponsavel.style.display = 'none';
    }
});

buscarSelect.addEventListener('change', () => {
    if (buscarSelect.value === 'nao') {
        campoQuemBusca.style.display = 'block';
    } else {
        campoQuemBusca.style.display = 'none';
    }
});

// Cadastro da criança
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const idade = document.getElementById('idade').value;
    const telefone = document.getElementById('telefone').value;

    let nomeResponsavel = '';
    let parentesco = '';

    if (responsavelSelect.value === 'sim') {
        nomeResponsavel = document.getElementById('nomePais').value;
        parentesco = 'Pai/Mãe';
    } else {
        nomeResponsavel = document.getElementById('nomeOutroResponsavel').value;
        parentesco = document.getElementById('parentesco').value;
    }

    const buscarResponsavel = buscarSelect.value;
    const nomeBusca = buscarResponsavel === 'nao' ? document.getElementById('nomeBusca').value : nomeResponsavel;

    // Tempo: horas + minutos
    const horas = parseInt(document.getElementById('horas').value || 0);
    const minutos = parseInt(document.getElementById('minutos').value || 0);
    const totalMinutos = (horas * 60) + minutos;

    if (totalMinutos <= 0) {
        alert('Informe um tempo válido!');
        return;
    }

    const inicio = new Date().getTime();

    // Salva no Firestore
    await db.collection('criancas').add({
        nome,
        idade,
        telefone,
        responsavel: nomeResponsavel,
        parentesco,
        buscarResponsavel,
        nomeBusca,
        tempo: totalMinutos,
        inicio
    });

    form.reset();
    campoPais.style.display = 'none';
    campoOutroResponsavel.style.display = 'none';
    campoQuemBusca.style.display = 'none';
});

// Atualiza lista em tempo real
db.collection('criancas').onSnapshot(snapshot => {
    let criancas = [];
    snapshot.forEach(doc => {
        criancas.push({ id: doc.id, ...doc.data() });
    });

    // Ordena pelo menor tempo restante
    criancas.sort((a, b) => {
        const diffA = (a.inicio + a.tempo * 60000) - Date.now();
        const diffB = (b.inicio + b.tempo * 60000) - Date.now();
        return diffA - diffB;
    });

    lista.innerHTML = '';
    criancas.forEach((data, index) => {
        const tempoRestante = calcularTempoRestante(data.inicio, data.tempo);
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div>
                <h3 class="${index === 0 ? 'blink' : ''}">${data.nome} (${data.idade} anos)</h3>
                <p>Responsável: ${data.responsavel} (${data.parentesco})</p>
                <p>Telefone: ${data.telefone}</p>
                <p>Quem buscará: ${data.buscarResponsavel === 'sim' ? 'Responsável' : data.nomeBusca}</p>
            </div>
            <div>
                <span class="timer ${index === 0 ? 'blink' : ''}">${tempoRestante}</span>
                <button class="finalizar" onclick="finalizarFicha('${data.id}', this)">Finalizar</button>
            </div>
        `;

        lista.appendChild(div);

        // Atualiza cronômetro a cada segundo
        setInterval(() => {
            div.querySelector('.timer').textContent = calcularTempoRestante(data.inicio, data.tempo);
        }, 1000);
    });
});

// Calcula tempo restante
function calcularTempoRestante(inicio, tempo) {
    const agora = new Date().getTime();
    const fim = inicio + (tempo * 60000);
    const diff = fim - agora;

    if (diff <= 0) return "Tempo esgotado!";
    const min = Math.floor(diff / 60000);
    const seg = Math.floor((diff % 60000) / 1000);
    return `${min}m ${seg}s`;
}

// Finaliza ficha e adiciona efeito de brilho
async function finalizarFicha(id, botao) {
    botao.classList.add('brilho'); // adiciona efeito de brilho
    setTimeout(() => {
        botao.classList.remove('brilho'); // remove após 1,5 segundos
    }, 1500);

    await db.collection('criancas').doc(id).delete();
}
