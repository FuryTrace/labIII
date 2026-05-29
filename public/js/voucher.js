const API_URL = "http://localhost:3000/voucher";

const API_URL_CLIENTE = "http://localhost:3000/cliente";

// Função Obtem a Lista de Clientes cadastrados.

async function obterListaDeCliente() {
    const url = `${API_URL_CLIENTE}/listar`;

    try {
        const res = await fetch(url);

        // Verifica se a API respondeu com status de sucesso (200-299)
        if (!res.ok) {
            throw new Error(`Erro na requisição: Status ${res.status}`);
        }

        // Converte para JSON
        const clientes = await res.json();
        return clientes;

    } catch (erro) {
        console.error("Falha ao obter lista de clientes:", erro);
        // Retorna um array vazio para evitar que o forEach da próxima função quebre
        return []; 
    }
}

// Carrega o Combo de Cliente do Formulário de Criação de Voucher

async function carregarComboClienteFormularioCriarVoucher() {
    const clientes = await obterListaDeCliente();
 

    const select = document.getElementById('inputCmbCliente');
    
    // Garantia: Se o elemento não existir no HTML, o código não quebra
    if (!select) {
        console.error("Elemento 'inputCmbCliente' não foi encontrado na página.");
        return;
    }

    // Limpa opções antigas (evita duplicar caso a função rode mais de uma vez)
    select.innerHTML = '<option value="">Selecione um cliente...</option>';

    // Usando um Fragment para atualizar o HTML de uma vez só (Melhor performance)
    const fragmento = document.createDocumentFragment();

    clientes.forEach((cliente) => {
        const novaOpcao = document.createElement('option');
        novaOpcao.value = cliente.idCliente;
        novaOpcao.textContent = cliente.nome;
        
        fragmento.appendChild(novaOpcao);
    });

    // Adiciona todos os clientes no select de uma só vez
    select.appendChild(fragmento);
}


// Carrega o Combo de Cliente do Formulário Formulário Principal

async function carregarComboClienteBusca() {
    const clientes = await obterListaDeCliente();
 
    const select = document.getElementById('inputCmbClienteBusca');
    

    // Limpa opções antigas (evita duplicar caso a função rode mais de uma vez)
    select.innerHTML = '<option value="">Selecione um cliente...</option>';

    // Usando um Fragment para atualizar o HTML de uma vez só (Melhor performance)
    const fragmento = document.createDocumentFragment();

    clientes.forEach((cliente) => {
        const novaOpcao = document.createElement('option');
        novaOpcao.value = cliente.idCliente;
        novaOpcao.textContent = cliente.nome;
        
        fragmento.appendChild(novaOpcao);
    });

    // Adiciona todos os clientes no select de uma só vez
    select.appendChild(fragmento);
}


async function obtemCliente (idCliente) {
    const url = `${API_URL_CLIENTE}/obter/` + idCliente;

    try {
        const res = await fetch(url);

        // Verifica se a API respondeu com status de sucesso (200-299)
        if (!res.ok) {
            throw new Error(`Erro na requisição: Status ${res.status}`);
        }

        // Converte para JSON
        const clientes = await res.json();

        return clientes;

    } catch (erro) {
        console.error("Falha ao obter lista de clientes:", erro);
        // Retorna um array vazio para evitar que o forEach da próxima função quebre
        return []; 
    }

}



// Define que o ID só pode ter números e letras maiúsculas
//const alfabeto = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//const gerarIdCustomizado = customAlphabet(alfabeto, 12); // Tamanho 12

//const idCupom = gerarIdCustomizado();
//console.log('ID Personalizado:', idCupom);

//import { obterUsuarioLogado } from './servicoUsuario.js';

async function listarVoucher() {
    // Lista os Vouchers

    const rotaUsuarioLogado = obtemRotaUsuarioLogado();

    const url = `${API_URL}/listar`+rotaUsuarioLogado;

    const res = await fetch(url);  // Chama a função Listar

    // Converte para Jason
    const vouchers = await res.json();
    // aponta para a tabela de Vouchers no HTML
    const tabela = document.getElementById("tabelaVouchers");
    // Limpa a tabela
    tabela.innerHTML = "";

    // Adiciona uma Linha de Vouchers
    for (const voucher of vouchers) {
    //vouchers.forEach(voucher => {
        const row = document.createElement("tr");
        const origemVoucher = (voucher.codOrigem == "P") ? "Plataforma" : "Loja";

        const cliente = await obtemCliente(voucher.idCliente);


        const tipoVoucher = (voucher.codTipo == "V") ? "Valor"
                        : (voucher.codTipo == "P") ? "Percentual"
                        : "";


    
        const periodoValidade = (new Date (voucher.datInicioValidade)).toLocaleString("pt-BR") +"<br>"+(new Date (voucher.datFimValidade)).toLocaleString("pt-BR");

        const situacao = (voucher.indAtivo == 1 ) ? "Ativo" : "Inativo";
        row.innerHTML = `
            <td>${origemVoucher}</td>
            <td>${cliente.nome}</td>
            <td>${voucher.codDesconto}</td>
            <td>${tipoVoucher}</td>
            <td>${periodoValidade}</td>
            <td>${situacao}</td>
            <td class="actions">
            <button onclick="consultarVoucher(${voucher.idDesconto})">👁️</button>
            <button onclick="inativarVoucher(${voucher.idDesconto},${voucher.indAtivo})">❌</button>
            </td>
        `;
        tabela.appendChild(row);
    };
}


// Função Acionada pelo Botão Buscar
async function buscarVoucher() {


    // Obtem os Parâmetros de Pesquisa.

    const codVoucher =  document.getElementById("inputCodigoBusca").value;
    const idCliente =   document.getElementById("inputCmbClienteBusca").value;
    
    const datInicioBusca = document.getElementById("inputDataInicioBusca").value;
    const datFimBusca = document.getElementById("inputDataFimBusca").value; 
 

    const rotaUsuarioLogado = obtemRotaUsuarioLogado();
  
    // Verifica se informou corretamente os padrões de busca.

    // Pelos menos algo tem que ter sido informado.
    if ( (!codVoucher  && !datInicioBusca && !datFimBusca)) {
        alert("É necessário ao menos informar o Código do Voucher ou as Datas de Início e de Fim de um período a ser buscado");
        return;
    }

    // Não pode informar o voucher e uma das outras datas    
    if (codVoucher  && (datInicioBusca || datFimBusca)) {
        alert("É necessário informar o Código do Voucher ou as Datas de Início e de Fim de um período a ser buscado");
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
        url = `${API_URL}/buscarCodigo/${codVoucher}`+rotaUsuarioLogado;

    }


    // Realiza a consulta
    const res = await fetch(url, { method: "GET" });

    if (res.status== 404) {
        alert("Não foram encontrados vouchers para os critérios informados.");
        return;

    }
    // Lista os Vouchers
    
    // Converte para Jason
    const vouchers = await res.json();
    // aponta para a tabela de Vouchers no HTML
    const tabela = document.getElementById("tabelaVouchers");
    // Limpa a tabela
    tabela.innerHTML = "";

    // Adiciona uma Linha de Vouchers
    vouchers.forEach(voucher => {
        const row = document.createElement("tr");
        const origemVoucher = (voucher.codOrigem == "P") ? "Plataforma" : "Loja";
        const tipoVoucher = (voucher.codTipo == "V") ? "Valor"
                        : (voucher.codTipo == "P") ? "Percentual"
                        
                        : "";
        const periodoValidade = (new Date (voucher.datInicioValidade)).toLocaleString("pt-BR") +"<br>"+(new Date (voucher.datFimValidade)).toLocaleString("pt-BR");

        const situacao = (voucher.indAtivo == 1 ) ? "Ativo" : "Inativo";
        row.innerHTML = `
            <td>${origemVoucher}</td>
            <td>${voucher.codDesconto}</td>
            <td>${tipoVoucher}</td>
            <td>${periodoValidade}</td>
            <td>${situacao}</td>
            <td class="actions">
            <button onclick="consultarVoucher(${voucher.idDesconto})">👁️</button>
            <button onclick="inativarVoucher(${voucher.idDesconto})">❌</button>
            </td>
        `;
        tabela.appendChild(row);
    });


}



// Função acionada pelo botão Salvar - irá criar um novo Voucher

async function salvarVoucher(e) {

    if (criticaVoucher()) { // Realiza as Críticas
    
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
                    codNatureza : "V",
                    codOrigem : codOrigem,
                    codTipo : codTipo,
                    valDesconto : document.getElementById("inputValor").value,
                    perDesconto : document.getElementById("inputPercentual").value,
                    datInicioValidade : datInicioValidade.toLocaleString('pt-BR'),
                    datFimValidade: datFimValidade,
                    obsDesconto : document.getElementById("inputObservacao").value,
                    idCliente: document.getElementById("inputCmbCliente").value,
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
                listarVoucher();
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

// Consuta um Voucher Individual

async function consultarVoucher(idDesconto) {

    // Obtem os dados de um determinado Voucher
    const res = await fetch(`${API_URL}/${idDesconto}`, { method: "GET" });
    const voucher = await res.json();


    document.getElementById("idDesconto").value = idDesconto;
    document.getElementById("inputCodigo").value = voucher.codDesconto;

    // Loja ou Plataforma
    if (voucher.codOrigem == "P") {
        document.getElementById("inlineRadioPlataforma").checked = true;
        document.getElementById("inlineRadioLoja").checked = false;
    } else {
        document.getElementById("inlineRadioPlataforma").checked = false;
        document.getElementById("inlineRadioLoja").checked = true;
    }

    
    document.getElementById("inlineRadioPercentual").checked = (voucher.codTipo == "P");
    document.getElementById("inlineRadioValor").checked = (voucher.codTipo == "V") ;


    document.getElementById("inputValor").value = voucher.valDesconto;
    document.getElementById("inputPercentual").value = voucher.perDesconto;

    const cliente = await obtemCliente(voucher.idCliente);

    document.getElementById("inputCliente").value = cliente.nome;




    document.getElementById("inputDataInicio").value = voucher.datInicioValidade.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    document.getElementById("inputDataFim").value = voucher.datFimValidade.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    document.getElementById("inputObservacao").value = voucher.obsDesconto;
    document.getElementById("inputQtdUtilizado").value = voucher.qtdDescontoUtilizado;
    document.getElementById("inputValorUtilizado").value = voucher.valDescontoUtilizado;


   
    document.getElementById("ckBoxInativo").checked = ( voucher.indAtivo == 0) ;
    document.getElementById("inputCriadoPor").value = voucher.nomUsuarioCriacao;
    if (voucher.datCriacao != null) {
        document.getElementById("inputDataCriacao").value = voucher.datCriacao.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
    }
    if (voucher.indAtivo == 0) {
        document.getElementById("inputInativadoPor").value = voucher.nomUsuarioInativacao;
        if (voucher.datInativacao != null) {
            document.getElementById("inputDataInativacao").value = voucher.datInativacao.toLocaleString('pt-BR').replace(' ', 'T').substring(0, 16);
        }
    }

   
    prepararFormularioVisualizarVoucher(); 
    exibeTipoDesconto(voucher.codTipo);
    exibirFormulario();

}


// Função que Inativa um voucher.

async function inativarVoucher(id,indAtivo) {
    if (indAtivo == 1) {
        if (confirm("Deseja inativar este voucher?")) {

            // Obtem a data/hora e quem está inativando o voucher.
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
            listarVoucher();
        }
    } else {
        alert("Este voucher já está inativado!")
    }

}

// Prepara o Formulário para a Visualização (e não a criação) de um Voucher

function prepararFormularioVisualizarVoucher() {
    document.getElementById("lblNovoVoucher").hidden = true;
    document.getElementById("lblVisualizarVoucher").hidden = false;
    document.getElementById("btnCancelarVoucher").hidden = true;
    document.getElementById("btnSalvarVoucher").hidden = true;
    document.getElementById("btnRetornarVoucher").hidden = false;
    document.getElementById("divAtivo").classList.replace("col-md-3", "col-md-6");


    // Desabilita os campos de edição da tela
    //document.getElementById("inputCodigo").disabled = true;

    // Esconde o Combo e Exibe o Input
    document.getElementById("inputCmbCliente").hidden = true;
    document.getElementById("inputCliente").hidden = false;
    


    document.getElementById("inlineRadioPercentual").disabled = true;
    document.getElementById("inlineRadioValor").disabled = true;
    
    document.getElementById("inputPercentual").disabled = true;
    document.getElementById("inputValor").disabled = true;
    document.getElementById("inputDataInicio").disabled = true;
    document.getElementById("inputDataFim").disabled = true;
    document.getElementById("inputObservacao").disabled = true;

    document.getElementById("areaControle").hidden = false;
    
}


// Prepara o Formulário para ser Editável.
function prepararFormularioCriarVoucher() {
    document.getElementById("lblNovoVoucher").hidden = false;
    document.getElementById("lblVisualizarVoucher").hidden = true;

    // Habilita os campos de edição da tela

    // Campo de Código é gerado automaticamente.
    // document.getElementById("inputCodigo").disabled = false;

    // Exibe o Combo e Esconde o Input
    document.getElementById("inputCmbCliente").hidden = false;
    document.getElementById("inputCliente").hidden = true;


    document.getElementById("inlineRadioPercentual").disabled = false;
    document.getElementById("inlineRadioValor").disabled = false;
    
    document.getElementById("inputPercentual").disabled = false;
    document.getElementById("inputValor").disabled = false;
    document.getElementById("inputDataInicio").disabled = false;
    document.getElementById("inputDataFim").disabled = false;
    document.getElementById("inputObservacao").disabled = false;

    document.getElementById("btnCancelarVoucher").hidden = false;
    document.getElementById("btnSalvarVoucher").hidden = false;
    document.getElementById("btnRetornarVoucher").hidden = true;
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
    
    document.getElementById("inputCmbCliente").value = "";
    document.getElementById("inputCliente").value = "";


    document.getElementById("inputCodigo").value = "";
    document.getElementById("inlineRadioPercentual").checked = false;
    document.getElementById("inlineRadioValor").checked = false;
   
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


async function geraIdVoucher() {
    const url = `${API_URL}/gerarCodigoVoucher`;

    // Realiza a consulta
    const res = await fetch(url, { method: "GET" });

    const voucher = await res.json();

    document.getElementById("inputCodigo").value = voucher.codDesconto;
  

}

// Função chama 
async function novoVoucher() {
   
    limparCamposFormulario();

    document.getElementById("idDesconto").value = 0; // Preciosismo

    prepararFormularioCriarVoucher(); 

    
    await geraIdVoucher();
    await  carregarComboClienteFormularioCriarVoucher();

    selecionarOrigem( obtemOrigemUsuarioLogado());
    exibirFormulario();
    
}


// Efatua as críticas de negócio para criação de voucher
function criticaVoucher() {

    // Testa a Origem do Voucher 
    if ( ! document.getElementById("inlineRadioLoja").checked && ! document.getElementById("inlineRadioPlataforma").checked ) {
        alert("É obrigatório identificar se é um voucher de loja ou de plataforma.");
        return false;
    }

    // Verifica se o Cliente foi Informado

        
    if (document.getElementById("inputCmbCliente").value == "") {
        alert("É obrigatório selecionar um cliente para criar o Voucher.");
        return false;
    }




    // Verifica se o código foi Informado
    if (document.getElementById("inputCodigo").value == "") {
        alert("É obrigatório informar um código para o Voucher.");
        return false;
    }

    const codDesconto = document.getElementById("inputCodigo").value;
    if ((codDesconto.length >= 4) && codDesconto.substring(0,3).toUpperCase() == 'VCHR') {
        alert("Um voucher não pode começar com o código reservado a um voucher. Prefixo VCHR não permitido.");
        return false;
        
    }



    // Verifica se o Tipo foi selecionado
    if ( ! document.getElementById("inlineRadioPercentual").checked && ! document.getElementById("inlineRadioValor").checked) {
        alert("É obrigatório identificar se é o voucher é Percentual ou Valor.");
        return false;
    }


    // Verifica se é do Tipo Percentual
    if (document.getElementById("inlineRadioPercentual").checked) {
        if (document.getElementById("inputPercentual").value  == "" ) {
            alert("É obrigatório informar um percentual para vouchers do tipo percentual.");
            return false;
        }
        const percentual = Number(document.getElementById("inputPercentual").value);
        if (percentual == 0 ) {
            alert("É obrigatório informar um percentual para vouchers do tipo percentual.");
            return false;
        }
        if (percentual > 60) {
            alert("O valor do percentual não pode exceder os 60%.");
            return false;
        }

    }
    
    // Voucher do tipo Valor
    if (document.getElementById("inlineRadioValor").checked) {
        if (document.getElementById("inputValor").value  == "" ) {
            alert("É obrigatório informar um valor para vouchers do tipo valor.");
            return false;
        }
        const valor = Number(document.getElementById("inputValor").value);
        if (valor  == 0 ) {
            alert("É obrigatório informar um valor para vouchers do tipo valor.");
            return false;
        }

        /* Voucher não tem limite de Valor.
        if (valor > 20) {
            alert("O valor do voucher não pode exceder os R$ 20,00.");
            return false;
        }
        */
    }

    // Verificando as Datas de Início e de Fim
    if (! document.getElementById("inputDataInicio").value ){
        alert("É obrigatório informar a data de início de validade do voucher.");
        return false;

    }
    if (! document.getElementById("inputDataFim").value ){
        alert("É obrigatório informar a data de fim de validade do voucher.");
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
        alert("É obrigatório informar uma observação descrevento o motipo pelo qual este voucher está sendo criado.");
        return false;
    }

    return true;

}

function exibeUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    if (usuarioLogado.tipo == "Loja") {
        document.getElementById("lblUsuario").textContent = usuarioLogado.tipo+" "+usuarioLogado.idLoja +": "+usuarioLogado.nome;
    } else if (usuarioLogado.tipo == "Cliente") {
        document.getElementById("lblUsuario").textContent = usuarioLogado.tipo+" "+usuarioLogado.idCliente +": "+usuarioLogado.nome;
    } {
        document.getElementById("lblUsuario").textContent = usuarioLogado.tipo +": "+usuarioLogado.nome;
    }

    
}


function obtemOrigemUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    if (usuarioLogado.tipo == "Loja") {
        return "L";
    } else if (usuarioLogado.tipo == "Plataforma") {
        return "P";
    } else if (usuarioLogado.tipo == "Cliente") {
        return "C";
    } else{
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

function obtemIdClienteUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
    return usuarioLogado.idCliente;
}


function obtemRotaUsuarioLogado() {
    const usuarioLogado = obterUsuarioLogado();
  
    if (usuarioLogado.tipo == "Plataforma") {
        return "/P/0";
    } else if (usuarioLogado.tipo == "Loja") { // Loja
        return "/L/"+usuarioLogado.idLoja;
    } else if (usuarioLogado.tipo == "Cliente") { // Loja
        return "/C/"+usuarioLogado.idCliente;
    }{
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
listarVoucher();
carregarComboClienteBusca();
exibeUsuarioLogado();



 
  