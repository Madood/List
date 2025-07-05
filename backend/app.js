const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { getCookie, notFound } = require('./middleware/errorHandler');

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', itemsRouter);   // ✅ supports pagination and search
app.use('/api/stats', statsRouter);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler for unmatched routes
app.use('*', notFound);

// Custom logic if not in test environment
if (process.env.NODE_ENV !== 'test') {
  getCookie();
}

module.exports = app;
