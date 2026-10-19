import Database from 'better-sqlite3'

// В тестах будем использовать :memory:, в разработке — файл
const db = new Database(process.env.DB_PATH || 'shop.sqlite')

// Включаем WAL для лучшей производительности (не работает для :memory:)
if (process.env.NODE_ENV !== 'test') {
  db.pragma('journal_mode = WAL')
}

export default db
