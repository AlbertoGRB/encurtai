# ADR 0002: Cache do redirecionamento no Redis

- **Situação:** aceita
- **Data:** 2026-11-19

## Contexto

Todo clique passa pela rota `/[slug]`. Buscar no PostgreSQL a cada clique deixa o redirecionamento mais lento e gasta o limite do plano gratuito do Neon. A meta (RNF01) é responder em menos de 100 ms no p95.

## Decisão

- Guardar `apelido → URL` no Redis (Upstash) por 24 horas.
- Guardar também quando o apelido não existe, por 1 minuto, para quem testa apelidos aleatórios não chegar ao banco.
- Apagar a chave do cache na hora em que o link é desativado, reativado ou excluído.

## Alternativas consideradas

- **Sem cache:** mais simples, mas não atinge a meta de tempo e consome o banco a cada clique.
- **Cache em memória do servidor:** não funciona bem em ambiente serverless, onde cada instância tem a própria memória e some a qualquer momento.
- **Cache de borda da CDN:** rápido, mas difícil de invalidar na hora quando o link é desativado.

## Consequências

- Positivas: redirecionamento rápido e banco protegido.
- Negativas: mais um serviço para configurar, e a invalidação precisa ser lembrada em toda ação que muda o link. Os testes de integração cobrem isso.
