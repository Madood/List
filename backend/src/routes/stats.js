// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const router = express.Router();
// const DATA_PATH = path.join(__dirname, '../../data/items.json');

// // GET /api/stats
// router.get('/', (req, res, next) => {
//   fs.readFile(DATA_PATH, (err, raw) => {
//     if (err) return next(err);

//     const items = JSON.parse(raw);
//     // Intentional heavy CPU calculation
//     const stats = {
//       total: items.length,
//       averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
//     };

//     res.json(stats);
//   });
// });

// module.exports = router;

const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs'); // For fs.watchFile
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

// ----------------- Cache Setup for /stats -----------------

let cachedStats = null;
let lastModifiedTime = 0;

function calculateStats(data) {
  return {
    totalItems: data.length,
    // Extend here for more advanced stats
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

// Watch file unless in test environment
if (process.env.NODE_ENV !== 'test') {
  fsSync.watchFile(DATA_PATH, async (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      await refreshStats();
    }
  });

  // Initial cache population
  refreshStats();
}

// ----------------- Routes -----------------

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      results = results.filter(item =>
        item.name?.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
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

    // ✅ Simple validation
    if (!item || !item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      return res.status(400).json({ error: 'Invalid item payload' });
    }

    const data = await readData();
    item.id = Date.now();
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

