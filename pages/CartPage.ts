import { Page, Locator } from '@playwright/test';

/** Cart page object. */
export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;
  readonly firstItemPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.firstItemPrice = page.locator('[data-test="inventory-item"] .inventory_item_price').first();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
