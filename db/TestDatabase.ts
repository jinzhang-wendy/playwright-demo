import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export interface Product {
  slug: string;
  name: string;
  price: number;
}

export interface Evidence {
  scenario: string;
  slug: string | null;
  expected_price: number;
  actual_price: number;
  passed: number;
}

// DB 文件在运行时生成（首次运行自动建库 + 播种），不入库
const DB_PATH = path.resolve(process.cwd(), 'data', 'testdata.db');

// saucedemo 公开商品目录（稳定 demo 数据，作为"测试基准/期望结果源"）
const SEED_PRODUCTS: Product[] = [
  { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: 29.99 },
  { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99 },
  { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: 7.99 },
  { slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

/**
 * 测试用 SQLite 封装：演示"用 SQL 管理测试数据 / 校验测试结果"这一测试开发核心能力。
 * - products 表：存放期望价格（测试基准源），用例通过 SELECT 查询得到期望值再去断言 UI
 * - test_evidence 表：把每次校验结果持久化，用例再 SELECT 读回，证明结果可审计/可验证
 */
export class TestDatabase {
  private db: Database.Database;

  constructor() {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
    this.seedIfEmpty();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        slug  TEXT PRIMARY KEY,
        name  TEXT NOT NULL,
        price REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS test_evidence (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario       TEXT NOT NULL,
        slug           TEXT,
        expected_price REAL,
        actual_price   REAL,
        passed         INTEGER NOT NULL,
        created_at     TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  private seedIfEmpty(): void {
    const { c } = this.db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number };
    if (c === 0) {
      const insert = this.db.prepare(
        'INSERT INTO products (slug, name, price) VALUES (@slug, @name, @price)'
      );
      const tx = this.db.transaction((rows: Product[]) => rows.forEach((r) => insert.run(r)));
      tx(SEED_PRODUCTS);
    }
  }

  /** 按 slug 查询期望价格 —— 用 SQL 取"期望结果"，再去断言 UI */
  getExpectedPrice(slug: string): number {
    const row = this.db
      .prepare('SELECT price FROM products WHERE slug = ?')
      .get(slug) as { price: number } | undefined;
    if (!row) throw new Error(`products 表中无此 slug: ${slug}`);
    return row.price;
  }

  /** 批量查询全部期望价格（ORDER BY 演示聚合/排序用法） */
  getAllProducts(): Product[] {
    return this.db
      .prepare('SELECT slug, name, price FROM products ORDER BY price DESC')
      .all() as Product[];
  }

  /** 把一次校验结果写入 SQLite（结果持久化 / 审计轨迹） */
  recordEvidence(e: Evidence): number {
    const info = this.db
      .prepare(
        `INSERT INTO test_evidence (scenario, slug, expected_price, actual_price, passed)
         VALUES (@scenario, @slug, @expected_price, @actual_price, @passed)`
      )
      .run(e);
    return Number(info.lastInsertRowid);
  }

  /** 从 SQLite 读回校验结果 —— 证明记录已持久化（用 SQL 验证测试结果） */
  getEvidence(scenario: string): Evidence[] {
    return this.db
      .prepare(
        `SELECT scenario, slug, expected_price, actual_price, passed
         FROM test_evidence WHERE scenario = ? ORDER BY id DESC`
      )
      .all(scenario) as Evidence[];
  }

  close(): void {
    this.db.close();
  }
}
