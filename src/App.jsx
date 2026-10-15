import { useState, useEffect } from 'react'
import './App.css'
import {
  registerProducts,
  loadCart,
  saveCart,
  addItem,
  removeItem,
  calcTotal,
  calcCount,
  productsById,
} from './utils/cart'

const products = [
  { id: 1, name: 'Меч', price: 1000, emoji: '⚔️' },
  { id: 2, name: 'Щит', price: 1500, emoji: '🛡️' },
  { id: 3, name: 'Зелье', price: 300, emoji: '🧪' },
  { id: 4, name: 'Лук', price: 800, emoji: '🏹' },
  { id: 5, name: 'Шлем', price: 1200, emoji: '🪖' },
  { id: 6, name: 'Посох', price: 2000, emoji: '🪄' },
]

registerProducts(products)

function App() {
  const [cart, setCart] = useState(loadCart)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const total = calcTotal(cart)
  const count = calcCount(cart)

  const submitOrder = (e) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.target))
      if (!data.name || !data.phone || !data.address) {
        throw new Error('Заполните все поля')
      }
      alert(`Спасибо, ${data.name}! Заказ на ${total} ₽ принят.`)
      setCart([])
      setShowCheckout(false)
    } catch (err) {
      console.error('Ошибка оформления заказа:', err)
      alert(`Не удалось оформить заказ: ${err.message}`)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🛒 Магазин</h1>
          <button onClick={() => setShowCart(!showCart)}>
            Корзина ({count})
          </button>
      </header>

      <main className="catalog">
        {products.map((p) => (
          <div key={p.id} className="product">
            <div className="emoji" aria-hidden="true">{p.emoji}</div>
            <h3>{p.name}</h3>
            <p>{p.price} ₽</p>
            <button
              aria-label={`Добавить ${p.name} в корзину`}
              onClick={() => setCart((prev) => addItem(prev, p.id))}
            >
              В корзину
            </button>
          </div>
        ))}
      </main>

      {showCart && (
        <aside className="cart" aria-label="Корзина">
          <h2>Корзина</h2>
          {cart.length === 0 ? (
            <p>Пусто</p>
          ) : (
            <>
              <ul>
                {cart.map((i) => {
                  const p = productsById.get(i.id)
                  if (!p) return null
                  return (
                    <li key={i.id}>
                      <span>{p.name} × {i.qty} = {p.price * i.qty} ₽</span>
                      <button
                        aria-label={`Удалить ${p.name} из корзины`}
                        onClick={() => setCart((prev) => removeItem(prev, i.id))}
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p><b>Итого: {total} ₽</b></p>
              <button onClick={() => setShowCheckout(true)}
              >
                Оформить
              </button>
            </>
          )}
        </aside>
      )}

      {showCheckout && (
        <div className="modal" role="dialog" aria-label="Оформление заказа">
          <form onSubmit={submitOrder}>
            <h2>Оформление</h2>
            <input name="name" placeholder="Имя" aria-label="Имя" required />
            <input name="phone" placeholder="Телефон" aria-label="Телефон" required />
            <input name="address" placeholder="Адрес" aria-label="Адрес" required />
            <button type="submit" aria-label="Подтвердить заказ">Подтвердить</button>
            <button
              type="button"
              aria-label="Отменить оформление"
              onClick={() => setShowCheckout(false)}
            >
              Отмена
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
