


/* Obtem uma "conexão" Knex já vinculado ao banco, que por sua vez é configurado através do knexfile, que carrega os valores definidos
no arquivo .env para process.env, de onde 

acessa as variáves armazenadas
em process.env.*

Neste local os valores arquivo .env são carregados

*/



const db = require('../db/knex');

async function gerarId() {
    //const { nanoid } = await import('nanoid');

    const { customAlphabet } = await import('nanoid');

    //const id = nanoid();
    // Define o alfabeto (apenas números e letras maiúsculas) e o tamanho padrão (10)
    const nanoidCustomizado = customAlphabet('1234567890ABCDEFGHIJKLM', 10);
    const id = nanoidCustomizado();

    return id;
}



exports.gerarCodigoVoucher = async (req, res) => {
   
    // Obtem a Data de Um Ano Atrás
  try {
      const id = await gerarId();
      const codDesconto = "VCHR-"+id;
      res.json({codDesconto : codDesconto});
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar o Voucher' });
    }
};


// Método de Consulta através do ID

exports.obter = async (req, res) => {
  try {
    const { idDesconto} = req.params;

    const desconto = await db("desconto").where({ idDesconto: req.params.idDesconto }).first();
    if (!desconto) {
      return res.status(404).json({ erro: "Voucher não encontrado" });
    }

    // Obtem o somatório e qtd de uso do Voucher

    const descontoPedido = await db("descontopedido")
                                .sum('valDesconto as totDesconto')
                                .count('* as qtdDesconto')
                                .where('idDesconto',idDesconto)
                                .first();

    // se encontrou valores, então adiciona ao registro do Desconto. 
                             
    if (descontoPedido) {
        const { totDesconto, qtdDesconto } = descontoPedido;
        if (totDesconto) {  // Trata a cláusula Sum
            desconto.valDescontoUtilizado = totDesconto;
            desconto.qtdDescontoUtilizado = qtdDesconto;

        } else {
            desconto.valDescontoUtilizado = 0;
            desconto.qtdDescontoUtilizado = qtdDesconto;
        }
    } else {
        desconto.valDescontoUtilizado = 0;
        desconto.qtdDescontoUtilizado = 0;
    }
    



    res.json(desconto);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o Voucher" });
  }
};


// Busca os Vouchers Like Codigo

exports.buscarVoucherCodigo = async (req, res) => {
  try {
    const { codVoucher, codOrigem, idLoja  } = req.params;

    const whereLike = codVoucher +"%";
    let desconto;
    if (codOrigem == "P") { // Plataforma
        desconto = await db("desconto")
                        .where ('codNatureza','V')
                        .where( 'codDesconto','like',  whereLike )
                        .where ('codOrigem','P')
                        .orderBy('datInicioValidade');
    } else if (codOrigem == "L") { // Loja
        desconto = await db("desconto")
                        .where ('codNatureza','V')
                        .where( 'codDesconto','like',  whereLike )
                        .where ('codOrigem','L')
                        .where('idLoja',idLoja)
                        .orderBy('datInicioValidade');

    }
    if (desconto.length === 0) {
      return res.status(404).json({ erro: "Voucher não encontrado" });
    }
    res.json(desconto);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o Voucher" });
  }
};

// Busca Vouchers de um Intervalo

exports.buscarVoucherIntervalo = async (req, res) => {
    try {
        const { datInicioBusca, datFimBusca,codOrigem, idLoja } = req.params;

        let desconto;
        if (codOrigem == "P") { // Plataforma


            desconto = await db('desconto')
                .where ('codNatureza','V')
                .where(function() {
                    // Primeiro grupo: Data1 entre DataI e DataF
                    this.whereBetween('datInicioValidade', [datInicioBusca, datFimBusca])
                    // Segundo grupo conectado por OU: Data2 entre DataI e DataF
                    .orWhereBetween('datFimValidade', [datInicioBusca, datFimBusca]);
                })
                .andWhere(function() {
                    this.where('CodOrigem', 'P');
                });
        } else if (codOrigem == "L") { // Loja
            desconto = await db('desconto')
                .where(function() {
                    // Primeiro grupo: Data1 entre DataI e DataF
                    this.whereBetween('datInicioValidade', [datInicioBusca, datFimBusca])
                    // Segundo grupo conectado por OU: Data2 entre DataI e DataF
                    .orWhereBetween('datFimValidade', [datInicioBusca, datFimBusca]);
                })
                .andWhere(function() {
                    this.where('CodOrigem', 'L')
                    .andWhere('idLoja', idLoja);
                });
        }

        if (!desconto) {
            return res.status(404).json({ erro: "Voucher não encontrado" });
        }
        res.json(desconto);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar o Voucher" });
    }
};


// Método de Listar todos os vouchers com até 1 ano de idade

exports.listar = async (req, res) => {


   
    // Obtem a Data de Um Ano Atrás
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    // where( 'datInicioValidade','>',  umAnoAtras )

    const { codOrigem, idLoja  } = req.params;
    let desconto;

  try {


        if (codOrigem == "P") { // Plataforma
            desconto = desconto = await db('desconto')
                    .where( 'datInicioValidade','>',  umAnoAtras )
                    .where ('codOrigem','P')
                    .where ('codNatureza','V')
                    .orderBy('datInicioValidade', 'desc');
        } else if (codOrigem == "L") { // Loja
            desconto = desconto = await db('desconto')
                    .where ('codNatureza','V')
                    .where( 'datInicioValidade','>',  umAnoAtras )
                            .where ('codOrigem','L')
                            .where('idLoja',idLoja)
                            .orderBy('datInicioValidade');
        }
        if (!desconto) {
            res.status(404).jason({erro : "Não foram encontrados registros"});
            return;
        }
        // Retorna os registros encontrados
        res.json(desconto);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar o Voucher' });
    }
};


// Método de inserir um Voucher 

exports.inserir = async (req, res) => {
  try {

    gerarId()

    const { codDesconto,codNatureza,codOrigem,codTipo,valDesconto,perDesconto,datInicioValidade,datFimValidade,obsDesconto,idLoja,idUsuarioCriacao,nomUsuarioCriacao,datCriacao } = req.body;
      
    const desconto = await db("desconto").where( 'codDesconto','=',  codDesconto).first();
    if (desconto) {
      return res.status(401).json({ erro: "Já existe um voucher cadastrado com este código" });
    }
    
    // Prepara para Inclusão
    const camposDesconto = { 
      codDesconto : codDesconto,
      codNatureza : codNatureza,
      codOrigem: codOrigem,
      codTipo : codTipo,
      datInicioValidade : datInicioValidade,
      datFimValidade: datFimValidade,
      obsDesconto : obsDesconto,
      indAtivo : 1,
      idUsuarioCriacao:idUsuarioCriacao,
      nomUsuarioCriacao: nomUsuarioCriacao,
      datCriacao: datCriacao
    };


    // adiciona campos que podem ser nulos.
    if (codOrigem == "L") {
        camposDesconto.idLoja = idLoja;    
    }
    if (codTipo == 'V') {
      camposDesconto.valDesconto = valDesconto;
    } else if (codTipo == 'P') {
      camposDesconto.perDesconto = perDesconto;
    }

    // efeutua a inclusão

    await db('desconto').insert(camposDesconto);
    res.status(201).json({ mensagem: 'Voucher inserido com sucesso' });
  } catch (err) {
    console.error('Erro ao inserir:', err.message);
    res.status(501).json({ erro: 'Erro ao inserir o Voucher' });
  }
};

// Método de inativar um Voucher


exports.inativar = async (req, res) => {
  try {
    const { idDesconto } = req.params;
    const { idUsuarioInativacao, nomUsuarioInativacao, datInativacao } = req.body;
    
    await db('desconto').where({ idDesconto }).update({ indAtivo : 0, idUsuarioInativacao : idUsuarioInativacao, nomUsuarioInativacao : nomUsuarioInativacao,datInativacao : datInativacao });
    res.json({ mensagem: 'Voucher inativado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar Voucher' });
  }
};

