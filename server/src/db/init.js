import db from './index.js'

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      emoji TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Тот самый индекс, который спасет от N+1 при поиске отзывов по товару!
    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  `)

  // Проверяем, пустая ли таблица products
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count
  if (count === 0) {
    const insertProduct = db.prepare(
      'INSERT INTO products (name, price, emoji) VALUES (?, ?, ?)'
    )
    const insertReview = db.prepare(
      'INSERT INTO reviews (product_id, author, text) VALUES (?, ?, ?)'
    )

    const products = [
      ['Меч', 1000, '⚔️'],
      ['Щит', 1500, '🛡️'],
      ['Зелье', 300, '🧪'],
      ['Лук', 800, '🏹'],
      ['Шлем', 1200, '🪖'],
      ['Посох', 2000, '🪄'],
    ]

    const insertMany = db.transaction((items) => {
      for (const item of items) insertProduct.run(...item)
    })
    insertMany(products)

    const reviews = [
      [1, 'Иван', 'Отличный меч!'],
      [1, 'Петр', 'Тяжеловат, но острый.'],
      [2, 'Мария', 'Надежный щит.'],
      [3, 'Олег', 'Зелье супер.'],
    ]

    const insertManyReviews = db.transaction((items) => {
      for (const item of items) insertReview.run(...item)
    })
    insertManyReviews(reviews)
  }
}

export function resetDb() {
  db.exec(`
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS products;
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `)
  initDb()
}
