# front-painel

Interface web do Painel do Lojista em Next.js com App Router.

Este app cuida da navegação, da experiência de operação e da camada de sessão no browser.

## Fluxo Principal

O frontend faz parte da stack Docker do repositório.
O uso esperado para rodar a aplicação inteira é:

```bash
make run-dev
```

Isso sobe frontend, backend, MySQL e Adminer de uma vez.
Rodar o frontend isoladamente só faz sentido para ajustes pontuais.

## Requisitos

- Node.js 20+
- npm
- Backend disponível para atender as requisições

## Configuração de Ambiente

Arquivo de exemplo:

- [`.env.example`](./.env.example)

Variáveis principais:

- `BACKEND_URL`
- `NEXT_PUBLIC_API_URL`

`BACKEND_URL` é a preferência para chamadas server-side. `NEXT_PUBLIC_API_URL` funciona como fallback quando o backend precisa ser acessado pelo browser.

## Instalação

```bash
npm install
cp .env.example .env
```

## Scripts

- `npm run dev` - inicia o app em desenvolvimento.
- `npm run build` - gera a build de produção.
- `npm run start` - executa a build gerada.
- `npm run lint` - executa ESLint.
- `npm run format` - formata o código.
- `npm run format:check` - valida a formatação.

## Desenvolvimento Local

1. Suba o backend.
2. Configure `BACKEND_URL` para `http://localhost:3001`.
3. Inicie o frontend com `npm run dev`.

O app usa o backend como origem de dados e mantém a sessão por meio da camada intermediária do lado servidor.

## Docker

No fluxo principal do projeto, o frontend sobe por Docker Compose e já recebe `BACKEND_URL` apontando para o serviço interno da stack.
Esse é o caminho recomendado para demonstração pública e para replicar o ambiente completo.

## Build

```bash
npm run build
npm run start
```

## Observações

- O projeto segue o App Router.
- A proteção de sessão e de rotas depende da integração com o backend.
- A base atual prioriza build, lint e arquitetura; ainda não há suíte de testes dedicada no frontend.
