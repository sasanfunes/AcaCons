import { expect, test } from "@playwright/test";
import { ADMIN, login, newUserPage } from "./helpers";

function localDate(daysAhead: number, hour: number) {
  const d = new Date(Date.now() + daysAhead * 86400_000);
  return `${d.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:00`;
}

test("admin crea un evento con cupo 1; lista de espera y promoción al cancelar; check-in y CSV", async ({ page, browser }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/eventos/nuevo");
  await page.getByLabel("Título").fill("Taller e2e de morteros");
  await page.getByLabel("Resumen").fill("Taller de prueba automatizada sobre morteros.");
  await page.getByLabel("Inicio", { exact: true }).fill(localDate(10, 8));
  await page.getByLabel("Fin", { exact: true }).fill(localDate(10, 12));
  await page.getByLabel("Lugar").fill("Bodega central");
  await page.getByLabel("Dirección").fill("Barrio El Centro");
  await page.getByLabel("Ciudad").fill("Comayagua");
  await page.getByLabel("Cupo").fill("1");
  await page.getByLabel("Estado").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Crear evento" }).click();
  await expect(page.getByText("Evento creado")).toBeVisible();
  const eventUrl = page.url();

  const ana = await newUserPage(browser, "Ana Reyes");
  await ana.goto("/eventos");
  await ana.getByRole("link", { name: /Taller e2e de morteros/ }).click();
  await ana.getByRole("button", { name: "Inscribirme gratis" }).click();
  await expect(ana.getByText(/Su inscripción está confirmada/)).toBeVisible();

  const beto = await newUserPage(browser, "Beto Flores");
  await beto.goto(ana.url());
  await beto.getByRole("button", { name: "Anotarme en lista de espera" }).click();
  await expect(beto.getByText(/lista de espera \(posición 1\)/)).toBeVisible();

  // Ana guarda su código de entrada y luego cancela; Beto pasa a confirmado.
  await ana.reload();
  await ana.getByRole("link", { name: "Ver mi entrada" }).click();
  await expect(ana.getByText(/^TKT-/)).toBeVisible();
  await ana.getByRole("button", { name: "Cancelar mi inscripción" }).click();
  await expect(ana).toHaveURL(/\/mi-cuenta\/eventos$/);

  await beto.reload();
  await expect(beto.getByText(/Su inscripción está confirmada/)).toBeVisible();
  await beto.getByRole("link", { name: "Ver mi entrada" }).click();
  const ticket = (await beto.getByText(/^TKT-/).textContent())!.trim();

  // Check-in del admin con el código de Beto.
  await page.goto(`${eventUrl.split("?")[0]}/inscritos`);
  await page.getByLabel("Código de entrada").fill(ticket.toLowerCase());
  await page.getByRole("button", { name: "Registrar ingreso" }).click();
  await expect(page.getByText("✔ Asistencia registrada: Beto Flores")).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Exportar CSV" }).click()]);
  const csv = await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
  expect(csv).toContain("Beto Flores");
  expect(csv).toContain("Ana Reyes");
  expect(csv).toContain("Cancelada");
});
