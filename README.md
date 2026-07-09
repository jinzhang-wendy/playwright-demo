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
| **UI 价格与 SQLite 期望价一致** | `tests/db_verification.spec.ts` | 用 SQL 批量查询期望价，逐条断言 UI（**测试数据用 SQL 管理**） |
| **购物车价格用 SQL 校验** | `tests/db_verification.spec.ts` | 加购后按 slug 查 DB 期望价，断言购物车行价格 |
| **测试结果持久化进 SQLite 并回读** | `tests/db_verification.spec.ts` | 把校验结果写库再用 SQL 读回，证明可审计（**用 SQL 验证测试结果**） |

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
│   ├── checkout.spec.ts
│   └── db_verification.spec.ts  # 用 SQLite 管理测试数据 / 校验测试结果（SQL 实战）
├── db/                       # SQLite 测试库封装（better-sqlite3）
│   └── TestDatabase.ts
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
- **用 SQL 做测试验证**：`db/TestDatabase.ts` 用 SQLite 存放期望价格（测试基准源），用例通过 `SELECT` 取期望值再断言 UI；并把每次校验结果 `INSERT` 进 `test_evidence` 表、再用 `SELECT` 读回，演示测试开发中"用数据库管理测试数据、用 SQL 验证/审计测试结果"的实战能力（对应招聘中常见的"会 SQL"要求）。

> 测试站点：[saucedemo.com](https://www.saucedemo.com)
> 标准账号：`standard_user` / `secret_sauce`
