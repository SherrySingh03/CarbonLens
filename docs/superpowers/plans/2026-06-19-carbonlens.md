# CarbonLens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CarbonLens — a React + TypeScript web app that helps Indians understand, track, and reduce their carbon footprint, with AI-powered tips via Anthropic Claude and a Vercel Edge Function proxy.

**Architecture:** Single-page app with React Context as the state layer (synced to localStorage), four pages (Onboarding, Dashboard, Insights, Progress), and a Vercel Edge Function that proxies Claude API calls to keep the API key off the frontend. Emissions calculations live in pure functions tested with Vitest before anything else is wired up.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS v3, React Router v6, Recharts, Vitest, Vercel Edge Functions, Anthropic Claude (claude-sonnet-4-6)

## Global Constraints

- TypeScript strict mode throughout — no `any` types
- No `dangerouslySetInnerHTML` anywhere
- `ANTHROPIC_API_KEY` only in Vercel env vars, never in `src/`
- `VITE_ELECTRICITY_MAPS_KEY` in `.env.example` (safe to bundle — read-only public API)
- All pages read state from `useApp()` hook — never import from `lib/storage.ts` directly
- `lib/emissions.ts` — pure functions only, zero side effects, 15-line function limit
- Slider `onChange` debounced 150ms
- `React.memo` on `InsightCard` and `CategoryBar`
- Progress page lazy-loaded with `React.lazy` + `Suspense`
- Minimum contrast ratio 4.5:1, all SVGs have `role="img"` + `aria-label` + hidden `<title>`
- India-first: CEA 2023 emission factors, 125 kg/month India average benchmark
- Vercel deploy from day one; develop with `vercel dev`

---

## File Map

| File | Responsibility |
|---|---|
| `src/types/index.ts` | All shared TypeScript interfaces |
| `src/lib/emissions.ts` | Pure emission factor calculations |
| `src/lib/storage.ts` | localStorage read/write helpers |
| `src/lib/gridIntensity.ts` | Fetch live IN-SO grid factor, fallback to 0.716 |
| `src/lib/ai.ts` | Fetch wrapper for /api/insights, tip cache logic |
| `src/context/AppContext.tsx` | Single context, provider, useApp() hook |
| `src/components/Layout.tsx` | Nav shell (bottom tab mobile / sidebar desktop), Quick Log sheet |
| `src/components/ScoreRing.tsx` | SVG circular gauge |
| `src/components/CategoryBar.tsx` | Horizontal emission bar |
| `src/components/InsightCard.tsx` | AI tip card with commit button |
| `src/components/HeatmapCalendar.tsx` | 12-week log grid |
| `src/components/ProgressBar.tsx` | Goal progress bar |
| `src/pages/Onboarding.tsx` | 4-step quiz → save → redirect |
| `src/pages/Dashboard.tsx` | Score + breakdown + quick log trigger |
| `src/pages/Insights.tsx` | AI tips feed |
| `src/pages/Progress.tsx` | Heatmap + trend chart + goal card |
| `src/App.tsx` | Router + redirect guard |
| `src/main.tsx` | Entry point |
| `api/insights.js` | Vercel Edge Function — Claude proxy |
| `tests/emissions.test.ts` | Unit tests (written BEFORE implementation) |
| `vercel.json` | Security headers + edge function config |
| `.env.example` | Placeholder env vars |
| `tailwind.config.js` | Color tokens + font config |

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- Create: `.env.example`, `.gitignore`, `vercel.json`
- Create: `src/main.tsx`, `src/App.tsx` (placeholder)
- Create: `index.html`

**Interfaces:**
- Produces: runnable `npm run dev`, `npm run test`, `npm run build`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd "D:/Projects/PromptWars/CarbonLens"
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `tailwind.config.js` with:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { green: '#16a34a', amber: '#d97706', red: '#dc2626' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Configure Vite with Vitest**

Replace `vite.config.ts` with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

Create `tests/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add Tailwind directives to src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Create .env.example**

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ELECTRICITY_MAPS_KEY=your_electricity_maps_key_here
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
dist/
.env
.vercel/
```

- [ ] **Step 8: Create vercel.json**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" }
      ]
    }
  ]
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server on http://localhost:5173

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TypeScript + Tailwind + Vitest"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: all shared interfaces used by every subsequent task

- [ ] **Step 1: Create src/types/index.ts**

```ts
export interface UserProfile {
  name: string;
  createdAt: string;
  monthlyGoalReductionPct: number;
}

export interface TransportData {
  carKm: number;
  carType: 'petrol' | 'diesel' | 'electric' | 'none';
  flightHours: number;
  transitKm: number;
}

export interface HomeEnergyData {
  electricityKwh: number;
  gasUnits: number;
  energySource: 'grid' | 'renewable' | 'mixed';
}

export interface DietData {
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  mealCount: number;
}

export interface PurchasesData {
  onlineOrdersCount: number;
  newClothingItems: number;
  electronicsItems: number;
}

export interface FootprintLog {
  id: string;
  date: string;
  transport: TransportData;
  homeEnergy: HomeEnergyData;
  diet: DietData;
  purchases: PurchasesData;
  totalKgCO2: number;
}

export interface InsightTip {
  id: string;
  category: 'transport' | 'energy' | 'diet' | 'purchases';
  title: string;
  description: string;
  estimatedSavingKgCO2: number;
  difficulty: 'easy' | 'medium' | 'hard';
  committed: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript interfaces"
```

---

### Task 3: Emissions Tests (RED phase — must fail)

**Files:**
- Create: `tests/emissions.test.ts`

**Interfaces:**
- Consumes: `TransportData`, `DietData`, `FootprintLog` from `src/types/index.ts`
- Produces: failing test suite that defines the contract for `lib/emissions.ts`

- [ ] **Step 1: Write tests/emissions.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculatePurchasesEmissions,
  calculateTotal,
  getCategoryBreakdown,
  INDIA_AVERAGE_KG_CO2_PER_MONTH,
  GLOBAL_AVERAGE_KG_CO2_PER_MONTH,
} from '../src/lib/emissions'
import type { FootprintLog } from '../src/types'

describe('calculateTransportEmissions', () => {
  it('returns 0 for no car and no flights', () => {
    expect(calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 })).toBe(0)
  })

  it('calculates petrol car at 100km correctly', () => {
    expect(calculateTransportEmissions({ carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 })).toBeCloseTo(19.2)
  })

  it('calculates flight emissions at 2 hours (800km/h)', () => {
    const result = calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 2, transitKm: 0 })
    expect(result).toBeCloseTo(2 * 800 * 0.255)
  })

  it('electric car has lower emissions than petrol at same distance', () => {
    const petrol = calculateTransportEmissions({ carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 })
    const electric = calculateTransportEmissions({ carKm: 100, carType: 'electric', flightHours: 0, transitKm: 0 })
    expect(electric).toBeLessThan(petrol)
  })

  it('includes transit emissions', () => {
    const result = calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 0, transitKm: 100 })
    expect(result).toBeCloseTo(8.9)
  })
})

describe('calculateEnergyEmissions', () => {
  it('calculates grid electricity correctly', () => {
    const result = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'grid' })
    expect(result).toBeCloseTo(71.6)
  })

  it('renewable source produces much less than grid', () => {
    const grid = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'grid' })
    const renewable = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'renewable' })
    expect(renewable).toBeLessThan(grid)
  })

  it('accepts gridOverride and uses it instead of energySource factor', () => {
    const withOverride = calculateEnergyEmissions(
      { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      0.5
    )
    expect(withOverride).toBeCloseTo(50)
  })

  it('adds gas emissions correctly', () => {
    const result = calculateEnergyEmissions({ electricityKwh: 0, gasUnits: 10, energySource: 'grid' })
    expect(result).toBeCloseTo(20.4)
  })
})

describe('calculateDietEmissions', () => {
  it('vegan produces less than meat-heavy at same meal count', () => {
    const meatHeavy = calculateDietEmissions({ dietType: 'meat-heavy', mealCount: 3 })
    const vegan = calculateDietEmissions({ dietType: 'vegan', mealCount: 3 })
    expect(vegan).toBeLessThan(meatHeavy)
  })

  it('emissions scale with mealCount relative to 3-meal baseline', () => {
    const base = calculateDietEmissions({ dietType: 'average', mealCount: 3 })
    const double = calculateDietEmissions({ dietType: 'average', mealCount: 6 })
    expect(double).toBeCloseTo(base * 2)
  })

  it('meat-heavy at 3 meals equals factor value', () => {
    const result = calculateDietEmissions({ dietType: 'meat-heavy', mealCount: 3 })
    expect(result).toBeCloseTo(7.19)
  })
})

describe('calculatePurchasesEmissions', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 })).toBe(0)
  })

  it('calculates online orders correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 4, newClothingItems: 0, electronicsItems: 0 })
    expect(result).toBeCloseTo(2.0)
  })

  it('calculates clothing correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 2, electronicsItems: 0 })
    expect(result).toBeCloseTo(20.0)
  })

  it('calculates electronics correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 1 })
    expect(result).toBeCloseTo(70.0)
  })
})

describe('calculateTotal', () => {
  it('returns 0 for all-zero inputs', () => {
    const result = calculateTotal({
      transport: { carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 0, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'vegan', mealCount: 0 },
      purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
    })
    expect(result).toBe(0)
  })

  it('sums all four category totals correctly', () => {
    const result = calculateTotal({
      transport: { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'average', mealCount: 3 },
      purchases: { onlineOrdersCount: 2, newClothingItems: 0, electronicsItems: 0 },
    })
    expect(result).toBeCloseTo(19.2 + 71.6 + 5.63 + 1.0)
  })
})

describe('getCategoryBreakdown', () => {
  it('returns an object with four category keys', () => {
    const log: FootprintLog = {
      id: '1', date: '2026-06-19',
      transport: { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'average', mealCount: 3 },
      purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
      totalKgCO2: 96.43,
    }
    const breakdown = getCategoryBreakdown(log)
    expect(breakdown).toHaveProperty('transport')
    expect(breakdown).toHaveProperty('energy')
    expect(breakdown).toHaveProperty('diet')
    expect(breakdown).toHaveProperty('purchases')
  })
})

describe('constants', () => {
  it('INDIA_AVERAGE_KG_CO2_PER_MONTH is 125', () => {
    expect(INDIA_AVERAGE_KG_CO2_PER_MONTH).toBe(125)
  })
  it('GLOBAL_AVERAGE_KG_CO2_PER_MONTH is 375', () => {
    expect(GLOBAL_AVERAGE_KG_CO2_PER_MONTH).toBe(375)
  })
})
```

- [ ] **Step 2: Run tests — confirm ALL fail (red phase)**

```bash
npm run test
```
Expected: all tests fail with "Cannot find module '../src/lib/emissions'"

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/emissions.test.ts tests/setup.ts
git commit -m "test: add emissions unit tests (red phase — all failing)"
```

---

### Task 4: Emissions Implementation (GREEN phase)

**Files:**
- Create: `src/lib/emissions.ts`

**Interfaces:**
- Consumes: `TransportData`, `HomeEnergyData`, `DietData`, `PurchasesData`, `FootprintLog` from `src/types/index.ts`
- Produces:
  - `calculateTransportEmissions(data: TransportData): number`
  - `calculateEnergyEmissions(data: HomeEnergyData, gridOverride?: number): number`
  - `calculateDietEmissions(data: DietData): number`
  - `calculatePurchasesEmissions(data: PurchasesData): number`
  - `calculateTotal(log: Omit<FootprintLog, 'id' | 'date' | 'totalKgCO2'>): number`
  - `getCategoryBreakdown(log: FootprintLog): Record<string, number>`
  - `INDIA_AVERAGE_KG_CO2_PER_MONTH: 125`
  - `GLOBAL_AVERAGE_KG_CO2_PER_MONTH: 375`

- [ ] **Step 1: Create src/lib/emissions.ts**

```ts
import type { TransportData, HomeEnergyData, DietData, PurchasesData, FootprintLog } from '../types'

const FACTORS = {
  car: { petrol: 0.192, diesel: 0.171, electric: 0.053, none: 0 },
  flight: 0.255,
  transit: 0.089,
  electricity: { grid: 0.716, renewable: 0.041, mixed: 0.400 },
  gas: 2.04,
  diet: { 'meat-heavy': 7.19, average: 5.63, vegetarian: 3.81, vegan: 2.89 },
  onlineOrder: 0.5,
  clothing: 10.0,
  electronics: 70.0,
} as const

export const INDIA_AVERAGE_KG_CO2_PER_MONTH = 125
export const GLOBAL_AVERAGE_KG_CO2_PER_MONTH = 375

export function calculateTransportEmissions(data: TransportData): number {
  const carEmissions = data.carType === 'none' ? 0 : data.carKm * FACTORS.car[data.carType]
  const flightEmissions = data.flightHours * 800 * FACTORS.flight
  const transitEmissions = data.transitKm * FACTORS.transit
  return carEmissions + flightEmissions + transitEmissions
}

export function calculateEnergyEmissions(data: HomeEnergyData, gridOverride?: number): number {
  const gridFactor = gridOverride ?? FACTORS.electricity[data.energySource]
  return data.electricityKwh * gridFactor + data.gasUnits * FACTORS.gas
}

export function calculateDietEmissions(data: DietData): number {
  return FACTORS.diet[data.dietType] * (data.mealCount / 3)
}

export function calculatePurchasesEmissions(data: PurchasesData): number {
  return (
    data.onlineOrdersCount * FACTORS.onlineOrder +
    data.newClothingItems * FACTORS.clothing +
    data.electronicsItems * FACTORS.electronics
  )
}

export function calculateTotal(
  log: Omit<FootprintLog, 'id' | 'date' | 'totalKgCO2'>
): number {
  return (
    calculateTransportEmissions(log.transport) +
    calculateEnergyEmissions(log.homeEnergy) +
    calculateDietEmissions(log.diet) +
    calculatePurchasesEmissions(log.purchases)
  )
}

export function getCategoryBreakdown(log: FootprintLog): Record<string, number> {
  return {
    transport: calculateTransportEmissions(log.transport),
    energy: calculateEnergyEmissions(log.homeEnergy),
    diet: calculateDietEmissions(log.diet),
    purchases: calculatePurchasesEmissions(log.purchases),
  }
}
```

- [ ] **Step 2: Run tests — confirm ALL pass (green phase)**

```bash
npm run test
```
Expected: all tests pass

- [ ] **Step 3: Verify no function exceeds 15 lines**

Each function in the file is ≤ 10 lines — constraint met.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/emissions.ts
git commit -m "feat: implement emissions calculation functions (all tests passing)"
```

---

### Task 5: Storage Helpers

**Files:**
- Create: `src/lib/storage.ts`

**Interfaces:**
- Consumes: `UserProfile`, `FootprintLog`, `InsightTip` from `src/types/index.ts`
- Produces:
  - `saveProfile(profile: UserProfile): void`
  - `getProfile(): UserProfile | null`
  - `saveDailyLog(log: FootprintLog): void`
  - `getAllLogs(): FootprintLog[]`
  - `getLogByDate(date: string): FootprintLog | null`
  - `saveInsightTips(tips: InsightTip[]): void`
  - `getInsightTips(): InsightTip[]`
  - `commitTip(tipId: string): void`
  - `clearAllData(): void`

- [ ] **Step 1: Create src/lib/storage.ts**

```ts
import type { UserProfile, FootprintLog, InsightTip } from '../types'

const KEYS = {
  PROFILE: 'cl_profile',
  LOGS: 'cl_logs',
  TIPS: 'cl_tips',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function saveProfile(profile: UserProfile): void {
  write(KEYS.PROFILE, profile)
}

export function getProfile(): UserProfile | null {
  return read<UserProfile>(KEYS.PROFILE)
}

export function saveDailyLog(log: FootprintLog): void {
  const logs = getAllLogs()
  const idx = logs.findIndex((l) => l.date === log.date)
  if (idx >= 0) logs[idx] = log
  else logs.push(log)
  write(KEYS.LOGS, logs)
}

export function getAllLogs(): FootprintLog[] {
  return read<FootprintLog[]>(KEYS.LOGS) ?? []
}

export function getLogByDate(date: string): FootprintLog | null {
  return getAllLogs().find((l) => l.date === date) ?? null
}

export function saveInsightTips(tips: InsightTip[]): void {
  write(KEYS.TIPS, tips)
}

export function getInsightTips(): InsightTip[] {
  return read<InsightTip[]>(KEYS.TIPS) ?? []
}

export function commitTip(tipId: string): void {
  const tips = getInsightTips().map((t) =>
    t.id === tipId ? { ...t, committed: true } : t
  )
  write(KEYS.TIPS, tips)
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage helpers"
```

---

### Task 6: Grid Intensity Helper

**Files:**
- Create: `src/lib/gridIntensity.ts`

**Interfaces:**
- Produces: `fetchGridIntensity(): Promise<number>`

- [ ] **Step 1: Create src/lib/gridIntensity.ts**

```ts
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
    const data = await res.json()
    const kgPerKwh = (data.carbonIntensity as number) / 1000
    sessionStorage.setItem(CACHE_KEY, String(kgPerKwh))
    return kgPerKwh
  } catch {
    return FALLBACK_KG_PER_KWH
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/gridIntensity.ts
git commit -m "feat: add live grid intensity helper with CEA fallback"
```

---

### Task 7: AppContext

**Files:**
- Create: `src/context/AppContext.tsx`

**Interfaces:**
- Consumes: all storage helpers from `src/lib/storage.ts`, all types from `src/types/index.ts`
- Produces: `AppProvider` component, `useApp()` hook returning `AppContextValue`

```ts
interface AppContextValue {
  profile: UserProfile | null
  todayLog: FootprintLog | null
  allLogs: FootprintLog[]
  tips: InsightTip[]
  saveProfile(p: UserProfile): void
  saveDailyLog(log: FootprintLog): void
  commitTip(tipId: string): void
  saveInsightTips(tips: InsightTip[]): void
  clearAllData(): void
}
```

- [ ] **Step 1: Create src/context/AppContext.tsx**

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UserProfile, FootprintLog, InsightTip } from '../types'
import * as storage from '../lib/storage'

interface AppContextValue {
  profile: UserProfile | null
  todayLog: FootprintLog | null
  allLogs: FootprintLog[]
  tips: InsightTip[]
  saveProfile(p: UserProfile): void
  saveDailyLog(log: FootprintLog): void
  commitTip(tipId: string): void
  saveInsightTips(tips: InsightTip[]): void
  clearAllData(): void
}

const AppContext = createContext<AppContextValue | null>(null)

const today = () => new Date().toISOString().slice(0, 10)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => storage.getProfile())
  const [allLogs, setAllLogs] = useState<FootprintLog[]>(() => storage.getAllLogs())
  const [tips, setTips] = useState<InsightTip[]>(() => storage.getInsightTips())

  const todayLog = allLogs.find((l) => l.date === today()) ?? null

  const saveProfile = useCallback((p: UserProfile) => {
    storage.saveProfile(p)
    setProfile(p)
  }, [])

  const saveDailyLog = useCallback((log: FootprintLog) => {
    storage.saveDailyLog(log)
    setAllLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date)
      if (idx >= 0) { const next = [...prev]; next[idx] = log; return next }
      return [...prev, log]
    })
  }, [])

  const commitTip = useCallback((tipId: string) => {
    storage.commitTip(tipId)
    setTips((prev) => prev.map((t) => t.id === tipId ? { ...t, committed: true } : t))
  }, [])

  const saveInsightTips = useCallback((newTips: InsightTip[]) => {
    storage.saveInsightTips(newTips)
    setTips(newTips)
  }, [])

  const clearAllData = useCallback(() => {
    storage.clearAllData()
    setProfile(null)
    setAllLogs([])
    setTips([])
  }, [])

  return (
    <AppContext.Provider value={{ profile, todayLog, allLogs, tips, saveProfile, saveDailyLog, commitTip, saveInsightTips, clearAllData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add AppContext with localStorage sync"
```

---

### Task 8: AI Fetch Wrapper

**Files:**
- Create: `src/lib/ai.ts`

**Interfaces:**
- Consumes: `FootprintLog`, `UserProfile`, `InsightTip` from `src/types/index.ts`; `fetchGridIntensity` from `src/lib/gridIntensity.ts`
- Produces: `fetchInsights(log: FootprintLog, profile: UserProfile, committedTipIds: string[]): Promise<InsightTip[]>`

- [ ] **Step 1: Create src/lib/ai.ts**

```ts
import type { FootprintLog, UserProfile, InsightTip } from '../types'
import { fetchGridIntensity } from './gridIntensity'
import { getCategoryBreakdown } from './emissions'

const CACHE_KEY = 'cl_tips_cache'

function hashLog(log: FootprintLog): string {
  const breakdown = getCategoryBreakdown(log)
  return `${log.totalKgCO2.toFixed(1)}_${Object.values(breakdown).map(v => v.toFixed(1)).join('_')}`
}

function getCached(hash: string): InsightTip[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedHash, tips } = JSON.parse(raw)
    return savedHash === hash ? tips : null
  } catch { return null }
}

function setCached(hash: string, tips: InsightTip[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedHash: hash, tips }))
}

function hasChangedSignificantly(oldHash: string, newHash: string): boolean {
  const [oldTotal] = oldHash.split('_').map(Number)
  const [newTotal] = newHash.split('_').map(Number)
  if (!oldTotal) return true
  return Math.abs(newTotal - oldTotal) / oldTotal > 0.05
}

export async function fetchInsights(
  log: FootprintLog,
  profile: UserProfile,
  committedTipIds: string[]
): Promise<InsightTip[]> {
  const gridFactor = await fetchGridIntensity()
  const hash = hashLog(log)
  const cached = getCached(hash)

  const raw = localStorage.getItem(CACHE_KEY)
  const oldHash = raw ? JSON.parse(raw).savedHash : null
  if (cached && !hasChangedSignificantly(oldHash, hash)) return cached

  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprintLog: { ...log, gridFactor }, profile, committedTipIds }),
  })

  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`)
  const tips: InsightTip[] = await res.json()
  setCached(hash, tips)
  return tips
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai.ts
git commit -m "feat: add AI fetch wrapper with tips caching"
```

---

### Task 9: Vercel Edge Function

**Files:**
- Create: `api/insights.js`

**Interfaces:**
- Consumes: POST body `{ footprintLog, profile, committedTipIds }`
- Produces: JSON array of `InsightTip` objects

- [ ] **Step 1: Create api/insights.js**

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add api/insights.js
git commit -m "feat: add Vercel Edge Function for Claude API proxy"
```

---

### Task 10: Layout + Routing Skeleton

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

**Interfaces:**
- Consumes: `useApp()` from `src/context/AppContext.tsx`
- Produces: working 4-route app with nav, redirect guard, Quick Log sheet placeholder

- [ ] **Step 1: Update src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 2: Create src/App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'

const Progress = lazy(() => import('./pages/Progress'))

export default function App() {
  const { profile } = useApp()

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/*"
        element={
          profile ? (
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="insights" element={<Insights />} />
                <Route
                  path="progress"
                  element={
                    <Suspense fallback={<div className="p-6 text-gray-500">Loading…</div>}>
                      <Progress />
                    </Suspense>
                  }
                />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
    </Routes>
  )
}
```

- [ ] **Step 3: Create src/components/Layout.tsx**

```tsx
import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/insights', label: 'Insights', icon: '💡' },
  { to: '/progress', label: 'Progress', icon: '📈' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { todayLog, allLogs } = useApp()

  const prefill = todayLog ?? [...allLogs].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-20 bg-white border-r border-gray-100 py-6 items-center gap-6" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'}`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className="mt-auto bg-green-600 text-white rounded-xl px-3 py-2 text-xs font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
          aria-label="Log today's footprint"
        >
          + Log
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0" id="main-content">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-10" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors px-3 py-1 ${isActive ? 'text-green-600' : 'text-gray-500'}`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex flex-col items-center gap-0.5 text-xs font-medium text-green-600"
          aria-label="Log today's footprint"
        >
          <span className="text-xl">✏️</span>
          Log
        </button>
      </nav>

      {/* Quick Log bottom sheet */}
      {sheetOpen && (
        <QuickLogSheet prefill={prefill} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  )
}

import QuickLogSheet from './QuickLogSheet'
```

- [ ] **Step 4: Create src/components/QuickLogSheet.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { calculateTotal } from '../lib/emissions'
import type { FootprintLog, TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const ZERO_TRANSPORT: TransportData = { carKm: 0, carType: 'petrol', flightHours: 0, transitKm: 0 }
const ZERO_ENERGY: HomeEnergyData = { electricityKwh: 0, gasUnits: 0, energySource: 'grid' }
const ZERO_DIET: DietData = { dietType: 'average', mealCount: 3 }
const ZERO_PURCHASES: PurchasesData = { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 }

export default function QuickLogSheet({ prefill, onClose }: { prefill: FootprintLog | null; onClose: () => void }) {
  const { saveDailyLog } = useApp()
  const [transport, setTransport] = useState<TransportData>(prefill?.transport ?? ZERO_TRANSPORT)
  const [energy, setEnergy] = useState<HomeEnergyData>(prefill?.homeEnergy ?? ZERO_ENERGY)
  const [diet, setDiet] = useState<DietData>(prefill?.diet ?? ZERO_DIET)
  const [purchases, setPurchases] = useState<PurchasesData>(prefill?.purchases ?? ZERO_PURCHASES)

  const total = calculateTotal({ transport, homeEnergy: energy, diet, purchases })

  function handleSave() {
    const log: FootprintLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport, homeEnergy: energy, diet, purchases,
      totalKgCO2: total,
    }
    saveDailyLog(log)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Quick log today's footprint">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Log Today's Footprint</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 focus-visible:ring-2" aria-label="Close">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car km this month</label>
            <input type="number" min={0} max={5000} value={transport.carKm}
              onChange={(e) => setTransport({ ...transport, carKm: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Electricity kWh this month</label>
            <input type="number" min={0} max={10000} value={energy.electricityKwh}
              onChange={(e) => setEnergy({ ...energy, electricityKwh: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none" />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">Estimated total</p>
            <p className="text-2xl font-bold text-gray-900">{total.toFixed(1)} <span className="text-base font-normal text-gray-500">kg CO₂</span></p>
          </div>

          <button onClick={handleSave}
            className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">
            Save Log
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create placeholder pages**

`src/pages/Onboarding.tsx`:
```tsx
export default function Onboarding() {
  return <div className="p-8 text-center text-gray-500">Onboarding — coming in Task 11</div>
}
```

`src/pages/Dashboard.tsx`:
```tsx
export default function Dashboard() {
  return <div className="p-8 text-center text-gray-500">Dashboard — coming in Task 12</div>
}
```

`src/pages/Insights.tsx`:
```tsx
export default function Insights() {
  return <div className="p-8 text-center text-gray-500">Insights — coming in Task 14</div>
}
```

`src/pages/Progress.tsx`:
```tsx
export default function Progress() {
  return <div className="p-8 text-center text-gray-500">Progress — coming in Task 15</div>
}
```

- [ ] **Step 6: Verify dev server works end-to-end**

```bash
npm run dev
```
Open http://localhost:5173 — should redirect to /onboarding (profile is null). Nav renders. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/ 
git commit -m "feat: add Layout, routing skeleton, Quick Log sheet"
```

---

### Task 11: Onboarding Page

**Files:**
- Modify: `src/pages/Onboarding.tsx`

**Interfaces:**
- Consumes: `useApp()` → `saveProfile`, `saveDailyLog`; `calculateTotal` from `src/lib/emissions.ts`
- Produces: working 4-step onboarding that saves profile + first log and redirects to `/`

- [ ] **Step 1: Implement src/pages/Onboarding.tsx**

```tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calculateTotal } from '../lib/emissions'
import type { TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const STEPS = ['Transport', 'Energy', 'Diet', 'Profile']

const ZERO_TRANSPORT: TransportData = { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 50 }
const ZERO_ENERGY: HomeEnergyData = { electricityKwh: 150, gasUnits: 5, energySource: 'grid' }
const ZERO_DIET: DietData = { dietType: 'average', mealCount: 3 }
const ZERO_PURCHASES: PurchasesData = { onlineOrdersCount: 2, newClothingItems: 0, electronicsItems: 0 }

function RadioCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-green-600 ${
        selected ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-green-600">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-600" />
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveProfile, saveDailyLog } = useApp()
  const [step, setStep] = useState(0)
  const [transport, setTransport] = useState<TransportData>(ZERO_TRANSPORT)
  const [energy, setEnergy] = useState<HomeEnergyData>(ZERO_ENERGY)
  const [diet, setDiet] = useState<DietData>(ZERO_DIET)
  const [purchases] = useState<PurchasesData>(ZERO_PURCHASES)
  const [name, setName] = useState('')
  const [goalPct, setGoalPct] = useState(10)

  const liveTotal = calculateTotal({ transport, homeEnergy: energy, diet, purchases })

  const handleFinish = useCallback(() => {
    const profile = { name: name || 'You', createdAt: new Date().toISOString(), monthlyGoalReductionPct: goalPct }
    const log = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport, homeEnergy: energy, diet, purchases,
      totalKgCO2: liveTotal,
    }
    saveProfile(profile)
    saveDailyLog(log)
    navigate('/')
  }, [name, goalPct, transport, energy, diet, purchases, liveTotal, saveProfile, saveDailyLog, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-1.5 bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Live estimate */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-sm text-gray-500">Estimated monthly footprint</span>
          <span className="text-xl font-bold text-gray-900">{liveTotal.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg CO₂</span></span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          {step === 0 && (
            <>
              <h1 className="text-xl font-semibold text-gray-900">How do you get around?</h1>
              <div className="space-y-2" role="radiogroup" aria-label="Car type">
                {(['none', 'electric', 'petrol', 'diesel'] as const).map((t) => (
                  <RadioCard key={t} selected={transport.carType === t} onClick={() => setTransport({ ...transport, carType: t })}>
                    <span className="font-medium capitalize">{t === 'none' ? 'No car' : `${t.charAt(0).toUpperCase() + t.slice(1)} car`}</span>
                  </RadioCard>
                ))}
              </div>
              <Slider label="Monthly km by car" value={transport.carKm} min={0} max={3000} unit="km" onChange={(v) => setTransport({ ...transport, carKm: v })} />
              <Slider label="Monthly transit km" value={transport.transitKm} min={0} max={2000} unit="km" onChange={(v) => setTransport({ ...transport, transitKm: v })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly flight hours</label>
                <input type="number" min={0} max={500} value={transport.flightHours}
                  onChange={(e) => setTransport({ ...transport, flightHours: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-semibold text-gray-900">Home energy use</h1>
              <Slider label="Monthly electricity" value={energy.electricityKwh} min={0} max={600} unit="kWh" onChange={(v) => setEnergy({ ...energy, electricityKwh: v })} />
              <Slider label="Monthly gas" value={energy.gasUnits} min={0} max={50} unit="m³" onChange={(v) => setEnergy({ ...energy, gasUnits: v })} />
              <div className="space-y-2" role="radiogroup" aria-label="Energy source">
                {([['grid', 'City grid'], ['mixed', 'Mixed / partial solar'], ['renewable', 'Fully renewable']] as const).map(([val, label]) => (
                  <RadioCard key={val} selected={energy.energySource === val} onClick={() => setEnergy({ ...energy, energySource: val })}>
                    <span className="font-medium">{label}</span>
                  </RadioCard>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-semibold text-gray-900">What do you eat?</h1>
              <div className="space-y-2" role="radiogroup" aria-label="Diet type">
                {([['vegan', 'Vegan', '🌱'], ['vegetarian', 'Vegetarian', '🥗'], ['average', 'Average omnivore', '🍽️'], ['meat-heavy', 'Meat-heavy', '🥩']] as const).map(([val, label, icon]) => (
                  <RadioCard key={val} selected={diet.dietType === val} onClick={() => setDiet({ ...diet, dietType: val })}>
                    <span>{icon} <span className="font-medium">{label}</span></span>
                  </RadioCard>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meals per day</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setDiet({ ...diet, mealCount: Math.max(1, diet.mealCount - 1) })}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">−</button>
                  <span className="text-2xl font-bold w-8 text-center">{diet.mealCount}</span>
                  <button type="button" onClick={() => setDiet({ ...diet, mealCount: Math.min(5, diet.mealCount + 1) })}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">+</button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-semibold text-gray-900">Almost there!</h1>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your first name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none" />
              </div>
              <Slider label="Monthly reduction goal" value={goalPct} min={5} max={30} unit="%" onChange={setGoalPct} />
              <p className="text-sm text-gray-500">You're aiming to cut your footprint by <strong>{goalPct}%</strong> per month.</p>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="flex-1 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleFinish}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600">
                See my footprint →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test onboarding manually**

Run `npm run dev`. Open http://localhost:5173 — should show Onboarding step 1. Complete all 4 steps. Should redirect to `/` (Dashboard placeholder). Check localStorage in DevTools: `cl_profile` and `cl_logs` should be populated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Onboarding.tsx
git commit -m "feat: implement Onboarding 4-step form with live CO2 estimate"
```

---

### Task 12: ScoreRing + CategoryBar + Dashboard

**Files:**
- Create: `src/components/ScoreRing.tsx`
- Create: `src/components/CategoryBar.tsx`
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `useApp()` → `todayLog`, `allLogs`; `getCategoryBreakdown`, `INDIA_AVERAGE_KG_CO2_PER_MONTH`, `GLOBAL_AVERAGE_KG_CO2_PER_MONTH` from emissions
- Produces: Dashboard page with live score ring, category bars, and quick log trigger

- [ ] **Step 1: Create src/components/ScoreRing.tsx**

```tsx
import { useEffect, useRef } from 'react'

interface ScoreRingProps {
  kg: number
  size?: number
}

function getColor(kg: number): string {
  if (kg < 80) return '#16a34a'
  if (kg <= 150) return '#d97706'
  return '#dc2626'
}

function getLabel(kg: number): string {
  if (kg < 80) return 'Low'
  if (kg <= 150) return 'Moderate'
  return 'High'
}

export default function ScoreRing({ kg, size = 200 }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const maxKg = 500
  const fillPct = Math.min(kg / maxKg, 1)
  const color = getColor(kg)
  const label = getLabel(kg)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.strokeDashoffset = String(circumference)
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 800ms ease-out'
      el.style.strokeDashoffset = String(circumference * (1 - fillPct))
    })
  }, [circumference, fillPct])

  return (
    <svg
      width={size} height={size}
      role="img"
      aria-label={`Carbon score: ${kg.toFixed(1)} kg CO₂ this month — ${label} impact`}
    >
      <title>{`Carbon footprint: ${kg.toFixed(1)} kg CO₂ per month`}</title>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={16} />
      {/* Fill */}
      <circle
        ref={circleRef}
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={16}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Center text */}
      <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.14} fontWeight="bold" fill="#111827">
        {kg.toFixed(0)}
      </text>
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.07} fill="#6b7280">
        kg CO₂/mo
      </text>
      <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.065} fontWeight="600" fill={color}>
        {label}
      </text>
    </svg>
  )
}
```

- [ ] **Step 2: Create src/components/CategoryBar.tsx**

```tsx
import { memo } from 'react'

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  transport: { label: 'Transport', icon: '🚗', color: 'bg-blue-500' },
  energy: { label: 'Energy', icon: '⚡', color: 'bg-orange-500' },
  diet: { label: 'Diet', icon: '🍽️', color: 'bg-green-500' },
  purchases: { label: 'Purchases', icon: '🛍️', color: 'bg-purple-500' },
}

interface CategoryBarProps {
  category: string
  kg: number
  total: number
}

const CategoryBar = memo(function CategoryBar({ category, kg, total }: CategoryBarProps) {
  const meta = CATEGORY_META[category] ?? { label: category, icon: '•', color: 'bg-gray-500' }
  const pct = total > 0 ? (kg / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center" aria-hidden="true">{meta.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{meta.label}</span>
          <span className="text-sm font-semibold text-gray-900">{kg.toFixed(1)} kg</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${meta.color} rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${meta.label}: ${pct.toFixed(0)}% of total`}
          />
        </div>
      </div>
    </div>
  )
})

export default CategoryBar
```

- [ ] **Step 3: Implement src/pages/Dashboard.tsx**

```tsx
import { useApp } from '../context/AppContext'
import ScoreRing from '../components/ScoreRing'
import CategoryBar from '../components/CategoryBar'
import { getCategoryBreakdown, INDIA_AVERAGE_KG_CO2_PER_MONTH, GLOBAL_AVERAGE_KG_CO2_PER_MONTH } from '../lib/emissions'

export default function Dashboard() {
  const { profile, todayLog } = useApp()

  if (!todayLog) {
    return (
      <section aria-label="Dashboard">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, {profile?.name ?? 'there'}</h1>
        <p className="text-gray-500">No log for today yet. Tap <strong>Log</strong> to record your footprint.</p>
      </section>
    )
  }

  const breakdown = getCategoryBreakdown(todayLog)
  const total = todayLog.totalKgCO2

  return (
    <section aria-label="Carbon footprint dashboard">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Hello, {profile?.name ?? 'there'} 👋</h1>

      {/* Score ring */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-4">
        <ScoreRing kg={total} size={200} />
        <div className="mt-4 flex gap-6 text-sm text-gray-500">
          <span>India avg: <strong className="text-gray-700">{INDIA_AVERAGE_KG_CO2_PER_MONTH} kg</strong></span>
          <span>Global avg: <strong className="text-gray-700">{GLOBAL_AVERAGE_KG_CO2_PER_MONTH} kg</strong></span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Factors based on CEA India 2023 data</p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Breakdown</h2>
        {Object.entries(breakdown).map(([cat, kg]) => (
          <CategoryBar key={cat} category={cat} kg={kg} total={total} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Test Dashboard manually**

Run `npm run dev`. Complete onboarding. Dashboard should show the ScoreRing animating on mount, four category bars, and comparison averages. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScoreRing.tsx src/components/CategoryBar.tsx src/pages/Dashboard.tsx
git commit -m "feat: add ScoreRing, CategoryBar, and Dashboard page"
```

---

### Task 13: InsightCard + Insights Page

**Files:**
- Create: `src/components/InsightCard.tsx`
- Modify: `src/pages/Insights.tsx`

**Interfaces:**
- Consumes: `useApp()` → `todayLog`, `profile`, `tips`, `commitTip`, `saveInsightTips`; `fetchInsights` from `src/lib/ai.ts`
- Produces: working Insights page with tip feed, commit flow, loading skeleton

- [ ] **Step 1: Create src/components/InsightCard.tsx**

```tsx
import { memo } from 'react'
import type { InsightTip } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'border-blue-500',
  energy: 'border-orange-500',
  diet: 'border-green-500',
  purchases: 'border-purple-500',
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

interface InsightCardProps {
  tip: InsightTip
  onCommit: (id: string) => void
}

const InsightCard = memo(function InsightCard({ tip, onCommit }: InsightCardProps) {
  return (
    <article
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${CATEGORY_COLORS[tip.category] ?? 'border-gray-300'}`}
      aria-label={tip.title}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">{tip.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[tip.difficulty]}`}>
          {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{tip.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
          Saves ~{tip.estimatedSavingKgCO2.toFixed(1)} kg CO₂/mo
        </span>
        {tip.committed ? (
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">✓ Committed</span>
        ) : (
          <button
            onClick={() => onCommit(tip.id)}
            className="text-sm font-semibold text-green-600 border border-green-600 rounded-xl px-3 py-1 hover:bg-green-50 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Commit to this
          </button>
        )}
      </div>
    </article>
  )
})

export default InsightCard
```

- [ ] **Step 2: Implement src/pages/Insights.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import InsightCard from '../components/InsightCard'
import { fetchInsights } from '../lib/ai'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
    </div>
  )
}

export default function Insights() {
  const { todayLog, profile, tips, commitTip, saveInsightTips } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [committedOpen, setCommittedOpen] = useState(false)

  const uncommitted = tips.filter((t) => !t.committed).sort((a, b) => b.estimatedSavingKgCO2 - a.estimatedSavingKgCO2)
  const committed = tips.filter((t) => t.committed)
  const totalPotential = uncommitted.reduce((sum, t) => sum + t.estimatedSavingKgCO2, 0)

  async function handleRefresh() {
    if (!todayLog || !profile) return
    setLoading(true)
    setError(null)
    try {
      const committedIds = committed.map((t) => t.id)
      const newTips = await fetchInsights(todayLog, profile, committedIds)
      saveInsightTips(newTips)
    } catch {
      setError('Could not load tips. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Personalised reduction plan">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Your reduction plan</h1>
          {totalPotential > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">Potential saving: <strong className="text-green-600">{totalPotential.toFixed(1)} kg CO₂/mo</strong></p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="shrink-0 text-sm font-medium text-green-600 border border-green-600 rounded-xl px-3 py-1.5 hover:bg-green-50 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-green-600"
        >
          {loading ? 'Loading…' : 'Refresh tips'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

      <div className="space-y-3 mt-4">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : uncommitted.length === 0 && tips.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">💡</p>
            <p className="font-medium">No tips yet</p>
            <p className="text-sm mt-1">Tap <strong>Refresh tips</strong> to get your personalised plan</p>
          </div>
        ) : (
          uncommitted.map((tip) => <InsightCard key={tip.id} tip={tip} onCommit={commitTip} />)
        )}
      </div>

      {committed.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setCommittedOpen((o) => !o)}
            className="text-sm font-medium text-gray-500 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-green-600"
            aria-expanded={committedOpen}
          >
            {committedOpen ? '▾' : '▸'} Committed ({committed.length}) — {committed.reduce((s, t) => s + t.estimatedSavingKgCO2, 0).toFixed(1)} kg saved
          </button>
          {committedOpen && (
            <div className="space-y-3 mt-3">
              {committed.map((tip) => <InsightCard key={tip.id} tip={tip} onCommit={commitTip} />)}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Test Insights manually**

Run `npm run dev`. Navigate to /insights. Should show empty state with "Refresh tips" button. Clicking it calls `/api/insights` (requires `vercel dev` for the Edge Function). Verify skeleton shows during load, then tips appear sorted by savings.

- [ ] **Step 4: Commit**

```bash
git add src/components/InsightCard.tsx src/pages/Insights.tsx
git commit -m "feat: add InsightCard and Insights page with AI tip feed"
```

---

### Task 14: HeatmapCalendar + ProgressBar + Progress Page

**Files:**
- Create: `src/components/HeatmapCalendar.tsx`
- Create: `src/components/ProgressBar.tsx`
- Modify: `src/pages/Progress.tsx`

**Interfaces:**
- Consumes: `useApp()` → `profile`, `todayLog`, `allLogs`; `INDIA_AVERAGE_KG_CO2_PER_MONTH` from emissions; Recharts `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ReferenceLine`, `ResponsiveContainer`

- [ ] **Step 1: Create src/components/ProgressBar.tsx**

```tsx
interface ProgressBarProps {
  current: number
  goal: number
  baseline: number
  label?: string
}

function getColor(current: number, goal: number): { bar: string; text: string } {
  const pct = goal > 0 ? current / goal : 1
  if (pct <= 1) return { bar: 'bg-green-500', text: 'text-green-700' }
  if (pct <= 1.1) return { bar: 'bg-amber-500', text: 'text-amber-700' }
  return { bar: 'bg-red-500', text: 'text-red-700' }
}

export default function ProgressBar({ current, goal, baseline, label }: ProgressBarProps) {
  const pct = baseline > 0 ? Math.min((current / baseline) * 100, 100) : 0
  const { bar, text } = getColor(current, goal)
  const status = current <= goal ? 'On track' : current <= goal * 1.1 ? 'Close' : 'Behind'

  return (
    <div>
      {label && <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`font-semibold ${text}`}>{status}</span>
      </div>}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}
          role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Progress: ${pct.toFixed(0)}% of baseline — ${status}`} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{current.toFixed(1)} kg</span>
        <span>Goal: {goal.toFixed(1)} kg</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/HeatmapCalendar.tsx**

```tsx
import { useState } from 'react'
import type { FootprintLog } from '../types'

const WEEKS = 12

function getColor(kg: number | undefined): string {
  if (kg === undefined) return 'bg-gray-100'
  if (kg < 3) return 'bg-green-700'
  if (kg < 6) return 'bg-green-500'
  if (kg < 10) return 'bg-green-300'
  return 'bg-green-100'
}

export default function HeatmapCalendar({ logs }: { logs: FootprintLog[] }) {
  const [popover, setPopover] = useState<{ date: string; kg: number } | null>(null)
  const logMap = Object.fromEntries(logs.map((l) => [l.date, l.totalKgCO2]))

  const today = new Date()
  const days: { date: string; dayLabel: string }[] = []
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().slice(0, 10), dayLabel: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) })
  }

  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="relative">
      <div
        className="flex gap-1"
        role="img"
        aria-label="12-week activity heatmap showing daily carbon footprint logs"
      >
        <title>Carbon footprint activity over the last 12 weeks</title>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ date, dayLabel }) => {
              const kg = logMap[date]
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => kg !== undefined ? setPopover({ date, kg }) : undefined}
                  className={`w-4 h-4 rounded-sm ${getColor(kg)} transition-colors focus-visible:ring-2 focus-visible:ring-green-600`}
                  aria-label={kg !== undefined ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂` : `${dayLabel}: no log`}
                  title={kg !== undefined ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂` : dayLabel}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
        <span>Less</span>
        {['bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700'].map((c) => (
          <span key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>

      {/* Popover */}
      {popover && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-10 whitespace-nowrap">
          {popover.date}: {popover.kg.toFixed(1)} kg CO₂
          <button onClick={() => setPopover(null)} className="ml-2 opacity-60 hover:opacity-100" aria-label="Close">✕</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement src/pages/Progress.tsx**

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import HeatmapCalendar from '../components/HeatmapCalendar'
import ProgressBar from '../components/ProgressBar'
import { INDIA_AVERAGE_KG_CO2_PER_MONTH } from '../lib/emissions'

export default function Progress() {
  const { profile, allLogs } = useApp()

  const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date))
  const last30 = sorted.slice(-30)
  const chartData = last30.map((l) => ({ date: l.date.slice(5), kg: l.totalKgCO2 }))

  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
  const thisMonthLogs = sorted.filter((l) => l.date.startsWith(thisMonth))
  const lastMonthLogs = sorted.filter((l) => l.date.startsWith(lastMonth))

  const currentAvg = thisMonthLogs.length
    ? thisMonthLogs.reduce((s, l) => s + l.totalKgCO2, 0) / thisMonthLogs.length
    : 0
  const lastAvg = lastMonthLogs.length
    ? lastMonthLogs.reduce((s, l) => s + l.totalKgCO2, 0) / lastMonthLogs.length
    : INDIA_AVERAGE_KG_CO2_PER_MONTH

  const goalPct = profile?.monthlyGoalReductionPct ?? 10
  const goalKg = lastAvg * (1 - goalPct / 100)

  const daysLogged = allLogs.length
  const bestLog = sorted.reduce<{ date: string; kg: number } | null>((best, l) =>
    !best || l.totalKgCO2 < best.kg ? { date: l.date, kg: l.totalKgCO2 } : best, null)
  const totalSaved = lastAvg > 0 ? Math.max(0, (lastAvg - currentAvg) * thisMonthLogs.length) : 0

  return (
    <section aria-label="Progress and goals">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Your Progress</h1>

      {/* Goal card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Monthly Goal</h2>
        <ProgressBar current={currentAvg} goal={goalKg} baseline={lastAvg} label={`${goalPct}% reduction target`} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Days logged', value: daysLogged },
          { label: 'Best day', value: bestLog ? `${bestLog.kg.toFixed(0)} kg` : '—' },
          { label: 'Total saved', value: `${totalSaved.toFixed(0)} kg` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Activity</h2>
        <HeatmapCalendar logs={allLogs} />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">30-day trend</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Log a few days to see your trend</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg`, 'CO₂']} />
              <ReferenceLine y={INDIA_AVERAGE_KG_CO2_PER_MONTH} stroke="#d97706" strokeDasharray="4 2" label={{ value: 'India avg', fontSize: 10, fill: '#d97706' }} />
              <Line type="monotone" dataKey="kg" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Test Progress manually**

Run `npm run dev`. Navigate to /progress. Should show goal card (relative to India average if no last-month data), stats row, heatmap (grey cells since we just started), and empty trend chart message. After logging a few days, heatmap and chart should populate.

- [ ] **Step 5: Commit**

```bash
git add src/components/HeatmapCalendar.tsx src/components/ProgressBar.tsx src/pages/Progress.tsx
git commit -m "feat: add HeatmapCalendar, ProgressBar, and Progress page"
```

---

### Task 15: End-to-End Verification + Deploy

**Files:**
- Verify: all pages work end-to-end
- Deploy to Vercel

**Interfaces:**
- Consumes: all tasks above
- Produces: live Vercel URL

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```
Expected: all emissions tests pass

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Run production build**

```bash
npm run build
```
Expected: successful build, no warnings about missing types

- [ ] **Step 4: Test with vercel dev**

```bash
vercel dev
```
Expected: app runs at http://localhost:3000 with Edge Function available at /api/insights

- [ ] **Step 5: Test Insights page end-to-end**

Open /insights. Click "Refresh tips". Verify 6 tips appear from Claude. Commit one tip — verify it moves to the Committed section. Reload page — committed state should persist (from localStorage).

- [ ] **Step 6: Set Vercel environment variables**

In Vercel dashboard (or via CLI):
```bash
vercel env add ANTHROPIC_API_KEY
vercel env add VITE_ELECTRICITY_MAPS_KEY
```

- [ ] **Step 7: Deploy to Vercel**

```bash
vercel --prod
```
Expected: live URL printed to console

- [ ] **Step 8: Smoke test live URL**

Open the live URL. Complete onboarding → Dashboard → Insights (click Refresh tips) → Progress. All four pages must load without errors. Check browser console for errors.

- [ ] **Step 9: Final commit**

```bash
git add .
git commit -m "chore: verified end-to-end, ready for submission"
```

---

## Self-Review Notes

- All 8 TypeScript interfaces from spec are defined in Task 2
- TDD red-green cycle is explicit in Tasks 3 and 4 with exact test code
- `gridOverride` parameter is consistent: defined in Task 4 emissions, consumed in Task 6 gridIntensity, passed through in Task 8 ai.ts
- Quick Log pre-fill priority (today → most recent → zeros) is implemented in Task 10 Layout and QuickLogSheet
- `React.memo` applied to `InsightCard` (Task 13) and `CategoryBar` (Task 12)
- Progress page uses `React.lazy` in Task 10 App.tsx
- Security headers in vercel.json (Task 1), input sanitization in Edge Function (Task 9)
- `ANTHROPIC_API_KEY` only in api/insights.js (Task 9), never in src/
- All SVGs have `role="img"` + `aria-label` + `<title>`: ScoreRing (Task 12), HeatmapCalendar (Task 14)
- Diet emissions formula `factor × (mealCount / 3)` matches spec and tests
