import { Router } from 'express'
import { productsRepo } from '../data/products.js'
import {
  ProductSchema,
  ProductUpdateSchema,
  IdParamSchema,
} from '../schemas/product.js'

const router = Router()

// Вспомогательная функция для обработки ошибок
const handleError = (res, error) => {
  console.error('Route error:', error)
  res.status(500).json({ error: 'Internal server error' })
}

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Массив товаров
 */
router.get('/', (req, res) => {
  try {
    res.json(productsRepo.getAll())
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * @openapi
 * /api/products/with-reviews:
 *   get:
 *     summary: Список товаров с отзывами (оптимизированный запрос без N+1)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Массив товаров с вложенными отзывами
 */
router.get('/with-reviews', (req, res) => {
  try {
    res.json(productsRepo.getAllWithReviews())
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар
 */
router.get('/:id', (req, res) => {
  try {
    const parsed = IdParamSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid id', details: parsed.error.issues })
    }
    const product = productsRepo.getById(parsed.data.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Созданный товар
 */
router.post('/', (req, res) => {
  try {
    const parsed = ProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
    }
    const product = productsRepo.create(parsed.data)
    res.status(201).json(product)
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Обновлённый товар
 */
router.put('/:id', (req, res) => {
  try {
    const idParsed = IdParamSchema.safeParse(req.params)
    if (!idParsed.success) {
      return res.status(400).json({ error: 'Invalid id', details: idParsed.error.issues })
    }
    const bodyParsed = ProductUpdateSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: bodyParsed.error.issues })
    }
    const updated = productsRepo.update(idParsed.data.id, bodyParsed.data)
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(updated)
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Удалено
 */
router.delete('/:id', (req, res) => {
  try {
    const parsed = IdParamSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid id', details: parsed.error.issues })
    }
    const deleted = productsRepo.delete(parsed.data.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(204).send()
  } catch (err) {
    handleError(res, err)
  }
})

export default router
