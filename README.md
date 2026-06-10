## 1. Pré-requisitos:
1. Ter o **node** instalado. Para fazer o download acesse https://nodejs.org/pt/download . Prefira o download de uma versão LTS.
2. Ter um banco **MySQL** instalado . Para fazer o download acesse https://dev.mysql.com/downloads/. Pode usar também o **MariaDB** que é instalado com o XAMPP, disponível em https://www.apachefriends.org/pt_br/index.html. 

## 2. Criação do Banco de Dados

1) Criar o banco dbmarketplace no servidor de banco de dados Mysql.

O script de criação encontra-se na pasta banco.

2) Anotar:

nome do servidor: localhost
nome do banco: dbmarketplace
nome do usuário: root
senha: root

## 3. Criação da estrutura de pastas

Foi utilizado o seguinte comando:

npx express-generator labiii

 Foi então criada a seguinte estrutura: 

   labiii\
   labiii\public\             : Páginas da Aplicação
   labiii\public\css\         : Folhas de Estilo da Aplicação
   labiii\public\img\         : Reservado para eventuais imagens
   labiii\public\js\          : Funções Java Script 
   labiii\src                 : Fontes da Aplicação        
   labiii\src\controllers\    : Fontes dos Controladores
   labiii\src\db\             : Conexão com Banco de Dados
   labiii\src\routes\         : Roteadores da Aplicação
   labiii\server.js           : Inicio de execução da aplicação 
   labiii\package.json        : Configuração da Aplicação
   labiii\.env                : "Variáveis de Ambiente" da aplicação  
   labiii\README.md           : Este arquivo

Para entrar na pasta utilize o comando cd (no torminal)

   Alteração change directory:lab iii
     > cd labiii

   instalar dependencias
     > npm install

Caso deseje instalar manualmente, execute os seguintes comandos:

npm init
npm install dotenv
npm install express
npm install knex 
npm install mysql2
npm install nanoid


## 4. Executar a aplicação em modo de desenvolvimento:
       
     npm run dev
