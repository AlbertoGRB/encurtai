// O notFound() dentro de um route handler responde 404 com o corpo vazio, e o visitante veria
// uma tela em branco. A rota de redirecionamento devolve esta página simples no lugar.
const LINK_NOT_FOUND_HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Link não encontrado | encurtai</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #171717; }
      main { max-width: 36rem; padding: 1.5rem; }
      p { color: #52525b; }
      a { color: inherit; }
      @media (prefers-color-scheme: dark) {
        body { background: #0a0a0a; color: #ededed; }
        p { color: #a1a1aa; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Link não encontrado</h1>
      <p>Este endereço não existe ou o link foi desativado pelo dono.</p>
      <a href="/">Ir para a página inicial</a>
    </main>
  </body>
</html>`;

export function linkNotFoundResponse() {
  return new Response(LINK_NOT_FOUND_HTML, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
