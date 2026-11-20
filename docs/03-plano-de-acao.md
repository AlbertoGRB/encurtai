# Plano de ação: encurtai

## 1. Metodologia

**Kanban com ciclos semanais**, um Scrumban adaptado para uma pessoa.

O Scrum puro pressupõe um time com papéis separados (Product Owner, Scrum Master e desenvolvedores) e cerimônias feitas para alinhar várias pessoas. Num projeto de uma pessoa, daily e planning viram burocracia. Por isso o plano usa o quadro do Kanban e aproveita do Scrum só o que funciona para uma pessoa:

| Vem do Scrum | Vem do Kanban |
|---|---|
| backlog priorizado (as histórias do levantamento, com prioridade MoSCoW) | quadro visual com o fluxo do trabalho |
| ciclos curtos, de 1 semana, cada um com uma meta | limite de trabalho em andamento: no máximo 2 cards em "Fazendo" |
| revisão no fim de cada ciclo | puxar a próxima tarefa só quando a atual termina |
| Definição de Pronto | |

## 2. Ferramentas e fluxo

- **Quadro:** GitHub Projects com as colunas Backlog → Pronto para começar → Fazendo (máx. 2) → Em revisão → Feito.
- **Issues:** uma por história ou tarefa técnica, com os critérios de aceite copiados do [levantamento](01-requisitos.md).
- **Milestones:** uma por ciclo, com a meta escrita em uma frase.
- **Branches:** `main` protegida, uma branch por issue (`feat/7-criar-link`), pull request com checklist e merge com squash.
- **Commits:** Conventional Commits em português (`feat: cria link curto com apelido aleatório`).
- **Versões:** tag ao fim de cada ciclo (`v0.1.0`, `v0.2.0`), com o MVP em `v1.0.0`.

## 3. Definição de Preparado (para começar uma issue)

- Critérios de aceite escritos.
- O que a issue precisa de outras já está pronto.
- Cabe em até 2 dias. Se não couber, é dividida.

## 4. Definição de Pronto

- Critérios de aceite atendidos.
- Testes escritos e passando no CI.
- Lint e checagem de tipos sem erro.
- Nenhum segredo no código; `.env.example` atualizado se surgiu variável nova.
- README ou docs atualizados quando o comportamento muda.
- Pull request revisado com o checklist e mergeado.

## 5. Cronograma

Capacidade: no máximo 5 dias de trabalho planejados por ciclo. O que não couber vai para o ciclo seguinte, em vez de apertar a semana.

| Ciclo | Meta | Issues | Dias planejados | Versão |
|---|---|---|---|---|
| 1 | "A base está pronta, consigo entrar e as regras de URL e apelido estão testadas" | 1 a 6 | 4 | `v0.1.0` |
| 2 | "Consigo criar e gerenciar meus links, e o link curto redireciona com cache" | 7 a 12 | 4,5 | `v0.2.0` |
| 3 | "Cada clique é registrado sem atrasar o visitante e já vira número" | 13 a 15 | 3 | `v0.3.0` |
| 4 | "O painel mostra os resultados e o projeto está no ar" | 16 a 19 | 5 | `v1.0.0` |

O ciclo 3 tem folga de propósito: é onde entram as duas tecnologias usadas pela primeira vez (`after()` e leitura de user-agent), e o que sobrar adianta o painel.

## 6. Backlog inicial

Estimativa: **P** = meio dia, **M** = 1 dia, **G** = 2 dias.

| # | Tipo | Issue | Origem | Ciclo | Tamanho |
|---|---|---|---|---|---|
| 1 | chore | Configurar Next.js, TypeScript strict, ESLint e Prettier | RNF07 | 1 | P |
| 2 | chore | docker-compose com PostgreSQL e Redis | — | 1 | P |
| 3 | chore | CI com lint, tipos, testes e build | RNF07 | 1 | P |
| 4 | chore | Schema do Prisma e primeira migração | — | 1 | P |
| 5 | feat | Login com GitHub | US05, RF01 | 1 | M |
| 6 | feat | Validação de URL e de apelido | RN01 a RN04 | 1 | M |
| 7 | feat | Criar link e copiar | US01, RF02, RF03, RF10 | 2 | M |
| 8 | feat | Listar meus links | RF06 | 2 | P |
| 9 | feat | Desativar, reativar e excluir | US04, RF08, RF09, RN06 | 2 | M |
| 10 | feat | Rota de redirecionamento lendo do banco | US02, RF04, RN05 | 2 | P |
| 11 | feat | Cache no Redis e cache de apelido inexistente | RNF01 | 2 | M |
| 12 | feat | Limite de 20 links por hora | RN07 | 2 | P |
| 13 | feat | Registrar o clique depois da resposta | RF05, RNF02 | 3 | M |
| 14 | feat | Ler user-agent, país e origem e detectar robôs | RF05, RN08 | 3 | M |
| 15 | feat | Consultas do painel | US03, RF07 | 3 | M |
| 16 | feat | Tela do painel com gráficos | US03, RF07 | 4 | G |
| 17 | test | Ponta a ponta: criar, abrir e ver o clique | US01 a US03 | 4 | M |
| 18 | chore | Deploy na Vercel com Neon e Upstash | RNF08 | 4 | M |
| 19 | docs | Medição de desempenho e README com GIF | RNF01 | 4 | M |

Total estimado: 16,5 dias de trabalho, distribuídos em 4 ciclos.

## 7. Riscos do cronograma

| Risco | Resposta |
|---|---|
| Primeiro uso do Auth.js e do `after()` | meio dia de estudo (spike) antes da issue 5, no ciclo 1, e antes da issue 13, no ciclo 3, que tem folga para isso |
| Redis local diferente do Upstash | usar o serverless-redis-http no docker-compose, que fala o mesmo protocolo do Upstash |
| Gráficos tomarem mais tempo que o previsto | entregar primeiro o gráfico por dia (o principal) e os demais em seguida |

## 8. Rotina de cada ciclo

- **Início:** escolher as issues do ciclo no quadro e escrever a meta na milestone.
- **Durante:** puxar a próxima issue só quando a atual estiver pronta, respeitando o limite de 2 em andamento.
- **Fim:** revisão de 15 minutos com três perguntas (o que ficou pronto, o que não ficou e por quê, o que muda no próximo ciclo), registrada em `docs/ciclos.md`, e tag da versão.
