# encurtai

Encurtador de links com painel de cliques. Você cria um link curto, compartilha e acompanha quantas pessoas clicaram, em que dia, de qual navegador e de onde vieram.

**Acesse:** <https://encurtai-six.vercel.app>. Para criar links, entre com a sua conta do GitHub.

> Em desenvolvimento. O andamento segue o [plano de ação](docs/03-plano-de-acao.md).

## Stack

- Next.js 16 (App Router) e TypeScript em modo strict
- PostgreSQL com Prisma
- Redis (Upstash) para o cache do redirecionamento e o limite de requisições
- Auth.js com login do GitHub
- Tailwind CSS
- Vitest e Playwright nos testes

## Como rodar

Pré-requisitos: Node.js 22, Docker e uma conta no GitHub.

```bash
cp .env.example .env
docker compose up -d   # PostgreSQL, Redis e a API REST do Redis
npm install            # também gera o client do Prisma
npm run db:migrate     # cria as tabelas
npm run dev
```

Abra <http://localhost:3000>.

### Login com GitHub

O login precisa de um OAuth App seu no GitHub:

1. Em **Settings > Developer settings > OAuth Apps > New OAuth App**, preencha:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copie o Client ID para `AUTH_GITHUB_ID` e gere um Client secret para `AUTH_GITHUB_SECRET`, no `.env`.
3. Gere o `AUTH_SECRET`, que assina a sessão:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

## Deploy na Vercel

O projeto roda na Vercel, com o banco no Neon e o Redis no Upstash, todos em São Paulo.

1. Importe o repositório na Vercel. O `vercel.json` já define o build, que aplica as migrações antes do `next build`, e a região das funções.
2. Em **Storage**, crie um banco Neon com o prefixo `DATABASE`. A integração cria a `DATABASE_URL` e a `DATABASE_URL_UNPOOLED`, usada nas migrações.
3. Crie um banco Redis no Upstash e cadastre `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
4. Crie um OAuth App no GitHub com o callback `https://<seu-dominio>/api/auth/callback/github` e cadastre `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` e um `AUTH_SECRET` novo.

O `APP_URL` não precisa ser cadastrado: sem ele, o app usa o domínio de produção que a Vercel informa.

## Scripts

| Comando                    | O que faz                                                              |
| -------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`              | sobe o app em modo de desenvolvimento                                  |
| `npm run build`            | gera o build de produção                                               |
| `npm run lint`             | roda o ESLint                                                          |
| `npm run typecheck`        | confere os tipos com o TypeScript                                      |
| `npm run format`           | formata o código com o Prettier                                        |
| `npm test`                 | roda os testes unitários                                               |
| `npm run test:integration` | roda os testes com o banco (apaga os dados do banco local)             |
| `npm run test:e2e`         | roda os testes ponta a ponta no navegador (também apaga o banco local) |
| `npm run db:migrate`       | aplica e cria migrações do Prisma                                      |
| `npm run db:studio`        | abre o Prisma Studio                                                   |

## Documentação

- [Levantamento de requisitos](docs/01-requisitos.md)
- [Arquitetura](docs/02-arquitetura.md)
- [Plano de ação](docs/03-plano-de-acao.md)
- [Decisões técnicas (ADRs)](docs/adr/)

## Licença

[MIT](LICENSE)
