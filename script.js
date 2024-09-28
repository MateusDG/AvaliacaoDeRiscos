// script.js

// Variável global para armazenar o gráfico da simulação
let simChart;

// Função para gerar um número aleatório entre 0 e 1
function getRandom() {
    return Math.random();
}

// Função para realizar a simulação de Monte Carlo
function runSimulation(capitalInicial, valorJogo, probErro, probAcerto, numJogos) {
    let capital = capitalInicial;
    let resultados = [];
    let acertos = 0;
    let erros = 0;

    console.log(`Iniciando simulação com ${numJogos} jogos...`);

    for (let i = 0; i < numJogos; i++) {
        let rand = getRandom();
        if (rand < probErro / 100) {
            capital -= valorJogo;
            erros++;
        } else {
            capital += valorJogo;
            acertos++;
        }
        resultados.push(capital);

        // Opcional: Log a cada 100 jogos para monitoramento
        if ((i + 1) % 100 === 0) {
            console.log(`Jogo ${i + 1}: Capital = R$ ${capital.toFixed(2)}`);
        }
    }

    console.log(`Simulação concluída. Capital Final: R$ ${capital.toFixed(2)}, Acertos: ${acertos}, Erros: ${erros}`);
    return { resultados, acertos, erros };
}

// Função para desenhar o gráfico da simulação
function desenharGrafico(dados, capitalInicial) {
    const ctx = document.getElementById('resultadoChart').getContext('2d');

    // Destruir gráfico anterior se existir
    if (simChart != undefined) 
        simChart.destroy();

    // Criar a linha de referência do capital inicial
    const linhaCapitalInicial = Array(dados.resultados.length).fill(capitalInicial);

    simChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dados.resultados.map((_, index) => index + 1),
            datasets: [
                {
                    label: 'Capital ao Longo dos Jogos (R$)',
                    data: dados.resultados,
                    borderColor: 'rgba(26, 188, 156, 1)',
                    backgroundColor: 'rgba(26, 188, 156, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Capital Inicial (R$)',
                    data: linhaCapitalInicial,
                    borderColor: 'rgba(52, 73, 94, 1)',
                    borderDash: [10,5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true, // Garante que o gráfico seja responsivo
            maintainAspectRatio: false, // Permite que o gráfico se ajuste ao contêiner
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Número de Jogos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Capital (R$)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Função para exibir resultados de acertos e erros na página
function exibirResultados(acertos, erros, capitalFinal) {
    const resultsDiv = document.getElementById('simulationResults');
    document.getElementById('totalJogos').textContent = acertos + erros;
    document.getElementById('totalAcertos').textContent = acertos;
    document.getElementById('totalErros').textContent = erros;
    document.getElementById('capitalFinal').textContent = capitalFinal.toFixed(2);

    // Mostrar a div de resultados
    resultsDiv.style.display = 'block';
}

// Função para sincronizar as probabilidades
function sincronizarProbabilidades(event) {
    const probErroInput = document.getElementById('probErro');
    const probAcertoInput = document.getElementById('probAcerto');

    if (event.target.id === 'probErro') {
        let probErro = parseFloat(probErroInput.value);
        if (isNaN(probErro) || probErro < 0) {
            probErro = 0;
        } else if (probErro > 100) {
            probErro = 100;
        }
        probErroInput.value = probErro;
        probAcertoInput.value = (100 - probErro).toFixed(0);
    }
}

// Manipulador de evento para o formulário de simulação
document.getElementById('simulationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obter valores do formulário
    const capitalInicial = parseFloat(document.getElementById('capitalInicial').value);
    const valorJogo = parseFloat(document.getElementById('valorJogo').value);
    const probErro = parseFloat(document.getElementById('probErro').value);
    const probAcerto = parseFloat(document.getElementById('probAcerto').value);
    const numJogos = parseInt(document.getElementById('numJogos').value);

    console.log(`Formulário submetido com: Capital Inicial = R$ ${capitalInicial}, Valor por Jogo = R$ ${valorJogo}, Prob Erro = ${probErro}%, Prob Acerto = ${probAcerto}%, Número de Jogos = ${numJogos}`);

    // Validação básica
    if (probErro + probAcerto !== 100) {
        alert('A soma das probabilidades de erro e acerto deve ser 100%.');
        return;
    }

    if (capitalInicial < 0 || valorJogo < 0 || numJogos <= 0) {
        alert('Os valores de Capital Inicial, Valor por Jogo devem ser iguais ou maiores que 0, e o Número de Jogos deve ser maior que 0.');
        return;
    }

    // Limitar o número de jogos para evitar simulações muito longas
    const maxJogos = 10000;
    if (numJogos > maxJogos) {
        alert(`O número máximo de jogos permitido é ${maxJogos}.`);
        return;
    }

    // Executar simulação
    const simulacao = runSimulation(capitalInicial, valorJogo, probErro, probAcerto, numJogos);

    // Desenhar gráfico
    desenharGrafico(simulacao, capitalInicial);

    // Exibir resultados
    const capitalFinal = simulacao.resultados[simulacao.resultados.length - 1];
    exibirResultados(simulacao.acertos, simulacao.erros, capitalFinal);
});

// Adicionar eventos para sincronizar as probabilidades
document.getElementById('probErro').addEventListener('input', sincronizarProbabilidades);
// O campo probAcerto está definido como readonly, não é necessário adicionar um listener

// Inicializar os campos de probabilidade e gráficos das técnicas e estudos de caso
window.onload = function() {
    // Inicialmente, probErro = 0 e probAcerto = 100
    document.getElementById('probErro').value = "0";
    document.getElementById('probAcerto').value = "100";

    // Inicializar os gráficos das técnicas (funcionalidade futura)
    inicializarTecnicas();

    // Inicializar os gráficos dos estudos de caso (funcionalidade futura)
    inicializarEstudosCaso();
};

// Função para inicializar os gráficos das técnicas
function inicializarTecnicas() {
    // Aqui você pode adicionar funcionalidades interativas para as técnicas, como gráficos ou infográficos.
    // Exemplo: Criar gráficos que ilustram cada técnica de avaliação de riscos.
}

// Função para inicializar os gráficos dos estudos de caso
function inicializarEstudosCaso() {
    // Aqui você pode adicionar funcionalidades interativas para os estudos de caso, como gráficos ou infográficos.
    // Exemplo: Apresentar resultados de simulações específicas para cada estudo de caso.
}
