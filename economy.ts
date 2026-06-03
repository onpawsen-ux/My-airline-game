export function calculateTicketsSold(route: any, airlinePrice: number, allCompetitorsOnRoute: any[], reputation: number) {
    let marketShare = 1;
    if (allCompetitorsOnRoute.length > 0) {
        const avgPrice = allCompetitorsOnRoute.reduce((sum: number, c: any) => sum + c.price, airlinePrice) / (allCompetitorsOnRoute.length + 1);
        
        if (airlinePrice < avgPrice) {
            marketShare += 0.2;
        } else if (airlinePrice > avgPrice) {
            marketShare -= 0.3;
        }
        
        marketShare = Math.max(0.1, marketShare / (allCompetitorsOnRoute.length + 1));
    }
    
    const repBonus = 1 + (reputation / 100);
    const baseStandardPrice = route.distance * 0.20;
    
    let pricePenalty = 1;
    if (airlinePrice > baseStandardPrice * 1.5) {
         pricePenalty = 0.2;
    } else if (airlinePrice > baseStandardPrice * 1.2) {
         pricePenalty = 0.6;
    }
    
    // Multiply baseDemand to scale up passenger numbers for the game 
    const gameScaleDemand = route.baseDemand * 6;
    return gameScaleDemand * marketShare * repBonus * pricePenalty;
}
