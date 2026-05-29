-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema dbmarketplace
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema dbmarketplace
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dbmarketplace` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `dbmarketplace` ;

-- -----------------------------------------------------
-- Table `dbmarketplace`.`desconto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbmarketplace`.`desconto` (
  `idDesconto` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador do Desconto.',
  `codDesconto` VARCHAR(48) NOT NULL COMMENT 'O código Identifica o desconto para a camada de negócio. Serve para localizar o Desconto',
  `codNatureza` CHAR(1) NOT NULL COMMENT 'Indica a Natureza do Desconto:\\n\\nC - Cupom\\nV - Voucher',
  `codOrigem` CHAR(1) NOT NULL COMMENT 'Indica a Origem do Desconto\\n\\nP - Plataforma\\nL - Loja\\n\\n',
  `codTipo` CHAR(1) NOT NULL COMMENT 'Informa como será dado o desconto:\\n\\nV - o desconto será um valor\\nP - o desconto será um percentual\\nF - O desconto será de Frete gratis.\\n\\n',
  `valDesconto` DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Valor do Desconto. Deve ser nulo se o desconto for dotipo P - Percentual ou F - Frete Gratis. Não pode ser nulo se for um desconto do tipo Valor.',
  `perDesconto` DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Percentual do Desconto. Deve ser nulo se o desconto for dotipo V - Valor ou F - Frete Gratis. Não pode ser nulo se for um desconto do tipo pP - Percentual. \\n',
  `datInicioValidade` DATETIME NOT NULL COMMENT 'Data e hora de Início da Validade do Desconto.',
  `datFimValidade` DATETIME NOT NULL COMMENT 'Data e hora do fim da validade do desconto.',
  `obsDesconto` VARCHAR(256) NULL DEFAULT NULL COMMENT 'Descrição ou observação sobre o motivo da criação do Cupom ou Voucher de desconto.',
  `indAtivo` CHAR(1) NOT NULL COMMENT 'Indica se o desconto está ou não ativo:\\n\\nS - Desconto Ativo\\nN - Desconto Inativo.\\n',
  `idLoja` INT NULL DEFAULT NULL COMMENT 'Identificação da Loja. Obrigatório se codOrigem for L - Loja. Deve ser Nulo de codOrigem for diferente de L.',
  `idCliente` INT NULL DEFAULT NULL COMMENT 'Código do Cliente. Obrigatório para Voucher. Nulo se for um Cupom',
  `idUsuarioCriacao` INT NOT NULL COMMENT 'Identificação do Usuário que criou o Desconto.',
  `datCriacao` DATETIME NOT NULL COMMENT 'Data e Hora da criação do Desconto.',
  `idUsuarioInativacao` INT NULL DEFAULT NULL COMMENT 'Identificação do Usuário que inativou o Desconto.',
  `datInativacao` DATETIME NULL DEFAULT NULL COMMENT 'Data e Hora da inativação do Desconto.',
  `nomUsuarioCriacao` VARCHAR(128) NOT NULL COMMENT 'Nome do Usuário que criou o Desconto.',
  `nomUsuarioInativacao` VARCHAR(128) NULL DEFAULT NULL COMMENT 'Nome do Usuário que inativou o Desconto.',
  PRIMARY KEY (`idDesconto`),
  UNIQUE INDEX `ix_Desconto_codDesconto` (`codDesconto` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Tabela com os Descontos (Cupons e Vouchers).';


-- -----------------------------------------------------
-- Table `dbmarketplace`.`descontopedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbmarketplace`.`descontopedido` (
  `idPedido` INT NOT NULL COMMENT 'Identifica o número do pedido que utilizou o desconto.',
  `idDesconto` INT NOT NULL COMMENT 'Identificador do Desconto',
  `valDesconto` DECIMAL(10,2) NOT NULL COMMENT 'Valor que foi concedido de desconto.',
  PRIMARY KEY (`idPedido`, `idDesconto`),
  INDEX `ix_DescontoPedido_Desconto` (`idDesconto` ASC) VISIBLE,
  CONSTRAINT `fk_DescontoPedido_Desconto`
    FOREIGN KEY (`idDesconto`)
    REFERENCES `dbmarketplace`.`desconto` (`idDesconto`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Identifica qual pedido utilizou o Desconto.';


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
