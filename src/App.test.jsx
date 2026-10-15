import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
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
    const buttons = screen.getAllByRole('button', { name: /В корзину/i })
    fireEvent.click(buttons[0])
    expect(screen.getByText(/Корзина \(1\)/)).toBeInTheDocument()
  })

  it('открывает корзину и показывает итог', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByText(/Корзина \(/))
    expect(screen.getByText(/Итого: 1000 ₽/)).toBeInTheDocument()
  })

  it('сохраняет корзину в localStorage', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    expect(localStorage.getItem('cart')).toBeTruthy()
  })
})
