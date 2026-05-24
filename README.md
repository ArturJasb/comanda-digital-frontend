# 🍔 Comanda Digital — Backend API

Sistema de Pedidos para Dark Kitchen
**UNASP SP | Desenvolvimento Full-Stack (G01371.1) | Prof. Thiago Silva | 2026/1**

---

## 📋 Stack

| Camada      | Tecnologia                                  |
| ----------- | ------------------------------------------- |
| Linguagem   | **Java 17**                                 |
| Framework   | **Spring Boot 3.2.5**                       |
| Segurança   | Spring Security + JWT (jjwt 0.12.5)         |
| Persistência| Spring Data JPA + Hibernate                 |
| Banco       | **MySQL 8.0+**                              |
| Migrations  | **Flyway** (scripts versionados)            |
| Validação   | Jakarta Bean Validation                     |
| API Docs    | SpringDoc OpenAPI (Swagger UI)              |
| Build       | Maven                                       |

---

## ✅ Pré-requisitos

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| **JDK**    | 17 (testado também em 21) |
| **Maven**  | 3.8+          |
| **MySQL**  | 8.0+          |

Confira com:

```bash
java -version
mvn -version
mysql --version
```

---

## 🚀 Como rodar (passo a passo)

### 1. Banco de dados

Conecte no MySQL como `root` (ou outro usuário admin) e crie o banco:

```sql
CREATE DATABASE comanda_digital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> 💡 **Não precisa criar tabelas manualmente** — o Flyway executa as migrations (V1 e V2) automaticamente na primeira inicialização.

### 2. Configurar credenciais

Por padrão o `application.properties` usa `root / root`. Para sobrescrever sem editar o arquivo, defina variáveis de ambiente:

**Linux/macOS:**
```bash
export DB_USER=root
export DB_PASSWORD=sua_senha_aqui
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=comanda_digital
```

**Windows (PowerShell):**
```powershell
$env:DB_USER="root"
$env:DB_PASSWORD="sua_senha_aqui"
```

Ou edite diretamente `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=sua_senha_aqui
```

### 3. Build e execução

Na raiz do projeto (onde está o `pom.xml`):

```bash
mvn spring-boot:run
```

O servidor sobe em **http://localhost:8080**

Para gerar o JAR e rodá-lo:

```bash
mvn clean package -DskipTests
java -jar target/comanda-digital.jar
```

---

## 👥 Usuários seed (senha de todos: `senha123`)

| Email                 | Perfil     |
| --------------------- | ---------- |
| `admin@email.com`     | ADMIN      |
| `gerente@email.com`   | GERENTE    |
| `cozinheiro@email.com`| COZINHEIRO |
| `cliente@email.com`   | CLIENTE    |

> O hash BCrypt no seed (`V2__seed_data.sql`) foi **gerado e validado** com `senha123` rodando contra o `BCryptPasswordEncoder` do Spring Security. **Login funciona out-of-the-box.**

---

## 📚 Swagger UI (documentação interativa)

**http://localhost:8080/swagger-ui.html**

### Como autenticar no Swagger
1. Em `Autenticacao`, expanda `POST /api/auth/login` → **Try it out**
2. Use credenciais do seed e execute
3. Copie o valor do campo `token` da resposta
4. Clique no botão **Authorize** 🔓 no topo da página
5. Cole **apenas o token** (sem "Bearer ") e confirme

---

## 🗺️ Endpoints principais

### 🌐 Públicos (sem JWT)
```
POST   /api/auth/login             Login → retorna JWT
POST   /api/auth/register          Cadastro público (sempre cria CLIENTE)
GET    /api/cardapio               Lista pratos ATIVOS (filtro ?categoriaId)
GET    /api/cardapio/{id}          Detalhe do prato
GET    /api/cardapio/categorias    Lista categorias ATIVAS
```

### 👤 Cliente (`ROLE_CLIENTE`)
```
POST   /api/pedidos                Criar pedido (checkout)
GET    /api/pedidos/meus           Histórico do cliente logado
GET    /api/pedidos/{id}/status    Acompanhar status (somente o dono)
PATCH  /api/pedidos/{id}/cancelar  Cancelar próprio pedido (antes de EM_PREPARO)
```

### 🛠️ Admin (`ADMIN` / `GERENTE` / `COZINHEIRO`)

#### Cardápio
```
GET/POST/PUT/DELETE  /api/admin/categorias
GET/POST/PUT/DELETE  /api/admin/pratos
PATCH                /api/admin/pratos/{id}/status      ATIVO/INATIVO/PAUSADO
GET                  /api/admin/pratos/{id}/custo       Custo + food cost
GET/POST/PUT         /api/admin/pratos/{id}/ficha       Ficha técnica
```

#### Pedidos & Cozinha
```
GET    /api/admin/pedidos                  Lista com filtros (status, datas)
GET    /api/admin/pedidos/{id}             Detalhe
PATCH  /api/admin/pedidos/{id}/status      Avança status (CONFIRMADO baixa estoque)
PATCH  /api/admin/pedidos/{id}/cancelar    Cancelar (ADMIN/GERENTE — RN04)
```

#### Estoque
```
GET/POST/PUT/DELETE  /api/admin/ingredientes
GET    /api/admin/ingredientes/estoque/saldo      Saldo atual de todos
GET    /api/admin/ingredientes/estoque/alertas    Abaixo do mínimo
POST   /api/admin/ingredientes/estoque/movimentacao   Saída manual (perda)
GET    /api/admin/ingredientes/{id}/movimentacoes Histórico paginado
```

#### Fornecedores & Compras
```
GET/POST/PUT/DELETE  /api/admin/fornecedores
GET/POST/PUT/DELETE  /api/admin/fornecedores/{id}/produtos
GET    /api/admin/fornecedores/cotacao/{ingredienteId}   Cotação comparativa

GET/POST/PUT         /api/admin/compras
PATCH  /api/admin/compras/{id}/status      RASCUNHO→ENVIADO/CANCELADO
POST   /api/admin/compras/{id}/receber     Recebe → entrada no estoque + atualiza custo
```

#### Dashboard
```
GET    /api/admin/dashboard/resumo         KPIs do dia
GET    /api/admin/dashboard/top-pratos     Top N mais vendidos (default 5)
```

#### Usuários (apenas `ADMIN`)
```
GET/POST/PUT/DELETE  /api/admin/usuarios
```

---

## 📐 Regras de Negócio implementadas

| ID    | Regra                                                         | Onde                                 |
| ----- | ------------------------------------------------------------- | ------------------------------------ |
| RN01  | Prato só fica ATIVO se tiver ficha técnica com ≥ 1 ingrediente | `PratoService.alterarStatus`         |
| RN02  | Food cost > 35% retorna aviso no response                     | `FichaTecnicaService.toResponse`     |
| RN03  | Estoque insuficiente bloqueia criação de pedido (HTTP 422)    | `PedidoService.validarEstoque`       |
| RN04  | Cancelamento após EM_PREPARO só por ADMIN/GERENTE             | `PedidoService.cancelar`             |
| RN05  | Recebimento de compra atualiza custo unitário do ingrediente  | `CompraService.receberMercadoria`    |
| RN06  | Soft delete: status = INATIVO (nunca DELETE físico)           | Todos os services                    |
| RN07  | CNPJ validado pelo algoritmo da Receita Federal               | `CnpjValidator`                      |
| RN08  | Fator de correção ≥ 1.0                                       | `FichaTecnicaItemRequest` + serviço  |
| RN09  | Cardápio público só exibe pratos ATIVOS                       | `PratoService.listarAtivosParaCardapio` |
| RN10  | Email único — retorna 409 se já existir                       | `AuthService` / `UsuarioService`     |

---

## 🧮 Fórmulas (SRS §3.2)

```
custo_prato  = SUM(quantidade × fator_correção × custo_unitário) / rendimento
food_cost%   = (custo_prato / preço_venda) × 100
```

Classificação por cor:

| Food cost   | Classificação | Cor       |
| ----------- | ------------- | --------- |
| ≤ 30%       | VERDE         | ✅        |
| 31% – 35%   | AMARELO       | ⚠️        |
| > 35%       | VERMELHO      | 🔴 + aviso |

### Saldo de estoque (correção aplicada)

```
saldo = Σ ENTRADA + Σ ESTORNO − Σ SAÍDA
```

> ⚠️ **Bug corrigido** vs. versão anterior: `ESTORNO` (cancelamento de pedido) agora **soma** ao saldo, devolvendo os ingredientes ao estoque. Antes era subtraído.

---

## 🏗️ Arquitetura

```
src/main/java/com/unasp/comandadigital/
├── ComandaDigitalApplication.java
├── config/                    # SecurityConfig, CorsConfig, OpenApiConfig, CnpjValidator
├── controller/                # Controllers REST
│   ├── AuthController         # POST /api/auth/**
│   ├── CardapioController     # GET /api/cardapio (público)
│   ├── PedidoController       # /api/pedidos (CLIENTE)
│   └── admin/                 # /api/admin/** (ADMIN/GERENTE/COZINHEIRO)
├── service/                   # Lógica de negócio (todas as regras aqui)
├── repository/                # Interfaces JPA
├── entity/                    # @Entity + enums
├── dto/                       # Records de request/response
├── security/                  # JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
└── exception/                 # @RestControllerAdvice global

src/main/resources/
├── application.properties
└── db/migration/
    ├── V1__create_tables.sql  # DDL (13 tabelas, FKs, índices)
    └── V2__seed_data.sql      # 4 usuários + 5 pratos com ficha técnica + estoque inicial
```

### Princípios seguidos

- **Camadas**: `Controller → Service → Repository` (lógica nunca no controller)
- **DTOs em todas as fronteiras** (`@Entity` nunca é exposto na API)
- **Tratamento global de erros** via `@RestControllerAdvice` (sem stack trace para o cliente)
- **Paginação** em todas as listagens (`Pageable`)
- **`@PreAuthorize`** em cada endpoint protegido
- **`@Transactional(readOnly = true)`** por padrão nos services; `@Transactional` só onde escreve
- **`@Transactional`** garante atomicidade na confirmação de pedido (baixa de estoque)

---

## 🗄️ Banco de dados (13 tabelas)

`usuario`, `categoria`, `prato`, `ingrediente`, `ficha_tecnica`, `ficha_tecnica_item`, `fornecedor`, `fornecedor_produto`, `pedido`, `pedido_item`, `pedido_compra`, `pedido_compra_item`, `estoque_movimentacao`.

DDL completo em `src/main/resources/db/migration/V1__create_tables.sql`.

### Relacionamentos principais
- `usuario (CLIENTE)` 1:N `pedido`
- `pedido` 1:N `pedido_item` N:1 `prato`
- `prato` 1:1 `ficha_tecnica` 1:N `ficha_tecnica_item` N:1 `ingrediente`
- `fornecedor` N:N `ingrediente` (via `fornecedor_produto`)
- `pedido_compra` 1:N `pedido_compra_item` N:1 `ingrediente`
- `estoque_movimentacao` registra TODAS as alterações de saldo (ENTRADA/SAÍDA/ESTORNO)

---

## 🔐 Segurança

- Senhas com **BCrypt** (factor 10) — nunca retornadas em responses
- JWT **HS256**, expiração 8h (configurável em `jwt.expiration`)
- Endpoints protegidos por `@PreAuthorize` (RBAC por perfil)
- CORS liberado para `http://localhost:4200` (Angular)
- CSRF desabilitado (API stateless)
- `server.error.include-stacktrace=never` em produção

### Chave JWT
Para gerar uma chave forte em produção, defina a variável de ambiente:

```bash
export JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')"
```

---

## 🧪 Testes

```bash
mvn test
```

Inclui testes unitários para o algoritmo de CNPJ (RN07).

---

## 🐛 Bugs do código original que foram corrigidos nesta refatoração

| # | Problema                                                                  | Correção                                              |
|---|---------------------------------------------------------------------------|-------------------------------------------------------|
| 1 | Hash BCrypt do seed **não correspondia a `senha123`** (login falhava)     | Hash regenerado e validado contra `BCryptPasswordEncoder` |
| 2 | `ESTORNO` era subtraído do saldo (cancelar pedido confirmado *reduzia* estoque) | `ENTRADA + ESTORNO − SAÍDA`                          |
| 3 | `pom.xml` exigia Java 21 (SRS pede 17)                                    | Java 17 + Spring Boot 3.2.5                           |
| 4 | `PratoService` tinha import duplicado + anotação solta entre comentários  | Limpo                                                 |
| 5 | `CompraService.alterarStatus` permitia ENVIADO→RECEBIDO **sem** dar entrada nem atualizar custo | Bloqueado — força uso de `POST /compras/{id}/receber` |
| 6 | `SecurityConfig` bloqueia CLIENTE em `/api/admin/**`, mas o endpoint de cancelamento permitia CLIENTE → unreachable | Adicionado `PATCH /api/pedidos/{id}/cancelar` em `PedidoController` |
| 7 | `PedidoService.criar` fazia **dois saves** (save + iterar + save)          | Cascade `ALL` resolve em uma chamada                 |
| 8 | `application.properties` com `username=` vazio                             | Defaults via `${DB_USER:root}` + variáveis de ambiente |
| 9 | `FichaTecnicaResponse.alertaFoodCost` misturava classificação + aviso + emoji em uma única string | Separado em `classificacao` (VERDE/AMARELO/VERMELHO) e `avisoFoodCost` (mensagem ou null) |
| 10 | jjwt 0.11.5 (API obsoleta com `setClaims`/`setSubject`)                  | jjwt 0.12.5 com API nova (`claims()`/`subject()`/`SIG.HS256`) |
| 11 | jwt key derivado direto de `secret.getBytes()` sem charset explícito      | UTF-8 explícito                                       |
| 12 | `FichaTecnica.itens` LAZY causava `LazyInitializationException` quando recalculava o custo fora da transação | Mudado para EAGER (a ficha é o único caso em que itens são sempre necessários) |
| 13 | **3 dos 4 CNPJs do seed eram inválidos** pelo algoritmo da Receita Federal (`22.333.444/0001-89`, `33.444.555/0001-06`, `44.555.666/0001-40`) — passariam pelo INSERT direto, mas falhariam em qualquer update via API | CNPJs regenerados pelo próprio algoritmo do `CnpjValidator` (todos validados em teste) |

---

## 🐳 Rodando MySQL com Docker (opcional)

Se preferir não instalar MySQL local:

```bash
docker run --name comanda-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=comanda_digital \
  -p 3306:3306 \
  -d mysql:8.0
```

E rode o backend normalmente. Para parar/remover:

```bash
docker stop comanda-mysql && docker rm comanda-mysql
```

---

## 📄 Licença

Trabalho acadêmico — UNASP SP, 2026/1.
