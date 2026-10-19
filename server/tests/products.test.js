import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { resetDb } from '../src/db/init.js'

const app = createApp()

beforeEach(() => {
  resetDb()
})

describe('API', () => {
  it('GET /health — возвращает ok и статус БД', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', database: 'up' })
  })

  it('GET /api/products — возвращает список товаров', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(6)
  })

  it('GET /api/products/with-reviews — возвращает товары с отзывами', async () => {
    const res = await request(app).get('/api/products/with-reviews')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const mech = res.body.find((p) => p.name === 'Меч')
    expect(mech).toBeDefined()
    expect(mech.reviews.length).toBeGreaterThanOrEqual(2)
  })

  it('GET /api/products/:id — возвращает товар', async () => {
    const res = await request(app).get('/api/products/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, name: 'Меч' })
  })

  it('GET /api/products/:id — 404 если не найден', async () => {
    const res = await request(app).get('/api/products/999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Product not found')
  })

  it('GET /api/products/:id — 400 если id невалиден', async () => {
    const res = await request(app).get('/api/products/abc')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid id')
  })

  it('POST /api/products — создаёт товар', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Кинжал', price: 500, emoji: '🗡️' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Кинжал', price: 500 })
    expect(res.body.id).toBeDefined()
  })

  it('POST /api/products — 400 на невалидные данные', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: '', price: -10 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('PUT /api/products/:id — обновляет товар', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: 1500 })
    expect(res.status).toBe(200)
    expect(res.body.price).toBe(1500)
  })

  it('PUT /api/products/:id — 404 если не найден', async () => {
    const res = await request(app)
      .put('/api/products/999')
      .send({ price: 1500 })
    expect(res.status).toBe(404)
  })

  it('PUT /api/products/:id — 400 если id невалиден', async () => {
    const res = await request(app)
      .put('/api/products/abc')
      .send({ price: 1500 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid id')
  })

  it('PUT /api/products/:id — 400 если тело невалидно', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: -100 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('DELETE /api/products/:id — удаляет товар', async () => {
    const res = await request(app).delete('/api/products/1')
    expect(res.status).toBe(204)

    const check = await request(app).get('/api/products/1')
    expect(check.status).toBe(404)
  })

  it('DELETE /api/products/:id — 404 если не найден', async () => {
    const res = await request(app).delete('/api/products/999')
    expect(res.status).toBe(404)
  })

  it('DELETE /api/products/:id — 400 если id невалиден', async () => {
    const res = await request(app).delete('/api/products/abc')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid id')
  })

  it('GET /metrics — возвращает метрики Prometheus', async () => {
    const res = await request(app).get('/metrics')
    expect(res.status).toBe(200)
    expect(res.text).toContain('devraid_http_requests_total')
    expect(res.text).toContain('devraid_db_status')
  })
})
