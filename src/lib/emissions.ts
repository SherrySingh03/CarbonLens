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
  const car = data.carType === 'none' ? 0 : data.carKm * FACTORS.car[data.carType]
  const flight = data.flightHours * 800 * FACTORS.flight
  const transit = data.transitKm * FACTORS.transit
  return car + flight + transit
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
