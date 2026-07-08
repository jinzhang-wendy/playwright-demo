import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login', () => {
  test('standard user can log in successfully', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('locked out user sees error and stays on login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('locked_out_user', 'secret_sauce');

    await expect(login.errorMessage).toContainText('locked out');
    await expect(page).toHaveURL(/\/$/);
  });

  test('empty credentials show required-field error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();

    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText('Username is required');
  });
});
