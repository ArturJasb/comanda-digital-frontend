-- ============================================================
-- V1__create_tables.sql
-- Comanda Digital - UNASP SP - Prof. Thiago Silva - 2026/1
-- Cria todas as tabelas do sistema (conforme SRS secao 6)
-- ============================================================

-- ----------------------------
-- Tabela: usuario
-- ----------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)  NOT NULL,
    perfil      ENUM('ADMIN','GERENTE','COZINHEIRO','CLIENTE') NOT NULL,
    telefone    VARCHAR(20),
    endereco    VARCHAR(255),
    status      ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: categoria
-- ----------------------------
CREATE TABLE IF NOT EXISTS categoria (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(80)   NOT NULL,
    descricao   VARCHAR(255),
    ordem       INT,
    status      ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: prato
-- ----------------------------
CREATE TABLE IF NOT EXISTS prato (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id        BIGINT        NOT NULL,
    nome                VARCHAR(100)  NOT NULL,
    descricao           TEXT,
    foto_url            VARCHAR(500),
    preco_venda         DECIMAL(10,2) NOT NULL,
    tempo_preparo_min   INT,
    status              ENUM('ATIVO','INATIVO','PAUSADO') NOT NULL DEFAULT 'INATIVO',
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prato_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: ingrediente
-- ----------------------------
CREATE TABLE IF NOT EXISTS ingrediente (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100)   NOT NULL,
    sku             VARCHAR(50)    UNIQUE,
    unidade_padrao  ENUM('G','ML','UN','KG','L') NOT NULL,
    estoque_minimo  DECIMAL(10,4)  NOT NULL DEFAULT 0,
    custo_unitario  DECIMAL(10,4)  NOT NULL DEFAULT 0,
    status          ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: ficha_tecnica
-- ----------------------------
CREATE TABLE IF NOT EXISTS ficha_tecnica (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    prato_id     BIGINT  NOT NULL UNIQUE,
    rendimento   INT     NOT NULL DEFAULT 1,
    modo_preparo TEXT,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ficha_prato FOREIGN KEY (prato_id) REFERENCES prato(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: ficha_tecnica_item
-- ----------------------------
CREATE TABLE IF NOT EXISTS ficha_tecnica_item (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    ficha_tecnica_id BIGINT        NOT NULL,
    ingrediente_id   BIGINT        NOT NULL,
    quantidade       DECIMAL(10,4) NOT NULL,
    unidade          ENUM('G','ML','UN','KG','L') NOT NULL,
    fator_correcao   DECIMAL(5,2)  NOT NULL DEFAULT 1.00,
    CONSTRAINT fk_fti_ficha       FOREIGN KEY (ficha_tecnica_id) REFERENCES ficha_tecnica(id) ON DELETE CASCADE,
    CONSTRAINT fk_fti_ingrediente FOREIGN KEY (ingrediente_id)   REFERENCES ingrediente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: fornecedor
-- ----------------------------
CREATE TABLE IF NOT EXISTS fornecedor (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj         VARCHAR(18)  NOT NULL UNIQUE,
    telefone     VARCHAR(20),
    email        VARCHAR(150),
    status       ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: fornecedor_produto
-- ----------------------------
CREATE TABLE IF NOT EXISTS fornecedor_produto (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    fornecedor_id   BIGINT         NOT NULL,
    ingrediente_id  BIGINT         NOT NULL,
    preco           DECIMAL(10,4)  NOT NULL,
    unidade_venda   ENUM('G','ML','UN','KG','L') NOT NULL,
    UNIQUE KEY uq_fornecedor_ingrediente (fornecedor_id, ingrediente_id),
    CONSTRAINT fk_fp_fornecedor  FOREIGN KEY (fornecedor_id)  REFERENCES fornecedor(id),
    CONSTRAINT fk_fp_ingrediente FOREIGN KEY (ingrediente_id) REFERENCES ingrediente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: pedido
-- ----------------------------
CREATE TABLE IF NOT EXISTS pedido (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id          BIGINT         NOT NULL,
    status              ENUM('RECEBIDO','CONFIRMADO','EM_PREPARO','PRONTO','SAIU_ENTREGA','FINALIZADO','CANCELADO')
                        NOT NULL DEFAULT 'RECEBIDO',
    valor_total         DECIMAL(10,2)  NOT NULL DEFAULT 0,
    endereco_entrega    VARCHAR(255),
    observacoes         VARCHAR(500),
    motivo_cancelamento VARCHAR(500),
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: pedido_item
-- ----------------------------
CREATE TABLE IF NOT EXISTS pedido_item (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       BIGINT         NOT NULL,
    prato_id        BIGINT         NOT NULL,
    quantidade      INT            NOT NULL,
    preco_unitario  DECIMAL(10,2)  NOT NULL,
    observacoes     VARCHAR(500),
    CONSTRAINT fk_pi_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_prato  FOREIGN KEY (prato_id)  REFERENCES prato(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: pedido_compra
-- ----------------------------
CREATE TABLE IF NOT EXISTS pedido_compra (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    fornecedor_id BIGINT         NOT NULL,
    status        ENUM('RASCUNHO','ENVIADO','RECEBIDO','CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    valor_total   DECIMAL(10,2)  NOT NULL DEFAULT 0,
    usuario_id    BIGINT         NOT NULL,
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pc_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id),
    CONSTRAINT fk_pc_usuario    FOREIGN KEY (usuario_id)    REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: pedido_compra_item
-- ----------------------------
CREATE TABLE IF NOT EXISTS pedido_compra_item (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_compra_id BIGINT         NOT NULL,
    ingrediente_id   BIGINT         NOT NULL,
    quantidade       DECIMAL(10,4)  NOT NULL,
    preco_unitario   DECIMAL(10,4)  NOT NULL,
    subtotal         DECIMAL(10,2)  NOT NULL,
    CONSTRAINT fk_pci_compra      FOREIGN KEY (pedido_compra_id) REFERENCES pedido_compra(id) ON DELETE CASCADE,
    CONSTRAINT fk_pci_ingrediente FOREIGN KEY (ingrediente_id)   REFERENCES ingrediente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabela: estoque_movimentacao
-- ----------------------------
CREATE TABLE IF NOT EXISTS estoque_movimentacao (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingrediente_id   BIGINT         NOT NULL,
    tipo             ENUM('ENTRADA','SAIDA','ESTORNO') NOT NULL,
    quantidade       DECIMAL(10,4)  NOT NULL,
    motivo           ENUM('COMPRA','VENDA','DESPERDICIO','VENCIMENTO','QUEBRA','USO_INTERNO','AJUSTE','ESTORNO') NOT NULL,
    lote             VARCHAR(50),
    validade         DATE,
    custo_unitario   DECIMAL(10,4),
    pedido_compra_id BIGINT,
    pedido_id        BIGINT,
    usuario_id       BIGINT         NOT NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_em_ingrediente   FOREIGN KEY (ingrediente_id)   REFERENCES ingrediente(id),
    CONSTRAINT fk_em_pedido_compra FOREIGN KEY (pedido_compra_id) REFERENCES pedido_compra(id),
    CONSTRAINT fk_em_pedido        FOREIGN KEY (pedido_id)        REFERENCES pedido(id),
    CONSTRAINT fk_em_usuario       FOREIGN KEY (usuario_id)       REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Indices para performance
-- ============================================================
CREATE INDEX idx_pedido_cliente    ON pedido(cliente_id);
CREATE INDEX idx_pedido_status     ON pedido(status);
CREATE INDEX idx_pedido_created    ON pedido(created_at);
CREATE INDEX idx_em_ingrediente    ON estoque_movimentacao(ingrediente_id);
CREATE INDEX idx_em_tipo           ON estoque_movimentacao(tipo);
CREATE INDEX idx_em_created        ON estoque_movimentacao(created_at);
CREATE INDEX idx_prato_status      ON prato(status);
CREATE INDEX idx_prato_categoria   ON prato(categoria_id);
CREATE INDEX idx_fp_ingrediente    ON fornecedor_produto(ingrediente_id);
CREATE INDEX idx_pc_status         ON pedido_compra(status);
CREATE INDEX idx_pc_created        ON pedido_compra(created_at);
CREATE INDEX idx_usuario_perfil    ON usuario(perfil);
