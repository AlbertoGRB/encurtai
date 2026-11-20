# Levantamento de requisitos: encurtai

## 1. Problema

Quem divulga links (pequenos negócios, social media, criadores de conteúdo) precisa de links curtos, que caibam numa bio ou numa mensagem sem quebrar, e quer saber se a divulgação funcionou: quantas pessoas clicaram, quando e por qual canal chegaram. Um link longo não resolve nenhuma das duas coisas.

## 2. Público-alvo

| Perfil | Quem é | O que precisa |
|---|---|---|
| Divulgador | dono de pequeno negócio, social media | criar link curto rápido e saber qual canal trouxe mais cliques |
| Visitante | quem clica no link | chegar ao destino na hora, sem tela no meio do caminho |

## 3. Como os requisitos foram levantados

- **Análise de ferramentas parecidas**, para separar o que é básico em todas do que é diferencial:

| Ferramenta | O que oferece | O que serve de referência |
|---|---|---|
| Bitly | painel completo, mas boa parte dos relatórios fica no plano pago | cliques por dia e por origem como informação principal |
| TinyURL | rápido e sem cadastro, quase sem métricas | criar o link em um passo |
| Dub | código aberto, painel moderno | interface limpa do painel |

- **Definição de escopo** para caber em 4 semanas de trabalho de uma pessoa, usando só serviços com plano gratuito.

## 4. Requisitos funcionais

Prioridade pelo método MoSCoW: **Must** entra no MVP, **Should** entra se der tempo, **Could** fica para uma próxima versão, **Won't** está fora desta versão.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O usuário entra com a conta do GitHub | Must |
| RF02 | O usuário cria um link curto informando a URL de destino | Must |
| RF03 | O usuário pode escolher o apelido do link em vez do aleatório | Must |
| RF04 | O visitante que abre o link curto é redirecionado para o destino | Must |
| RF05 | Cada clique é registrado com data, origem, navegador, sistema, aparelho e país | Must |
| RF06 | O usuário vê a lista dos seus links com o total de cliques de cada um | Must |
| RF07 | O usuário vê o painel de um link: cliques por dia (30 dias), origens, navegadores, aparelhos e países | Must |
| RF08 | O usuário desativa e reativa um link | Must |
| RF09 | O usuário exclui um link | Must |
| RF10 | O usuário copia o link curto com um clique | Should |
| RF11 | O usuário gera o QR code do link | Could |
| RF12 | O usuário define data de expiração do link | Could |
| RF13 | O usuário exporta os cliques em CSV | Could |
| RF14 | O usuário usa domínio próprio | Won't |

## 5. Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF01 | Desempenho | Redirecionamento com o apelido em cache responde em menos de 100 ms no servidor (p95), medido e publicado no README |
| RNF02 | Disponibilidade | Se a gravação do clique falhar, o redirecionamento acontece mesmo assim |
| RNF03 | Privacidade (LGPD) | Não armazenar IP do visitante nem a URL completa de origem |
| RNF04 | Segurança | Só aceitar destino `http` ou `https`, limitar criação de links e conferir o dono em toda ação |
| RNF05 | Usabilidade | Funcionar no celular; criar um link em até 2 cliques depois do login |
| RNF06 | Acessibilidade | Formulários e painel navegáveis por teclado, com contraste nível AA |
| RNF07 | Manutenibilidade | TypeScript em modo strict, lint e testes no CI; regras de negócio com mais de 80% de cobertura |
| RNF08 | Custo | Rodar nos planos gratuitos da Vercel, do Neon e do Upstash |

## 6. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | O apelido aleatório tem 7 caracteres, com letras minúsculas e números, sem os ambíguos (`0`, `o`, `1`, `l`) |
| RN02 | O apelido escolhido tem de 3 a 30 caracteres: letras minúsculas, números e hífen, sem hífen no começo ou no fim |
| RN03 | O apelido é único no sistema e não pode ser uma palavra reservada (`dashboard`, `login`, `api` e demais caminhos do app) |
| RN04 | A URL de destino é `http` ou `https`, tem até 2.048 caracteres e não aponta para o próprio encurtador |
| RN05 | Link desativado ou excluído devolve 404 ao visitante |
| RN06 | O apelido de um link excluído não volta a ficar disponível, para um link antigo nunca levar a um destino de outra pessoa |
| RN07 | Cada usuário cria no máximo 20 links por hora |
| RN08 | Clique de robô (prévia do WhatsApp, buscadores) é registrado, mas fica fora dos números e gráficos |
| RN09 | Só o dono vê o painel do link e pode alterá-lo |

## 7. Histórias de usuário

### US01: Criar link curto (RF02, RF03, RF10)

Como divulgador, quero colar uma URL e receber um link curto, para compartilhar em qualquer lugar.

Critérios de aceite:
- Dado que estou logado, quando colo uma URL válida e confirmo, então recebo o link curto e consigo copiá-lo.
- Dado que informo `javascript:alert(1)`, quando confirmo, então vejo "URL inválida" e nada é criado.
- Dado que escolho um apelido já em uso ou reservado, quando confirmo, então vejo "apelido indisponível".
- Dado que já criei 20 links na última hora, quando tento criar outro, então vejo quanto tempo falta para liberar.

### US02: Ser redirecionado (RF04, RF05)

Como visitante, quero abrir o link curto e chegar ao destino na hora.

Critérios de aceite:
- Dado um link ativo, quando abro, então sou redirecionado (302) para o destino.
- Dado um link desativado, excluído ou inexistente, quando abro, então vejo a página 404.
- Dado que a gravação do clique falha, quando abro, então ainda sou redirecionado.

### US03: Acompanhar resultados (RF06, RF07)

Como divulgador, quero ver os cliques por dia e por origem, para saber qual canal funcionou.

Critérios de aceite:
- Dado um link com cliques, quando abro o painel, então vejo o gráfico dos últimos 30 dias, com os dias sem clique aparecendo como zero.
- Dado que houve cliques de robôs, então eles não entram nos números.
- Dado o link de outro usuário, quando tento abrir o painel pelo endereço, então vejo 404.

### US04: Desativar e excluir (RF08, RF09)

Como divulgador, quero desativar um link sem perder o histórico, ou excluí-lo de vez.

Critérios de aceite:
- Dado um link ativo, quando desativo, então ele para de redirecionar imediatamente, e volta a funcionar quando reativo.
- Dado um link, quando peço para excluir, então o sistema pede confirmação, e depois o apelido não fica disponível para ninguém.

### US05: Entrar (RF01)

Como divulgador, quero entrar com minha conta do GitHub, para não criar mais uma senha.

Critérios de aceite:
- Dado que não estou logado, quando abro o painel, então sou levado ao login.
- Dado que entro com o GitHub, então volto para a página onde estava.

## 8. Premissas e restrições

- Projeto de uma pessoa, com cerca de 4 semanas de trabalho.
- Infraestrutura somente em planos gratuitos.
- Login só pelo GitHub: evita guardar senha, e quem vai testar o projeto já tem conta lá.
- Sem domínio próprio no MVP: o link curto usa o domínio da Vercel.

## 9. Riscos

| Risco | Impacto | Resposta |
|---|---|---|
| Uso do encurtador para spam ou phishing | domínio bloqueado por navegadores | só usuários logados criam links, limite por hora, e verificação no Google Safe Browsing como próxima melhoria |
| Estourar o limite gratuito do Upstash ou do Neon | site fora do ar | cache com tempo de expiração, poucas consultas por clique, acompanhamento do uso no painel de cada serviço |
| Robôs inflando os números | métricas erradas | detecção pelo user-agent (biblioteca isbot) e exclusão dos gráficos |
