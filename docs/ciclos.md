# Revisões de ciclo

Registro do fim de cada ciclo, com as três perguntas da [rotina do plano de ação](03-plano-de-acao.md#8-rotina-de-cada-ciclo).

## Ciclo 1: base, login e regras (`v0.1.0`)

- **Meta:** "A base está pronta, consigo entrar e as regras de URL e apelido estão testadas"
- **Revisão:** 20/11/2026
- **Resultado:** meta cumprida, issues 1 a 6 fechadas.

### O que ficou pronto

- Next.js 16 com TypeScript strict, ESLint, Prettier e Vitest (#1).
- docker-compose com PostgreSQL 17, Redis e a API REST do Redis no formato do Upstash (#2).
- CI no GitHub Actions: lint, formatação, tipos, migrações, checagem de que o schema bate com as migrações, testes, build e `npm audit` (#3).
- Schema do Prisma com as tabelas do Auth.js, `Link` e `Click`, e a primeira migração (#4).
- Login com GitHub, com a sessão guardada no banco e o painel protegido. Depois do login, a pessoa volta para onde estava, sem aceitar endereço de outro site (#5).
- Regras de URL de destino e de apelido (RN01 a RN04). São 39 testes unitários no total (#6).

### O que não ficou e por quê

Todas as issues do ciclo foram entregues. Duas verificações ficaram para depois:

- **O CI ainda não rodou no GitHub**, porque o repositório ainda não foi publicado. A mesma sequência de comandos foi rodada localmente, a partir de um `npm ci` limpo.
- **O docker-compose não foi testado nesta máquina**, que está sem Docker. As migrações e o login foram conferidos num PostgreSQL em memória (PGlite).

Contratempos no caminho:

- O npm 10 travou ao instalar o Vitest 5.1.0. A versão 5.1.1 resolveu.
- O `npm audit` apontou uma falha alta no pacote `effect`, que vem junto com o Prisma. Foi corrigida fixando a versão 3.22.4 em `overrides`.

### O que muda no próximo ciclo

- Publicar o repositório no início do ciclo 2, para o CI rodar a cada push.
- Ter o Docker funcionando antes da issue 11, que é a primeira a depender do Redis.
- Deixar pronta a configuração de fora do código (OAuth App, contas de serviço) antes de puxar a issue que depende dela. Neste ciclo, a issue 6 foi feita antes da 5 enquanto o OAuth App do GitHub era criado.
