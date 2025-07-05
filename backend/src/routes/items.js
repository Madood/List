const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// ----------------- Utility Functions -----------------

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// ----------------- Stats Caching -----------------

let cachedStats = null;
let lastModifiedTime = 0;

function calculateStats(data) {
  return {
    totalItems: data.length,
  };
}

async function refreshStats() {
  try {
    const data = await readData();
    cachedStats = calculateStats(data);
    lastModifiedTime = Date.now();
    console.log('[Cache] Stats updated');
  } catch (err) {
    console.error('Failed to refresh stats cache:', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  fsSync.watchFile(DATA_PATH, async (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      await refreshStats();
    }
  });

  refreshStats(); // Populate on startup
}

// ----------------- Routes -----------------

// GET /api/items?q=term&page=1&limit=5
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    let { q = '', page = 1, limit = 5 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;

    // Filter by search term
    let results = data;
    if (q) {
      results = results.filter(
        item =>
          typeof item.name === 'string' &&
          item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    const total = results.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = results.slice(startIndex, startIndex + limit);

    res.json({
      items: paginatedItems,
      total,
      page,
      pages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const item = req.body;

    // ✅ Basic validation
    if (
      !item ||
      !item.name ||
      typeof item.name !== 'string' ||
      item.name.trim() === ''
    ) {
      return res.status(400).json({ error: 'Invalid item payload' });
    }

    const data = await readData();
    item.id = Date.now(); // Simple unique ID
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/stats
router.get('/stats', async (req, res, next) => {
  try {
    if (cachedStats) {
      return res.json({
        stats: cachedStats,
        cachedAt: new Date(lastModifiedTime).toISOString(),
        cached: true,
      });
    }

    const data = await readData();
    cachedStats = calculateStats(data);
    lastModifiedTime = Date.now();

    res.json({
      stats: cachedStats,
      cachedAt: new Date(lastModifiedTime).toISOString(),
      cached: false,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
