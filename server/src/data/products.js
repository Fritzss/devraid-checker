import db from '../db/index.js'

export const productsRepo = {
  getAll: () => db.prepare('SELECT * FROM products').all(),

  getById: (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),

  create: (data) => {
    const info = db.prepare(
      'INSERT INTO products (name, price, emoji) VALUES (?, ?, ?)'
    ).run(data.name, data.price, data.emoji || '📦')
    return { id: info.lastInsertRowid, ...data }
  },

  update: (id, data) => {
    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    if (!current) return null
    const updated = { ...current, ...data }
    db.prepare(
      'UPDATE products SET name = ?, price = ?, emoji = ? WHERE id = ?'
    ).run(updated.name, updated.price, updated.emoji, id)
    return updated
  },

  delete: (id) => {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id)
    return info.changes > 0
  },

  /**
   * Оптимизированный запрос с JOIN, чтобы избежать N+1.
   * Получает товары и их отзывы одним запросом.
   */
  getAllWithReviews: () => {
    const rows = db.prepare(`
      SELECT 
        p.id, p.name, p.price, p.emoji,
        r.id as review_id, r.author, r.text
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      ORDER BY p.id
    `).all()

    // Группируем результаты в памяти
    const productsMap = new Map()
    for (const row of rows) {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          price: row.price,
          emoji: row.emoji,
          reviews: [],
        })
      }
      if (row.review_id) {
        productsMap.get(row.id).reviews.push({
          id: row.review_id,
          author: row.author,
          text: row.text,
        })
      }
    }

    return Array.from(productsMap.values())
  },
}
