require('dotenv').config();
const express = require('express');
const cors = require('cors');
const currencyRoutes = require('./routes/currencyRoutes');

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'clicolab-app-currency' }));
app.use('/api/rates', currencyRoutes);

const PORT = process.env.PORT || 4100;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`clicolab-app-currency listening on 0.0.0.0:${PORT}`);
});
