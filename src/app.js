const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');
const { swaggerUi, swaggerSpec } = require('./swagger');
const responseMiddleware = require('./middleware/responseMiddleware');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));



app.get('/', (req, res) => {
  res.json({ message: 'Multi-tenant RBAC API is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(responseMiddleware);
app.use('/api',routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/uploads', express.static('/var/www/html/api.msmeaccounts.com/public/uploads'));


app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
