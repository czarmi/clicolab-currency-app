// Fetches USD and EUR reference rates ("kurs sredni" - table A) from the
// National Bank of Poland (NBP) public API. Docs: https://api.nbp.pl/
const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.NBP_API_BASE_URL || 'https://api.nbp.pl/api/exchangerates/rates/A';

async function fetchCurrentRates() {
  const [usdRes, eurRes] = await Promise.all([
    axios.get(`${BASE_URL}/USD/?format=json`),
    axios.get(`${BASE_URL}/EUR/?format=json`),
  ]);

  const usd = usdRes.data.rates[0];
  const eur = eurRes.data.rates[0];

  return {
    date: usd.effectiveDate,
    usd: { code: 'USD', rate: usd.mid, no: usd.no },
    eur: { code: 'EUR', rate: eur.mid, no: eur.no },
  };
}

// Last 7 NBP quotation days (NBP publishes only on business days).
async function fetchHistory() {
  const [usdRes, eurRes] = await Promise.all([
    axios.get(`${BASE_URL}/USD/last/7/?format=json`),
    axios.get(`${BASE_URL}/EUR/last/7/?format=json`),
  ]);

  const usdRates = usdRes.data.rates;
  const eurRates = eurRes.data.rates;

  return usdRates.map((usdEntry, idx) => ({
    date: usdEntry.effectiveDate,
    usd: usdEntry.mid,
    eur: eurRates[idx] ? eurRates[idx].mid : null,
  }));
}

module.exports = { fetchCurrentRates, fetchHistory };
