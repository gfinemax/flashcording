import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('should have email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should have Google sign in button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('should have sign up link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /sign in with email/i });
    await submitButton.click();

    // Wait for validation errors to appear
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /sign in with email/i }).click();

    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in with email/i }).click();

    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in with email/i }).click();

    // Wait for toast notification
    await expect(page.getByText(/login successful/i)).toBeVisible();

    // Should redirect to agent page
    await page.waitForURL('/agent', { timeout: 5000 });
    await expect(page).toHaveURL('/agent');
  });

  test('should navigate to register page when clicking sign up link', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should disable submit button while loading', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    const submitButton = page.getByRole('button', { name: /sign in with email/i });
    await submitButton.click();

    // Button should show loading state
    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible();
  });
});
