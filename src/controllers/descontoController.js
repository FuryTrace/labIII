/* Obtem uma "conexão" Knex já vinculado ao banco, que por sua vez é configurado através do knexfile, que carrega os valores definidos
no arquivo .env para process.env, de onde 

acessa as variáves armazenadas
em process.env.*

Neste local os valores arquivo .env são carregados

*/

const db = require('../db/knex');

// Método de Validar através do Código do Desconto

exports.validar = async (req, res) => {
    try {
        const { codDesconto } = req.params;
        if (codDesconto === null || codDesconto === undefined || codDesconto.trim() === "") {
            return res.status(400).json({ erro: "Código do Desconto inválido" });

        }


        const desconto = await db("desconto").where({ codDesconto: codDesconto }).first();
        if (!desconto) {
            
            return res.status(404).json({ erro: "Desconto não encontrado" });
        }
        // Obtem o somatório e qtd de uso do Desconto

        const idDesconto = desconto.idDesconto;

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
        res.status(500).json({ erro: "Erro ao buscar o Desconto" });
    }
};

exports.trataErro = async (req, res) => {
    try {
      return res.status(400).json({ erro: "Código do Desconto Inválido" });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar o Desconto" });
    }
};





// Método utilização do Desconto

exports.utilizar = async (req, res) => {
    try {
        // Critica os Parâmetros
        const { idDesconto,idPedido,valDesconto } = req.body;

        if (!idDesconto) {
            return res.status(400).json({ erro: "O Identificador do Desconto está inválido" });
        }
        if (!idPedido) {
            return res.status(400).json({ erro: "Identificador do Pedido inválido" });
        }
        if (!valDesconto) {
            return res.status(400).json({ erro: "Valor do Desconto do Pedido está inválido" });
        }
        // Leitura do Desconto
        const desconto = await db("desconto").where({ idDesconto: idDesconto }).first();
        if (!desconto) {
            // Se não encontrou o Desconto
            return res.status(404).json({ erro: "Desconto não encontrado" });
        }

        // Verifica se o Cupom está Ativo

        if (desconto.indAtivo == 0) {
             return res.status(400).json({ erro: "O Desconto está inativo." });
        }

        const hoje = new Date();

        if (desconto.datInicioValidade > hoje) {
             return res.status(400).json({ erro: "A data de início de validade deste desconto é no futuro. O Desconto atualmente está inativo." });
        }

        if (desconto.datFimValidade < hoje) {
             return res.status(400).json({ erro: "A data de fim de validade deste desconto já passou. O Desconto está inativo." });
        }


        // Desconto de Valor

        if (desconto.codTipo == "V"){
            if (valDesconto > desconto.valDesconto) {
             return res.status(400).json({ erro: "O Valor que está sendo concedido está maior que o valor original do Desconto." });
            }
            
        }


        // Verifica se for um Voucher

        if (desconto.codNatureza == "V") { 
            const rsPedidoDesconto = await db("descontopedido").where({ idDesconto: idDesconto }).first();
            if (rsPedidoDesconto) {
                return res.status(400).json({ erro: `Este Voucher já foi utilizado no pedido ${idPedido}`});
            }
        }




        
        const rsPedidoDescontoDuplicado = await db("descontopedido").where({ idDesconto: idDesconto,idPedido: idPedido }).first();
        if (rsPedidoDescontoDuplicado) {
            return res.status(400).json({ erro: "Este Desconto já foi utilizado neste pedido."});
        }

        const camposDescontoPedido = { 
            idDesconto : idDesconto,
            idPedido : idPedido,
            valDesconto: valDesconto
        };


     

        await db('descontopedido').insert(camposDescontoPedido);
        res.status(201).json({ mensagem: 'Desconto utilizado com sucesso' });
        } catch (err) {
        console.error('Erro ao inserir:', err.message);
        res.status(501).json({ erro: 'Erro ao inserir o Cupom' });
  }
};




