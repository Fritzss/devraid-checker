import { useState, useReducer, useEffect } from 'react'
import './App.css'
import {
  registerProducts, loadCart, saveCart, productsById, calcTotal, calcCount,
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

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.id === action.id)
      if (existing) return state.map((i) => i.id === action.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { id: action.id, qty: 1 }]
    }
    case 'REMOVE': return state.filter((i) => i.id !== action.id)
    case 'CLEAR': return []
    default: return state
  }
}

function App() {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => { saveCart(cart) }, [cart])

  const total = calcTotal(cart)
  const count = calcCount(cart)

  const submitOrder = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items: cart })
      })
      if (!res.ok) throw new Error('Server error')
      alert(`Спасибо, ${data.name}! Заказ оформлен.`)
    } catch (err) {
      // Фолбэк для демо, если бэкенд недоступен
      console.warn('API unavailable, using fallback:', err)
      alert(`Спасибо, ${data.name}! Заказ на ${total} ₽ принят (демо).`)
    } finally {
      dispatch({ type: 'CLEAR' })
      setShowCheckout(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🛒 Магазин</h1>
        <button aria-label="Корзина" onClick={() => setShowCart(!showCart)}>
          Корзина ({count})
        </button>
      </header>

      <main className="catalog">
        {products.map((p) => (
          <div key={p.id} className="product">
            <div className="emoji" aria-hidden="true">{p.emoji}</div>
            <h3>{p.name}</h3>
            <p>{p.price} ₽</p>
            <button aria-label={`В корзину ${p.name}`} onClick={() => dispatch({ type: 'ADD', id: p.id })}>В корзину</button>
            <button aria-label={`Купить ${p.name}`} className="buy" onClick={() => { dispatch({ type: 'ADD', id: p.id }); setShowCheckout(true) }}>Купить</button>
          </div>
        ))}
      </main>

      {showCart && (
        <aside className="cart" aria-label="Корзина">
          <h2>Корзина</h2>
          {cart.length === 0 ? <p>Пусто</p> : (
            <>
              <ul>
                {cart.map((i) => {
                  const p = productsById.get(i.id)
                  if (!p) return null
                  return (
                    <li key={i.id}>
                      <span>{p.name} × {i.qty} = {p.price * i.qty} ₽</span>
                      <button aria-label={`Удалить ${p.name}`} onClick={() => dispatch({ type: 'REMOVE', id: i.id })}>✕</button>
                    </li>
                  )
                })}
              </ul>
              <p><b>Итого: {total} ₽</b></p>
              <button aria-label="Оформить" onClick={() => setShowCheckout(true)}>Оформить</button>
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
            <button type="button" aria-label="Отменить оформление" onClick={() => setShowCheckout(false)}>Отмена</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
