const express = require('express');
const redisClient = require('../config/redis');
const { fetchCurrentRates, fetchHistory } = require('../services/nbpService');

const router = express.Router();
const TTL = parseInt(process.env.CACHE_TTL_SECONDS || '1800', 10);

async function getCached(key, fetchFn) {
  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('[Redis] cache read failed, falling back to live fetch:', e.message);
  }

  const data = await fetchFn();

  try {
    await redisClient.set(key, JSON.stringify(data), { EX: TTL });
  } catch (e) {
    console.warn('[Redis] cache write failed:', e.message);
  }

  return data;
}

router.get('/current', async (req, res) => {
  try {
    const data = await getCached('nbp:current', fetchCurrentRates);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ message: 'Failed to fetch current rates from NBP' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const data = await getCached('nbp:history', fetchHistory);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ message: 'Failed to fetch rate history from NBP' });
  }
});

module.exports = router;
