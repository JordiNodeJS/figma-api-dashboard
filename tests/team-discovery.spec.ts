import { test, expect } from "@playwright/test";

test.describe("Figma Team Discovery", () => {
  test("should automatically list team files", async ({ page }) => {
    // Navigate to discovery page
    await page.goto("http://localhost:3000/discovery");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click on "Por Equipo" method
    await page.getByRole("button", { name: "Por Equipo" }).click();

    // Verify the team discovery form is visible
    await expect(page.getByText("Listar Archivos del Equipo")).toBeVisible();

    // Verify the default team ID placeholder is shown
    await expect(page.getByText("958458320512591682")).toBeVisible();

    // Click the "Listar Archivos del Equipo" button
    await page
      .getByRole("button", { name: "Listar Archivos del Equipo" })
      .click();

    // Wait for the API call to complete (may take a few seconds)
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/figma/team") && response.status() === 200
    );

    // Handle the success dialog
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("archivos en el equipo");
      dialog.accept();
    });

    // Verify that files are discovered and displayed
    await expect(page.getByText("Archivos Descubiertos")).toBeVisible();
    // Check for specific files that should be found
    await expect(page.getByText("Accesible").first()).toBeVisible();

    // Verify we can see at least one file from the team
    const fileElements = page.locator('[data-testid="discovered-file"]');
    await expect(fileElements.first()).toBeVisible({ timeout: 10000 });
    // Check that we have the expected files (both should be found)
    await expect(page.getByText("team colors").first()).toBeVisible();
    await expect(page.getByText("clone drive").first()).toBeVisible();
  });

  test("should display file details correctly", async ({ page }) => {
    // Start fresh and navigate
    await page.goto("http://localhost:3000/discovery");

    // Switch to team method
    await page.getByRole("button", { name: "Por Equipo" }).click();

    // Trigger team discovery
    await page
      .getByRole("button", { name: "Listar Archivos del Equipo" })
      .click();

    // Handle dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Wait for results
    await page.waitForSelector('[data-testid="discovered-file"]', {
      timeout: 15000,
    });

    // Verify file information is displayed
    const firstFile = page.locator('[data-testid="discovered-file"]').first();

    // Should show status
    await expect(firstFile.getByText("Accesible")).toBeVisible();

    // Should show a Figma URL
    await expect(firstFile.locator("text=/figma.com/")).toBeVisible();

    // Should have an "Añadir a Mis Archivos" button
    await expect(
      firstFile.getByRole("button", { name: /Añadir/ })
    ).toBeVisible();
  });

  test("should handle team API errors gracefully", async ({ page }) => {
    // Test with invalid team ID to check error handling
    await page.goto("http://localhost:3000/discovery");

    // Switch to team method
    await page.getByRole("button", { name: "Por Equipo" }).click();

    // Enter invalid team ID
    await page.getByPlaceholder(/958458320512591682/).fill("invalid-team-id");

    // Try to list files
    await page
      .getByRole("button", { name: "Listar Archivos del Equipo" })
      .click();

    // Should handle error dialog
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Error");
      dialog.accept();
    });
  });
});
