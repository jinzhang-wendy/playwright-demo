import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');
  });

  test('add one item and see it in the cart', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addItemToCart('sauce-labs-backpack');
    await inventory.goToCart();

    const cart = new CartPage(page);
    await expect(cart.cartItems).toHaveCount(1);
  });

  test('cart badge reflects the number of items added', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addItemToCart('sauce-labs-backpack');
    await inventory.addItemToCart('sauce-labs-bike-light');

    await expect(inventory.cartBadge).toHaveText('2');
  });
});
