import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  });

  test('should have all required fields', async ({ page }) => {
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/^email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('should have Google sign up button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
  });

  test('should have sign in link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation error for short username', async ({ page }) => {
    await page.getByLabel(/username/i).fill('ab');
    await page.getByLabel(/^email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/username must be at least 3 characters/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^email/i).fill('invalid-email');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('123');
    await page.getByLabel(/confirm password/i).fill('123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
  });

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('differentpassword');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });

  test('should successfully register with valid data', async ({ page }) => {
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for success toast
    await expect(page.getByText(/account created successfully/i)).toBeVisible();

    // Should redirect to agent page
    await page.waitForURL('/agent', { timeout: 5000 });
    await expect(page).toHaveURL('/agent');
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should disable submit button while loading', async ({ page }) => {
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');

    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();

    // Button should show loading state
    await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible();
  });
});
