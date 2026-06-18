export const config = { runtime: 'edge' }

const VALID_CAR_TYPES = ['petrol', 'diesel', 'electric', 'none']
const VALID_ENERGY_SOURCES = ['grid', 'renewable', 'mixed']
const VALID_DIET_TYPES = ['meat-heavy', 'average', 'vegetarian', 'vegan']

function sanitizeString(val, validValues, fallback) {
  return validValues.includes(val) ? val : fallback
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { footprintLog, profile, committedTipIds } = body

  if (!footprintLog || !profile) {
    return new Response('Missing required fields', { status: 400 })
  }

  const carKm = Math.min(Number(footprintLog.transport?.carKm) || 0, 5000)
  const flightHours = Math.min(Number(footprintLog.transport?.flightHours) || 0, 500)
  const transitKm = Math.min(Number(footprintLog.transport?.transitKm) || 0, 3000)
  const electricityKwh = Math.min(Number(footprintLog.homeEnergy?.electricityKwh) || 0, 10000)
  const gasUnits = Math.min(Number(footprintLog.homeEnergy?.gasUnits) || 0, 1000)
  const totalKgCO2 = Math.min(Number(footprintLog.totalKgCO2) || 0, 50000)

  const carType = sanitizeString(footprintLog.transport?.carType, VALID_CAR_TYPES, 'petrol')
  const energySource = sanitizeString(footprintLog.homeEnergy?.energySource, VALID_ENERGY_SOURCES, 'grid')
  const dietType = sanitizeString(footprintLog.diet?.dietType, VALID_DIET_TYPES, 'average')
  const safeCommitted = Array.isArray(committedTipIds)
    ? committedTipIds.filter((id) => typeof id === 'string').slice(0, 50).join(', ')
    : 'none'

  const systemPrompt = `You are a carbon footprint reduction expert for Indian users. Given a user's monthly carbon footprint data, generate exactly 6 personalized, specific, actionable tips to reduce their footprint.

Return ONLY a valid JSON array. No markdown, no explanation, no preamble. Each object must have:
- id: string (unique, e.g. "tip_001")
- category: one of "transport" | "energy" | "diet" | "purchases"
- title: string (max 8 words, action-oriented)
- description: string (1-2 sentences, specific and encouraging, India-relevant)
- estimatedSavingKgCO2: number (monthly saving in kg, realistic)
- difficulty: "easy" | "medium" | "hard"
- committed: false

Prioritize categories with the highest CO2 contribution. Make tips specific to the user's actual data. Do not suggest tips the user has already committed to.`

  const userMessage = `User footprint data:
- Transport: ${carKm}km by ${carType} car, ${flightHours}h flights, ${transitKm}km transit
- Home energy: ${electricityKwh}kWh electricity (${energySource}), ${gasUnits} gas units
- Diet: ${dietType}
- Purchases: ${Number(footprintLog.purchases?.onlineOrdersCount) || 0} online orders, ${Number(footprintLog.purchases?.newClothingItems) || 0} clothing, ${Number(footprintLog.purchases?.electronicsItems) || 0} electronics
- Total: ${totalKgCO2.toFixed(1)} kg CO2/month
- Already committed tip IDs (do not repeat): ${safeCommitted}

Generate 6 tips tailored to this specific profile.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    return new Response('AI service error', { status: 502 })
  }

  const data = await response.json()
  const tipsJson = data.content[0].text

  try {
    JSON.parse(tipsJson)
  } catch {
    return new Response('Invalid AI response format', { status: 500 })
  }

  return new Response(tipsJson, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
