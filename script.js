var historicoCalculos = [];
var modoEscuroAtivado = false;

// ======= CONFIG DO EMAILJS =======
// Preencha com seus dados do EmailJS:
const EMAILJS_SERVICE_ID = 'service_ne8lhir';
const EMAILJS_TEMPLATE_ID = 'template_hjkxsdx';
const DEST_EMAIL = 'lorenzowrublewski08@gmail.com';
// =================================

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
  historicoCalculos.unshift({
    valor: formatarMoeda(valor),
    data: dataHoraAtual,
    pis: formatarMoeda(pis),
    coffins: formatarMoeda(coffins),
    calculoN: formatarMoeda(calculoN),
    importadostotal: formatarMoeda(importadostotal),
    icmstotal: formatarMoeda(icmstotal)
  });
  if (historicoCalculos.length > 5) historicoCalculos.pop();
  atualizarHistorico();
  salvarHistorico();
  document.querySelector('.historico').style.display = 'block';
}

function exibirDetalhesHistorico(index) {
  var h = historicoCalculos[index];
  var msg = `PIS: ${h.pis}\nCOFINS: ${h.coffins}\nICMS: ${h.calculoN}\nTOTAL IMPORTADOS: ${h.importadostotal}\nTOTAL ICMS: ${h.icmstotal}`;
  alert(msg);
}

function atualizarHistorico() {
  var lista = document.getElementById('historicoLista');
  lista.innerHTML = '';
  historicoCalculos.forEach(function(item, index) {
    var li = document.createElement('li');
    li.innerHTML = `<span class="valor">${item.valor}</span> <span class="data">${item.data}</span>`;
    li.classList.add(index === 0 ? 'ultimo-calculo' : 'calculo-anterior');
    li.addEventListener('click', function() { exibirDetalhesHistorico(index); });
    lista.appendChild(li);
  });
}

// ======= NOVO: função para enviar e-mail com EmailJS =======
async function enviarEmailResultados(payload) {
  if (!window.emailjs) {
    return;
  }

  // Estes nomes de campos devem existir no seu TEMPLATE do EmailJS.
  // No EmailJS, crie variáveis como: to_email, assunto, corpo, etc.
  const templateParams = {
    to_email: DEST_EMAIL,
    assunto: 'Resultado do cálculo Suframa',
    // Corpo de e-mail em texto simples
    corpo:
`Data/Hora: ${payload.dataHora}

Entrada:
- Valor total da ordem: R$ ${payload.valorTotalBR}
- Valor de produtos NACIONAIS: R$ ${payload.valorTotalNBR}

Resultados:
- Desconto total: R$ ${payload.descontoBR}
- PIS: R$ ${payload.pisBR}
- COFINS: R$ ${payload.cofinsBR}
- ICMS (sobre nacionais): R$ ${payload.icmsNBR}
- Total Importados: R$ ${payload.totalImportadosBR}
- Total ICMS (importados 4%): R$ ${payload.totalICMSImportBR}`
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  } catch (err) {
    alert('Falha');
  }
}
// ===========================================================

function calcularDesconto() {
    var vTotalStr = document.getElementById('valorTotal').value;
    var vNacStr   = document.getElementById('valorTotalN').value;

    var valorTotal = parseFloat(vTotalStr.replace(/\./g, '').replace(',', '.'));
    var valorTotalN = parseFloat(vNacStr.replace(/\./g, '').replace(',', '.'));

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

    var pis = valorTotal * 0.0165;
    var coffins = valorTotal * 0.076;
    var calculo_N = valorTotalN * 0.07;
    var importadostotal = valorTotal - valorTotalN;
    var icmstotal = (valorTotal - valorTotalN) * 0.04;

    var desconto = pis + coffins + calculo_N;

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

    // adiciona ao histórico (usa desconto como "valor" na lista)
    adicionarAoHistorico(desconto, pis, coffins, calculo_N, importadostotal, icmstotal);

    // ===== Enviar e-mail automaticamente ao concluir =====
    const payload = {
      dataHora: formatarDataHora(),
      valorTotal: valorTotal,
      valorTotalN: valorTotalN,
      desconto: desconto,
      pis: pis,
      cofins: coffins,
      icmsN: calculo_N,
      totalImportados: importadostotal,
      totalICMSImport: icmstotal,

      // versões formatadas (R$) para o corpo do e-mail
      valorTotalBR: formatarMoeda(valorTotal),
      valorTotalNBR: formatarMoeda(valorTotalN),
      descontoBR: formatarMoeda(desconto),
      pisBR: formatarMoeda(pis),
      cofinsBR: formatarMoeda(coffins),
      icmsNBR: formatarMoeda(calculo_N),
      totalImportadosBR: formatarMoeda(importadostotal),
      totalICMSImportBR: formatarMoeda(icmstotal)
    };
    enviarEmailResultados(payload);
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

  document.querySelectorAll('#valorDesconto, #pisValue, #coffinsValue, #calculoNValue, #importadostotalValue, #icmstotalValue')
    .forEach(el => el.classList.remove('animated'));
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
    var isVisible = infoHistorico.style.visibility !== 'hidden';

    infoHistorico.style.visibility = isVisible ? 'hidden' : 'visible';
    infoHistorico.style.height = isVisible ? '0' : 'auto';
    historicoLista.style.visibility = isVisible ? 'hidden' : 'visible';
    historicoLista.style.height = isVisible ? '0' : 'auto';
    limparHistoricoBtn.style.display = isVisible ? 'none' : 'block';

    this.title = isVisible ? 'Maximizar o histórico' : 'Minimizar o histórico';
    this.textContent = isVisible ? '+' : '-';
  });
}
adicionarBotaoMinimizar();

document.getElementById('limparHistorico').addEventListener('click', function() {
  if (confirm("Tem certeza que deseja limpar o histórico?")) limparHistorico();
});
document.getElementById('valorTotal').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') calcularDesconto();
});
document.getElementById('valorTotalN').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') calcularDesconto();
});
document.addEventListener('DOMContentLoaded', function() {
  carregarHistorico();
  carregarModoEscuro();
});
