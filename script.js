const { jsPDF } = window.jspdf;

// Variáveis globais
let localizacaoCapturada = null;
let horaInicio = null;

const hamburger = document.querySelector(".hamburger"),
  navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active"),
    navMenu.classList.toggle("active")
});

document.querySelectorAll(".nav-menu a").forEach(a => a.addEventListener("click", () => {
  hamburger.classList.remove("active"),
    navMenu.classList.remove("active")
}));

// Função para formatar data e hora
function formatarDataHoraLocal(data) {
  const padZero = num => num.toString().padStart(2, "0");
  return `${padZero(data.getDate())}/${padZero(data.getMonth() + 1)}/${data.getFullYear()} ${padZero(data.getHours())}:${padZero(data.getMinutes())}`;
}

// Função para salvar operação no localStorage
function salvarOperacao(operacao) {
  let operacoes = JSON.parse(localStorage.getItem("operacoes")) || [];
  operacoes.push(operacao);
  localStorage.setItem("operacoes", JSON.stringify(operacoes));
}

// Evento de marcar início da operação
document.getElementById("marcarInicio")?.addEventListener("click", function () {
  const agora = new Date();
  horaInicio = agora;

  // Formata a data para o input datetime-local
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const dataInicioFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;

  // Atualiza campo de início
  const campoInicio = document.getElementById("inicioOperacao");
  if (campoInicio) {
    campoInicio.value = dataInicioFormatada;
  }

  // Habilita campos do formulário
  const campos = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm select, #operacaoForm textarea");
  campos.forEach(campo => campo.removeAttribute("disabled"));

  // Desabilita botão de início
  this.disabled = true;
});

// Evento de captura de localização
document.getElementById("capturarLocalizacao")?.addEventListener("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (posicao) {
        const latitude = posicao.coords.latitude;
        const longitude = posicao.coords.longitude;
        const horaCaptura = new Date().toLocaleString();

        localizacaoCapturada = { latitude, longitude, hora: horaCaptura };
        alert(`Localização capturada: Latitude ${latitude}, Longitude ${longitude} às ${horaCaptura}`);
      },
      function (erro) {
        alert("Erro ao capturar localização: " + erro.message);
      }
    );
  } else {
    alert("Geolocalização não é suportada por este navegador.");
  }
});

// Evento de submissão do formulário
document.getElementById("operacaoForm")?.addEventListener("submit", function (event) {
  event.preventDefault();

  // Captura e formata data/hora do fim da operação
  const horaFim = new Date();
  const operacaoInicio = new Date(document.getElementById("inicioOperacao").value);

  // Cria objeto com dados da operação
  const operacao = {
    inicioOperacao: formatarDataHoraLocal(operacaoInicio), // Formato DD/MM/YYYY HH:mm
    fimOperacao: formatarDataHoraLocal(horaFim), // Formato DD/MM/YYYY HH:mm
    kmInicial: document.getElementById("kmInicial").value,
    kmFinal: document.getElementById("kmFinal").value,
    distanciaPercorrida: document.getElementById("kmFinal").value - document.getElementById("kmInicial").value,
    nomeOpAux: document.getElementById("nomeOpAux").value,
    tipoOperacao: document.getElementById("tipoOperacao").value,
    nomeCidade: document.getElementById("nomeCidade").value,
    nomePocoServ: document.getElementById("nomePocoServ").value,
    nomeOperador: document.getElementById("nomeOperador").value,
    volumeBbl: document.getElementById("volumeBbl").value,
    temperatura: document.getElementById("temperatura").value,
    pressao: document.getElementById("pressao").value,
    descricaoAtividades: document.getElementById("descricaoAtividades").value,
    timestamp: new Date().toLocaleString(),
    localizacao: localizacaoCapturada
  };

  try {
    // Salva operação e atualiza histórico
    salvarOperacao(operacao);
    adicionarOperacaoAoHistorico(operacao);

    // Reset do formulário
    this.reset();
    document.getElementById("marcarInicio").disabled = false;

    // Desabilita campos
    const campos = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm select, #operacaoForm textarea");
    campos.forEach(campo => campo.setAttribute("disabled", "disabled"));

    localizacaoCapturada = null;
    alert("Operação salva com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar operação:", erro);
    alert("Erro ao salvar operação");
  }
});

// Inicialização quando o DOM é carregado
document.addEventListener("DOMContentLoaded", function () {
  // Desabilita campos inicialmente
  const campos = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm select, #operacaoForm textarea");
  campos?.forEach(campo => campo.setAttribute("disabled", "disabled"));

  // Carrega operações do dia
  if (document.getElementById("historicoOperacoes")) {
    carregarOperacoesDoDia();
  }
});

function carregarOperacoesDoDia() {
  const a = JSON.parse(localStorage.getItem("operacoes")) || [],
    b = new Date().toLocaleDateString(),
    c = a.filter(a => {
      const c = new Date(a.timestamp).toLocaleDateString();
      return c === b;
    }),
    d = document.getElementById("historicoOperacoes");

  if (d) {
    d.innerHTML = "";
    if (0 === c.length) {
      d.innerHTML = "<li class=\"sem-operacoes\">Nenhuma operação registrada hoje</li>";
    } else {
      c.forEach(a => {
        const b = document.createElement("li");
        let c = a.localizacao ? `Lat: ${a.localizacao.latitude.toFixed(4)}, Long: ${a.localizacao.longitude.toFixed(4)}` : "Não capturada";
        b.innerHTML = `
          <div class="operacao-item">
            <div class="operacao-grid">
              <div class="grid-item">
                <strong>Início:</strong><br>
                ${a.inicioOperacao}
              </div>
              <div class="grid-item">
                <strong>Fim:</strong><br>
                ${a.fimOperacao}
              </div>
              <div class="grid-item">
                <strong>Quilometragem:</strong><br>
                Inicial: ${a.kmInicial}km<br>
                Final: ${a.kmFinal}km<br>
                Percorrido: ${a.distanciaPercorrida}km
              </div>
              <div class="grid-item">
                <strong>OP/Aux:</strong><br>
                ${a.nomeOpAux}
              </div>
              <div class="grid-item">
                <strong>Tipo Operação:</strong><br>
                ${a.tipoOperacao}
              </div>
              <div class="grid-item">
                <strong>Cidade:</strong><br>
                ${a.nomeCidade}
              </div>
              <div class="grid-item">
                <strong>Poço/Serviço:</strong><br>
                ${a.nomePocoServ}
              </div>
              <div class="grid-item">
                <strong>Operador:</strong><br>
                ${a.nomeOperador}
              </div>
              <div class="grid-item">
                <strong>Volume:</strong><br>
                ${a.volumeBbl} bbl
              </div>
              <div class="grid-item">
                <strong>Temperatura:</strong><br>
                ${a.temperatura}°C
              </div>
              <div class="grid-item">
                <strong>Pressão:</strong><br>
                ${a.pressao} PSI
              </div>
              <div class="grid-item grid-item-full">
                <strong>Localização:</strong><br>
                ${c}
              </div>
              <div class="grid-item grid-item-full">
                <strong>Descrição:</strong><br>
                ${a.descricaoAtividades}
              </div>
            </div>
          </div>
        `;
        d.appendChild(b);
      });
    }
  }
}

function adicionarOperacaoAoHistorico(a) {
  const b = document.getElementById("historicoOperacoes"),
    c = document.createElement("li");
  let d = a.localizacao ? `Lat: ${a.localizacao.latitude.toFixed(4)}, Long: ${a.localizacao.longitude.toFixed(4)}` : "Não capturada";
  c.innerHTML = `
    <div class="operacao-item">
      <div class="operacao-grid">
        <div class="grid-item">
          <strong>Início:</strong><br>
          ${a.inicioOperacao}
        </div>
        <div class="grid-item">
          <strong>Fim:</strong><br>
          ${a.fimOperacao}
        </div>
        <div class="grid-item">
          <strong>Quilometragem:</strong><br>
          Inicial: ${a.kmInicial}km<br>
          Final: ${a.kmFinal}km<br>
          Percorrido: ${a.distanciaPercorrida}km
        </div>
        <div class="grid-item">
          <strong>Data/Hora:</strong><br>
          ${a.timestamp}
        </div>
        <div class="grid-item">
          <strong>OP/Aux:</strong><br>
          ${a.nomeOpAux}
        </div>
        <div class="grid-item">
          <strong>Tipo Operação:</strong><br>
          ${a.tipoOperacao}
        </div>
        <div class="grid-item">
          <strong>Cidade:</strong><br>
          ${a.nomeCidade}
        </div>
        <div class="grid-item">
          <strong>Poço/Serviço:</strong><br>
          ${a.nomePocoServ}
        </div>
        <div class="grid-item">
          <strong>Operador:</strong><br>
          ${a.nomeOperador}
        </div>
        <div class="grid-item">
          <strong>Volume:</strong><br>
          ${a.volumeBbl} bbl
        </div>
        <div class="grid-item">
          <strong>Temperatura:</strong><br>
          ${a.temperatura}°C
        </div>
        <div class="grid-item">
          <strong>Pressão:</strong><br>
          ${a.pressao}
        </div>
        <div class="grid-item grid-item-full">
          <strong>Localização:</strong><br>
          ${d}
        </div>
        <div class="grid-item grid-item-full">
          <strong>Descrição:</strong><br>
          ${a.descricaoAtividades}
        </div>
      </div>
      <div class="operacao-actions">
        <button class="btn-excluir" onclick="excluirOperacao('${a.timestamp}')">Excluir</button>
      </div>
    </div>
  `;
  b.insertBefore(c, b.firstChild);
}

function excluirOperacao(a) {
  if (confirm("Tem certeza que deseja excluir esta operação?")) {
    const b = JSON.parse(localStorage.getItem("historicoOperacoes")) || [],
      c = b.filter(b => b.timestamp !== a);
    localStorage.setItem("historicoOperacoes", JSON.stringify(c));
    exibirHistorico();
  }
}

document.addEventListener("DOMContentLoaded", exibirHistorico);

function exibirHistorico() {
  const a = document.getElementById("historicoOperacoes");
  a.innerHTML = "";
  const b = JSON.parse(localStorage.getItem("historicoOperacoes")) || [];
  b.forEach((b, c) => {
    const d = document.createElement("li");
    d.innerHTML = `
      <div class="operacao-item">
        <div class="operacao-info">
          <strong>Data/Hora:</strong> ${b.dataHora}<br>
          <strong>OP/Aux:</strong> ${b.nomeOpAux}<br>
          <strong>Tipo de Operação:</strong> ${b.tipoOperacao}<br>
          <strong>Cidade:</strong> ${b.nomeCidade}<br>
          <strong>Poço/Serviço:</strong> ${b.nomePocoServ}
        </div>
        <button class="btn-excluir" data-index="${c}">Excluir</button>
      </div>
    `;
    a.appendChild(d);
  });
  document.querySelectorAll(".btn-excluir").forEach(a => {
    a.addEventListener("click", function () {
      const a = this.getAttribute("data-index");
      excluirOperacao(a);
    });
  });
}

// Evento para gerar PDF
document.getElementById("gerarPDF")?.addEventListener("click", function () {
  try {
    const doc = new jsPDF();
    const operacoes = JSON.parse(localStorage.getItem("operacoes")) || [];
    const dataAtual = new Date().toLocaleDateString();

    // Configurações do PDF
    const margemEsquerda = 20;
    const margemTopo = 20;
    const espacoLinha = 7;
    let posicaoY = margemTopo;

    // Título do relatório
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Relatório de Operações - ${dataAtual}`, margemEsquerda, posicaoY);
    posicaoY += espacoLinha * 2;

    // Configuração para o conteúdo
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Função auxiliar para adicionar texto com título em negrito
    const adicionarCampo = (titulo, valor) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${titulo}: `, margemEsquerda, posicaoY);
      doc.setFont("helvetica", "normal");

      // Quebra de texto para valores longos
      const texto = valor.toString();
      const linhas = doc.splitTextToSize(texto, 170);
      doc.text(linhas, margemEsquerda + 40, posicaoY);
      posicaoY += linhas.length * espacoLinha;
    };

    // Adiciona cada operação ao PDF
    operacoes.forEach(operacao => {
      // Verifica se precisa de nova página
      if (posicaoY > 250) {
        doc.addPage();
        posicaoY = margemTopo;
      }

      adicionarCampo("Data/Hora Início", operacao.inicioOperacao);
      adicionarCampo("Data/Hora Fim", operacao.fimOperacao);
      adicionarCampo("Quilometragem", `Inicial: ${operacao.kmInicial}km | Final: ${operacao.kmFinal}km | Percorrido: ${operacao.distanciaPercorrida}km`);
      adicionarCampo("OP/Aux", operacao.nomeOpAux);
      adicionarCampo("Tipo de Operação", operacao.tipoOperacao);
      adicionarCampo("Cidade", operacao.nomeCidade);
      adicionarCampo("Poço/Serviço", operacao.nomePocoServ);
      adicionarCampo("Operador", operacao.nomeOperador);
      adicionarCampo("Volume", `${operacao.volumeBbl} bbl`);
      adicionarCampo("Temperatura", `${operacao.temperatura} °C`);
      adicionarCampo("Pressão", `${operacao.pressao} PSI`);

      if (operacao.localizacao) {
        adicionarCampo("Localização", `Lat: ${operacao.localizacao.latitude.toFixed(4)}, Long: ${operacao.localizacao.longitude.toFixed(4)}`);
      }

      adicionarCampo("Descrição", operacao.descricaoAtividades);

      // Adiciona linha separadora entre operações
      posicaoY += espacoLinha;
      doc.setDrawColor(200);
      doc.line(margemEsquerda, posicaoY, 190, posicaoY);
      posicaoY += espacoLinha;
    });

    // Adiciona rodapé com data de geração
    doc.setFontSize(8);
    doc.text(`Relatório gerado em ${dataAtual}`, margemEsquerda, 285);

    // Salva o PDF
    doc.save(`relatorio_operacoes_${dataAtual.replace(/\//g, "-")}.pdf`);

    alert("PDF gerado com sucesso!");
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro ao gerar o PDF. Por favor, tente novamente.");
  }
});

// Função para limpar histórico
document.getElementById("limparHistorico")?.addEventListener("click", function () {
  if (confirm("Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.")) {
    try {
      // Limpa o localStorage
      localStorage.removeItem("operacoes");

      // Limpa a lista de operações na tela
      const historicoElement = document.getElementById("historicoOperacoes");
      if (historicoElement) {
        historicoElement.innerHTML = "<li class=\"sem-operacoes\">Nenhuma operação registrada hoje</li>";
      }

      alert("Histórico limpo com sucesso!");
    } catch (erro) {
      console.error("Erro ao limpar histórico:", erro);
      alert("Erro ao limpar o histórico. Por favor, tente novamente.");
    }
  }
});