import { Router } from 'express'
import { products, getNextId } from '../data/products.js'
import {
  ProductSchema,
  ProductUpdateSchema,
  IdParamSchema,
} from '../schemas/product.js'

const router = Router()

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Массив товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', (req, res) => {
  res.json(products)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректный id
 *       404:
 *         description: Не найден
 */
router.get('/:id', (req, res) => {
  const parsed = IdParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid id', details: parsed.error.issues })
  }
  const product = products.find((p) => p.id === parsed.data.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', (req, res) => {
  const parsed = ProductSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
  }
  const product = { id: getNextId(), ...parsed.data }
  products.push(product)
  res.status(201).json(product)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Не найден
 */
router.put('/:id', (req, res) => {
  const idParsed = IdParamSchema.safeParse(req.params)
  if (!idParsed.success) {
    return res.status(400).json({ error: 'Invalid id', details: idParsed.error.issues })
  }
  const bodyParsed = ProductUpdateSchema.safeParse(req.body)
  if (!bodyParsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: bodyParsed.error.issues })
  }
  const idx = products.findIndex((p) => p.id === idParsed.data.id)
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  products[idx] = { ...products[idx], ...bodyParsed.data }
  res.json(products[idx])
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
 *       404:
 *         description: Не найден
 */
router.delete('/:id', (req, res) => {
  const parsed = IdParamSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid id', details: parsed.error.issues })
  }
  const idx = products.findIndex((p) => p.id === parsed.data.id)
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  products.splice(idx, 1)
  res.status(204).send()
})

export default router
