import { api } from 'boot/axios'

export const fetchExchangeRates = async () => {
  const [usd, eur, cny] = await Promise.all([
    api.get('/TipoCambio/en-vivo?desde=PEN&hacia=USD'),
    api.get('/TipoCambio/en-vivo?desde=PEN&hacia=EUR'),
    api.get('/TipoCambio/en-vivo?desde=PEN&hacia=CNY'),
  ])

  return {
    usd: Number(usd.data.tasaCambioReferencial),
    eur: Number(eur.data.tasaCambioReferencial),
    cny: Number(cny.data.tasaCambioReferencial),
    mensajes: {
      usd: usd.data.mensaje,
      eur: eur.data.mensaje,
      cny: cny.data.mensaje,
    },
  }
}
