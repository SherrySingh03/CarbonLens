export const config = { runtime: 'edge' }

const VALID_CAR_TYPES = ['petrol', 'diesel', 'electric', 'none']
const VALID_ENERGY_SOURCES = ['grid', 'renewable', 'mixed']
const VALID_DIET_TYPES = ['meat-heavy', 'average', 'vegetarian', 'vegan']

function sanitizeString(val, validValues, fallback) {
  return validValues.includes(val) ? val : fallback
}

export default async function handler(req) {
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'same-origin',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
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
  const onlineOrdersCount = Math.min(Number(footprintLog.purchases?.onlineOrdersCount) || 0, 100)
  const newClothingItems  = Math.min(Number(footprintLog.purchases?.newClothingItems) || 0, 100)
  const electronicsItems  = Math.min(Number(footprintLog.purchases?.electronicsItems) || 0, 100)

  const carType = sanitizeString(footprintLog.transport?.carType, VALID_CAR_TYPES, 'petrol')
  const energySource = sanitizeString(footprintLog.homeEnergy?.energySource, VALID_ENERGY_SOURCES, 'grid')
  const dietType = sanitizeString(footprintLog.diet?.dietType, VALID_DIET_TYPES, 'average')
  const safeCommitted = Array.isArray(committedTipIds)
    ? committedTipIds
        .filter((id) => typeof id === 'string')
        .slice(0, 50)
        .map((id) => id.slice(0, 64))
        .join(', ')
    : 'none'

  const systemPrompt = `You are a carbon footprint reduction expert for Indian users. Given a user's monthly carbon footprint data, generate exactly 6 personalized, actionable tips to reduce their footprint.

Return ONLY a valid JSON array. No markdown, no explanation, no preamble. Each object must have:
- id: string (unique, e.g. "tip_001")
- category: one of "transport" | "energy" | "diet" | "purchases"
- title: string (max 6 words, action-oriented)
- description: string (max 15 words, India-relevant, specific to user data)
- estimatedSavingKgCO2: number (monthly saving in kg, realistic)
- difficulty: "easy" | "medium" | "hard"
- committed: false

Be extremely concise. The entire JSON response must stay under 250 words. Prioritize categories with the highest CO2 contribution. Do not suggest tips the user has already committed to.`

  const userMessage = `User footprint data:
- Transport: ${carKm}km by ${carType} car, ${flightHours}h flights, ${transitKm}km transit
- Home energy: ${electricityKwh}kWh electricity (${energySource}), ${gasUnits} gas units
- Diet: ${dietType}
- Purchases: ${onlineOrdersCount} online orders, ${newClothingItems} clothing, ${electronicsItems} electronics
- Total: ${totalKgCO2.toFixed(1)} kg CO2/month
- Already committed tip IDs (do not repeat): ${safeCommitted}

Generate 6 tips tailored to this specific profile.`

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.4, responseMimeType: 'application/json' }
      }),
    }
  )

  if (!response.ok) {
    const errBody = await response.text()
    return new Response(
      JSON.stringify({ geminiStatus: response.status, geminiError: errBody }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await response.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    return new Response(
      JSON.stringify({ error: 'Empty AI response', data }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
  // Parse — with truncation recovery.
  // Gemini occasionally truncates mid-object when the response is long.
  // Literal newlines in JSON only appear as structural whitespace (string values
  // use escaped \n), so `},\n` reliably marks the end of a complete tip object.
  let tips
  try {
    tips = JSON.parse(rawText)
  } catch {
    const lastComplete = rawText.lastIndexOf('},\n')
    if (lastComplete >= 0) {
      try {
        tips = JSON.parse(rawText.slice(0, lastComplete + 1) + '\n]')
      } catch {}
    }
  }

  if (!Array.isArray(tips) || tips.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Invalid AI response format', rawText }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(JSON.stringify(tips), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
