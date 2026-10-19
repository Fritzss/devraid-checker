import { Router } from 'express'
import { z } from 'zod'
import db from '../db/index.js'

const router = Router()

const OrderSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  items: z.array(z.object({ id: z.number(), qty: z.number() })).min(1)
})

router.post('/', (req, res) => {
  const parsed = OrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
  }

  try {
    const { name, phone, address, items } = parsed.data
    let total = 0
    
    const getProduct = db.prepare('SELECT price FROM products WHERE id = ?')
    for (const item of items) {
      const product = getProduct.get(item.id)
      if (product) total += product.price * item.qty
    }

    const insertOrder = db.prepare('INSERT INTO orders (name, phone, address, total) VALUES (?, ?, ?, ?)')
    const info = insertOrder.run(name, phone, address, total)
    
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, qty) VALUES (?, ?, ?)')
    for (const item of items) {
      insertItem.run(info.lastInsertRowid, item.id, item.qty)
    }

    res.status(201).json({ id: info.lastInsertRowid, total, status: 'created' })
  } catch (err) {
    console.error('Order creation failed:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
