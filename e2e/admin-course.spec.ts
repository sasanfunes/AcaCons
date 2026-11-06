import { expect, test } from "@playwright/test";
import { ADMIN, login } from "./helpers";

test("admin crea y publica un curso con módulo, lección y evaluación", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/cursos/nuevo");
  await page.getByLabel("Título").fill("Pisos de concreto pulido");
  await page.getByLabel("Resumen").fill("Preparación, colado y pulido de pisos de concreto.");
  await page.getByLabel("Categoría").selectOption({ label: "Concreto y cemento" });
  await page.getByLabel("Duración estimada (min)").fill("120");
  await page.getByText("Cementos del Valle").first().click();
  await page.getByLabel("Lo que aprenderá (uno por línea)").fill("Compactar la sub-base\nColar y pulir el piso");
  await page.getByRole("button", { name: "Crear curso" }).click();
  await expect(page.getByText("Curso creado.")).toBeVisible();

  await page.getByPlaceholder("Título del módulo").last().fill("Preparación de la base");
  await page.getByRole("button", { name: "Agregar módulo" }).click();
  await expect(page.getByText("Módulo 1")).toBeVisible();

  await page.getByText("+ Agregar lección").click();
  await page.getByLabel("Título de la lección").fill("Compactación de la sub-base");
  await page.getByLabel("URL del video (YouTube o Vimeo)").fill("https://youtu.be/aqz-KE-bpKQ");
  await expect(page.getByText("✔ YouTube · id aqz-KE-bpKQ")).toBeVisible();
  await page.getByRole("button", { name: "Agregar lección" }).click();
  await expect(page.getByText("Lección creada.")).toBeVisible();

  await page.getByRole("button", { name: "Crear evaluación" }).click();
  await expect(page).toHaveURL(/\/evaluaciones\//);
  await page.getByLabel("Pregunta").fill("¿Qué se debe hacer antes de colar el piso?");
  await page.getByPlaceholder("Opción 1").fill("Compactar la sub-base");
  await page.getByPlaceholder("Opción 2").fill("Nada");
  await page.getByRole("button", { name: "Agregar pregunta" }).click();
  await expect(page.getByText("Pregunta agregada.")).toBeVisible();
  await page.getByRole("link", { name: /Pisos de concreto pulido/ }).click();

  await page.getByLabel("Estado").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Curso guardado.")).toBeVisible();

  await page.goto("/cursos?q=pulido");
  await page.getByRole("link", { name: /Pisos de concreto pulido/ }).click();
  await expect(page.getByText("Compactación de la sub-base")).toBeVisible();
  await expect(page.getByText("1 sección · 1 lección")).toBeVisible();
  await expect(page.getByText("Lo que aprenderá")).toBeVisible();
});
