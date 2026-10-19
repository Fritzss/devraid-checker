import { createApp } from './app.js'
import logger from './logger.js'

const PORT = process.env.PORT || 3000
const app = createApp()

const server = app.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`)
  logger.info(`Docs: http://localhost:${PORT}/docs`)
  logger.info(`Metrics: http://localhost:${PORT}/metrics`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})
