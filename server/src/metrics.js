import client from 'prom-client'

// Собираем дефолтные метрики (память, CPU, event loop)
client.collectDefaultMetrics({ prefix: 'devraid_' })

// Создаем кастомные метрики
export const httpRequestDuration = new client.Histogram({
  name: 'devraid_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
})

export const httpRequestTotal = new client.Counter({
  name: 'devraid_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

export const dbStatus = new client.Gauge({
  name: 'devraid_db_status',
  help: 'Status of the database connection (1 = up, 0 = down)',
})

export default client
