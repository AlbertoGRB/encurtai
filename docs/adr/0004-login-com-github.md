# ADR 0004: Login com GitHub pelo Auth.js

- **Situação:** aceita
- **Data:** 2026-11-19

## Contexto

O encurtai precisa saber quem é o dono de cada link. Guardar senha exige hash, recuperação de senha, envio de e-mail e proteção contra tentativa de força bruta, o que não é o foco do projeto.

## Decisão

Login só com GitHub, usando o Auth.js e o adaptador do Prisma para guardar usuários e sessões no PostgreSQL.

## Alternativas consideradas

- **E-mail e senha próprios:** mais trabalho e mais risco, sem acrescentar nada ao objetivo do projeto.
- **Link mágico por e-mail:** exige um serviço de envio de e-mail configurado.
- **Clerk ou outro serviço pago de autenticação:** resolve tudo, mas esconde como a autenticação funciona e cria dependência de plano.

## Consequências

- Positivas: nenhuma senha guardada, login em um clique para quem vai testar e menos código de segurança para manter.
- Negativas: quem não tem conta no GitHub não consegue entrar. Outro provedor (Google) pode ser adicionado no Auth.js sem mudar o resto.
