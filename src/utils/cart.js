/**
 * Чистые функции для работы с корзиной.
 * Корзина — массив { id: number, qty: number }.
 */

export const productsById = new Map()

export function registerProducts(products) {
  products.forEach((p) => productsById.set(p.id, p))
}

export function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  } catch {
    return []
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart))
  } catch (err) {
    console.warn('Не удалось сохранить корзину:', err)
  }
}

export function addItem(cart, id) {
  const existing = cart.find((i) => i.id === id)
  if (existing) {
    return cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
  }
  return [...cart, { id, qty: 1 }]
}

export function removeItem(cart, id) {
  return cart.filter((i) => i.id !== id)
}

export function calcTotal(cart) {
  return cart.reduce((sum, i) => {
    const p = productsById.get(i.id)
    return p ? sum + p.price * i.qty : sum
  }, 0)
}

export function calcCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0)
}
