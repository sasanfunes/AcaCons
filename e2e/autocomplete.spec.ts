import { expect, test, type Page } from "@playwright/test";
import { register } from "./helpers";

/**
 * Simula el reproductor de YouTube: una página servida desde youtube-nocookie.com que, al recibir "listening",
 * informa la duración y la posición indicada (en fracción del video).
 */
async function fakeYouTube(page: Page, fraction: number) {
  await page.route("https://www.youtube-nocookie.com/embed/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><body style="background:#000"><script>
        window.addEventListener("message", (e) => {
          let m; try { m = JSON.parse(e.data); } catch { return; }
          if (m.event !== "listening") return;
          const send = (info) => parent.postMessage(JSON.stringify({ event: "infoDelivery", info }), "*");
          send({ duration: 600, currentTime: 0 });
          setTimeout(() => send({ currentTime: ${600 * fraction} }), 300);
        });
      </script></body>`,
    }),
  );
}

async function enrollAndOpenFirstLesson(page: Page) {
  await register(page, "Rafael Ortega");
  await page.goto("/cursos/techos-de-lamina-instalacion-y-prevencion-de-filtraciones");
  await page.getByRole("button", { name: "Inscribirme gratis" }).click();
  await expect(page).toHaveURL(/\/leccion\//);
}

test("la lección se marca sola cuando el video llega casi al final", async ({ page }) => {
  await fakeYouTube(page, 0.95);
  await enrollAndOpenFirstLesson(page);
  await expect(page.getByText("Lección completada")).toBeVisible({ timeout: 15_000 });
  const checkbox = page.getByRole("complementary", { name: "Contenido del curso" }).getByRole("checkbox", { name: /Calibres, pendientes y traslapes/ });
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Su progreso: 33%")).toBeVisible();
  await page.getByRole("link", { name: /Siguiente lección/ }).click();
  await expect(page.getByRole("heading", { name: "Fijación correcta" })).toBeVisible();
});

test("no se marca si el video va por la mitad", async ({ page }) => {
  await fakeYouTube(page, 0.5);
  await enrollAndOpenFirstLesson(page);
  await page.waitForTimeout(3000);
  await expect(page.getByText("Lección completada")).toHaveCount(0);
  const checkbox = page.getByRole("complementary", { name: "Contenido del curso" }).getByRole("checkbox", { name: /Calibres, pendientes y traslapes/ });
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
});
