import { expect, test } from "@playwright/test";
import { register } from "./helpers";

test("registro → inscripción → lecciones → evaluación → certificado", async ({ page, request }) => {
  await register(page, "Carlos Alvarado");
  await expect(page.getByRole("heading", { name: "Hola, Carlos" })).toBeVisible();

  await page.goto("/cursos?categoria=techos-y-cubiertas");
  await page.getByRole("link", { name: /Techos de lámina/ }).first().click();
  await page.getByRole("button", { name: "Inscribirme gratis" }).click();
  await expect(page).toHaveURL(/\/leccion\//);

  // Tres lecciones: se marcan en orden; la última lleva a la evaluación final.
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /Marcar como completada/ }).click();
    await page.waitForURL(/\/(leccion|evaluacion)\//);
  }
  await expect(page).toHaveURL(/\/evaluacion\//);
  await expect(page.getByRole("heading", { name: "Evaluación final" })).toBeVisible();

  // Primer intento con una respuesta incorrecta → no aprueba.
  await page.getByLabel("Calibre 26").check();
  await page.getByLabel("Arandela de neopreno").check();
  await page.getByLabel("5 cm").check();
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  await expect(page.getByText(/No alcanzó el puntaje mínimo — 33%/)).toBeVisible();

  // Segundo intento correcto → certificado.
  await page.reload();
  await page.getByLabel("Calibre 24").check();
  await page.getByLabel("Arandela de neopreno").check();
  await page.getByLabel("20 cm").check();
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  await expect(page.getByText("¡Aprobado! — 100%")).toBeVisible();
  await page.getByRole("link", { name: "Ver mi certificado" }).click();

  await expect(page.getByText("Certificado válido")).toBeVisible();
  await expect(page.locator("#contenido").getByText("Carlos Alvarado")).toBeVisible();
  const code = (await page.locator("p.font-mono").first().textContent())!.trim();
  expect(code).toMatch(/^CERT-/);

  const pdf = await request.get(`/api/certificados/${code}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");

  // Verificación pública (sin sesión) con código en minúsculas.
  await page.context().clearCookies();
  await page.goto("/certificados/verificar");
  await page.getByLabel("Código del certificado").fill(code.toLowerCase());
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByText("Certificado válido")).toBeVisible();

  // Sin sesión, /mi-cuenta vuelve a pedir el ingreso.
  await page.goto("/mi-cuenta");
  await expect(page).toHaveURL(/\/ingresar/);
});

test("rutas protegidas redirigen al ingreso y el admin exige rol", async ({ page }) => {
  await page.goto("/mi-cuenta/eventos");
  await expect(page).toHaveURL(/\/ingresar\?volver=%2Fmi-cuenta%2Feventos/);
  await register(page, "Usuario Común");
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(403);
});
