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

  it('кнопка «Купить» добавляет товар и открывает оформление', () => {
    render(<App />)
    const buyButtons = screen.getAllByRole('button', { name: /Купить/i })
    fireEvent.click(buyButtons[0])
    expect(screen.getByText(/Корзина \(1\)/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Адрес')).toBeInTheDocument()
  })

  it('оформляет заказ (submitOrder) и очищает корзину', () => {
    render(<App />)
    // Добавляем товар
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    // Открываем корзину и жмём Оформить
    fireEvent.click(screen.getByText(/Корзина \(/))
    fireEvent.click(screen.getByText('Оформить'))

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByPlaceholderText('Телефон'), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText('Адрес'), { target: { value: 'Москва' } })

    // Мокаем alert, чтобы тест не падал на нём
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Подтверждаем
    fireEvent.click(screen.getByText('Подтвердить'))

    expect(alertSpy).toHaveBeenCalledWith('Спасибо, Иван! Заказ на 1000 ₽ принят.')
    expect(screen.getByText(/Корзина \(0\)/)).toBeInTheDocument()

    alertSpy.mockRestore()
  })

  it('показывает ошибку, если не заполнены поля при оформлении', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByText(/Корзина \(/))
    fireEvent.click(screen.getByText('Оформить'))

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    // В форме есть required, но мы вызовем submit напрямую
    fireEvent.submit(screen.getByText('Подтвердить').closest('form'))
    
    // Так как required в jsdom не блокирует submit, submitOrder выбросит ошибку о пустых полях
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Не удалось оформить заказ'))
    
    alertSpy.mockRestore()
  })

  it('закрывает форму оформления по кнопке Отмена', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /В корзину/i })[0])
    fireEvent.click(screen.getByText(/Корзина \(/))
    fireEvent.click(screen.getByText('Оформить'))
    
    // Форма открыта
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
    
    // Жмём Отмена
    fireEvent.click(screen.getByText('Отмена'))
    
    // Форма закрыта
    expect(screen.queryByPlaceholderText('Имя')).not.toBeInTheDocument()
  })

})
