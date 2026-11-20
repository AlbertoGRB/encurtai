# ADR 0001: Monolito em Next.js organizado por funcionalidade

- **Situação:** aceita
- **Data:** 2026-11-19

## Contexto

O encurtai tem dois domínios (links e cliques), uma pessoa desenvolvendo e precisa rodar no plano gratuito. A rota de redirecionamento precisa ser rápida; o resto é um painel comum.

## Decisão

Um único app Next.js (App Router) com as telas, as Server Actions e a rota de redirecionamento, com o código separado em três camadas: `app/` (rotas), `actions/` (casos de uso) e `lib/` (regras e dados).

## Alternativas consideradas

- **API Express + front React separados:** dois deploys, CORS e autenticação entre os dois, sem benefício neste tamanho.
- **Microsserviço de redirecionamento:** resolveria um problema de escala que o projeto não tem; o cache já atende à meta de velocidade.
- **Monolito modular com contratos entre módulos:** útil com muitos domínios; com dois, as pastas por funcionalidade bastam.

## Consequências

- Positivas: um deploy, um repositório, depuração simples e menos configuração.
- Negativas: a rota de redirecionamento escala junto com o painel. Se o volume de cliques crescer muito, a rota pode ser extraída, e a separação em `lib/` deixa isso barato.
