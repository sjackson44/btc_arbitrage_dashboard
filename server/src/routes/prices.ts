import { Router } from 'express';
import { ExchangeService } from '../services/exchangeService.js';

const router = Router();
const exchangeService = new ExchangeService();

router.get('/bitcoin', async (req, res) => {
  try {
    const prices = await exchangeService.fetchAllPrices();
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router }; 