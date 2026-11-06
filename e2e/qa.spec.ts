import { expect, test } from "@playwright/test";
import { ADMIN, login, register } from "./helpers";

test("alumno pregunta en una lección, el admin responde y el alumno ve la respuesta", async ({ page, browser }) => {
  await register(page, "Marta Zúniga");
  await page.getByRole("search").first().getByRole("searchbox").fill("tablayeso");
  await page.getByRole("search").first().getByRole("searchbox").press("Enter");
  await expect(page.getByRole("heading", { name: /resultados para «tablayeso»/ })).toBeVisible();
  await page.getByRole("link", { name: /Construcción en seco con tablayeso/ }).first().click();
  await page.getByRole("button", { name: "Inscribirme gratis" }).click();
  await expect(page).toHaveURL(/\/leccion\//);

  await page.getByRole("tab", { name: "Preguntas y respuestas" }).click();
  await page.getByLabel("Título o resumen").fill("¿Separación de postes en muros altos?");
  await page.getByLabel(/Detalle/).fill("Para un muro de 3.5 m de altura, ¿conviene postes a 40 cm?");
  await page.getByRole("button", { name: "Publicar pregunta" }).click();
  await expect(page.getByText("Su pregunta fue publicada")).toBeVisible();
  const lessonUrl = page.url();

  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await login(admin, ADMIN.email, ADMIN.password);
  await admin.goto("/admin/preguntas");
  const card = admin
    .locator("div")
    .filter({ has: admin.getByRole("heading", { name: "¿Separación de postes en muros altos?" }) })
    .filter({ has: admin.getByLabel("Respuesta") })
    .last();
  await card.getByLabel("Respuesta").fill("Sí: para más de 3 m use postes cada 40 cm o perfil de mayor calibre.");
  await card.getByRole("button", { name: "Responder" }).click();
  // Ya respondida, sale de la lista "Sin responder" y aparece en "Todas".
  await expect(admin.getByRole("heading", { name: "¿Separación de postes en muros altos?" })).toBeHidden();
  await admin.getByRole("link", { name: "Todas" }).click();
  await expect(admin.getByText(/use postes cada 40 cm/)).toBeVisible();

  await page.goto(lessonUrl.split("?")[0] + "?tab=preguntas");
  await page.getByText("¿Separación de postes en muros altos?").click();
  await expect(page.getByText("Equipo académico", { exact: true })).toBeVisible();
  await expect(page.getByText(/use postes cada 40 cm/)).toBeVisible();
});
