// === CONFIG DO WEBHOOK GOOGLE ===
const EMAIL_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwZadwR-X5w9TuKO3XKb8hWDGevDKFlCRvp06CJCVQOwSvCkzyu19odcIs9flzu62yb/exec";


var historicoCalculos = [];
var modoEscuroAtivado = false;




function exibirModalSobre() {
    var modalSobre = document.getElementById('modalSobre');
    modalSobre.style.display = 'block';
}

function fecharModalSobre() {
    var modalSobre = document.getElementById('modalSobre');
    modalSobre.style.display = 'none';
}

function formatarDataHora() {
  var agora = new Date();
  return agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
}

function adicionarAoHistorico(valor, pis, coffins, calculoN, importadostotal, icmstotal) {
  var dataHoraAtual = formatarDataHora();
  historicoCalculos.unshift({ valor: formatarMoeda(valor), data: dataHoraAtual, pis: formatarMoeda(pis), coffins: formatarMoeda(coffins), calculoN: formatarMoeda(calculoN), importadostotal: formatarMoeda(importadostotal), icmstotal: formatarMoeda(icmstotal) });
  if (historicoCalculos.length > 5) {
    historicoCalculos.pop();
  }
  atualizarHistorico();
  salvarHistorico();
  document.querySelector('.historico').style.display = 'block';
}

function exibirDetalhesHistorico(index) {
  var historicoItem = historicoCalculos[index];
  var mensagem = `PIS: ${historicoItem.pis}\nCOFINS: ${historicoItem.coffins}\nICMS: ${historicoItem.calculoN}\nTOTAL IMPORTADOS: ${historicoItem.importadostotal}\nTOTAL ICMS: ${historicoItem.icmstotal}`;
  alert(mensagem);
}

function atualizarHistorico() {
  var lista = document.getElementById('historicoLista');
  lista.innerHTML = '';
  historicoCalculos.forEach(function(item, index) {
    var li = document.createElement('li');
    li.innerHTML = `<span class="valor">${item.valor}</span> <span class="data">${item.data}</span>`;
    li.classList.add(index === 0 ? 'ultimo-calculo' : 'calculo-anterior');
    li.addEventListener('click', function() {
      exibirDetalhesHistorico(index);
    });
    lista.appendChild(li);
  });
}

async function enviarEmailResultados(payload){
  try {
    await fetch(EMAIL_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors", // importante, pois o Apps Script não libera CORS
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    alert("Solicitação de envio de e-mail realizada! 📧");
  } catch (err) {
    console.error("Erro ao chamar webhook:", err);
    alert("Falha ao solicitar envio do e-mail.");
  }
}

function calcularDesconto() {
    var valorTotal = parseFloat(document.getElementById('valorTotal').value.replace('.', '').replace(',', '.'));
    var valorTotalN = parseFloat(document.getElementById('valorTotalN').value.replace('.', '').replace(',', '.'));

    var resultado = document.getElementById('resultado');
    var valorDesconto = document.getElementById('valorDesconto');
    var pisResult = document.getElementById('pisResult');
    var coffinsResult = document.getElementById('coffinsResult');
    var calculoNResult = document.getElementById('calculoNResult');
    var importadostotalResult = document.getElementById('importadostotalResult');
    var icmstotalResult = document.getElementById('icmstotalResult');

    if (isNaN(valorTotal) || isNaN(valorTotalN)) {
        alert('Preencha todos os campos corretamente.');
        return false;
    }

    if (!isNaN(valorTotal) && !isNaN(valorTotalN)) {
        // ===== Cálculos =====
        var pis = valorTotal * 0.0165;
        var coffins = valorTotal * 0.076;
        var calculo_N = valorTotalN * 0.07;
        var importadostotal = valorTotal - valorTotalN;
        var icmstotal = importadostotal * 0.04;

        var desconto = pis + coffins + calculo_N;

        // ===== Atualiza a tela =====
        resultado.textContent = formatarMoeda(desconto);
        valorDesconto.classList.remove('hidden');
        pisResult.textContent = formatarMoeda(pis);
        coffinsResult.textContent = formatarMoeda(coffins);
        calculoNResult.textContent = formatarMoeda(calculo_N);
        importadostotalResult.textContent = formatarMoeda(importadostotal);
        icmstotalResult.textContent = formatarMoeda(icmstotal);

        document.getElementById('pisValue').classList.remove('hidden');
        document.getElementById('coffinsValue').classList.remove('hidden');
        document.getElementById('calculoNValue').classList.remove('hidden');
        document.getElementById('importadostotalValue').classList.remove('hidden');
        document.getElementById('icmstotalValue').classList.remove('hidden');

        document.querySelectorAll('#valorDesconto, #pisValue, #coffinsValue, #calculoNValue, #importadostotalValue, #icmstotalValue')
            .forEach(el => el.classList.add('animated'));

        // ===== Salva no histórico =====
        adicionarAoHistorico(desconto, pis, coffins, calculo_N, importadostotal, icmstotal);

        // ===== Monta o payload para o e-mail =====
        const payload = {
            to: "lorenzowrublewski08@gmail.com",
            subject: "Resultado - Desconto Suframa",
            valorTotal,
            valorTotalN,
            pis,
            coffins,
            icmsNacionais: calculo_N,
            totalImportados: importadostotal,
            icmsImportados: icmstotal,
            desconto,
            dataHora: formatarDataHora(),
            origem: location.href
        };

        // ===== Envia para o Google Apps Script =====
        enviarEmailResultados(payload);
    }
}


function limpar() {
  document.getElementById('valorTotal').value = '';
  document.getElementById('valorTotalN').value = '';

  document.getElementById('resultado').textContent = 'XXX,XXX';
  document.getElementById('pisResult').textContent = 'XXX,XXX';
  document.getElementById('coffinsResult').textContent = 'XXX,XXX';
  document.getElementById('calculoNResult').textContent = 'XXX,XXX';
  document.getElementById('importadostotalResult').textContent = 'XXX,XXX';
  document.getElementById('icmstotalResult').textContent = 'XXX,XXX';

  document.getElementById('valorDesconto').classList.add('hidden');
  document.getElementById('pisValue').classList.add('hidden');
  document.getElementById('coffinsValue').classList.add('hidden');
  document.getElementById('calculoNValue').classList.add('hidden');
  document.getElementById('importadostotalValue').classList.add('hidden');
  document.getElementById('icmstotalValue').classList.add('hidden');

  document.querySelectorAll('#valorDesconto, #pisValue, #coffinsValue, #calculoNValue, #importadostotalValue, #icmstotalValue').forEach(el => {
    el.classList.remove('animated');
  });
}

function limparHistorico() {
  historicoCalculos = [];
  salvarHistorico();
  atualizarHistorico();
}

function salvarHistorico() {
  localStorage.setItem('historicoCalculos', JSON.stringify(historicoCalculos));
}

function salvarModoEscuro() {
  localStorage.setItem('modoEscuro', modoEscuroAtivado);
}

function carregarHistorico() {
  var historicoSalvo = localStorage.getItem('historicoCalculos');
  if (historicoSalvo) {
    historicoCalculos = JSON.parse(historicoSalvo);
    atualizarHistorico();
    document.querySelector('.historico').style.display = 'block';
  }
}

function carregarModoEscuro() {
  var modoEscuroSalvo = localStorage.getItem('modoEscuro');
  if (modoEscuroSalvo !== null) {
    modoEscuroAtivado = JSON.parse(modoEscuroSalvo);
    aplicarModoEscuro();
  }
}

function aplicarModoEscuro() {
  var body = document.body;
  body.classList.toggle('dark-mode', modoEscuroAtivado);

  var modoEscuroBtn = document.querySelector('.modo-escuro-btn');
  modoEscuroBtn.textContent = modoEscuroAtivado ? 'Modo Claro' : 'Modo Escuro';
}

function alternarModo() {
  modoEscuroAtivado = !modoEscuroAtivado;
  salvarModoEscuro();
  aplicarModoEscuro();
}

function adicionarBotaoMinimizar() {
  var tituloHistorico = document.querySelector('.titulo-historico');
  var botaoMinimizar = document.createElement('button');
  botaoMinimizar.id = 'toggleHistorico';
  botaoMinimizar.title = 'Minimizar o histórico';
  botaoMinimizar.textContent = '-';
  tituloHistorico.appendChild(botaoMinimizar);

  botaoMinimizar.addEventListener('click', function() {
    var infoHistorico = document.getElementById('infoHistorico');
    var historicoLista = document.getElementById('historicoLista');
    var limparHistoricoBtn = document.getElementById('limparHistorico');
    var isHistoricoVisible = infoHistorico.style.visibility !== 'hidden';

    infoHistorico.style.visibility = isHistoricoVisible ? 'hidden' : 'visible';
    infoHistorico.style.height = isHistoricoVisible ? '0' : 'auto';

    historicoLista.style.visibility = isHistoricoVisible ? 'hidden' : 'visible';
    historicoLista.style.height = isHistoricoVisible ? '0' : 'auto';

    limparHistoricoBtn.style.display = isHistoricoVisible ? 'none' : 'block';

    this.title = isHistoricoVisible ? 'Maximizar o histórico' : 'Minimizar o histórico';
    this.textContent = isHistoricoVisible ? '+' : '-';
  });
}

adicionarBotaoMinimizar();

document.getElementById('limparHistorico').addEventListener('click', function() {
  if (confirm("Tem certeza que deseja limpar o histórico?")) {
    limparHistorico();
  }
});

document.getElementById('valorTotal').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    calcularDesconto();
  }
});

document.getElementById('valorTotalN').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    calcularDesconto();
  }
});

document.addEventListener('DOMContentLoaded', (event) => {
  carregarHistorico();
  carregarModoEscuro();
});








