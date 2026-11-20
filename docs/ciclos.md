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

## Ciclo 2: criar, gerenciar e redirecionar (`v0.2.0`)

- **Meta:** "Consigo criar e gerenciar meus links, e o link curto redireciona com cache"
- **Revisão:** 20/11/2026
- **Resultado:** meta cumprida, issues 7 a 12 fechadas.

### O que ficou pronto

- Formulário de novo link, com apelido opcional e botão para copiar o link curto (#7).
- Lista "Meus links", do mais novo para o mais antigo, com o número de cliques sem contar robôs (#8).
- Desativar, reativar e excluir. Excluir pede confirmação e não libera o apelido para outra pessoa (RN06) (#9).
- Rota `/[apelido]`, que redireciona com 302. Apelido fora do formato nem chega ao banco, e link inexistente ou desativado mostra uma página 404 em português (#10).
- Cache do redirecionamento no Redis: o link encontrado fica guardado por 24 horas e o apelido inexistente por 1 minuto. Desativar ou excluir apaga a chave na hora. Se o Redis cair, o redirecionamento lê direto do banco (#11).
- Limite de 20 links por hora por pessoa, com janela deslizante e uma mensagem que diz quantos minutos faltam (#12).
- 12 testes de integração, 3 deles com o Redis.

### O que não ficou e por quê

Todas as issues foram entregues, mas duas mudanças combinadas na revisão do ciclo 1 não aconteceram:

- **O repositório não foi publicado no início do ciclo.** A decisão foi terminar e testar tudo antes de publicar, então o CI seguiu sem rodar no GitHub.
- **O Docker continuou indisponível.** Os testes do Redis e a criação de links no navegador só rodaram no ciclo 4, quando um banco gratuito do Upstash entrou no lugar do Redis local.

Contratempos no caminho:

- Com o Redis fora do ar, o redirecionamento levava cerca de 8,7 segundos, porque o cliente do Upstash tenta de novo várias vezes por padrão. Com 1 nova tentativa e 50 ms de espera, caiu para 0,13 segundo.
- `notFound()` dentro de uma rota (`route.ts`) devolve a página 404 com o corpo vazio. A rota passou a devolver uma página HTML própria.

### O que muda no próximo ciclo

- Testar o caminho de falha de cada serviço externo (Redis fora do ar, por exemplo) junto com o caminho feliz.
- Lembrar que os testes de integração apagam o banco local, e com ele a sessão do login. O README avisa disso.

## Ciclo 3: registro dos cliques (`v0.3.0`)

- **Meta:** "Cada clique é registrado sem atrasar o visitante e já vira número"
- **Revisão:** 20/11/2026
- **Resultado:** meta cumprida, issues 13 a 15 fechadas. A folga do ciclo foi usada para adiantar as issues 16 e 17, do ciclo 4.

### O que ficou pronto

- O clique é gravado depois que o visitante já foi redirecionado, com o `after()` do Next.js ([ADR 0003](adr/0003-clique-depois-da-resposta.md)). Se a gravação falhar, o erro vai para o log e o redirecionamento não é afetado (#13).
- Leitura do clique: navegador, sistema, tipo de aparelho, país e site de origem, sem o `www.`. Robôs e prévias de apps, como as do WhatsApp e do Facebook, ficam marcados e não entram na conta (RN08) (#14).
- Consultas do painel: cliques por dia nos últimos 30 dias, no fuso de São Paulo e com os dias sem clique aparecendo como zero, e os 5 valores mais comuns de origem, navegador, aparelho e país (#15).
- 6 testes de integração para as consultas, chegando a 18 no total.

### O que não ficou e por quê

Todas as issues foram entregues. Fica uma limitação conhecida: o país vem do cabeçalho `x-vercel-ip-country`, que só a Vercel envia. Fora dela, o país aparece como "Desconhecido". A conferência fica para depois do deploy.

Contratempo no caminho: contar os dias no fuso de São Paulo, e não no UTC do banco. Um clique às 22h em São Paulo já cai no dia seguinte em UTC, por isso a consulta agrupa os cliques pelo horário local.

### O que muda no próximo ciclo

- Publicar o repositório antes do deploy, já que a Vercel publica a partir do GitHub.
- Criar as contas de produção (Neon, Upstash, Vercel e o OAuth App de produção) antes de puxar a issue 18.
