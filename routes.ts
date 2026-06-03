import { calculateDistance } from '../utils/math';
import { AIRPORTS } from './airports';

export function getPossibleRoutes() {
    const routes = [];
    for (let i = 0; i < AIRPORTS.length; i++) {
        for (let j = i + 1; j < AIRPORTS.length; j++) {
            const a1 = AIRPORTS[i];
            const a2 = AIRPORTS[j];
            const distance = calculateDistance(a1.lat, a1.lon, a2.lat, a2.lon);
            routes.push({
                id: `${a1.id}-${a2.id}`,
                origin: a1.id,
                originName: a1.name,
                destination: a2.id,
                destinationName: a2.name,
                distance,
                baseDemand: Math.floor((a1.baseDemand + a2.baseDemand) / 2)
            });
        }
    }
    return routes;
}
