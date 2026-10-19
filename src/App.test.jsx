import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'created' }) })
  ))
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('App — витрина и корзина', () => {
  it('рендерит каталог товаров', () => {
    render(<App />)
    expect(screen.getByText('Меч')).toBeInTheDocument()
    expect(screen.getByText('Щит')).toBeInTheDocument()
    expect(screen.getByText('Зелье')).toBeInTheDocument()
  })

  it('добавляет товар в корзину и увеличивает счётчик', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    // Кнопка корзины теперь имеет aria-label="Корзина", а текст меняется динамически
    expect(screen.getByRole('button', { name: 'Корзина' })).toHaveTextContent('Корзина (1)')
  })

  it('открывает корзину и показывает итог', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Корзина' }))
    expect(screen.getByText(/Итого: 1000 ₽/)).toBeInTheDocument()
  })

  it('сохраняет корзину в localStorage', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    expect(localStorage.getItem('cart')).toBeTruthy()
  })

  it('кнопка «Купить» добавляет товар и открывает оформление', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Купить/i })[0])
    expect(screen.getByRole('button', { name: 'Корзина' })).toHaveTextContent('Корзина (1)')
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
  })

  it('отправляет заказ (submitOrder), очищает корзину и закрывает форму', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Корзина' }))
    fireEvent.click(screen.getByRole('button', { name: 'Оформить' }))

    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByPlaceholderText('Телефон'), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText('Адрес'), { target: { value: 'Москва' } })

    fireEvent.click(screen.getByRole('button', { name: /Подтвердить/ }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Спасибо, Иван! Заказ оформлен.')
      expect(screen.getByRole('button', { name: 'Корзина' })).toHaveTextContent('Корзина (0)')
    })
  })

  it('использует фолбэк, если API недоступен', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network Error'))))
    
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Корзина' }))
    fireEvent.click(screen.getByRole('button', { name: 'Оформить' }))

    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByPlaceholderText('Телефон'), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText('Адрес'), { target: { value: 'Москва' } })

    fireEvent.click(screen.getByRole('button', { name: /Подтвердить/ }))

    await waitFor(() => {
      // Должен сработать fallback alert
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Заказ на 1000 ₽ принят (демо)'))
    })
  })

  it('закрывает форму оформления по кнопке Отмена', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Купить/i })[0])
    
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Отменить оформление' }))
    expect(screen.queryByPlaceholderText('Имя')).not.toBeInTheDocument()
  })
})
