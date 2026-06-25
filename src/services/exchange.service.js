import axios from 'axios'

const fetchDirectRate = async (currency) => {
  const response = await axios.get(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`,
  )
  const rate = response.data?.[currency]?.pen
  return rate ? Number(rate.toFixed(4)) : 0
}

export const fetchExchangeRates = async () => {
  const [usd, eur, cny] = await Promise.all([
    fetchDirectRate('usd'),
    fetchDirectRate('eur'),
    fetchDirectRate('cny'),
  ])

  if (!usd && !eur && !cny) {
    throw new Error('No se pudieron obtener los tipos de cambio.')
  }

  return { usd, eur, cny }
}

export const fetchUsdRateHistory = async (days = 30) => {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })

  const requests = dates.map(async (date) => {
    try {
      const response = await axios.get(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`,
      )
      const rate = response.data?.usd?.pen

      return {
        date,
        rate: rate ? Number(rate.toFixed(4)) : 0,
      }
    } catch {
      return {
        date,
        rate: 0,
      }
    }
  })

  const results = await Promise.all(requests)

  return results.filter((item) => item.rate > 0).sort((a, b) => a.date.localeCompare(b.date))
}
