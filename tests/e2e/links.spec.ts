import { expect, test } from "@playwright/test";

// Visitante comum, vindo do Instagram. O navegador do teste se identifica como "HeadlessChrome".
const VISITOR = {
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  referer: "https://www.instagram.com/",
};

test("cria um link, abre e vê o clique no painel", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByLabel("URL de destino").fill("https://example.com/promo");
  await page.getByRole("button", { name: "Encurtar" }).click();

  const created = page.getByRole("status");
  await expect(created).toContainText("Link criado");
  const shortUrl = (await created.getByRole("link").textContent())!.trim();

  // Abre o link curto sem seguir o redirecionamento para fora do app.
  const response = await page.request.get(shortUrl, {
    maxRedirects: 0,
    headers: VISITOR,
  });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe("https://example.com/promo");

  // O clique é gravado logo depois da resposta, então pode levar um instante.
  await expect(async () => {
    await page.goto("/dashboard");
    await expect(page.getByText("1 clique ·")).toBeVisible({ timeout: 1000 });
  }).toPass();

  await page.getByRole("link", { name: "Ver painel" }).click();
  const total = page
    .locator("section")
    .filter({ hasText: "Cliques nos últimos 30 dias" })
    .locator("p")
    .first();
  await expect(total).toHaveText("1");
  await expect(page.getByText("instagram.com")).toBeVisible();
  await expect(page.getByText("Celular")).toBeVisible();
});

test("o link desativado para de redirecionar na hora", async ({ page }) => {
  const slug = `e2e-${Date.now()}`;
  await page.goto("/dashboard");
  await page.getByLabel("URL de destino").fill("https://example.com/");
  await page.getByLabel("Apelido").fill(slug);
  await page.getByRole("button", { name: "Encurtar" }).click();
  await expect(page.getByRole("status")).toContainText(slug);

  // Primeira visita: o link vai para o cache.
  const before = await page.request.get(`/${slug}`, { maxRedirects: 0 });
  expect(before.status()).toBe(302);

  const row = page.getByRole("listitem").filter({ hasText: slug });
  await row.getByRole("button", { name: "Desativar" }).click();
  await expect(row.getByText("Desativado")).toBeVisible();

  const after = await page.request.get(`/${slug}`, { maxRedirects: 0 });
  expect(after.status()).toBe(404);
});

test("recusa URL que não é http ou https", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByLabel("URL de destino").fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Encurtar" }).click();

  await expect(page.locator("#create-link-error")).toHaveText(/^URL inválida/);
});

test.describe("sem login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("o painel leva para o login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/);
    await expect(
      page.getByRole("button", { name: "Entrar com GitHub" }),
    ).toBeVisible();
  });
});
