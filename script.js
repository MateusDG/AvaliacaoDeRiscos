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

// Função para gerar cores aleatórias para os jogadores
function getRandomColor() {
    const r = Math.floor(Math.random() * 200) + 50; // Evita cores muito claras
    const g = Math.floor(Math.random() * 200) + 50;
    const b = Math.floor(Math.random() * 200) + 50;
    return `rgba(${r}, ${g}, ${b}, 1)`;
}

// Função para desenhar o gráfico da simulação
function desenharGrafico(dadosArray, capitalInicial) {
    const ctx = document.getElementById('resultadoChart').getContext('2d');

    // Destruir gráfico anterior se existir
    if (simChart != undefined) 
        simChart.destroy();

    // Supondo que todos os jogadores têm o mesmo número de jogos
    const numJogos = dadosArray[0].resultados.length;
    const labels = Array.from({length: numJogos}, (_, i) => i + 1);

    // Criar a linha de referência do capital inicial
    const linhaCapitalInicial = Array(numJogos).fill(capitalInicial);

    // Preparar datasets para cada jogador
    const datasets = dadosArray.map((dados, index) => ({
        label: `Dia ${index + 1}`,
        data: dados.resultados,
        borderColor: getRandomColor(),
        backgroundColor: 'rgba(0,0,0,0)', // Remover preenchimento
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.3
    }));

    // Adicionar a linha de referência
    datasets.push({
        label: 'Capital Inicial (R$)',
        data: linhaCapitalInicial,
        borderColor: 'rgba(52, 73, 94, 1)', // Cor da linha de referência
        borderDash: [10,5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0
    });

    simChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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

// Função para exibir resultados de acertos, erros, capital final e lucro do cassino na página
function exibirResultados(dadosArray, valorJogo) {
    const resultsDiv = document.getElementById('simulationResults');
    const totalJogosSpan = document.getElementById('totalJogos');
    const totalAcertosSpan = document.getElementById('totalAcertos');
    const totalErrosSpan = document.getElementById('totalErros');
    const capitalFinalSpan = document.getElementById('capitalFinal');
    const probabilidadeVencerSpan = document.getElementById('probabilidadeVencer');
    const lucroCassinoSpan = document.getElementById('lucroCassino'); // Novo Elemento

    // Calcular totais agregados
    let totalJogos = 0;
    let totalAcertos = 0;
    let totalErros = 0;
    let capitalFinalTotal = 0;

    dadosArray.forEach(dados => {
        totalJogos += dados.acertos + dados.erros;
        totalAcertos += dados.acertos;
        totalErros += dados.erros;
        capitalFinalTotal += dados.resultados[dados.resultados.length - 1];
    });

    // Calcular média de capital final
    const numJogadores = dadosArray.length;
    const capitalFinalMedio = capitalFinalTotal / numJogadores;

    // Calcular a probabilidade de vencer
    const probabilidadeVencer = (totalAcertos / totalJogos) * 100;

    // Calcular o lucro do cassino
    // Lucro = (Total de Erros * Valor por Jogo) - (Total de Acertos * Valor por Jogo)
    const lucroCassino = (totalErros - totalAcertos) * valorJogo;

    // Atualizar os elementos na página
    totalJogosSpan.textContent = totalJogos;
    totalAcertosSpan.textContent = totalAcertos;
    totalErrosSpan.textContent = totalErros;
    capitalFinalSpan.textContent = `${capitalFinalMedio.toFixed(2)} (Média de ${numJogadores} jogadores)`;
    probabilidadeVencerSpan.textContent = probabilidadeVencer.toFixed(2);
    lucroCassinoSpan.textContent = lucroCassino.toFixed(2); // Atualizar o Lucro do Cassino

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
    const numJogadores = parseInt(document.getElementById('numJogadores').value);

    console.log(`Formulário submetido com: Capital Inicial = R$ ${capitalInicial}, Valor por Jogo = R$ ${valorJogo}, Prob Erro = ${probErro}%, Prob Acerto = ${probAcerto}%, Número de Jogos = ${numJogos}, Número de Jogadores = ${numJogadores}`);

    // Validação básica
    if (probErro + probAcerto !== 100) {
        alert('A soma das probabilidades de erro e acerto deve ser 100%.');
        return;
    }

    if (capitalInicial < 0 || valorJogo < 0 || numJogos <= 0 || numJogadores <= 0) {
        alert('Os valores de Capital Inicial, Valor por Jogo devem ser iguais ou maiores que 0, o Número de Jogos e o Número de Jogadores devem ser maiores que 0.');
        return;
    }

    // Limitar o número de jogos e jogadores para evitar simulações muito longas
    const maxJogos = 10000;
    const maxJogadores = 100; // Define um máximo razoável
    if (numJogos > maxJogos) {
        alert(`O número máximo de jogos permitido é ${maxJogos}.`);
        return;
    }
    if (numJogadores > maxJogadores) {
        alert(`O número máximo de jogadores permitido é ${maxJogadores}.`);
        return;
    }

    // Executar simulações para cada jogador
    const simulacoes = [];
    for (let i = 0; i < numJogadores; i++) {
        const simulacao = runSimulation(capitalInicial, valorJogo, probErro, probAcerto, numJogos);
        simulacoes.push(simulacao);
    }

    // Desenhar gráfico
    desenharGrafico(simulacoes, capitalInicial);

    // Exibir resultados, passando também o valor do jogo para calcular o lucro do cassino
    exibirResultados(simulacoes, valorJogo);
});

document.getElementById('probErro').addEventListener('input', sincronizarProbabilidades);
