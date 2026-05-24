-- ============================================================
-- V2__seed_data.sql
-- Comanda Digital - UNASP SP - Dados iniciais obrigatorios
-- Senha de todos os usuarios seed: senha123
-- Hash BCrypt $2a$10 verificado funcionando com Spring Security
-- ============================================================

-- ----------------------------
-- Usuarios (senha de todos: senha123)
-- ----------------------------
INSERT INTO usuario (nome, email, senha_hash, perfil, telefone, endereco, status) VALUES
('Administrador',  'admin@email.com',
 '$2a$10$3HvRkJt/rhjp/qDsJLxbCu6imBuYs5zjDyGcDvdnnVJytAzwsTOjy',
 'ADMIN',      '(11) 99999-0001', 'Rua da Cozinha, 100 - SP', 'ATIVO'),
('Gerente Ops',    'gerente@email.com',
 '$2a$10$3HvRkJt/rhjp/qDsJLxbCu6imBuYs5zjDyGcDvdnnVJytAzwsTOjy',
 'GERENTE',    '(11) 99999-0002', 'Rua da Gestao, 200 - SP', 'ATIVO'),
('Chef Carlos',    'cozinheiro@email.com',
 '$2a$10$3HvRkJt/rhjp/qDsJLxbCu6imBuYs5zjDyGcDvdnnVJytAzwsTOjy',
 'COZINHEIRO', '(11) 99999-0003', 'Av. dos Sabores, 300 - SP', 'ATIVO'),
('Cliente Teste',  'cliente@email.com',
 '$2a$10$3HvRkJt/rhjp/qDsJLxbCu6imBuYs5zjDyGcDvdnnVJytAzwsTOjy',
 'CLIENTE',    '(11) 98888-0001', 'Rua dos Pedidos, 42, Apto 10 - SP', 'ATIVO');

-- ----------------------------
-- Categorias
-- ----------------------------
INSERT INTO categoria (nome, descricao, ordem, status) VALUES
('Hamburgueres', 'Artesanais e smash',           1, 'ATIVO'),
('Acai',         'Bowls e tigelas',              2, 'ATIVO'),
('Bebidas',      'Refrigerantes, sucos e agua',  3, 'ATIVO'),
('Sobremesas',   'Doces e gelados',              4, 'ATIVO'),
('Porcoes',      'Aperitivos e petiscos',        5, 'ATIVO');

-- ----------------------------
-- Ingredientes (22 itens)
-- ----------------------------
INSERT INTO ingrediente (nome, sku, unidade_padrao, estoque_minimo, custo_unitario, status) VALUES
-- Proteinas
('Blend bovino 80/20', 'PROT-001', 'G',   500,  0.0450, 'ATIVO'),
('Frango grelhado',    'PROT-002', 'G',   400,  0.0280, 'ATIVO'),
-- Paes
('Pao brioche',        'PAO-001',  'UN',   20,  2.8000, 'ATIVO'),
('Pao australiano',    'PAO-002',  'UN',   15,  3.2000, 'ATIVO'),
-- Laticinios
('Queijo cheddar',     'LACT-001', 'G',   200,  0.0650, 'ATIVO'),
('Queijo prato',       'LACT-002', 'G',   150,  0.0420, 'ATIVO'),
-- Vegetais
('Alface americana',   'VEG-001',  'G',   100,  0.0120, 'ATIVO'),
('Tomate',             'VEG-002',  'G',   150,  0.0080, 'ATIVO'),
('Cebola roxa',        'VEG-003',  'G',   100,  0.0060, 'ATIVO'),
('Bacon',              'FRIO-001', 'G',   200,  0.0900, 'ATIVO'),
-- Molhos e condimentos
('Molho especial',     'MOL-001',  'ML',  200,  0.0320, 'ATIVO'),
('Mostarda dijon',     'MOL-002',  'ML',  100,  0.0250, 'ATIVO'),
('Maionese',           'MOL-003',  'ML',  300,  0.0180, 'ATIVO'),
-- Acai
('Polpa de acai',      'ACA-001',  'G',  1000,  0.0280, 'ATIVO'),
('Granola',            'ACA-002',  'G',   500,  0.0150, 'ATIVO'),
('Banana',             'ACA-003',  'UN',   30,  0.8000, 'ATIVO'),
('Leite condensado',   'ACA-004',  'ML',  500,  0.0200, 'ATIVO'),
-- Bebidas
('Refrigerante lata',  'BEB-001',  'UN',   48,  2.5000, 'ATIVO'),
('Suco concentrado',   'BEB-002',  'ML',  500,  0.0150, 'ATIVO'),
-- Batata
('Batata palito',      'BAT-001',  'G',   500,  0.0120, 'ATIVO'),
('Oleo para fritar',   'OLE-001',  'ML',  1000, 0.0050, 'ATIVO'),
('Sal',                'TMP-001',  'G',   500,  0.0010, 'ATIVO');

-- ----------------------------
-- Fornecedores
-- ----------------------------
INSERT INTO fornecedor (razao_social, cnpj, telefone, email, status) VALUES
('Frigorifico Sao Paulo LTDA',  '11.222.333/0001-81', '(11) 3333-1111', 'vendas@frigorificasp.com.br', 'ATIVO'),
('Distribuidora Verde Sabor',   '22.333.444/0001-81', '(11) 3333-2222', 'pedidos@verdesabor.com.br',   'ATIVO'),
('Acai da Amazonia EIRELI',     '33.444.555/0001-81', '(11) 3333-3333', 'contato@acaidaamazonia.com',  'ATIVO'),
('Bebidas Brasil Distribuidora','44.555.666/0001-81', '(11) 3333-4444', 'vendas@bebidasbrasil.com',    'ATIVO');

-- ----------------------------
-- Pratos (5 obrigatorios - todos ATIVOS apos terem ficha tecnica)
-- ----------------------------
INSERT INTO prato (categoria_id, nome, descricao, foto_url, preco_venda, tempo_preparo_min, status) VALUES
(1, 'Hamburguer Artesanal Classic',
    'Blend bovino 180g, queijo cheddar, alface, tomate, molho especial no pao brioche.',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    39.90, 15, 'ATIVO'),
(1, 'Smash Burguer Bacon',
    'Dois smash 90g, bacon crocante, queijo prato, cebola caramelizada e mostarda dijon.',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
    44.90, 12, 'ATIVO'),
(1, 'Chicken Crispy',
    'Frango grelhado, queijo prato, alface, tomate e maionese no pao australiano.',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500',
    36.90, 15, 'ATIVO'),
(2, 'Bowl de Acai 500g',
    '500g de acai cremoso com granola, banana e leite condensado.',
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500',
    28.90,  8, 'ATIVO'),
(5, 'Porcao de Batata Frita',
    '300g de batata palito frita, temperada com sal e servida com maionese.',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
    22.90, 12, 'ATIVO');

-- ----------------------------
-- Fichas Tecnicas
-- ----------------------------

-- Prato 1: Hamburguer Artesanal Classic
INSERT INTO ficha_tecnica (prato_id, rendimento, modo_preparo) VALUES
(1, 1, '1. Tempere o blend com sal e pimenta. 2. Grelhe na chapa por 4 min cada lado. 3. Monte: pao tostado, molho, alface, tomate, hamburguer, queijo derretido, pao.');

INSERT INTO ficha_tecnica_item (ficha_tecnica_id, ingrediente_id, quantidade, unidade, fator_correcao) VALUES
(1, 1,  180, 'G',  1.00),  -- blend bovino
(1, 3,  1,   'UN', 1.00),  -- pao brioche
(1, 5,  40,  'G',  1.00),  -- queijo cheddar
(1, 7,  30,  'G',  1.40),  -- alface (FC: limpeza)
(1, 8,  50,  'G',  1.25),  -- tomate (FC: sementes)
(1, 11, 25,  'ML', 1.00);  -- molho especial

-- Prato 2: Smash Burguer Bacon
INSERT INTO ficha_tecnica (prato_id, rendimento, modo_preparo) VALUES
(2, 1, '1. Divida 180g de blend em 2 bolinhas. 2. Smash na chapa bem quente. 3. Frite o bacon. 4. Monte com queijo, cebola caramelizada e mostarda.');

INSERT INTO ficha_tecnica_item (ficha_tecnica_id, ingrediente_id, quantidade, unidade, fator_correcao) VALUES
(2, 1,  180, 'G',  1.00),  -- blend bovino
(2, 3,  1,   'UN', 1.00),  -- pao brioche
(2, 6,  50,  'G',  1.00),  -- queijo prato
(2, 10, 40,  'G',  1.00),  -- bacon
(2, 9,  30,  'G',  1.15),  -- cebola roxa
(2, 12, 20,  'ML', 1.00);  -- mostarda dijon

-- Prato 3: Chicken Crispy
INSERT INTO ficha_tecnica (prato_id, rendimento, modo_preparo) VALUES
(3, 1, '1. Tempere e grelhe o frango. 2. Torre o pao australiano. 3. Monte com maionese, alface, tomate e o frango.');

INSERT INTO ficha_tecnica_item (ficha_tecnica_id, ingrediente_id, quantidade, unidade, fator_correcao) VALUES
(3, 2,  150, 'G',  1.10),  -- frango (FC: osso/aparas)
(3, 4,  1,   'UN', 1.00),  -- pao australiano
(3, 6,  40,  'G',  1.00),  -- queijo prato
(3, 7,  30,  'G',  1.40),  -- alface
(3, 8,  50,  'G',  1.25),  -- tomate
(3, 13, 30,  'ML', 1.00);  -- maionese

-- Prato 4: Bowl de Acai 500g
INSERT INTO ficha_tecnica (prato_id, rendimento, modo_preparo) VALUES
(4, 1, '1. Bata a polpa de acai congelada. 2. Monte na tigela. 3. Adicione granola, banana fatiada e fio de leite condensado.');

INSERT INTO ficha_tecnica_item (ficha_tecnica_id, ingrediente_id, quantidade, unidade, fator_correcao) VALUES
(4, 14, 500, 'G',  1.00),  -- polpa de acai
(4, 15, 60,  'G',  1.00),  -- granola
(4, 16, 1,   'UN', 1.20),  -- banana (FC: casca)
(4, 17, 30,  'ML', 1.00);  -- leite condensado

-- Prato 5: Porcao de Batata Frita
INSERT INTO ficha_tecnica (prato_id, rendimento, modo_preparo) VALUES
(5, 1, '1. Frite as batatas em oleo a 180 graus por 8 min. 2. Escorra e tempere com sal. 3. Sirva com maionese a parte.');

INSERT INTO ficha_tecnica_item (ficha_tecnica_id, ingrediente_id, quantidade, unidade, fator_correcao) VALUES
(5, 20, 350, 'G',  1.15),  -- batata palito (FC: aparas)
(5, 21, 200, 'ML', 1.00),  -- oleo
(5, 22, 3,   'G',  1.00),  -- sal
(5, 13, 30,  'ML', 1.00);  -- maionese

-- ----------------------------
-- Estoque inicial (entradas manuais)
-- ----------------------------
INSERT INTO estoque_movimentacao
    (ingrediente_id, tipo, quantidade, motivo, custo_unitario, usuario_id)
VALUES
-- Proteinas
(1,  'ENTRADA', 5000,  'AJUSTE', 0.0450, 1),
(2,  'ENTRADA', 3000,  'AJUSTE', 0.0280, 1),
-- Paes
(3,  'ENTRADA', 100,   'AJUSTE', 2.8000, 1),
(4,  'ENTRADA', 60,    'AJUSTE', 3.2000, 1),
-- Laticinios
(5,  'ENTRADA', 2000,  'AJUSTE', 0.0650, 1),
(6,  'ENTRADA', 1500,  'AJUSTE', 0.0420, 1),
-- Vegetais
(7,  'ENTRADA', 800,   'AJUSTE', 0.0120, 1),
(8,  'ENTRADA', 1200,  'AJUSTE', 0.0080, 1),
(9,  'ENTRADA', 600,   'AJUSTE', 0.0060, 1),
(10, 'ENTRADA', 1500,  'AJUSTE', 0.0900, 1),
-- Molhos
(11, 'ENTRADA', 1000,  'AJUSTE', 0.0320, 1),
(12, 'ENTRADA', 500,   'AJUSTE', 0.0250, 1),
(13, 'ENTRADA', 1500,  'AJUSTE', 0.0180, 1),
-- Acai
(14, 'ENTRADA', 5000,  'AJUSTE', 0.0280, 1),
(15, 'ENTRADA', 2000,  'AJUSTE', 0.0150, 1),
(16, 'ENTRADA', 50,    'AJUSTE', 0.8000, 1),
(17, 'ENTRADA', 2000,  'AJUSTE', 0.0200, 1),
-- Bebidas
(18, 'ENTRADA', 144,   'AJUSTE', 2.5000, 1),
(19, 'ENTRADA', 3000,  'AJUSTE', 0.0150, 1),
-- Batata
(20, 'ENTRADA', 3000,  'AJUSTE', 0.0120, 1),
(21, 'ENTRADA', 5000,  'AJUSTE', 0.0050, 1),
(22, 'ENTRADA', 1000,  'AJUSTE', 0.0010, 1);

-- ----------------------------
-- Catalogo: vincula ingredientes aos fornecedores
-- ----------------------------
INSERT INTO fornecedor_produto (fornecedor_id, ingrediente_id, preco, unidade_venda) VALUES
-- Frigorifico
(1, 1,  0.0430, 'G'),
(1, 2,  0.0270, 'G'),
(1, 10, 0.0880, 'G'),
-- Distribuidora Verde Sabor
(2, 3,  2.7500, 'UN'),
(2, 4,  3.1500, 'UN'),
(2, 5,  0.0640, 'G'),
(2, 6,  0.0410, 'G'),
(2, 7,  0.0110, 'G'),
(2, 8,  0.0075, 'G'),
(2, 9,  0.0055, 'G'),
(2, 11, 0.0310, 'ML'),
(2, 12, 0.0240, 'ML'),
(2, 13, 0.0170, 'ML'),
(2, 20, 0.0115, 'G'),
(2, 21, 0.0048, 'ML'),
(2, 22, 0.0009, 'G'),
-- Acai da Amazonia
(3, 14, 0.0270, 'G'),
(3, 15, 0.0140, 'G'),
(3, 16, 0.7500, 'UN'),
(3, 17, 0.0190, 'ML'),
-- Bebidas Brasil
(4, 18, 2.4500, 'UN'),
(4, 19, 0.0140, 'ML');
