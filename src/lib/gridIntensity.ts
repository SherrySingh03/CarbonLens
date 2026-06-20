const FALLBACK_KG_PER_KWH = 0.716
const CACHE_KEY = 'cl_grid_intensity'

export interface GridIntensityResult {
  kgPerKwh: number
  isLive: boolean
  zone?: string
}

export async function fetchGridIntensity(): Promise<GridIntensityResult> {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed && typeof parsed === 'object' && typeof parsed.kgPerKwh === 'number') {
        return parsed as GridIntensityResult
      }
      // old format was a plain number — fall through to re-fetch
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch('/api/grid-intensity')
    if (!res.ok) throw new Error('grid intensity fetch failed')
    const data = await res.json() as { kgPerKwh: number; source: string; zone?: string }
    const result: GridIntensityResult = {
      kgPerKwh: data.kgPerKwh,
      isLive: data.source === 'live',
      zone: data.zone,
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
    return result
  } catch {
    return { kgPerKwh: FALLBACK_KG_PER_KWH, isLive: false }
  }
}
