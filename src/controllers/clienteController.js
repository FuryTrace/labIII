const clientes = [
    
    { idCliente: 1, nome: "Pedro Paulo"  },
    { idCliente: 2, nome: "Mario Augusto" },
    { idCliente: 3, nome: "João Carlos"},
    { idCliente: 4, nome: "Pedro de Castro"},
    { idCliente: 5, nome: "Maurício de Paula"},
    { idCliente: 6, nome: "José Bonifácio"}
];


function obtemListaClientes () {
  

    return  JSON.stringify(clientes);
}

// Função que Simula retornar os dados de um Cliente.
// Teria que ser revisto em um implementação Real.

exports.obter = async (req, res) => {
    try {


        const { idCliente} = req.params;

        
        const cliente = clientes.find(c => c.idCliente == idCliente);

        if (cliente) {
            res.json(cliente);
        } else { 
            res.status(404).json({ erro: "Cliente não encontrado." });
        }

    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar o Cliente" });
    }
};


// Função que Simula a Leitura de uma tabela de Clientes.
// Teria que ser revisto em um implementação Real.

exports.listar = async (req, res) => {


  try {
        const listaDeClientes = JSON.parse(obtemListaClientes());
        res.json(listaDeClientes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar os Clientes' });
    }
};


