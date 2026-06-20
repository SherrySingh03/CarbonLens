export const config = { runtime: 'edge' }

const ZONE = 'IN-SO'
const FALLBACK_KG_PER_KWH = 0.716

export default async function handler() {
  try {
    const res = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${ZONE}`,
      { headers: { 'auth-token': process.env.ELECTRICITY_MAPS_KEY ?? '' } }
    )
    if (!res.ok) throw new Error(`Electricity Maps API error: ${res.status}`)
    const data = await res.json()
    const kgPerKwh = Number(data.carbonIntensity) / 1000
    if (!isFinite(kgPerKwh) || kgPerKwh <= 0) throw new Error('Invalid carbonIntensity value')
    return new Response(JSON.stringify({ kgPerKwh, source: 'live', zone: ZONE }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ kgPerKwh: FALLBACK_KG_PER_KWH, source: 'fallback', error: String(err) }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      }
    )
  }
}
