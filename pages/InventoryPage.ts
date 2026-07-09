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

  /** 按商品 slug 读取其在商品列表中的 UI 价格文本（如 "$29.99"），用于和 DB 期望价对比 */
  async getItemPrice(itemSlug: string): Promise<string> {
    const item = this.page.locator('[data-test="inventory-item"]', {
      has: this.page.locator(`[data-test="add-to-cart-${itemSlug}"]`),
    });
    return (await item.locator('.inventory_item_price').textContent())?.trim() ?? '';
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
