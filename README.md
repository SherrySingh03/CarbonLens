# CarbonLens

> Understand, track, and reduce your carbon footprint — built for PromptWars Virtual: Challenge 3 (Google for Developers × Hack2Skill)

---

## Problem Statement Alignment

| Verb | Feature |
|---|---|
| **Understand** | Visual ScoreRing gauge with colour-coded impact (green / amber / red) and comparison against India and global averages |
| **Track** | Daily FootprintLog persistence in localStorage, 12-week heatmap calendar, 30-day trend chart |
| **Reduce** | AI-generated, ranked, actionable tips via Claude API — sorted by estimated kg CO₂ saved, with commit tracking |

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
#   ANTHROPIC_API_KEY=sk-ant-...
#   VITE_ELECTRICITY_MAPS_KEY=...  (optional — falls back to CEA 2023 constant)

# 3. Run locally with Vercel dev (required for the AI Edge Function)
npx vercel dev
```

Open http://localhost:3000.

---

## Deployment

```bash
# Set environment variables in Vercel dashboard, then:
vercel --prod
```

The `ANTHROPIC_API_KEY` must be set as a Vercel environment variable — it is never bundled into the frontend.

---

## Architecture

```
Input layer          Engine layer              Output layer
─────────────────    ─────────────────────     ────────────────────────
Onboarding form  →   lib/emissions.ts          Dashboard (ScoreRing,
Quick Log sheet  →   (pure calculations)   →   CategoryBars)

Daily log data   →   AppContext             →   Progress (heatmap,
                     (in-memory + LS sync)      trend chart, goal card)

FootprintLog     →   api/insights.js        →   Insights (AI tips feed,
+ Profile        →   (Vercel Edge Fn)   →       commit tracking)
                     Anthropic Claude API
```

**Key invariants:**
- Pages read state only from `useApp()` hook — never directly from localStorage
- `lib/emissions.ts` is pure functions — no React, no side effects
- `ANTHROPIC_API_KEY` exists only in the Edge Function environment
- AI tips are cached by footprint hash; Edge Function called only on >5% data change or manual refresh

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

React 18 · Vite · TypeScript · Tailwind CSS v3 · React Router v6 · Recharts · Vitest · Vercel Edge Functions · Anthropic Claude (claude-sonnet-4-6)
