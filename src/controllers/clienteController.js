const clientes = [
    
    { idCliente: 1, nome: "Pedro Paulo"  },
    { idCliente: 2, nome: "Mario Augusto" },
    { idCliente: 3, nome: "João Carlos"},
    { idCliente: 4, nome: "Pedro de Castro"},
    { idCliente: 5, nome: "Maurício de Paula"},
    { idCliente: 6, nome: "José Bonifácio"}
];


function obtemListaClientes () {
    return  JSON.parse(clientes);
}

// Método de Consulta através do ID

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


// Método de Listar todos os cupons com até 1 ano de idade

exports.listar = async (req, res) => {


  try {

        res.json(obtemListaClientes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar os Clientes' });
    }
};


