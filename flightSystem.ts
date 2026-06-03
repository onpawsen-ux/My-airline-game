// =========================
// AIRLINE FLIGHT SYSTEM
// =========================

export function calculateFlightTime(distance: number, speed: number) {
  return distance / speed;
}

export function calculateFuel(distance: number, fuelPerKm: number) {
  return distance * fuelPerKm;
}

export function calculateCO2(fuel: number) {
  return fuel * 3.16;
}

export function generateFuelPrice() {
  const random = Math.random(); 
  return 0.5 + (1.5 * random); // Adjusted for real world scale of lbs per km
}

export let currentFuelPrice = generateFuelPrice();

export function updateFuelPrice() {
  currentFuelPrice = generateFuelPrice();
}

export function calculateFlightCost(distance: number, fuelPerKm: number, pollutionPenalty = 10) {
  const fuel = calculateFuel(distance, fuelPerKm);
  const co2 = calculateCO2(fuel);

  const fuelCost = fuel * currentFuelPrice;
  const co2Cost = co2 * pollutionPenalty;

  return {
    fuel,
    co2,
    fuelCost,
    co2Cost,
    totalCost: fuelCost + co2Cost
  };
}

export function simulateFlight({ distance, speed, fuelPerKm }: {distance: number, speed: number, fuelPerKm: number}) {
  const time = calculateFlightTime(distance, speed);
  const costData = calculateFlightCost(distance, fuelPerKm);

  return {
    timeHours: time,
    ...costData
  };
}
