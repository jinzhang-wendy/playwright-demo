import { Page, Locator } from '@playwright/test';

/** Inventory (product list) page object. */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  /** itemSlug e.g. "sauce-labs-backpack" → uses [data-test="add-to-cart-<slug>"] */
  async addItemToCart(itemSlug: string) {
    await this.page.locator(`[data-test="add-to-cart-${itemSlug}"]`).click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
