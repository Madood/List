const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { getCookie, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('*', notFound);

if (process.env.NODE_ENV !== 'test') {
  getCookie();
}

module.exports = app;
