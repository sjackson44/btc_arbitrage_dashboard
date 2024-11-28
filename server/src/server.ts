import express from 'express';
import cors from 'cors';
import { router as pricesRouter } from './routes/prices.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com'
    : 'http://localhost:5173'
}));

app.use(express.json());
app.use('/api/prices', pricesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 