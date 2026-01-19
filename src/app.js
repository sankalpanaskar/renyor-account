const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { swaggerUi, swaggerSpec } = require('./swagger');
const responseMiddleware = require('./middleware/responseMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const multer = require("multer");
const upload = multer();


app.get('/', (req, res) => {
  res.json({ message: 'Multi-tenant RBAC API is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(responseMiddleware);
app.use('/api', upload.none(),routes);


app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
