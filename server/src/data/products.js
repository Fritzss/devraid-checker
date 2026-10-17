let nextId = 7

export const products = [
  { id: 1, name: 'Меч', price: 1000, emoji: '⚔️' },
  { id: 2, name: 'Щит', price: 1500, emoji: '🛡️' },
  { id: 3, name: 'Зелье', price: 300, emoji: '🧪' },
  { id: 4, name: 'Лук', price: 800, emoji: '🏹' },
  { id: 5, name: 'Шлем', price: 1200, emoji: '🪖' },
  { id: 6, name: 'Посох', price: 2000, emoji: '🪄' },
]

export function getNextId() {
  return nextId++
}

export function resetId() {
  nextId = 7
}
