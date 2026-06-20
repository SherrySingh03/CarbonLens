# CarbonLens

> Understand, track, and reduce your carbon footprint — built for PromptWars Virtual: Challenge 3 (Google for Developers × Hack2Skill)

---

## Problem Statement Alignment

| Verb | Feature |
|---|---|
| **Understand** | Eco Score ring (0–850) with colour-coded grade and India/global average comparison; tap-to-explain category bars; tangible equivalences card |
| **Track** | Daily FootprintLog persistence in localStorage, 12-week heatmap calendar, 30-day trend chart |
| **Reduce** | AI-generated, ranked, actionable tips via Gemini API — sorted by estimated kg CO₂ saved; committing a tip immediately deducts its saving from your Eco Score |

---

## Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd carbonlens
npm install

# 2. Configure environment
cp .env.example .env
# Add your keys to .env:
#   GEMINI_API_KEY=...
#   ELECTRICITY_MAPS_KEY=...  (optional — falls back to CEA 2023 constant)

# 3. Run locally with Vercel dev (required for the AI Edge Function)
npm run dev:full
```

Open http://localhost:3000.

---

## Deployment

```bash
# Set environment variables in Vercel dashboard, then:
vercel --prod
```

The `GEMINI_API_KEY` must be set as a Vercel environment variable — it is never bundled into the frontend.

---

## Architecture

```
Input layer          Engine layer              Output layer
─────────────────    ─────────────────────     ────────────────────────
Onboarding form  →   lib/emissions.ts          Dashboard (ScoreRing,
Quick Log sheet  →   (pure calculations)   →   CategoryBars)

Daily log data   →   AppContext             →   Progress (heatmap,
                     (in-memory + LS sync)      trend chart, goal card)

FootprintLog     →   api/insights.js        →   Actions (AI tips feed,
+ Profile        →   (Vercel Edge Fn)   →       commit tracking)
                     Google Gemini API
```

**Key invariants:**
- Pages read state only from `useApp()` hook — never directly from localStorage
- `lib/emissions.ts` is pure functions — no React, no side effects
- `GEMINI_API_KEY` exists only in the Edge Function environment
- AI tips are cached by footprint hash with a 1-hour TTL; Edge Function called only on data change or manual refresh

---

## Eco Score

CarbonLens uses a custom **Eco Score** (0–850) instead of raw kg to make progress legible:

```
Score = 850 × (1 − net CO₂ / 350 kg)
```

- **Net CO₂** = monthly log estimate − savings from all committed & completed actions
- **350 kg ceiling** — zero-score baseline (just above global average of 375 kg/mo)
- **0 kg → 850** (Exceptional), **125 kg → 547** (Good, at India avg), **350 kg → 0** (Critical)

Committing to a tip in the Actions tab immediately raises your score. Completing it confirms you did it.

| Grade | Score |
|---|---|
| Exceptional | 750+ |
| Very Good | 600–749 |
| Good | 450–599 |
| Fair | 300–449 |
| Poor | 150–299 |
| Critical | 0–149 |

---

## Emission Factors

| Category | Factor | Source |
|---|---|---|
| Petrol car | 0.192 kg CO₂/km | DEFRA 2023 |
| Diesel car | 0.171 kg CO₂/km | DEFRA 2023 |
| Electric car | 0.053 kg CO₂/km | DEFRA 2023 |
| Flight | 0.255 kg CO₂/km | IPCC |
| Public transit | 0.089 kg CO₂/km | IPCC |
| Grid electricity (India) | 0.716 kg CO₂/kWh | CEA India 2023 |
| Renewable electricity | 0.041 kg CO₂/kWh | IPCC |
| Gas | 2.04 kg CO₂/m³ | DEFRA 2023 |
| Vegan diet | 2.89 kg CO₂/day | Poore & Nemecek, Science 2018 |
| Average diet | 5.63 kg CO₂/day | Poore & Nemecek, Science 2018 |
| Meat-heavy diet | 7.19 kg CO₂/day | Poore & Nemecek, Science 2018 |

Live grid intensity for zone IN-SO sourced from [Electricity Maps](https://www.electricitymaps.com/) where available; falls back to CEA 2023 constant.

> **Disclaimer:** Emission factors are scoped to India. Figures may not accurately reflect emissions in other regions.

---

## India Benchmarks

- **India average:** 125 kg CO₂/month (CEA / MoEFCC estimates)
- **Global average:** 375 kg CO₂/month (IEA 2022)

---

## Future Improvements

1. **Receipt OCR** — photograph grocery or petrol receipts to auto-fill purchase and fuel data
2. **Commute calendar integration** — import Google Calendar to estimate transport automatically
3. **Social challenges** — invite friends, compare weekly footprints, run group reduction challenges
4. **Offset marketplace** — surface verified carbon offset options ranked by cost-per-tonne
5. **Regional factor expansion** — support non-India grid zones using Electricity Maps zone data

---

## Tech Stack

React 18 · Vite · TypeScript · Tailwind CSS v3 · React Router v6 · Recharts · Vitest · Vercel Edge Functions · Google Gemini (gemini-3.5-flash)
