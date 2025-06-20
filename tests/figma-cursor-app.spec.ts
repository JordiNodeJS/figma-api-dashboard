import { test, expect } from "@playwright/test";

test.describe("Figma Cursor App", () => {
  test("Test completo de funcionalidades de la aplicación Figma Cursor", async ({
    page,
  }) => {
    // 1. Navegar a la página principal
    await page.goto("/");
    await expect(page).toHaveTitle(/Create Next App/);

    // Verificar elementos principales
    await expect(
      page.getByRole("heading", { name: "Figma Cursor" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tus Drafts de Figma" })
    ).toBeVisible();

    // 2. Verificar que se cargan los drafts correctamente
    await page.waitForTimeout(3000); // Esperar a que carguen los drafts

    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();

    // Verificar botones de acción
    await expect(
      page.getByRole("button", { name: "Abrir en Figma" })
    ).toHaveCount(2);

    // 3. Probar la funcionalidad de búsqueda
    const searchInput = page.getByRole("textbox", { name: "Buscar drafts..." });
    await searchInput.fill("Componentes");

    // Verificar filtrado en tiempo real
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).not.toBeVisible();

    // Probar búsqueda con botón
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();

    // 4. Probar el botón actualizar
    await page.getByRole("button", { name: "Actualizar" }).click();
    await page.waitForTimeout(1000);

    // Limpiar búsqueda para ver todos los drafts
    await searchInput.fill("");
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();

    // 5. Navegar a la página de añadir archivos
    await page.getByRole("link", { name: "Añadir Archivos" }).click();
    await expect(page).toHaveURL(/.*\/discovery/);
    await expect(
      page.getByRole("heading", { name: "Descubrir Archivos de Figma" })
    ).toBeVisible();

    // 6. Probar la verificación de URLs
    const urlInput = page.getByRole("textbox", {
      name: /https:\/\/www\.figma\.com\/file\//,
    });
    await urlInput.fill(
      "https://www.figma.com/file/test123/mi-archivo-de-prueba"
    );
    await page.getByRole("button", { name: "Verificar Archivo" }).click(); // Verificar que se muestra el resultado
    await expect(
      page.getByRole("heading", { name: "Archivos Descubiertos" })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("No Accesible")).toBeVisible();
    // 7. Navegar a diagnósticos
    await page.goto("/diagnostics");
    await expect(
      page.getByRole("heading", { name: "Diagnóstico de URLs de Figma" })
    ).toBeVisible();

    // 8. Ejecutar test de endpoints
    await page
      .getByRole("button", { name: "Probar Todos los Endpoints" })
      .click();

    // Verificar que se muestran los resultados
    await expect(
      page.getByRole("heading", { name: "Resultados" })
    ).toBeVisible();
    await expect(page.getByText(/\"success\": true/)).toBeVisible();
    await expect(page.getByText(/\"status\": 200/)).toBeVisible();
    // Verificar responsividad móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Verificar que los elementos siguen siendo visibles en móvil
    await expect(
      page.getByRole("heading", { name: "Figma Cursor" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Añadir Archivos" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Diagnósticos" })
    ).toBeVisible();

    // Verificar que los drafts se ven correctamente en móvil
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();
  });
  test("Test de navegación entre páginas", async ({ page }) => {
    await page.goto("/");

    // Test navegación a Discovery
    await page.getByRole("link", { name: "Añadir Archivos" }).click();
    await expect(page).toHaveURL(/.*\/discovery/);

    // Test navegación a Diagnostics
    await page.goto("/diagnostics");
    await expect(page).toHaveURL(/.*\/diagnostics/);

    // Volver a la página principal
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
  test("Test de funcionalidad de búsqueda avanzada", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);

    const searchInput = page.getByRole("textbox", { name: "Buscar drafts..." });

    // Test búsqueda por nombre
    await searchInput.fill("Mi Primer");
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).not.toBeVisible();

    // Test búsqueda por proyecto
    await searchInput.fill("Design System");
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).not.toBeVisible();

    // Test búsqueda sin resultados
    await searchInput.fill("No Existe");
    await expect(page.getByText("No se encontraron drafts")).toBeVisible();

    // Limpiar búsqueda
    await searchInput.fill("");
    await expect(
      page.getByRole("heading", { name: "Mi Primer Diseño" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Componentes UI" })
    ).toBeVisible();
  });
});
