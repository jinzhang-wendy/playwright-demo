import { Page, Locator } from '@playwright/test';

/** Cart page object. */
export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
