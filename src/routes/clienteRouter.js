// Carrega o servidor express

const express = require('express');

/* const router = express.Router(); significa que você está criando um "mini-aplicativo" Express 
   para modularizar e organizar as rotas de uma aplicação Node.js.
   
   Ele cria um novo objeto roteador para definir rotas de forma separada,
   o que é útil em aplicações maiores para manter o código organizado, 
   criando um arquivo dedicado para lidar com um conjunto de rotas específicas, 
   como as de produtos ou usuários. 


*/

const router = express.Router();

/*

*/

const controller = require('../controllers/clienteController');

/* Define a roteamento para cada verbo e atributo recebido na Url.

*/

router.get('/listar', controller.listar);
router.get('/obter/:idCliente', controller.obter);


/* module.exports é uma propriedade do Node.js que define o que um módulo JavaScript exporta 
  para outros arquivos usarem. 
  
  o atribuir algo a module.exports (como uma função, objeto ou variável), esse valor se
  torna disponível para ser importado em outros arquivos usando a função require(). 
  
  É fundamental para a organização do código e para a programação modular, permitindo a
  reutilização e a separação de responsabilidades em um projeto. 

*/

module.exports = router;
