# Painel do Lojista

Resolução de um **desafio técnico full-stack** para desenvolvimento de um MVP de gestão de loja, conforme os requisitos descritos em [`DESAFIO.md`](./DESAFIO.md).

O objetivo do projeto é demonstrar capacidade de implementação em um cenário próximo de uma aplicação real, cobrindo autenticação, CRUDs, validação, integração frontend-backend, controle de estoque, operação de caixa e fluxo de vendas.

## Sobre o Desafio

O desafio propõe a construção de um **Minimum Viable Core System (MVCS)** para um painel de lojista, com foco em:

- autenticação com JWT e refresh token;
- controle de acesso por perfil de usuário;
- CRUD de usuários;
- CRUD de produtos;
- busca de produto por EAN;
- registro de entrada e saída de estoque;
- abertura de caixa;
- carrinho de vendas;
- finalização de venda à vista;
- geração de recibo;
- integração entre frontend, backend e banco de dados;
- documentação e setup local com Docker.

A especificação completa está disponível em [`DESAFIO.md`](./DESAFIO.md).

## Stack Utilizada

O repositório é dividido em dois aplicativos principais:

- [`back-painel`](./back-painel): API em **Node.js**, **Express**, **TypeScript**, **Prisma** e **MySQL**.
- [`front-painel`](./front-painel): interface em **Next.js**, **App Router**, **React Hook Form**, **Zod**, **Tailwind CSS** e **shadcn/ui**.

Também há suporte a execução local com:

- Docker Compose;
- MySQL 8;
- Adminer;
- Makefile;
- arquivos `.env.example`.

## Visão Geral da Solução

O projeto implementa o fluxo central de um MVP de varejo:

- login com autenticação segura;
- sessão com access token e refresh token;
- rotas protegidas por perfil;
- administração de usuários;
- cadastro e manutenção de produtos;
- controle de estoque com entradas e saídas;
- abertura de caixa;
- tela de vendas com carrinho por EAN;
- aplicação de desconto;
- finalização de venda;
- geração de resumo/recibo;
- cancelamento de venda;
- persistência em banco relacional.

## Estrutura do Repositório

```text
.
├── back-painel/        # API, Prisma, regras de negócio e testes
├── front-painel/       # App web em Next.js
├── docker-compose.yml  # MySQL, Adminer, backend e frontend
├── Makefile            # Atalhos de desenvolvimento e validação
├── DESAFIO.md          # Especificação do desafio técnico
├── ENVIRONMENT.md      # Mapa central das variáveis de ambiente
├── back-painel/README.md
└── front-painel/README.md
```

## Documentação

- [`DESAFIO.md`](./DESAFIO.md): requisitos funcionais e técnicos do desafio.
- [`ENVIRONMENT.md`](./ENVIRONMENT.md): variáveis de ambiente usadas no projeto.
- [`back-painel/README.md`](./back-painel/README.md): detalhes do backend.
- [`front-painel/README.md`](./front-painel/README.md): detalhes do frontend.

## Funcionalidades Implementadas

### Autenticação e Sessão

- Login com e-mail e senha.
- Access token com expiração curta.
- Refresh token para renovação de sessão.
- Cookies `httpOnly`.
- Proteção de rotas.
- Controle de acesso por perfil.

### Usuários

- Listagem de usuários.
- Criação de usuário.
- Edição de dados.
- Desativação com soft delete.
- Restrição de acesso para administradores.

### Produtos

- Listagem paginada.
- Busca.
- Cadastro de produto.
- Edição.
- Inativação.
- Validação de EAN.
- Validação de preço.
- Controle de estoque mínimo e máximo.
- Indicação de estoque crítico.

### Estoque

- Registro de entrada.
- Registro de saída.
- Histórico de movimentações.
- Atualização do saldo de estoque.

### Caixa e Vendas

- Abertura de caixa.
- Validação de caixa aberto antes da venda.
- Busca de produto por EAN.
- Carrinho de venda.
- Alteração de quantidade.
- Remoção de itens.
- Aplicação de desconto.
- Finalização de venda.
- Geração de resumo/recibo.
- Cancelamento de venda.

## Como Rodar

O projeto foi pensado para rodar principalmente com Docker.

### Caminho recomendado

```bash
make run-dev
```

Ou diretamente:

```bash
docker compose up --build
```

Serviços expostos por padrão:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Adminer: `http://localhost:8080`

## Requisitos

- Docker
- Docker Compose
- Make
- Node.js 20+ apenas para execução manual fora do Docker
- npm apenas para manutenção local dos apps fora do fluxo principal

## Configuração de Ambiente

Existem arquivos de exemplo para as três camadas do projeto:

- [`.env.example`](./.env.example)
- [`back-painel/.env.example`](./back-painel/.env.example)
- [`front-painel/.env.example`](./front-painel/.env.example)

Fluxo recomendado:

1. Copie os arquivos `.env.example` para seus respectivos `.env`.
2. Ajuste as variáveis necessárias, principalmente:
   - `DATABASE_URL`
   - `SHADOW_DATABASE_URL`
   - `JWT_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `CORS_ORIGINS`
   - `BACKEND_URL`
3. Suba a stack com:

```bash
make run-dev
```

## Comandos Principais

### Makefile

```bash
make run-dev        # sobe a stack com Docker Compose
make down-dev       # derruba os containers
make format         # formata backend e frontend
make format-check   # valida formatação
make lint           # executa lint nos dois apps
make build          # executa build nos dois apps
make test           # executa a suíte do backend via Docker Compose
make setup-hooks    # configura hooks locais do Git
```

### Backend

```bash
npm run dev
npm run build
npm run lint
npm run test:run
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Execução Manual

A execução sem Docker existe, mas não é o fluxo principal do projeto.

Use esse caminho apenas se quiser trabalhar isoladamente no backend ou frontend.

Para detalhes específicos, consulte:

- [`back-painel/README.md`](./back-painel/README.md)
- [`front-painel/README.md`](./front-painel/README.md)

## Qualidade e Validação

O projeto foi estruturado para demonstrar não apenas funcionamento, mas também organização e boas práticas esperadas em um desafio técnico:

- separação entre frontend e backend;
- validação de entrada com Zod;
- autenticação baseada em JWT;
- autorização por perfil;
- ORM com Prisma;
- migrations versionadas;
- seed de dados;
- tratamento de erros;
- scripts de lint, build e testes;
- setup local com Docker;
- documentação de ambiente.

## Observações Técnicas

- O backend concentra as regras de negócio e expõe a API REST.
- O frontend utiliza uma camada intermediária para comunicação com a API e controle de sessão.
- O banco de dados utilizado no ambiente local é MySQL via Docker.
- A documentação das variáveis de ambiente está centralizada em [`ENVIRONMENT.md`](./ENVIRONMENT.md).
- O projeto foi desenvolvido com foco em um MVP funcional, seguindo os requisitos do desafio técnico.

## Status do Projeto

Este repositório representa a entrega de um desafio técnico full-stack.

O foco principal foi cumprir o escopo proposto em [`DESAFIO.md`](./DESAFIO.md), mantendo uma estrutura compreensível, validável e adequada para avaliação técnica.

## Autor

Desenvolvido por Érick Lúcio como projeto de desafio técnico e portfólio.
