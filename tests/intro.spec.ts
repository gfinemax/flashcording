import { test, expect } from '@playwright/test';

test.describe('Intro Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /flash/i });
    await expect(heading).toBeVisible();
  });

  test('should display the tagline', async ({ page }) => {
    await expect(page.getByText(/AI-Powered Coding Agent/i)).toBeVisible();
  });

  test('should display description', async ({ page }) => {
    await expect(page.getByText(/Boost your productivity/i)).toBeVisible();
  });

  test('should have Get Started button', async ({ page }) => {
    const button = page.getByRole('button', { name: /get started/i });
    await expect(button).toBeVisible();
  });

  test('should have Explore Features button', async ({ page }) => {
    const button = page.getByRole('button', { name: /explore features/i });
    await expect(button).toBeVisible();
  });

  test('should navigate to login when clicking Get Started', async ({ page }) => {
    await page.getByRole('button', { name: /get started/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to agent when clicking Explore Features', async ({ page }) => {
    await page.getByRole('button', { name: /explore features/i }).click();
    await expect(page).toHaveURL('/agent');
  });

  test('should have animated elements', async ({ page }) => {
    // Check for MeshGradientSVG or similar animated component
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('should have responsive gradient background', async ({ page }) => {
    const mainDiv = page.locator('div').first();
    await expect(mainDiv).toHaveClass(/min-h-screen/);
  });
});
