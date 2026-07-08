import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout', () => {
  test('complete purchase end-to-end', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');

    const inventory = new InventoryPage(page);
    await inventory.addItemToCart('sauce-labs-backpack');
    await inventory.goToCart();

    const cart = new CartPage(page);
    await cart.proceedToCheckout();

    const checkout = new CheckoutPage(page);
    await checkout.fillInformation('Zhang', 'Jing', '310000');
    await checkout.finish();

    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
  });
});
