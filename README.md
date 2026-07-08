# Playwright Demo — saucedemo.com

一个用 **Playwright + TypeScript** 写的端到端（E2E）自动化测试示例，覆盖电商核心链路：
**登录 → 加购 → 结算**。采用 **Page Object 模式**，贴合企业级工程实践。

## 覆盖场景

| 用例 | 文件 | 说明 |
|---|---|---|
| 标准用户登录成功 | `tests/login.spec.ts` | 跳转 inventory 页、标题为 "Products" |
| 锁定用户登录失败 | `tests/login.spec.ts` | 显示 "locked out" 错误，停留在登录页 |
| 空凭证登录报错 | `tests/login.spec.ts` | 提示 "Username is required" |
| 加购 1 件并进入购物车 | `tests/cart.spec.ts` | 购物车内有 1 条商品 |
| 购物车角标数量正确 | `tests/cart.spec.ts` | 加 2 件 → 角标显示 "2" |
| 端到端完成下单 | `tests/checkout.spec.ts` | 登录→加购→结算→"Thank you for your order!" |

## 工程结构

```
playwright-demo/
├── playwright.config.ts      # Playwright 配置（baseURL / retries / HTML report）
├── pages/                    # Page Object（登录 / 商品 / 购物车 / 结算）
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/                    # 测试用例（spec）
│   ├── login.spec.ts
│   ├── cart.spec.ts
│   └── checkout.spec.ts
├── .github/workflows/ci.yml  # GitHub Actions：推送即跑 CI
└── README.md
```

## 运行步骤

```bash
# 1. 安装依赖
npm install

# 2. 安装浏览器（首次需要）
npx playwright install chromium

# 3. 运行测试（无头模式）
npm test

# 4. 查看 HTML 报告
npm run report
```

## 技术亮点（面试可讲）

- **Page Object 模式**：页面元素与用例分离，元素变更只改一处，维护成本低。
- **稳定选择器**：优先用 `data-test` 属性，不依赖易变的文本/CSS 结构。
- **CI 集成**：`.github/workflows/ci.yml` 在每次 push/PR 自动运行，失败上传报告。
- **断言与等待**：Playwright 自动等待元素可见/可点击，天然降低 Flaky。

> 测试站点：[saucedemo.com](https://www.saucedemo.com)
> 标准账号：`standard_user` / `secret_sauce`
