import { test, expect } from '@playwright/test'

test('витрина рендерит товары', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Меч')).toBeVisible()
  await expect(page.getByText('Щит')).toBeVisible()
})

test('добавление товара в корзину', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /В корзину/i }).first().click()
  // Проверяем текст внутри кнопки Корзина
  await expect(page.getByRole('button', { name: 'Корзина' })).toContainText('Корзина (1)')
})

test('оформление заказа', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /В корзину/i }).first().click()
  
  await page.getByRole('button', { name: 'Корзина' }).click()
  await page.getByRole('button', { name: 'Оформить' }).click()

  page.on('dialog', (d) => d.accept())

  await page.getByPlaceholder('Имя').fill('Иван')
  await page.getByPlaceholder('Телефон').fill('+79001234567')
  await page.getByPlaceholder('Адрес').fill('Москва, Кремль')
  await page.getByRole('button', { name: 'Подтвердить' }).click()

  await expect(page.getByRole('button', { name: 'Корзина' })).toContainText('Корзина (0)')
})

test('кнопка «Купить» открывает оформление сразу', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Купить Меч/ }).click()
  await expect(page.getByPlaceholder('Имя')).toBeVisible()
  await expect(page.getByPlaceholder('Телефон')).toBeVisible()
  await expect(page.getByPlaceholder('Адрес')).toBeVisible()
})
