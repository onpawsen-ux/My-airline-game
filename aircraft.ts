export interface AircraftModel {
    id: string;
    name: string;
    speed: number;
    range: number;
    capacity: number;
    fuelCostPerKm: number;
    price: number;
    efficiency: number;
}

export const AIRCRAFT_DB = [
    { name: "Cessna 172", speed: 226, range: 1000, pax: 3, fuelPerKm: 4, cost: 51000 },
    { name: "Phenom 100", speed: 722, range: 2182, pax: 4, fuelPerKm: 8, cost: 68000 },
    { name: "EMB 121 Xingu I", speed: 365, range: 2352, pax: 5, fuelPerKm: 8, cost: 85000 },
    { name: "Hondajet", speed: 782, range: 2700, pax: 6, fuelPerKm: 6, cost: 100000 },
    { name: "An-74VIP", speed: 580, range: 3300, pax: 12, fuelPerKm: 8, cost: 100722 },
    { name: "Phenom 300", speed: 834, range: 3334, pax: 6, fuelPerKm: 8, cost: 102000 },
    { name: "Saab 340", speed: 467, range: 1730, pax: 37, fuelPerKm: 15, cost: 109241 },
    { name: "Legacy 450", speed: 845, range: 4260, pax: 7, fuelPerKm: 8, cost: 110501 },
    { name: "Beechcraft 1900D", speed: 480, range: 2776, pax: 19, fuelPerKm: 15, cost: 111024 },
    { name: "Saab 90 Scandia", speed: 450, range: 2510, pax: 32, fuelPerKm: 9, cost: 113217 },
    { name: "ATR 42-500", speed: 556, range: 1611, pax: 50, fuelPerKm: 16, cost: 122750 },
    { name: "ATR 72-600", speed: 562, range: 2800, pax: 74, fuelPerKm: 8, cost: 928466 },
    { name: "DHC-8-Q400", speed: 667, range: 2522, pax: 70, fuelPerKm: 9, cost: 804752 },
    { name: "ERJ 145", speed: 825, range: 2445, pax: 50, fuelPerKm: 7, cost: 442288 },
    { name: "ERJ 190", speed: 845, range: 3334, pax: 110, fuelPerKm: 10, cost: 1853174 },
    { name: "CRJ 200", speed: 810, range: 3500, pax: 50, fuelPerKm: 7, cost: 621621 },
    { name: "CRJ 900", speed: 881, range: 2956, pax: 86, fuelPerKm: 9, cost: 1530636 },
    { name: "B737-800", speed: 780, range: 7000, pax: 184, fuelPerKm: 10, cost: 4407858 },
    { name: "B737 MAX 8", speed: 839, range: 6500, pax: 180, fuelPerKm: 7, cost: 18011300 },
    { name: "A320-200", speed: 823, range: 5700, pax: 164, fuelPerKm: 11, cost: 6770196 },
    { name: "A321-NEO", speed: 850, range: 7250, pax: 189, fuelPerKm: 10, cost: 22760999 },
    { name: "A330-300", speed: 871, range: 10000, pax: 335, fuelPerKm: 18, cost: 43330073 },
    { name: "A350-900", speed: 945, range: 14500, pax: 314, fuelPerKm: 17, cost: 70503048 },
    { name: "B777-300ER", speed: 950, range: 14685, pax: 350, fuelPerKm: 19, cost: 68243786 },
    { name: "B787-9", speed: 903, range: 14500, pax: 290, fuelPerKm: 16, cost: 69997851 },
    { name: "A380-800", speed: 945, range: 14500, pax: 600, fuelPerKm: 21, cost: 215629503 },
    { name: "Concorde", speed: 2124, range: 7500, pax: 120, fuelPerKm: 35, cost: 407808000 },
    { name: "B747-400", speed: 893, range: 14500, pax: 416, fuelPerKm: 21, cost: 92136845, retired: true },
    { name: "DC-10", speed: 908, range: 7000, pax: 260, fuelPerKm: 18, cost: 24840516, retired: true },
    { name: "MD-11", speed: 876, range: 12655, pax: 410, fuelPerKm: 24, cost: 57269139, retired: true }
];

export const AIRCRAFT_MODELS: AircraftModel[] = AIRCRAFT_DB.filter(a => !a.retired).map(a => ({
    id: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: a.name,
    speed: a.speed,
    range: a.range,
    capacity: a.pax,
    fuelCostPerKm: a.fuelPerKm,
    price: a.cost,
    efficiency: a.fuelPerKm > 10 ? 0.3 : (a.fuelPerKm < 8 ? 0.6 : 0.4) // Keeping efficiency prop to bridge older flightSystem
}));
