import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import productsRouter from './routes/products.js'
import { initDb } from './db/init.js'


const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'devraid-checker API',
      version: '1.0.0',
      description: 'REST API для магазина',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Меч' },
            price: { type: 'integer', example: 1000 },
            emoji: { type: 'string', example: '⚔️' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', example: 'Меч' },
            price: { type: 'integer', example: 1000 },
            emoji: { type: 'string', example: '⚔️' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
})

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (req, res) => res.json({ status: 'ok' }))
  app.use('/api/products', productsRouter)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/openapi.json', (req, res) => res.json(swaggerSpec))

  app.use((req, res) => res.status(404).json({ error: 'Not found' }))
  initDb()

  return app
}
