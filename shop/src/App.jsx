import { useState, useEffect } from 'react'
import './App.css'

const products = [
  { id: 1, name: 'Меч', price: 1000, emoji: '⚔️' },
  { id: 2, name: 'Щит', price: 1500, emoji: '🛡️' },
  { id: 3, name: 'Зелье', price: 300, emoji: '🧪' },
  { id: 4, name: 'Лук', price: 800, emoji: '🏹' },
  { id: 5, name: 'Шлем', price: 1200, emoji: '🪖' },
  { id: 6, name: 'Посох', price: 2000, emoji: '🪄' },
]

function App() {
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem('cart') || '[]')
  )
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (id) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) return prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const total = cart.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.id)
    return sum + p.price * i.qty
  }, 0)

  const count = cart.reduce((s, i) => s + i.qty, 0)

  const submitOrder = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    alert(`Спасибо, ${data.name}! Заказ на ${total} ₽ принят.`)
    setCart([])
    setShowCheckout(false)
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
            <div className="emoji">{p.emoji}</div>
            <h3>{p.name}</h3>
            <p>{p.price} ₽</p>
            <button onClick={() => addToCart(p.id)}>В корзину</button>
          </div>
        ))}
      </main>

      {showCart && (
        <aside className="cart">
          <h2>Корзина</h2>
          {cart.length === 0 ? (
            <p>Пусто</p>
          ) : (
            <>
              <ul>
                {cart.map((i) => {
                  const p = products.find((x) => x.id === i.id)
                  return (
                    <li key={i.id}>
                      <span>{p.name} × {i.qty} = {p.price * i.qty} ₽</span>
                      <button onClick={() => removeFromCart(i.id)}>✕</button>
                    </li>
                  )
                })}
              </ul>
              <p><b>Итого: {total} ₽</b></p>
              <button onClick={() => setShowCheckout(true)}>Оформить</button>
            </>
          )}
        </aside>
      )}

      {showCheckout && (
        <div className="modal">
          <form onSubmit={submitOrder}>
            <h2>Оформление</h2>
            <input name="name" placeholder="Имя" required />
            <input name="phone" placeholder="Телефон" required />
            <input name="address" placeholder="Адрес" required />
            <button type="submit">Подтвердить</button>
            <button type="button" onClick={() => setShowCheckout(false)}>Отмена</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
