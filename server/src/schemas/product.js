import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  price: z.number().int().positive('Цена должна быть положительной'),
  emoji: z.string().max(10).optional().default('📦'),
})

export const ProductUpdateSchema = ProductSchema.partial()

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})
