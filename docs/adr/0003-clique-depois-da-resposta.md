# ADR 0003: Gravar o clique depois de responder ao visitante

- **Situação:** aceita
- **Data:** 2026-11-19

## Contexto

Registrar o clique exige ler o user-agent e gravar no banco. Se isso acontecer antes do redirecionamento, o visitante espera a gravação, e uma falha no banco impede o redirecionamento (RNF02).

## Decisão

Usar o `after()` do Next.js: a rota responde com o 302 primeiro, e a gravação do clique roda em seguida, no mesmo processo. Uma falha na gravação vai para o log e não afeta o visitante.

## Alternativas consideradas

- **Gravar antes de responder:** mais simples, mas deixa o redirecionamento lento e frágil.
- **Fila (Redis ou RabbitMQ) e um worker gravando em lote:** aguenta volume alto, mas exige um processo a mais rodando sempre, o que não cabe no plano gratuito nem no tamanho do MVP.

## Consequências

- Positivas: o visitante nunca espera a gravação, e não há infraestrutura extra.
- Negativas: se a instância cair entre a resposta e a gravação, aquele clique se perde. Para um painel de métricas, essa perda é aceitável. Se o volume crescer, o próximo passo é acumular os cliques no Redis e gravar em lote (já previsto no roadmap).
