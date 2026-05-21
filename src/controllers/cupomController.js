/* Obtem uma "conexão" Knex já vinculado ao banco, que por sua vez é configurado através do knexfile, que carrega os valores definidos
no arquivo .env para process.env, de onde 

acessa as variáves armazenadas
em process.env.*

Neste local os valores arquivo .env são carregados

*/

const db = require('../db/knex');

// Método de Consulta através do ID

exports.obter = async (req, res) => {
  try {
    const { idDesconto } = req.params;
    const desconto = await db("desconto").where({ idDesconto: req.params.idDesconto }).first();
    if (!desconto) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }
    res.json(desconto);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o Cupom" });
  }
};


// Busca os Cupons Like CodiGO
exports.buscarCupomCodigo = async (req, res) => {
  try {
    const { codCupom } = req.params;
    const whereLike = codCupom +"%";
    const desconto = await db("desconto").where( 'codDesconto','like',  whereLike ).orderBy('datInicioValidade');;
    if (desconto.length === 0) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }
    res.json(desconto);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o Cupom" });
  }
};

// Busca Cupons de um Intervalo

exports.buscarCupomIntervalo = async (req, res) => {
  try {
    const { datInicioBusca, datFimBusca } = req.params;
    console.log(datInicioBusca);
    console.log(datFimBusca);


    const desconto = await db("desconto")
    .where(function() {
        // Primeiro grupo: Data1 entre DataI e DataF
        this.whereBetween('datInicioValidade', [datInicioBusca, datFimBusca])
        // Segundo grupo conectado por OU: Data2 entre DataI e DataF
        .orWhereBetween('datFimValidade', [datInicioBusca, datFimBusca]);
    });
    if (desconto.length === 0) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }
    res.json(desconto);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o Cupom" });
  }
};


// Método de Listar todos os cupons

exports.listar = async (req, res) => {
  // Obtem a Data de Um Ano Atrás
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
  // where( 'datInicioValidade','>',  umAnoAtras )

  try {
    const desconto = await db('desconto').where( 'datInicioValidade','>',  umAnoAtras ).orderBy('datInicioValidade', 'desc');
    res.json(desconto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar o Cupom' });
  }
};


// Método de inserir um Cupom 

exports.inserir = async (req, res) => {
  try {
    const { codDesconto,codNatureza,codOrigem,codTipo,valDesconto,perDesconto,datInicioValidade,datFimValidade,obsDesconto,idLoja,idUsuarioCriacao,nomUsuarioCriacao,datCriacao } = req.body;
    


  
    const desconto = await db("desconto").where( 'codDesconto','=',  codDesconto).first();
    if (desconto) {
      return res.status(401).json({ erro: "Já existe um cupom cadastrado com este código" });
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

    await db('desconto').insert(camposDesconto);
    res.status(201).json({ mensagem: 'Cupom inserido com sucesso' });
  } catch (err) {
    console.error('Erro ao inserir:', err.message);
    res.status(501).json({ erro: 'Erro ao inserir o Cupom' });
  }
};

// Método de inativar um Cupom


exports.inativar = async (req, res) => {
  try {
    const { idDesconto } = req.params;
    const { idUsuarioInativacao, nomUsuarioInativacao, datInativacao } = req.body;
    
    await db('desconto').where({ idDesconto }).update({ indAtivo : 0, idUsuarioInativacao : idUsuarioInativacao, nomUsuarioInativacao : nomUsuarioInativacao,datInativacao : datInativacao });
    res.json({ mensagem: 'Cupom inativado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar Cupom' });
  }
};

