import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import pinoHttp from 'pino-http'
import productsRouter from './routes/products.js'
import { initDb } from './db/init.js'
import db from './db/index.js'
import logger from './logger.js'
import metricsClient, { httpRequestDuration, httpRequestTotal, dbStatus } from './metrics.js'

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'devraid-checker API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.js'],
})

export function createApp() {
  const app = express()
  
  // Логирование запросов
  app.use(pinoHttp({ logger }))
  
  app.use(cors())
  app.use(express.json())

  // Метрики времени выполнения
  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer()
    res.on('finish', () => {
      const labels = { 
        method: req.method, 
        route: req.route ? req.route.path : req.path, 
        status_code: res.statusCode 
      }
      end(labels)
      httpRequestTotal.inc(labels)
    })
    next()
  })

  // Health-check с проверкой БД
  app.get('/health', (req, res) => {
    try {
      db.prepare('SELECT 1').get()
      dbStatus.set(1)
      res.json({ status: 'ok', database: 'up' })
    } catch (error) {
      dbStatus.set(0)
      logger.error(error, 'Database health check failed')
      res.status(503).json({ status: 'error', database: 'down' })
    }
  })

  // Метрики для Prometheus
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metricsClient.register.contentType)
    res.end(await metricsClient.register.metrics())
  })

  app.use('/api/products', productsRouter)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/openapi.json', (req, res) => res.json(swaggerSpec))

  app.use((req, res) => res.status(404).json({ error: 'Not found' }))

  initDb()
  return app
}
