import { test, expect } from '@playwright/test';

test.describe('Agent Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in with email/i }).click();
    await page.waitForURL('/agent');
  });

  test('should display agent page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /AI Coding Agent/i })).toBeVisible();
  });

  test('should have prompt input textarea', async ({ page }) => {
    await expect(page.getByPlaceholder(/Example: Create a Flask REST API/i)).toBeVisible();
  });

  test('should have language selector', async ({ page }) => {
    const selector = page.getByRole('combobox');
    await expect(selector).toBeVisible();
  });

  test('should display template buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /login page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /REST API/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /README/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /unit tests/i })).toBeVisible();
  });

  test('should fill prompt when clicking template button', async ({ page }) => {
    await page.getByRole('button', { name: /login page/i }).click();
    const textarea = page.getByPlaceholder(/Example: Create a Flask REST API/i);
    await expect(textarea).toHaveValue(/Flask login page/i);
  });

  test('should change language selection', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /javascript/i }).click();

    // Verify selection changed
    await expect(page.getByRole('combobox')).toHaveText(/javascript/i);
  });

  test('should generate code when submitting prompt', async ({ page }) => {
    // Fill prompt
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a simple hello world function');

    // Click generate button
    await page.getByRole('button', { name: /generate code/i }).click();

    // Should show processing state
    await expect(page.getByText(/processing/i)).toBeVisible();

    // Wait for code generation to complete
    await expect(page.getByRole('heading', { name: /generated code/i })).toBeVisible({ timeout: 15000 });
  });

  test('should show thinking process during generation', async ({ page }) => {
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a simple function');
    await page.getByRole('button', { name: /generate code/i }).click();

    // Should show agent thinking process
    await expect(page.getByRole('heading', { name: /agent thinking process/i })).toBeVisible();
    await expect(page.getByText(/analyzing project context/i)).toBeVisible();
  });

  test('should display generated code in tabs', async ({ page }) => {
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a hello function');
    await page.getByRole('button', { name: /generate code/i }).click();

    // Wait for generation
    await expect(page.getByRole('heading', { name: /generated code/i })).toBeVisible({ timeout: 15000 });

    // Should have tabs
    await expect(page.getByRole('tab', { name: /code/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /explanation/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /files changed/i })).toBeVisible();
  });

  test('should have copy button for generated code', async ({ page }) => {
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a function');
    await page.getByRole('button', { name: /generate code/i }).click();

    await expect(page.getByRole('heading', { name: /generated code/i })).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /copy/i })).toBeVisible();
  });

  test('should have download button for generated code', async ({ page }) => {
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a function');
    await page.getByRole('button', { name: /generate code/i }).click();

    await expect(page.getByRole('heading', { name: /generated code/i })).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });

  test('should navigate to diff page when clicking review & commit', async ({ page }) => {
    await page.getByPlaceholder(/Example: Create a Flask REST API/i).fill('Create a function');
    await page.getByRole('button', { name: /generate code/i }).click();

    await expect(page.getByRole('heading', { name: /generated code/i })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /review & commit/i }).click();
    await expect(page).toHaveURL('/diff');
  });

  test('should show empty state when no code is generated', async ({ page }) => {
    await expect(page.getByText(/ready to generate code/i)).toBeVisible();
  });

  test('should disable generate button when prompt is empty', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate code/i });
    await expect(generateButton).toBeDisabled();
  });
});
