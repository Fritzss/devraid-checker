# devraid-checker

Магазин на React 19 + Vite 8.

🌐 **Прод:** https://fritzss.github.io/devraid-checker/

## Стек

- React 19
- Vite 8
- Vitest + Testing Library (unit)
- Playwright (E2E)

## Функционал

- Каталог товаров
- Корзина с сохранением в localStorage
- Подсчёт итога
- Оформление заказа (имя, телефон, адрес)

## Команды

```bash
npm install          # установка
npm run dev          # локальная разработка (http://localhost:5173)
npm run build        # прод-сборка в dist/
npm run preview      # предпросмотр прод-сборки
npm test             # unit-тесты (Vitest)
npm run test:e2e     # E2E-тесты (Playwright)
npm run lint         # ESLint
