import { test, expect } from '@playwright/test'

test('витрина рендерит товары', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Меч')).toBeVisible()
  await expect(page.getByText('Щит')).toBeVisible()
})

test('добавление товара в корзину', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'В корзину' }).first().click()
  await expect(page.getByText('Корзина (1)')).toBeVisible()
})

test('оформление заказа', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'В корзину' }).first().click()
  await page.getByRole('button', { name: /Корзина \(/ }).click()
  await page.getByRole('button', { name: 'Оформить' }).click()

  page.on('dialog', (d) => d.accept())

  await page.getByPlaceholder('Имя').fill('Иван')
  await page.getByPlaceholder('Телефон').fill('+79001234567')
  await page.getByPlaceholder('Адрес').fill('Москва, Кремль')
  await page.getByRole('button', { name: 'Подтвердить' }).click()

  await expect(page.getByText('Корзина (0)')).toBeVisible()
})
