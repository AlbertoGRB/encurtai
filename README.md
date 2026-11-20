# encurtai

Encurtador de links com painel de cliques. Você cria um link curto, compartilha e acompanha quantas pessoas clicaram, em que dia, de qual navegador e de onde vieram.

> Em desenvolvimento. O andamento segue o [plano de ação](docs/03-plano-de-acao.md).

## Stack

- Next.js 16 (App Router) e TypeScript em modo strict
- PostgreSQL com Prisma
- Redis (Upstash) para o cache do redirecionamento e o limite de requisições
- Auth.js com login do GitHub
- Tailwind CSS
- Vitest e Playwright nos testes

## Como rodar

Pré-requisitos: Node.js 22 e Docker.

```bash
cp .env.example .env
docker compose up -d   # PostgreSQL, Redis e a API REST do Redis
npm install            # também gera o client do Prisma
npm run db:migrate     # cria as tabelas
npm run dev
```

Abra <http://localhost:3000>.

## Scripts

| Comando              | O que faz                             |
| -------------------- | ------------------------------------- |
| `npm run dev`        | sobe o app em modo de desenvolvimento |
| `npm run build`      | gera o build de produção              |
| `npm run lint`       | roda o ESLint                         |
| `npm run typecheck`  | confere os tipos com o TypeScript     |
| `npm run format`     | formata o código com o Prettier       |
| `npm test`           | roda os testes com o Vitest           |
| `npm run db:migrate` | aplica e cria migrações do Prisma     |
| `npm run db:studio`  | abre o Prisma Studio                  |

## Documentação

- [Levantamento de requisitos](docs/01-requisitos.md)
- [Arquitetura](docs/02-arquitetura.md)
- [Plano de ação](docs/03-plano-de-acao.md)
- [Decisões técnicas (ADRs)](docs/adr/)

## Licença

[MIT](LICENSE)
