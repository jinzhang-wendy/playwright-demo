import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { TestDatabase } from '../db/TestDatabase';

/**
 * DB-backed 测试校验示例：演示测试开发中"用 SQL 管理测试数据、用 SQL 验证测试结果"的实战能力。
 * 这是招聘帖里常见的"会 SQL"要求的真实落地 —— 不是背概念，而是把数据库用在测试断言与结果审计上。
 */
test.describe('DB-backed test verification (SQLite)', () => {
  let db: TestDatabase;

  test.beforeAll(() => {
    db = new TestDatabase();
  });

  test.afterAll(() => {
    db.close();
  });

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');
  });

  test('inventory UI 价格与 SQLite 中查询到的期望价格一致', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const products = db.getAllProducts();

    // 用 SQL 批量取出期望价格，再逐条和 UI 断言对比
    for (const p of products) {
      const uiPrice = await inventory.getItemPrice(p.slug);
      expect(uiPrice, `商品 ${p.name} 的 UI 价格应与 DB 期望价一致`).toContain(`$${p.price}`);
    }
  });

  test('购物车行项目价格用 SQL 期望价校验', async ({ page }) => {
    const slug = 'sauce-labs-backpack';
    const inventory = new InventoryPage(page);
    await inventory.addItemToCart(slug);
    await inventory.goToCart();

    const expected = db.getExpectedPrice(slug);
    const cart = new CartPage(page);
    await expect(cart.cartItems).toHaveCount(1);
    await expect(cart.firstItemPrice).toContainText(`$${expected}`);
  });

  test('测试结果持久化进 SQLite 并可被查询回读（结果审计）', async ({ page }) => {
    const slug = 'sauce-labs-backpack';
    const inventory = new InventoryPage(page);
    await inventory.addItemToCart(slug);
    await inventory.goToCart();

    const expected = db.getExpectedPrice(slug);
    const cart = new CartPage(page);
    const actualText = (await cart.firstItemPrice.textContent())?.trim() ?? '';
    const actual = Number(actualText.replace('$', ''));
    const passed = Math.abs(actual - expected) < 0.01 ? 1 : 0;

    // 写入一条校验证据
    const id = db.recordEvidence({ scenario: 'cart-price', slug, expected_price: expected, actual_price: actual, passed });
    expect(id, '证据应成功写入 SQLite').toBeGreaterThan(0);

    // 再用 SQL 读回，证明记录已持久化 —— 这就是"用 SQL 验证测试结果"
    const rows = db.getEvidence('cart-price');
    expect(rows.length, '应能 SELECT 回读刚写入的证据').toBeGreaterThan(0);
    expect(rows[0].passed, '回读的证据应为通过').toBe(1);
    expect(rows[0].expected_price).toBe(expected);
  });
});
