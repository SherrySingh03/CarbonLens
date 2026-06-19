# CarbonLens — Design Spec
**Date:** 2026-06-19  
**Project:** PromptWars Virtual: Challenge 3 — Google for Developers x Hack2Skill  
**Status:** Approved

---

## Problem Statement Alignment

| Verb | Feature |
|---|---|
| Understand | Visual dashboard with ScoreRing gauge + category breakdown |
| Track | Daily FootprintLog persistence, heatmap calendar, trend chart |
| Reduce | AI-generated, ranked, actionable tips via Claude API |

---

## Decisions Made

| Question | Decision |
|---|---|
| Geography | India-first (CEA 2023 factors, 125 kg/month benchmark). Disclaimer shown on dashboard and README. |
| Deployment | Vercel from day one. `vercel dev` locally, `vercel --prod` for submission. |
| Test runner | Vitest (native Vite integration, zero config) |
| Daily log entry | Quick Log bottom sheet only. Onboarding runs once. Sheet pre-fills from today's log → most recent log → zeros. |
| State management | Single `AppContext` with flat `useState` slices. Pages never read localStorage directly. |

---

## Architecture

```
Browser (React 18 + Vite + TypeScript)
  └── AppProvider
       ├── AppContext { profile, todayLog, allLogs, tips }
       │    └── write methods → update state + sync localStorage simultaneously
       └── BrowserRouter
            ├── /onboarding  → <Onboarding />          (no Layout, runs once)
            ├── /            → <Dashboard />            (Layout)
            ├── /insights    → <Insights />             (Layout)
            └── /progress    → React.lazy(<Progress />) (Layout + Suspense)

Vercel Edge Function
  └── api/insights.js → validates + sanitises input → calls Anthropic API → returns JSON tips

localStorage keys: cl_profile | cl_logs | cl_tips | cl_committed
sessionStorage key: cl_grid_intensity (live grid factor, one fetch per session)
```

**Redirect guard:** On app load, if `profile === null` → redirect to `/onboarding`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript throughout |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Tests | Vitest |
| AI proxy | Vercel Edge Function (api/insights.js) |
| AI model | claude-sonnet-4-6 |
| Deployment | Vercel |

---

## Folder Structure

```
carbonlens/
├── api/
│   └── insights.js           # Vercel Edge Function — Claude API proxy
├── src/
│   ├── context/
│   │   └── AppContext.tsx     # Single context + provider + useApp() hook
│   ├── components/
│   │   ├── Layout.tsx         # Nav shell (bottom bar mobile / sidebar desktop)
│   │   ├── ScoreRing.tsx      # Circular SVG gauge (role="img", aria-label, hidden title)
│   │   ├── CategoryBar.tsx    # Horizontal emission bar (React.memo)
│   │   ├── InsightCard.tsx    # AI tip card with commit button (React.memo)
│   │   ├── HeatmapCalendar.tsx
│   │   └── ProgressBar.tsx
│   ├── lib/
│   │   ├── emissions.ts       # Pure calculation functions, no side effects
│   │   ├── gridIntensity.ts   # Fetches live IN-SO grid factor, falls back to 0.716
│   │   ├── storage.ts         # localStorage helpers (called only from AppContext)
│   │   └── ai.ts              # Fetch wrapper for /api/insights + tip cache logic
│   ├── pages/
│   │   ├── Onboarding.tsx     # 4-step quiz → calculate → save → redirect /
│   │   ├── Dashboard.tsx      # ScoreRing + CategoryBars + Quick Log FAB
│   │   ├── Insights.tsx       # Tips feed + commit flow
│   │   └── Progress.tsx       # Heatmap + trend chart + goal card (lazy-loaded)
│   ├── types/
│   │   └── index.ts           # All shared TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── emissions.test.ts      # Written BEFORE implementation (TDD red phase)
├── .env.example
├── .gitignore
├── vercel.json
├── tailwind.config.js
└── package.json
```

---

## Data Model (types/index.ts)

```typescript
interface UserProfile {
  name: string;
  createdAt: string;
  monthlyGoalReductionPct: number; // e.g. 10 = 10% reduction goal
}

interface FootprintLog {
  id: string;
  date: string;           // YYYY-MM-DD
  transport: TransportData;
  homeEnergy: HomeEnergyData;
  diet: DietData;
  purchases: PurchasesData;
  totalKgCO2: number;
}

interface TransportData {
  carKm: number;
  carType: 'petrol' | 'diesel' | 'electric' | 'none';
  flightHours: number;
  transitKm: number;
}

interface HomeEnergyData {
  electricityKwh: number;
  gasUnits: number;       // cubic metres
  energySource: 'grid' | 'renewable' | 'mixed';
}

interface DietData {
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  mealCount: number;      // meals per day
}

interface PurchasesData {
  onlineOrdersCount: number;
  newClothingItems: number;
  electronicsItems: number;
}

interface InsightTip {
  id: string;
  category: 'transport' | 'energy' | 'diet' | 'purchases';
  title: string;
  description: string;
  estimatedSavingKgCO2: number;
  difficulty: 'easy' | 'medium' | 'hard';
  committed: boolean;
}
```

---

## AppContext

```typescript
interface AppState {
  profile: UserProfile | null;
  todayLog: FootprintLog | null;
  allLogs: FootprintLog[];
  tips: InsightTip[];
}

interface AppContextValue extends AppState {
  saveProfile(p: UserProfile): void;
  saveDailyLog(log: FootprintLog): void;
  commitTip(tipId: string): void;
  saveInsightTips(tips: InsightTip[]): void;
  clearAllData(): void;
}
```

**Bootstrap:** reads all four localStorage keys synchronously on first render — no loading flash for returning users.

**Write invariant:** every write method updates in-memory state and calls the matching `lib/storage.ts` helper in the same function body. Pages never call storage helpers directly.

---

## Emissions Module

**File:** `lib/emissions.ts` — pure functions, zero imports from React/context/storage.

**Emission factors (CEA India 2023 / DEFRA / IPCC):**
```
car:         petrol 0.192 | diesel 0.171 | electric 0.053  kg CO2/km
flight:      0.255 kg CO2/km (800 km/h assumed)
transit:     0.089 kg CO2/km
electricity: grid 0.716 | renewable 0.041 | mixed 0.400    kg CO2/kWh
gas:         2.04 kg CO2/m³
diet:        meat-heavy 7.19 | average 5.63 | vegetarian 3.81 | vegan 2.89  kg CO2/day
onlineOrder: 0.5 | clothing: 10.0 | electronics: 70.0      kg CO2/unit
```

**Exported functions:**
- `calculateTransportEmissions(data: TransportData): number`
- `calculateEnergyEmissions(data: HomeEnergyData, gridOverride?: number): number`
- `calculateDietEmissions(data: DietData): number` — `FACTORS.diet[dietType] * (mealCount / 3)` where 3 is the reference daily meal baseline
- `calculatePurchasesEmissions(data: PurchasesData): number`
- `calculateTotal(log: Omit<FootprintLog, 'id'|'date'|'totalKgCO2'>): number`
- `getCategoryBreakdown(log: FootprintLog): Record<string, number>`
- `INDIA_AVERAGE_KG_CO2_PER_MONTH = 125`
- `GLOBAL_AVERAGE_KG_CO2_PER_MONTH = 375`

`calculateEnergyEmissions` accepts an optional `gridOverride` (live kg CO2/kWh from Electricity Maps). Falls back to `FACTORS.electricity[data.energySource]` if absent. This is the only function that changes signature for live data.

**15-line function limit enforced.** code-simplifier runs after all tests pass.

---

## Grid Intensity (lib/gridIntensity.ts)

```typescript
export async function fetchGridIntensity(): Promise<number>
```
- Calls Electricity Maps API, zone `IN-SO`
- Auth: `VITE_ELECTRICITY_MAPS_KEY` (read-only public data API — safe to bundle)
- Returns `carbonIntensity` in gCO2/kWh ÷ 1000 = kg CO2/kWh
- On any failure → returns `0.716` (CEA fallback)
- Cached in `sessionStorage['cl_grid_intensity']` — one fetch per session

**Called from `lib/ai.ts`** on init; result passed as `gridOverride` to `calculateEnergyEmissions`.

---

## TDD Order (mandatory)

1. Write all tests in `tests/emissions.test.ts` — run `vitest`, confirm every test **fails**
2. Implement functions one by one until all pass (green)
3. Run code-simplifier — split any function over 15 lines
4. Wire proven functions into AppContext methods

---

## Page Specifications

### Onboarding (4 steps, progress bar at top)
- Step 1 — Transport: car type radio cards, weekly km slider (0–500), flight hours, transit km slider
- Step 2 — Energy: monthly kWh slider (0–600), energy source radio cards, gas units slider (0–50)
- Step 3 — Diet: diet type radio cards, meals/day stepper (1–5)
- Step 4 — Profile: name input, monthly reduction goal slider (5–30%)
- Live CO2 estimate updates as sliders change (debounced 150ms)
- On complete: calculate total, save FootprintLog for today, save profile, redirect to `/`

### Dashboard
- ScoreRing: color <80 = green, 80–150 = amber, >150 = red. Center: "X kg CO2 this month". Below: India avg 125 kg / Global avg 375 kg
- Four CategoryBar components (transport, energy, diet, purchases)
- Quick Log FAB → bottom sheet (pre-fill: today → most recent → zeros)
- Renders from AppContext synchronously — no loading flash

### Insights
- Header: "Your personalised reduction plan" + total potential saving
- Refresh tips button → POST /api/insights → loading skeleton (3 pulse cards) while waiting
- Tips sorted by `estimatedSavingKgCO2` descending
- InsightCard: color-coded left border, title, description (2-line clamp), "Saves ~X kg" badge, difficulty badge, Commit button (toggles to Committed ✓)
- Committed section: collapsed by default, expandable
- Cache: tips keyed by hash of `totalKgCO2` + category breakdown. Re-fetch only if data changed >5% or user clicks Refresh

### Progress (lazy-loaded)
- Goal card: monthly goal, current vs last month, ProgressBar (green/amber/red)
- 12-week heatmap: grey = no log, green gradient by CO2 (lighter = lower). Click → popover with day total
- Recharts LineChart: last 30 days. Dashed horizontal line at monthly average
- Stats row: Days logged | Best day | Total saved vs baseline

---

## Layout & Navigation

- Mobile (<768px): bottom tab bar (Dashboard, Insights, Progress) + central Log FAB
- Desktop (≥768px): left sidebar (64px), icons + labels
- Quick Log sheet lives in Layout.tsx — accessible from all pages

---

## Component Details

| Component | Key behaviour |
|---|---|
| `ScoreRing` | SVG, `role="img"`, `aria-label="Carbon score: X kg CO2 this month"`, hidden `<title>`. Stroke animates on mount (CSS `stroke-dashoffset`, 800ms). |
| `CategoryBar` | `React.memo`. Fill width = `(kg/total)*100%`. |
| `InsightCard` | `React.memo`. Parent owns commit state via `onCommit(id)` prop. |
| `HeatmapCalendar` | Popover state internal. All SVG/canvas elements have `aria-label`. |
| `ProgressBar` | Color logic: ≥goal = green, within 10% = amber, >10% behind = red. |

---

## AI Proxy (api/insights.js — Vercel Edge Function)

- Runtime: `export const config = { runtime: 'edge' }`
- Method guard: non-POST → 405
- Input validation: missing `footprintLog` or `profile` → 400
- Numeric caps: carKm ≤ 5000, flightHours ≤ 500, transitKm ≤ 3000, electricityKwh ≤ 10000, gasUnits ≤ 1000
- String allowlist: `carType`, `energySource`, `dietType` validated against known enum values before interpolation
- Claude call: `claude-sonnet-4-6`, `max_tokens: 1500`, system prompt requests exactly 6 tips as a JSON array
- Response validation: `JSON.parse(tipsJson)` in try/catch → 500 if malformed
- Success response: `Content-Type: application/json`, `Cache-Control: private, max-age=3600`

---

## Security

- `ANTHROPIC_API_KEY` — Vercel env var only, never in `src/`
- `VITE_ELECTRICITY_MAPS_KEY` — safe to bundle (read-only public data)
- `.env` in `.gitignore` from scaffold step
- No `dangerouslySetInnerHTML` anywhere
- AI tip content rendered as React text nodes, never as HTML
- `vercel.json` security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Content-Security-Policy`

---

## Accessibility

- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>` on all pages
- All SVGs: `role="img"` + `aria-label` + hidden `<title>`
- Color never sole indicator — every color state paired with text label
- All interactive elements: keyboard-navigable, `focus-visible:ring-2`
- Minimum contrast 4.5:1
- Onboarding radio cards: proper `<label>` associations + `aria-checked`

---

## Performance

- Slider `onChange` debounced 150ms before recalculating emissions
- `React.memo` on `InsightCard` and `CategoryBar`
- Progress page lazy-loaded (`React.lazy` + `Suspense`, skeleton fallback)
- Dashboard renders from AppContext synchronously — no loading flash
- Tips cached by footprint hash; Edge Function only called on >5% change or manual refresh

---

## Design System

| Token | Value |
|---|---|
| Primary green | `#16a34a` (green-600) |
| Amber warning | `#d97706` (amber-600) |
| Red alert | `#dc2626` (red-600) |
| Background | `#f9fafb` (gray-50) |
| Card background | `#ffffff` |
| Text primary | `#111827` (gray-900) |
| Text secondary | `#6b7280` (gray-500) |
| Card style | `p-6 rounded-2xl shadow-sm border border-gray-100` |
| Motion | `transition-all duration-200` (subtle only) |
| Min viewport | 375px |

Font: system stack. Headings: `font-semibold`. Scores: `font-bold text-4xl`.

---

## Environment Variables

```
# .env.example
ANTHROPIC_API_KEY=your_key_here          # Vercel env var only — never in src/
VITE_ELECTRICITY_MAPS_KEY=your_key_here  # Safe to bundle — read-only public API
```

---

## Build Order

1. Scaffold Vite + React + TypeScript + Tailwind + React Router + Vitest
2. `types/index.ts` — all interfaces
3. `tests/emissions.test.ts` — write tests, confirm they **fail**
4. `lib/emissions.ts` — implement until all tests pass
5. code-simplifier pass on emissions.ts
6. `lib/storage.ts`
7. `lib/gridIntensity.ts`
8. `AppContext.tsx` — wire context methods to proven lib functions
9. `Layout.tsx` + routing skeleton (4 routes with placeholder text)
10. Parallel (compound-engineering): Onboarding | Dashboard+components | Edge Function+ai.ts | Insights+InsightCard
11. `Progress.tsx` + `HeatmapCalendar` + `ProgressBar` (sequential — depends on storage)
12. code-simplifier pass over all pages
13. Security review (focus: Edge Function + all inputs)
14. /code-review — address high-confidence findings
15. Accessibility audit
16. `vercel.json` headers, `.gitignore`, README
17. Deploy to Vercel, verify end-to-end

---

## Disclaimer

> Emission factors are based on Indian grid data (CEA 2023), DEFRA, and IPCC sources.  
> Live grid intensity for zone IN-SO is sourced from Electricity Maps where available.  
> This app is scoped to India — factors may not reflect emissions accurately in other regions.
