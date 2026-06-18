const FALLBACK_KG_PER_KWH = 0.716
const CACHE_KEY = 'cl_grid_intensity'
const ZONE = 'IN-SO'

export async function fetchGridIntensity(): Promise<number> {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) return parseFloat(cached)

  try {
    const res = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${ZONE}`,
      { headers: { 'auth-token': import.meta.env.VITE_ELECTRICITY_MAPS_KEY ?? '' } }
    )
    if (!res.ok) throw new Error('API error')
    const data = await res.json() as { carbonIntensity: number }
    const kgPerKwh = data.carbonIntensity / 1000
    sessionStorage.setItem(CACHE_KEY, String(kgPerKwh))
    return kgPerKwh
  } catch {
    return FALLBACK_KG_PER_KWH
  }
}
