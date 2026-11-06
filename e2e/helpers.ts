import { expect, type Browser, type Page } from "@playwright/test";

export const ADMIN = { email: process.env.ADMIN_EMAIL ?? "admin@acacons.local", password: process.env.ADMIN_PASSWORD ?? "Admin12345!" };

let n = 0;
export function uniqueEmail(prefix = "alumno") {
  return `${prefix}.${Date.now()}.${++n}@e2e.hn`;
}

export async function register(page: Page, name: string, email = uniqueEmail()) {
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill(name);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Profesión u oficio").selectOption("MAESTRO_DE_OBRA");
  await page.getByLabel("Departamento").selectOption("Cortés");
  await page.getByLabel("Ciudad / municipio").fill("San Pedro Sula");
  await page.getByLabel("Contraseña", { exact: true }).fill("Clave12345");
  await page.getByLabel("Repetir contraseña").fill("Clave12345");
  await page.getByText("Acepto los términos").click();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/mi-cuenta/);
  return email;
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/ingresar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/mi-cuenta/);
}

export async function newUserPage(browser: Browser, name: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await register(page, name);
  return page;
}
