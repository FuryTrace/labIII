// Define que o ID só pode ter números e letras maiúsculas
const alfabeto = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const gerarIdCustomizado = customAlphabet(alfabeto, 12); // Tamanho 12

const idCupom = gerarIdCustomizado();
console.log('ID Personalizado:', idCupom);

const API_URL = "http://localhost:3000/cupom";



//import { obterUsuarioLogado } from './servicoUsuario.js';

async function listarCupom() {
    // Lista os Cupons

    const rotaUsuarioLogado = obtemRotaUsuarioLogado();

    const url = `${API_URL}/listar`+rotaUsuarioLogado;

    const res = await fetch(url);  // Chama a função Listar

    // Converte para Jason
    const cupons = await res.json();
    // aponta para a tabela de Cupons no HTML
    const tabela = document.getElementById("tabelaCupons");
    // Limpa a tabela
    tabela.innerHTML = "";

    // Adiciona uma Linha de Cupons
    cupons.forEach(cupom => {
        const row = document.createElement("tr");
        const origemCupom = (cupom.codOrigem == "P") ? "Plataforma" : "Loja";
        const tipoCupom = (cupom.codTipo == "V") ? "Valor"
                        : (cupom.codTipo == "P") ? "Percentual"
                        : (cupom.codTipo == "F") ? "Frete Grátis"
                        : "";
        const periodoValidade = (new Date (cupom.datInicioValidade)).toLocaleString("pt-BR") +"<br>"+(new Date (cupom.datFimValidade)).toLocaleString("pt-BR");

        const situacao = (cupom.indAtivo == 1 ) ? "Ativo" : "Inativo";
        row.innerHTML = `
            <td>${origemCupom}</td>
            <td>${cupom.codDesconto}</td>
            <td>${tipoCupom}</td>
            <td>${periodoValidade}</td>
            <td>${situacao}</td>
            <td class="actions">
            <button onclick="consultarCupom(${cupom.idDesconto})">👁️</button>
            <button onclick="inativarCupom(${cupom.idDesconto},${cupom.indAtivo})">❌</button>
            </td>
        `;
        tabela.appendChild(row);
    });
}


// Função Acionada pelo Botão Buscar
async function buscarCupom() {


    // Obtem os Parâmetros de Pesquisa.

    const codCupom =  document.getElementById("inputCodigoBusca").value;
    const datInicioBusca = document.getElementById("inputDataInicioBusca").value;
    const datFimBusca = document.getElementById("inputDataFimBusca").value; 
 

    const rotaUsuarioLogado = obtemRotaUsuarioLogado();
  
    // Verifica se informou corretamente os padrões de busca.

    // Pelos menos algo tem que ter sido informado.
    if ( (!codCupom  && !datInicioBusca && !datFimBusca)) {
        alert("É necessário ao menos informar o Código do Cupom ou as Datas de Início e de Fim de um período a ser buscado");
        return;
    }

    // Não pode informar o cupom e uma das outras datas    
    if (codCupom  && (datInicioBusca || datFimBusca)) {
        alert("É necessário informar o Código do Cupom ou as Datas de Início e de Fim de um período a ser buscado");
        return;
    }

     
    let url; // Url d Busca
    

    // se Informou uma das datas
   
    if ((datInicioBusca || datFimBusca)) {
        // tem que informar as Duas Datas
        if (datInicioBusca && datFimBusca) {
            if (datInicioBusca < datFimBusca) {
                // Vai chamar a Pesquisa por Período
                url = `${API_URL}/buscarIntervalo/${datInicioBusca}/${datFimBusca}`+rotaUsuarioLogado;

            } else {
                alert("A Data de Início deve ser anterior ou igual a Data de Fim do período a ser buscado");
                return;
            }
        } else {
            alert("É necessário informar as Datas de Início e de Fim de um período a ser buscado");
            return;
        }
    } else { // Informou o código
        // Vai chamar a Pesquisa por Código
        url = `${API_URL}/buscarCodigo/${codCupom}`+rotaUsuarioLogado;

    }


    // Realiza a consulta
    const res = await fetch(url, { method: "GET" });

    if (res.status== 404) {
        alert("Não foram encontrados cupons para os critérios informados.");
        return;

    }
    // Lista os Cupons
    
    // Converte para Jason
    const cupons = await res.json();
    // aponta para a tabela de Cupons no HTML
    const tabela = document.getElementById("tabelaCupons");
    // Limpa a tabela
    tabela.innerHTML = "";

    // Adiciona uma Linha de Cupons
    cupons.forEach(cupom => {
        const row = document.createElement("tr");
        const origemCupom = (cupom.codOrigem == "P") ? "Plataforma" : "Loja";
        const tipoCupom = (cupom.codTipo == "V") ? "Valor"
                        : (cupom.codTipo == "P") ? "Percentual"
                        : (cupom.codTipo == "F") ? "Frete Grátis"
                        : "";
        const periodoValidade = (new Date (cupom.datInicioValidade)).toLocaleString("pt-BR") +"<br>"+(new Date (cupom.datFimValidade)).toLocaleString("pt-BR");

        const situacao = (cupom.indAtivo == 1 ) ? "Ativo" : "Inativo";
        row.innerHTML = `
            <td>${origemCupom}</td>
            <td>${cupom.codDesconto}</td>
            <td>${tipoCupom}</td>
            <td>${periodoValidade}</td>
            <td>${situacao}</td>
            <td class="actions">
            <button onclick="consultarCupom(${cupom.idDesconto})">👁️</button>
            <button onclick="inativarCupom(${cupom.idDesconto})">❌</button>
            </td>
        `;
        tabela.appendChild(row);
    });


}



// Função acionada pelo botão Salvar - irá criar um novo Cupom

async function salvarCupom(e) {

    if (criticaCupom()) { // Realiza as Críticas
    
        //e.preventDefault();

        // Cria json com os dados a seren enviados

        
        const datCriacao = (new Date()).toISOString().slice(0, 19).replace('T', ' ');
        
        const datInicioValidade = document.getElementById("inputDataInicio").value.slice(0, 19).replace('T', ' ');
        const datFimValidade = document.getElementById("inputDataFim").value.slice(0, 19).replace('T', ' ');

        const codOrigem = document.querySelector('input[name="inlineRadioOrigem"]:checked').value;
        const codTipo = document.querySelector('input[name="inlineRadioTipo"]:checked').value;
        const idUsuarioLogado = obtemIdUsuarioLogado();
        const nomUsuarioLogado = obtemNomeUsuarioLogado();


        // Monta o Registro
        const data = {
                    codDesconto : document.getElementById("inputCodigo").value,
                    codNatureza : "C",
                    codOrigem : codOrigem,
                    codTipo : codTipo,
                    valDesconto : document.getElementById("inputValor").value,
                    perDesconto : document.getElementById("inputPercentual").value,
                    datInicioValidade : datInicioValidade.toLocaleString('pt-BR'),
                    datFimValidade: datFimValidade,
                    obsDesconto : document.getElementById("inputObservacao").value,
                    indAtivo : 1,
                    idUsuarioCriacao: idUsuarioLogado,
                    
                    nomUsuarioCriacao: nomUsuarioLogado,

                    datCriacao: datCriacao
        };
        // Se for Loja, obter a Loja do Objeto Logado.

        if (codOrigem == "L") {
            const idLoja = obtemIdLojaUsuarioLogado();
            data.idLoja = idLoja;
        }

        const metodo = "POST"
        const url =  API_URL;
    
        
        try {
            // Simulando uma chamada de API que demora 1 segundo
            const res = await fetch(url, {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                });

            
            if (res.ok) {
                    // Recarrega a Grade a tela
                ocultarFormulario();
                listarCupom();
            } else if (res.status = 401) {
                const resposta = await res.json();
                alert("Inclusão não efetuada. " && resposta.erro);
            } 
    

        //throw new Error('Erro na requisição');
       
        } catch (erro) {
            alert("Inclusão não efetuada. ", erro,message)

        }
       
    }
}

// Consuta um Cupom Individual

async function consultarCupom(idDesconto) {

    // Obtem os dados de um determinado Cupom
    const res = await fetch(`${API_URL}/${idDesconto}`, { method: "GET" });
    const cupom = await res.json();

    console.log(cupom);

    document.getElementById("idDesconto").value = idDesconto;
    document.getElementById("inputCodigo").value = cupom.codDesconto;

    // Loja ou Plataforma
    if (cupom.codOrigem == "P") {
        document.getElementById("inlineRadioPlataforma").checked = true;
        document.getElementById("inlineRadioLoja").checked = false;
    } else {
        document.getElementById("inlineRadioPlataforma").checked = false;
        document.getElementById("inlineRadioLoja").checked = true;
    }

    
    document.getElementById("inlineRadioPercentual").checked = (cupom.codTipo == "P");
    document.getElementById("inlineRadioValor").checked = (cupom.codTipo == "V") ;
    document.getElementById("inlineRadioFrete").checked = (cupom.codTipo == "F") ;

    document.getElementById("inputValor").value = cupom.valDesconto;
    document.getElementById("inputPercentual").value = cupom.perDesconto;

    document.getElementById("inputDataInicio").value = cupom.datInicioValidade.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    document.getElementById("inputDataFim").value = cupom.datFimValidade.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    document.getElementById("inputObservacao").value = cupom.obsDesconto;
    document.getElementById("inputQtdUtilizado").value = cupom.qtdDescontoUtilizado;
    document.getElementById("inputValorUtilizado").value = cupom.valDescontoUtilizado;



    document.getElementById("ckBoxInativo").checked = ( cupom.indAtivo == 0) ;
    document.getElementById("inputCriadoPor").value = cupom.nomUsuarioCriacao;
    if (cupom.datCriacao != null) {
        document.getElementById("inputDataCriacao").value = cupom.datCriacao.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    }
    if (cupom.indAtivo == 0) {
        document.getElementById("inputInativadoPor").value = cupom.nomUsuarioInativacao;
        if (cupom.datInativacao != null) {
            document.getElementById("inputDataInativacao").value = cupom.datInativacao.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
        }
    }

   
    prepararFormularioVisualizarCupom(); 
    exibeTipoDesconto(cupom.codTipo);
    exibirFormulario();

}


// Função que Inativa um cupom.

async function inativarCupom(id,indAtivo) {
    if (indAtivo == 1) {
        if (confirm("Deseja inativar este cupom?")) {

            // Obtem a data/hora e quem está inativando o cupom.
            const datInativacao = (new Date()).toISOString().slice(0, 19).replace('T', ' ');
            
            const idUsuarioLogado = obtemIdLojaUsuarioLogado();
            const nomUsuarioLogado = obtemNomeUsuarioLogado();
            
            const data = {

                        idUsuarioInativacao : idUsuarioLogado,
                        nomUsuarioInativacao : nomUsuarioLogado,
                        datInativacao: datInativacao
            }
            const metodo = "DELETE"
            const url =  `${API_URL}/${id}`;

                await fetch(url, {
                    method: metodo,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
            });
            listarCupom();
        }
    } else {
        alert("Este cupom já está inativado!")
    }

}

// Prepara o Formulário para a Visualização (e não a criação) de um Cupom

function prepararFormularioVisualizarCupom() {
    document.getElementById("lblNovoCupom").hidden = true;
    document.getElementById("lblVisualizarCupom").hidden = false;
    document.getElementById("btnCancelarCupom").hidden = true;
    document.getElementById("btnSalvarCupom").hidden = true;
    document.getElementById("btnRetornarCupom").hidden = false;
    document.getElementById("divAtivo").classList.replace("col-md-3", "col-md-6");


    // Desabilita os campos de edição da tela
    document.getElementById("inputCodigo").disabled = true;
    document.getElementById("inlineRadioPercentual").disabled = true;
    document.getElementById("inlineRadioValor").disabled = true;
    document.getElementById("inlineRadioFrete").disabled = true;
    document.getElementById("inputPercentual").disabled = true;
    document.getElementById("inputValor").disabled = true;
    document.getElementById("inputDataInicio").disabled = true;
    document.getElementById("inputDataFim").disabled = true;
    document.getElementById("inputObservacao").disabled = true;

    document.getElementById("areaControle").hidden = false;
    
}


// Prepara o Formulário para ser Editável.
function prepararFormularioCriarCupom() {
    document.getElementById("lblNovoCupom").hidden = false;
    document.getElementById("lblVisualizarCupom").hidden = true;

    // Habilita os campos de edição da tela

    document.getElementById("inputCodigo").disabled = false;
    document.getElementById("inlineRadioPercentual").disabled = false;
    document.getElementById("inlineRadioValor").disabled = false;
    document.getElementById("inlineRadioFrete").disabled = false;
    document.getElementById("inputPercentual").disabled = false;
    document.getElementById("inputValor").disabled = false;
    document.getElementById("inputDataInicio").disabled = false;
    document.getElementById("inputDataFim").disabled = false;
    document.getElementById("inputObservacao").disabled = false;

    document.getElementById("btnCancelarCupom").hidden = false;
    document.getElementById("btnSalvarCupom").hidden = false;
    document.getElementById("btnRetornarCupom").hidden = true;
    document.getElementById("divAtivo").classList.replace("col-md-6", "col-md-3");

    // Marca o Tipo de Desconto Percentual como "Default"

    document.getElementById("inlineRadioPercentual").checked = true;
    exibeTipoDesconto("P");
    document.getElementById("areaControle").hidden = true;
}       

// Exibe ou oculta os campos de Valor ou de Percentual, de acordo com o Tipo do Desconto.
function exibeTipoDesconto(tipoDesconto) {
    document.getElementById("divPercentual").hidden = (tipoDesconto != "P");

    document.getElementById("divValor").hidden = (tipoDesconto != "V");
}


// Oculta a área de lista e exibe a área de Formulário
function exibirFormulario() {

    document.getElementById("areaEdicao").hidden = false
    document.getElementById("areaLista").hidden = true
}


// Oculta a área de formulário e exibe a área de lista
function ocultarFormulario() {
    document.getElementById("areaEdicao").hidden = true
    document.getElementById("areaLista").hidden = false
}

// Limpa os valores dos Inputs dos campos do Formuário.
function limparCamposFormulario() {
    document.getElementById("idDesconto").value = 0;
    document.getElementById("inlineRadioLoja").checked = false;
    document.getElementById("inlineRadioPlataforma").checked = false;
    
    document.getElementById("inputCodigo").value = "";
    document.getElementById("inlineRadioPercentual").checked = false;
    document.getElementById("inlineRadioValor").checked = false;
    document.getElementById("inlineRadioFrete").checked = false;
    document.getElementById("inputPercentual").value = "";
    document.getElementById("inputValor").value = "";
    document.getElementById("inputDataInicio").value = "";
    document.getElementById("inputDataFim").value = "";
    document.getElementById("inputObservacao").value = "";

    document.getElementById("inputCriadoPor").value = "";
    document.getElementById("inputDataCriacao").value = "";
    document.getElementById("inputInativadoPor").value = "";
    document.getElementById("inputDataInativacao").value = "";
    document.getElementById("ckBoxInativo").checked = false;

}


// Marca o Rádio Button de Plataforma ou de Loja.
function selecionarOrigem(codOrigem) {

// Loja ou Plataforma
    if (codOrigem == "P") {
        document.getElementById("inlineRadioPlataforma").checked = true;
        document.getElementById("inlineRadioLoja").checked = false;
    } else {
        document.getElementById("inlineRadioPlataforma").checked = false;
        document.getElementById("inlineRadioLoja").checked = true;
    }
}


// Função chama 
function novoCupom() {
   
    limparCamposFormulario();

    document.getElementById("idDesconto").value = 0; // Preciosismo

    prepararFormularioCriarCupom(); 

    selecionarOrigem( obtemOrigemUsuarioLogado());
    exibirFormulario();
    
}


// Efatua as críticas de negócio para criação de cupom
function criticaCupom() {

    // Testa a Origem do Cupom 
    if ( ! document.getElementById("inlineRadioLoja").checked && ! document.getElementById("inlineRadioPlataforma").checked ) {
        alert("É obrigatório identificar se é um cupom de loja ou de plataforma.");
        return false;
    }


    // Verifica se o código foi Informado
    if (document.getElementById("inputCodigo").value == "") {
        alert("É obrigatório informar um código para o Cupom.");
        return false;
    }

    const codDesconto = document.getElementById("inputCodigo").value;
    if ((codDesconto.length >= 4) && codDesconto.substring(0,3).toUpperCase() == 'VCHR') {
        alert("Um cupom não pode começar com o código reservado a um voucher. Prefixo VCHR não permitido.");
        return false;
        
    }



    // Verifica se o Tipo foi selecionado
    if ( ! document.getElementById("inlineRadioPercentual").checked && ! document.getElementById("inlineRadioValor").checked && ! document.getElementById("inlineRadioFrete").checked ) {
        alert("É obrigatório identificar se é o cupom é Percentual, Valor ou Frete Grátis.");
        return false;
    }


    // Verifica se é do Tipo Percentual
    if (document.getElementById("inlineRadioPercentual").checked) {
        if (document.getElementById("inputPercentual").value  == "" ) {
            alert("É obrigatório informar um percentual para cupons do tipo percentual.");
            return false;
        }
        const percentual = Number(document.getElementById("inputPercentual").value);
        if (percentual == 0 ) {
            alert("É obrigatório informar um percentual para cupons do tipo percentual.");
            return false;
        }
        if (percentual > 60) {
            alert("O valor do percentual não pode exceder os 60%.");
            return false;
        }



    }
    
    // Cupom do tipo Valor
    if (document.getElementById("inlineRadioValor").checked) {
        if (document.getElementById("inputValor").value  == "" ) {
            alert("É obrigatório informar um valor para cupons do tipo valor.");
            return false;
        }
        const valor = Number(document.getElementById("inputValor").value);
        if (valor  == 0 ) {
            alert("É obrigatório informar um valor para cupons do tipo valor.");
            return false;
        }
        if (valor > 20) {
            alert("O valor do cupom não pode exceder os R$ 20,00.");
            return false;
        }
    }

    // Verificando as Datas de Início e de Fim
    if (! document.getElementById("inputDataInicio").value ){
        alert("É obrigatório informar a data de início de validade do cupom.");
        return false;

    }
    if (! document.getElementById("inputDataFim").value ){
        alert("É obrigatório informar a data de fim de validade do cupom.");
        return false;

    }

    const dataInicio = new Date(document.getElementById("inputDataInicio").value);
    const dataFim = new Date(document.getElementById("inputDataFim").value);

    if (dataInicio < new Date()) {
        alert("A data de início não pode ser retroativa a este momento.");
        return false;
    }

    if (dataFim <= dataInicio) {
        alert("A data de final deve ser posterior a data inicial.");
        return false;
    }

    const msPorDia = 1000 * 60 * 60 * 24; // Quantidade de Milisegundos em um dia

    const diferencaMs = new Date(dataFim) - new Date(dataInicio); // Obtem a dirença em dias em Milisegundos

    const diferencaEmDias = Math.floor(diferencaMs / msPorDia); // Calcula a direença em dias.
    if (diferencaEmDias > 60) {
        alert("O período não pode ser superior a 60 dias.");
        return false;
    }
   

    // Testa a Observação

    if (! document.getElementById("inputObservacao").value ){
        alert("É obrigatório informar uma observação descrevento o motipo pelo qual este cupom está sendo criado.");
        return false;
    }

    return true;

}

function exibeUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    if (usuarioLogado.tipo == "Loja") {
        document.getElementById("lblUsuario").textContent = usuarioLogado.tipo+" "+usuarioLogado.idLoja +": "+usuarioLogado.nome;
    } else {
        document.getElementById("lblUsuario").textContent = usuarioLogado.tipo +": "+usuarioLogado.nome;
    }

    
}


function obtemOrigemUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    if (usuarioLogado.tipo == "Loja") {
        return "L";
    } else if (usuarioLogado.tipo == "Plataforma") {
        return "P";
    } else {
        alert("Usuário de tipo não autorizado: "+usuarioLogado.tipo);
        return "";
    }
}

function obtemNomeUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    return usuarioLogado.nome;
}

function obtemIdUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    return usuarioLogado.id;
}

function obtemIdLojaUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    return usuarioLogado.idLoja;
}

function obtemRotaUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
  
    if (usuarioLogado.tipo == "Plataforma") {
        return "/P/0";
    } else if (usuarioLogado.tipo == "Loja") { // Loja
        return "/L/"+usuarioLogado.idLoja;
    } else {
        return "";
    }
}

// Função gerada pelo Gemini
// Calcula a diferença em dias para duas datas

function diferencaEmDias(dataInicial, dataFinal) {
  const msPorDia = 1000 * 60 * 60 * 24;

  const diferencaMs = new Date(dataFinal) - new Date(dataInicial);

  return Math.floor(diferencaMs / msPorDia);
}


//document.getElementById("clienteForm").addEventListener("submit", salvarCliente);
listarCupom();
exibeUsuarioLogado();


 
  