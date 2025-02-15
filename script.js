const { jsPDF } = window.jspdf; let localizacaoCapturada = null, horaInicio = null; const hamburger = document.querySelector(".hamburger"), navMenu = document.querySelector(".nav-menu"); hamburger.addEventListener("click", () => { hamburger.classList.toggle("active"), navMenu.classList.toggle("active") }), document.querySelectorAll(".nav-menu a").forEach(a => a.addEventListener("click", () => { hamburger.classList.remove("active"), navMenu.classList.remove("active") })), document.getElementById("capturarLocalizacao")?.addEventListener("click", function () { navigator.geolocation ? navigator.geolocation.getCurrentPosition(function (a) { const b = a.coords.latitude, c = a.coords.longitude, d = new Date().toLocaleString(); localizacaoCapturada = { latitude: b, longitude: c, hora: d }, alert(`Localização capturada: Latitude ${b}, Longitude ${c} às ${d}`) }, function (a) { alert("Erro ao capturar localiza\xE7\xE3o: " + a.message) }) : alert("Geolocaliza\xE7\xE3o n\xE3o \xE9 suportada por este navegador.") }), document.getElementById("marcarInicio")?.addEventListener("click", function () { const a = new Date; horaInicio = a; const b = formatarDataHoraLocal(a); document.getElementById("inicioOperacao").value = b; const c = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm textarea"); c.forEach(a => a.removeAttribute("disabled")), this.disabled = !0 }), document.getElementById("operacaoForm")?.addEventListener("submit", function (a) { a.preventDefault(); const b = new Date, c = formatarDataHoraLocal(b); document.getElementById("fimOperacao").value = c; const d = document.getElementById("kmInicial").value, e = document.getElementById("kmFinal").value, f = { inicioOperacao: document.getElementById("inicioOperacao").value, kmInicial: d, nomeOpAux: document.getElementById("nomeOpAux").value, tipoOperacao: document.getElementById("tipoOperacao").value, nomeCidade: document.getElementById("nomeCidade").value, nomePocoServ: document.getElementById("nomePocoServ").value, nomeOperador: document.getElementById("nomeOperador").value, volumeBbl: document.getElementById("volumeBbl").value, temperatura: document.getElementById("temperatura").value, pressao: document.getElementById("pressao").value, descricaoAtividades: document.getElementById("descricaoAtividades").value, fimOperacao: c, kmFinal: e, distanciaPercorrida: e - d, timestamp: new Date().toLocaleString(), localizacao: localizacaoCapturada }; salvarOperacao(f), adicionarOperacaoAoHistorico(f), this.reset(), document.getElementById("marcarInicio").disabled = !1; const g = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm textarea"); g.forEach(a => a.setAttribute("disabled", "disabled")), localizacaoCapturada = null }); function carregarOperacoesDoDia() {
    const a = JSON.parse(localStorage.getItem("operacoes")) || [], b = new Date().toLocaleDateString(), c = a.filter(a => { const c = new Date(a.timestamp).toLocaleDateString(); return c === b }), d = document.getElementById("historicoOperacoes"); if (d) return d.innerHTML = "", 0 === c.length ? void (d.innerHTML = "<li class=\"sem-operacoes\">Nenhuma opera\xE7\xE3o registrada hoje</li>") : void c.forEach(a => {
        const b = document.createElement("li"); let c = a.localizacao ? `Lat: ${a.localizacao.latitude.toFixed(4)}, Long: ${a.localizacao.longitude.toFixed(4)}` : "N\xE3o capturada"; b.innerHTML = `
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
        `, d.appendChild(b)
    })
} function salvarOperacao(a) { let b = JSON.parse(localStorage.getItem("operacoes")) || []; b.push(a), localStorage.setItem("operacoes", JSON.stringify(b)) } function formatarDataHoraLocal(a) { const b = a => a.toString().padStart(2, "0"); return `${a.getFullYear()}-${b(a.getMonth() + 1)}-${b(a.getDate())}T${b(a.getHours())}:${b(a.getMinutes())}` } document.addEventListener("DOMContentLoaded", function () { const a = document.querySelectorAll("#operacaoForm input:not(#inicioOperacao), #operacaoForm textarea"); a?.forEach(a => a.setAttribute("disabled", "disabled")), document.getElementById("historicoOperacoes") && carregarOperacoesDoDia() }), document.getElementById("gerarPDF")?.addEventListener("click", function () { const a = new jsPDF, b = JSON.parse(localStorage.getItem("operacoes")) || [], c = new Date().toLocaleDateString(), d = 20, e = 20, f = 15; let g = e; a.setFontSize(16), a.setFont("helvetica", "bold"), a.text(`Relatório de Operações - ${c}`, d, g), g += f, a.setFontSize(10), a.setFont("helvetica", "normal"), b.forEach(b => { 250 < g && (a.addPage(), g = e); const c = (b, c) => { a.setFont("helvetica", "bold"), a.text(`${b}: `, d, g), a.setFont("helvetica", "normal"); const e = c.toString(), f = a.splitTextToSize(e, 170); a.text(f, d + 40, g), g += f.length * 7 }; c("Data/Hora In\xEDcio", b.inicioOperacao), c("Data/Hora Fim", b.fimOperacao), c("Quilometragem", `Inicial: ${b.kmInicial}km | Final: ${b.kmFinal}km | Percorrido: ${b.distanciaPercorrida}km`), c("OP/Aux", b.nomeOpAux), c("Tipo de Opera\xE7\xE3o", b.tipoOperacao), c("Cidade", b.nomeCidade), c("Po\xE7o/Servi\xE7o", b.nomePocoServ), c("Operador", b.nomeOperador), c("Volume", `${b.volumeBbl} bbl`), c("Temperatura", `${b.temperatura} °C`), c("Press\xE3o", `${b.pressao} PSI`), b.localizacao && c("Localiza\xE7\xE3o", `Lat: ${b.localizacao.latitude.toFixed(4)}, Long: ${b.localizacao.longitude.toFixed(4)}`), c("Descri\xE7\xE3o", b.descricaoAtividades), g += 5, a.setDrawColor(200), a.line(d, g, 190, g), g += f }), a.setFontSize(8), a.text(`Relatório gerado em ${c}`, d, 285), a.save(`relatorio_operacoes_${c.replace(/\//g, "-")}.pdf`) }); function adicionarOperacaoAoHistorico(a) {
    const b = document.getElementById("historicoOperacoes"), c = document.createElement("li"); let d = a.localizacao ? `Lat: ${a.localizacao.latitude.toFixed(4)}, Long: ${a.localizacao.longitude.toFixed(4)}` : "N\xE3o capturada"; c.innerHTML = `
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
    `, b.insertBefore(c, b.firstChild)
} function excluirOperacao(a) { if (confirm("Tem certeza que deseja excluir esta opera\xE7\xE3o?")) { const b = JSON.parse(localStorage.getItem("historicoOperacoes")) || [], c = b.filter(b => b.timestamp !== a); localStorage.setItem("historicoOperacoes", JSON.stringify(c)), exibirHistorico() } } document.addEventListener("DOMContentLoaded", exibirHistorico); function exibirHistorico() {
    const a = document.getElementById("historicoOperacoes"); a.innerHTML = ""; const b = JSON.parse(localStorage.getItem("historicoOperacoes")) || []; b.forEach((b, c) => {
        const d = document.createElement("li"); d.innerHTML = `
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
        `, a.appendChild(d)
    }), document.querySelectorAll(".btn-excluir").forEach(a => { a.addEventListener("click", function () { const a = this.getAttribute("data-index"); excluirOperacao(a) }) })
}