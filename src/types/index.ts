export interface UserProfile {
  name: string
  createdAt: string
  monthlyGoalReductionPct: number
}

export interface TransportData {
  carKm: number
  carType: 'petrol' | 'diesel' | 'electric' | 'none'
  flightHours: number
  transitKm: number
}

export interface HomeEnergyData {
  electricityKwh: number
  gasUnits: number
  energySource: 'grid' | 'renewable' | 'mixed'
}

export interface DietData {
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan'
  mealCount: number
}

export interface PurchasesData {
  onlineOrdersCount: number
  newClothingItems: number
  electronicsItems: number
}

export interface FootprintLog {
  id: string
  date: string
  transport: TransportData
  homeEnergy: HomeEnergyData
  diet: DietData
  purchases: PurchasesData
  totalKgCO2: number
}

export interface InsightTip {
  id: string
  category: 'transport' | 'energy' | 'diet' | 'purchases'
  title: string
  description: string
  estimatedSavingKgCO2: number
  difficulty: 'easy' | 'medium' | 'hard'
  committed: boolean   // "will try"
  completed?: boolean  // actually done
  completedAt?: string // ISO date
}
