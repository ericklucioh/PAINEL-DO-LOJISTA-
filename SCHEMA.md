# SCHEMA

Este documento separa o que e regra de negocio do que e persistencia.

## 1. Modelo De Negocio

### 1.1 Principios

- `Product` nao guarda `estoqueAtual` como fonte da verdade.
- O estoque nasce de um livro-razao de movimentos.
- `Sale` e `CashRegister` tambem devem ser auditaveis por movimentos.
- Dados historicos sao snapshots, nao referencias mutaveis.
- Tabelas de dominio fechado devem virar `enum`, nao tabela auxiliar.
- Soft delete usa `isActive` e, quando necessario, `deletedAt`.

### 1.2 Entidades De Dominio

#### User

- Representa admin ou vendedor.
- Campos principais: `id`, `fullName`, `email`, `passwordHash`, `role`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.
- Regras:
  - `email` unico.
  - `role` deve ser um conjunto fechado, idealmente `ADMIN` ou `VENDEDOR`.
  - usuario inativo nao autentica nem acessa rotas protegidas.

#### RefreshToken

- Representa a sessao renovavel do JWT.
- Campos principais: `id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `createdAt`.
- Regras:
  - refresh token nunca deve ser salvo puro.
  - token revogado nao pode renovar JWT.
  - a rotacao de refresh token deve invalidar o anterior.

#### Product

- Representa o cadastro comercial do item.
- Campos principais: `id`, `ean`, `name`, `price`, `minStock`, `maxStock`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.
- Regras:
  - `ean` unico com 13 digitos.
  - `price` maior que zero.
  - `minStock` menor que `maxStock`.
  - produto inativo nao pode ser vendido.
  - `Product` nao carrega o saldo atual como coluna principal.

#### InventoryMovement

- Representa qualquer alteracao de estoque.
- Campos principais: `id`, `productId`, `userId`, `type`, `quantity`, `note`, `saleId`, `createdAt`.
- Regras:
  - cada movimento registra quantidade positiva e o `type` define o sinal logico.
  - entradas: compra, devolucao, ajustes positivos.
  - saidas: danificado, perda, venda, ajuste negativo.
  - o historico e o saldo atual devem poder ser reconstruidos a partir dos movimentos.

#### InventoryBalance

- Representa a projeção atual do estoque por produto.
- Campos principais: `productId`, `currentQuantity`, `updatedAt`.
- Regras:
  - e uma tabela auxiliar de leitura, nao a fonte da verdade.
  - deve ser atualizada na mesma transacao que grava o movimento.
  - pode ficar negativa se a regra de saida permitir.

#### CashRegister

- Representa o caixa aberto por usuario.
- Campos principais: `id`, `openedByUserId`, `initialBalance`, `status`, `openedAt`, `closedAt`, `createdAt`, `updatedAt`.
- Regras:
  - um usuario nao deve ter mais de um caixa aberto ao mesmo tempo.
  - em MySQL isso tende a ser garantido pela aplicacao e pela transacao, porque nao existe unique partial index nativo como em outros bancos.
  - abertura de caixa exige saldo inicial.
  - o saldo atual pode ser obtido por movimentos de caixa.

#### CashMovement

- Representa o livro-razao financeiro do caixa.
- Campos principais: `id`, `cashRegisterId`, `saleId`, `type`, `amount`, `note`, `createdByUserId`, `createdAt`.
- Regras:
  - abertura de caixa gera movimento inicial.
  - venda gera movimento de entrada.
  - cancelamento gera movimento de reversao.
  - os valores devem ser `Decimal`, nunca `Float`.

#### Sale

- Representa a finalizacao de uma venda.
- Campos principais: `id`, `receiptNumber`, `cashRegisterId`, `soldByUserId`, `subtotal`, `discountAmount`, `totalAmount`, `paymentMethod`, `status`, `createdAt`, `cancelledAt`, `cancelReason`.
- Regras:
  - venda so pode existir com caixa aberto.
  - `receiptNumber` deve ser sequencial e unico.
  - totais sao snapshots calculados no momento da confirmacao.
  - cancelamento deve reverter estoque e caixa em transacao.

#### SaleItem

- Representa os itens da venda.
- Campos principais: `id`, `saleId`, `productId`, `productNameSnapshot`, `productEanSnapshot`, `unitPriceSnapshot`, `quantity`, `subtotal`.
- Regras:
  - usa snapshot de nome, EAN e preco para manter o recibo historico consistente.
  - nunca recalcula total historico a partir do cadastro atual do produto.

### 1.3 Regras De Negocio Consolidada

- Estoque atual = soma dos movimentos ou leitura da projection `InventoryBalance`.
- Historico de estoque deve mostrar data, tipo, quantidade e saldo acumulado.
- Entrada e saida de estoque sao movimentos, nao edicoes diretas de quantidade.
- Movimentos de estoque devem ser imutaveis depois de persistidos.
- Venda e cancelamento sempre acontecem dentro de transacao ACID.
- Dados operacionais nunca devem depender de campos mutaveis para manter historico.
- Tabelas de lookup como `Type`, `Status` e `PaymentType` so fazem sentido se houver necessidade real de relacionamento extra; neste caso, enums sao mais simples e corretos.

## 2. Modelo Relacional Sugerido

### 2.1 `users`

- `id`
- `full_name`
- `email` unique
- `password_hash`
- `role`
- `is_active`
- `deactivated_at`
- `created_at`
- `updated_at`

### 2.2 `refresh_tokens`

- `id`
- `user_id` FK
- `token_hash`
- `expires_at`
- `revoked_at`
- `created_at`

### 2.3 `products`

- `id`
- `ean` unique
- `name`
- `price`
- `min_stock`
- `max_stock`
- `is_active`
- `deactivated_at`
- `created_at`
- `updated_at`

### 2.4 `inventory_balances`

- `product_id` PK/FK
- `current_quantity`
- `updated_at`

### 2.5 `inventory_movements`

- `id`
- `product_id` FK
- `user_id` FK
- `sale_id` FK nullable
- `type`
- `quantity`
- `note` nullable
- `created_at`

### 2.6 `cash_registers`

- `id`
- `opened_by_user_id` FK
- `initial_balance`
- `status`
- `opened_at`
- `closed_at` nullable
- `created_at`
- `updated_at`

### 2.7 `cash_movements`

- `id`
- `cash_register_id` FK
- `sale_id` FK nullable
- `created_by_user_id` FK
- `type`
- `amount`
- `note` nullable
- `created_at`

### 2.8 `sales`

- `id`
- `receipt_number` unique
- `cash_register_id` FK
- `sold_by_user_id` FK
- `subtotal`
- `discount_amount`
- `total_amount`
- `payment_method`
- `status`
- `cancelled_at` nullable
- `cancel_reason` nullable
- `created_at`
- `updated_at`

### 2.9 `sale_items`

- `id`
- `sale_id` FK
- `product_id` FK
- `product_name_snapshot`
- `product_ean_snapshot`
- `unit_price_snapshot`
- `quantity`
- `subtotal`

## 3. Decisoes Importantes

- `Product` nao tera coluna `stock`.
- O saldo atual vai morar em `inventory_balances`, alimentado por `inventory_movements`.
- Para recibo numerado, eu recomendo:
  - usar `receipt_number` unico;
  - gerar esse numero na aplicacao com controle transacional, ou
  - derivar de um contador dedicado se voce quiser rigor maior.
- `cash_registers` nao precisa de uma tabela de status separada; `enum` resolve melhor.
- `payment_method`, `sale_status`, `cash_register_status`, `inventory_movement_type` e `user_role` tambem sao bons candidatos a `enum`.
- Se voce quiser deixar isso ainda mais profissional, o proximo passo e transformar este documento em um `Prisma schema` limpo, com nomes consistentes e relacoes fechadas.
