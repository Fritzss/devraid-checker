import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerProducts,
  loadCart,
  saveCart,
  addItem,
  removeItem,
  calcTotal,
  calcCount,
  productsById,
} from './cart'

const mockProducts = [
  { id: 1, name: 'Меч', price: 1000 },
  { id: 2, name: 'Щит', price: 1500 },
]

beforeEach(() => {
  localStorage.clear()
  productsById.clear()
  registerProducts(mockProducts)
})

describe('cart utils', () => {
  it('registerProducts заполняет productsById', () => {
    expect(productsById.get(1)).toEqual({ id: 1, name: 'Меч', price: 1000 })
  })

  it('loadCart возвращает пустой массив, если в localStorage ничего нет', () => {
    expect(loadCart()).toEqual([])
  })

  it('loadCart возвращает данные из localStorage', () => {
    localStorage.setItem('cart', JSON.stringify([{ id: 1, qty: 2 }]))
    expect(loadCart()).toEqual([{ id: 1, qty: 2 }])
  })

  it('loadCart безопасно обрабатывает битый JSON', () => {
    localStorage.setItem('cart', '{bad json')
    expect(loadCart()).toEqual([])
  })

  it('saveCart записывает данные в localStorage', () => {
    saveCart([{ id: 1, qty: 1 }])
    expect(localStorage.getItem('cart')).toBe('[{"id":1,"qty":1}]')
  })

  it('saveCart не падает при ошибке записи', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Мокаем JSON.stringify, чтобы он выбросил ошибку внутри try/catch в saveCart
    const stringifySpy = vi.spyOn(JSON, 'stringify').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    expect(() => saveCart([{ id: 1, qty: 1 }])).not.toThrow()
    expect(warnSpy).toHaveBeenCalledWith('Не удалось сохранить корзину:', expect.any(Error))

    // Убираем моки
    stringifySpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('addItem добавляет новый товар', () => {
    const cart = addItem([], 1)
    expect(cart).toEqual([{ id: 1, qty: 1 }])
  })

  it('addItem увеличивает количество, если товар уже есть', () => {
    const cart = addItem([{ id: 1, qty: 1 }], 1)
    expect(cart).toEqual([{ id: 1, qty: 2 }])
  })

  it('removeItem удаляет товар из корзины', () => {
    const cart = removeItem([{ id: 1, qty: 1 }, { id: 2, qty: 1 }], 1)
    expect(cart).toEqual([{ id: 2, qty: 1 }])
  })

  it('calcTotal правильно считает сумму', () => {
    const total = calcTotal([{ id: 1, qty: 2 }, { id: 2, qty: 1 }])
    expect(total).toBe(3500) // 1000*2 + 1500*1
  })

  it('calcTotal игнорирует отсутствующие в каталоге товары', () => {
    const total = calcTotal([{ id: 1, qty: 1 }, { id: 999, qty: 5 }])
    expect(total).toBe(1000)
  })

  it('calcCount правильно считает количество', () => {
    const count = calcCount([{ id: 1, qty: 2 }, { id: 2, qty: 3 }])
    expect(count).toBe(5)
  })
})
