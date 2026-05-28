# Modelos Core

Este arquivo resume apenas os pilares de regra de negocio do sistema.

Nao entram aqui:
- projecoes de leitura
- tabelas auxiliares
- tabelas de join puras
- tokens de autenticacao

## 1. User

Representa o usuario do sistema, com permissao de acesso e operacao.

Campos principais:
- `id`
- `fullName`
- `email`
- `passwordHash`
- `role`
- `deactivatedAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

Regras principais:
- `email` deve ser unico.
- `role` e um conjunto fechado, como `ADMIN` ou `VENDEDOR`.
- usuario inativo nao autentica nem acessa rotas protegidas.

## 2. Product

Representa o cadastro comercial do item vendido no sistema.

Campos principais:
- `id`
- `ean`
- `name`
- `price_de_venda`
- `minStock`
- `maxStock`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

Regras principais:
- `ean` deve ser unico e ter 13 digitos.
- `price` deve ser maior que zero.
- `minStock` deve ser menor que `maxStock`.
- produto inativo nao pode ser vendido.
- `Product` nao deve carregar estoque atual como fonte da verdade.

## 3. InventoryMovement

Representa qualquer alteracao de estoque.

Campos principais:
- `id`
- `productId`
- `userId`
- `type`
- `quantity`
- `note`
- `saleId`
- `createdAt`

Regras principais:
- cada movimento registra quantidade positiva.
- o `type` define o sentido logico da operacao.
- entradas cobrem compra, devolucao e ajustes positivos.
- saidas cobrem danificado, perda, venda e ajustes negativos.
- o saldo do estoque precisa ser reconstruivel a partir dos movimentos.
- movimentos nao devem ser editados depois de salvos.

## 4. CashRegister

Representa o caixa aberto por um usuario.

Campos principais:
- `id`
- `openedByUserId`
- `initialBalance`
- `status`
- `openedAt`
- `closedAt`
- `createdAt`
- `updatedAt`

Regras principais:
- um usuario nao deve ter mais de um caixa aberto ao mesmo tempo.
- abertura de caixa exige saldo inicial.
- a operacao de venda depende de caixa aberto.
- o saldo do caixa deve ser rastreavel por movimentos.

## 5. CashMovement

Representa o livro-razao financeiro do caixa.

Campos principais:
- `id`
- `cashRegisterId`
- `saleId`
- `type`
- `amount`
- `note`
- `createdByUserId`
- `createdAt`

Regras principais:
- abertura de caixa gera movimento inicial.
- venda gera entrada de caixa.
- cancelamento gera reversao.
- valores devem ser `Decimal`, nunca `Float`.

## 6. Sale

Representa a conclusao de uma venda.

Campos principais:
- `id`
- `receiptNumber`
- `cashRegisterId`
- `soldByUserId`
- `subtotal`
- `discountAmount`
- `totalAmount`
- `paymentMethod`
- `status`
- `createdAt`
- `cancelledAt`
- `cancelReason`

Regras principais:
- venda so existe com caixa aberto.
- `receiptNumber` deve ser sequencial e unico.
- totais sao snapshots do momento da confirmacao.
- cancelamento deve reverter estoque e caixa em transacao.

## 7. SaleItem

Representa os itens que compoem uma venda.

Campos principais:
- `id`
- `saleId`
- `productId`
- `productNameSnapshot`
- `productEanSnapshot`
- `unitPriceSnapshot`
- `quantity`
- `subtotal`

Regras principais:
- usa snapshot de nome, EAN e preco.
- nao pode depender do cadastro atual do produto para recalcular historico.
- existe para preservar a integridade do recibo e da auditoria da venda.

## 8. Pilares Do Dominio

Os pilares centrais do sistema sao:

- Identidade e acesso: `User`
- Cadastro comercial: `Product`
- Auditoria de estoque: `InventoryMovement`
- Operacao de caixa: `CashRegister`
- Auditoria financeira: `CashMovement`
- Finalizacao de venda: `Sale`
- Itens historicos da venda: `SaleItem`

## 9. Fora Do Core

Estes itens existem no sistema, mas nao sao pilares do dominio principal:

- `RefreshToken`
- `InventoryBalance`
- enums e tabelas de lookup
- tabelas de relacionamento puras

