import { AIRCRAFT_MODELS } from './aircraft';
import { getPossibleRoutes } from './routes';
import { calculateTicketsSold } from './economy';
import { randomInt, randomChoice } from '../utils/random';
import { simulateFlight, updateFuelPrice, currentFuelPrice } from './flightSystem';
import { formatMoney } from '../utils/math';

const TICK_RATE = 1000; // 1 real second
const GAME_SPEED = 1/60; // 1/60th of a minute per real second (so 1 real second = 1 real second in game flight duration)

export class GameManager {
    subscribers: any[];
    allRoutes: any[];
    logs: any[];
    state: any;
    tickCount: number;
    interval: any;

    constructor() {
        this.subscribers = [];
        this.allRoutes = getPossibleRoutes();
        this.logs = [];
        this.tickCount = 0;
        this.interval = null;
        this.state = this.loadState() || this.initialState();
    }

    initialState() {
        return {
            player: {
                id: 'player',
                name: 'My Airline',
                money: 4000000,
                reputation: 50,
                fleet: [],
                routes: [],
                totalCO2: 0, // Track total pollution
                fuelInventory: 0,
                co2Quota: 0,
                hubs: ['LAX'],
                campaigns: []
            },
            aiAirlines: [
                { id: 'ai1', name: 'Global Air', money: 20000000, reputation: 65, fleet: [], routes: [], totalCO2: 0, hubs: ['JFK'] },
                { id: 'ai2', name: 'Budget Fly', money: 8000000, reputation: 45, fleet: [], routes: [], totalCO2: 0, hubs: ['FRA'] },
                { id: 'ai3', name: 'TransContinental', money: 12000000, reputation: 55, fleet: [], routes: [], totalCO2: 0, hubs: ['PEK'] }
            ],
            activeFlights: [],
            fuelPrice: currentFuelPrice,
            settings: {
                insuranceWaiver: 1000000
            }
        };
    }

    log(message: string) {
        this.logs.unshift({ id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), message });
        if (this.logs.length > 50) this.logs.pop();
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => this.tick(), TICK_RATE);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }

    startPRCampaign(durationHours: number) {
        const cost = durationHours * 1500000; // expensive PR campaign
        if (this.state.player.money >= cost) {
            this.state.player.money -= cost;
            this.state.player.campaigns.push({
                id: `PR_${Date.now()}`,
                type: 'pr',
                endsAtCount: this.tickCount + (durationHours * 3600) // seconds
            });
            this.log(`Started a PR campaign for ${durationHours} hour(s) (${formatMoney(cost)}).`);
            this.notify();
            return true;
        }
        return false;
    }

    startCampaign(routeId: string, durationMinutes: number) {
        if (this.state.player.money >= 100000) {
            this.state.player.money -= 100000;
            this.state.player.campaigns.push({
                id: `CAMP_${Date.now()}`,
                type: 'route',
                routeId,
                endsAtCount: this.tickCount + (durationMinutes * 60) // 1 minute = 60 ticks
            });
            this.log(`Started a marketing campaign on route ${routeId} for $100,000.`);
            this.notify();
            return true;
        }
        return false;
    }

    subscribe(callback: any) {
        this.subscribers.push(callback);
        this.notifySingle(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notifySingle(cb: any) {
        const stateCopy = structuredClone(this.state);
        cb(stateCopy, [...this.logs], this.allRoutes, this.tickCount);
    }

    notify() {
        const stateCopy = structuredClone(this.state);
        this.subscribers.forEach(cb => cb(stateCopy, [...this.logs], this.allRoutes, this.tickCount));
    }

    saveState() {
        localStorage.setItem('airlineGameSave', JSON.stringify(this.state));
    }

    loadState() {
        const saved = localStorage.getItem('airlineGameSave');
        if (!saved) return null;
        const state = JSON.parse(saved);
        if (!state.player.campaigns) state.player.campaigns = [];
        if (!state.player.hubs) state.player.hubs = [];
        if (!state.settings) state.settings = { crashWaiverCost: 1000000 };
        if (state.player.fuelInventory === undefined) state.player.fuelInventory = 0;
        if (state.player.co2Quota === undefined) state.player.co2Quota = 0;
        if (state.player.totalCO2 === undefined) state.player.totalCO2 = 0;
        
        state.aiAirlines.forEach((ai: any) => {
             if (!ai.hubs) ai.hubs = ['JFK']; // fallback
             if (ai.totalCO2 === undefined) ai.totalCO2 = 0;
        });
        return state;
    }
    
    setInitialHub(airportId: string) {
        if (!this.state.player.hubs.includes(airportId)) {
             this.state.player.hubs.push(airportId);
             this.log(`Started airline operations at ${airportId}`);
             this.notify();
        }
    }

    setSettings(newSettings: any) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.notify();
    }

    reset() {
        localStorage.removeItem('airlineGameSave');
        this.state = this.initialState();
        this.logs = [];
        this.saveState();
        this.notify();
    }

    tick() {
        this.tickCount++;
        
        // update fuel price every 120 ticks (120 seconds = 2 mins)
        if (this.tickCount % 120 === 0) {
            updateFuelPrice();
            this.state.fuelPrice = currentFuelPrice;
        }

        // Cleanup expired campaigns
        this.state.player.campaigns = this.state.player.campaigns.filter((c:any) => this.tickCount < c.endsAtCount);

        // Apply PR Campaign effect
        const activePRs = this.state.player.campaigns.filter((c:any) => c.type === 'pr');
        if (activePRs.length > 0) {
            this.state.player.reputation += 0.005 * activePRs.length; // +0.3 reputation per real minute per campaign
            if (this.state.player.reputation > 100) this.state.player.reputation = 100;
        }

        this.processFlights();
        this.processAI();
        this.processDepartures();
        
        if (this.tickCount % 5 === 0) {
            this.saveState();
        }
        
        this.notify();
    }
    
    buyAircraft(airlineId: string, modelId: string) {
        const model = AIRCRAFT_MODELS.find(m => m.id === modelId);
        if (!model) return false;
        
        const airline = airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === airlineId);
        
        if (airline.money >= model.price) {
            airline.money -= model.price;
            const newAircraft = {
                id: `${modelId}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                modelId,
                name: `${model.name} ${airline.fleet.length + 1}`,
                state: 'idle',
                location: airline.hubs[0]
            };
            airline.fleet.push(newAircraft);
            if (airlineId === 'player') this.log(`You bought a new ${model.name} for $${model.price.toLocaleString()}.`);
            this.notify();
            return true;
        }
        return false;
    }
    
    openRoute(airlineId: string, routeId: string, price: number) {
        const airline = airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === airlineId);
        if (!airline.routes.find((r:any) => r.routeId === routeId)) {
            airline.routes.push({ routeId, price, assignedAircraftIds: [] });
            if (airlineId === 'player') this.log(`Opened new route: ${routeId} at $${price}`);
            this.notify();
        }
    }
    
    closeRoute(airlineId: string, routeId: string) {
         const airline = airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === airlineId);
         airline.routes = airline.routes.filter((r:any) => r.routeId !== routeId);
         this.notify();
    }
    
    assignAircraftToRoute(airlineId: string, aircraftId: string, routeId: string | null) {
        const airline = airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === airlineId);
        
        airline.routes.forEach((r:any) => {
             r.assignedAircraftIds = r.assignedAircraftIds.filter((id:any) => id !== aircraftId);
        });
        
        if (routeId) {
            const route = airline.routes.find((r:any) => r.routeId === routeId);
            if (route) {
                route.assignedAircraftIds.push(aircraftId);
            }
        }
        
        if (airlineId === 'player') {
            const aircraft = airline.fleet.find((a:any) => a.id === aircraftId);
            if (aircraft && aircraft.state !== 'flying') {
                aircraft.state = routeId ? 'assigned' : 'idle';
            }
        }

        this.notify();
    }

    buyFuel(amount: number) {
        const cost = amount * this.state.fuelPrice;
        if (this.state.player.money >= cost) {
            this.state.player.money -= cost;
            this.state.player.fuelInventory += amount;
            this.log(`Bought ${amount.toLocaleString()} units of fuel for $${cost.toLocaleString()}`);
            this.notify();
            return true;
        }
        return false;
    }

    buyCO2Quota(amount: number) {
        // Base CO2 penalty is 10 per unit, let's say market price fluctuates around 10
        const pricePerUnit = 10; 
        const cost = amount * pricePerUnit;
        if (this.state.player.money >= cost) {
            this.state.player.money -= cost;
            this.state.player.co2Quota += amount;
            this.log(`Bought ${amount.toLocaleString()} CO2 Quota for $${cost.toLocaleString()}`);
            this.notify();
            return true;
        }
        return false;
    }

    sellAircraft(airlineId: string, aircraftId: string, sellPrice: number) {
        const airline = airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === airlineId);
        const aircraftIndex = airline.fleet.findIndex((a:any) => a.id === aircraftId);
        if (aircraftIndex !== -1) {
            const aircraft = airline.fleet[aircraftIndex];
            if (aircraft.state === 'flying') return false; // Can't sell while flying
            
            // Unassign from routes
            airline.routes.forEach((r:any) => {
                 r.assignedAircraftIds = r.assignedAircraftIds.filter((id:any) => id !== aircraftId);
            });
            
            airline.fleet.splice(aircraftIndex, 1);
            airline.money += sellPrice;
            if (airlineId === 'player') this.log(`Sold aircraft ${aircraft.name} for $${sellPrice.toLocaleString()}`);
            this.notify();
            return true;
        }
        return false;
    }

    dispatchFlight(routeId: string, aircraftId: string, ignoreFuelWarning: boolean = false) {
        const airline = this.state.player;
        const routeConfig = airline.routes.find((r:any) => r.routeId === routeId);
        if (!routeConfig) return { success: false, reason: 'Route not found' };

        const aircraft = airline.fleet.find((a:any) => a.id === aircraftId);
        if (!aircraft || aircraft.state === 'flying') return { success: false, reason: 'Aircraft not available' };

        const routeDef = this.allRoutes.find((r:any) => r.id === routeId);
        const acModel = AIRCRAFT_MODELS.find(m => m.id === aircraft.modelId);
        if (!acModel) return { success: false, reason: 'Invalid aircraft model' };

        let destination = routeDef.destination;
        if (aircraft.location === routeDef.destination) {
            destination = routeDef.origin;
        } else if (aircraft.location !== routeDef.origin) {
            return { success: false, reason: `Aircraft is at ${aircraft.location}, not at route origin or destination.` };
        }

        const flightData = simulateFlight({ distance: routeDef.distance, speed: acModel.speed, fuelPerKm: acModel.fuelCostPerKm });
        const requiredFuel = flightData.fuel;

        if (airline.fuelInventory < requiredFuel) {
            if (!ignoreFuelWarning) {
                return { 
                    success: false, 
                    reason: 'insufficient_fuel', 
                    requiredFuel, 
                    availableFuel: airline.fuelInventory,
                    fuelPrice: this.state.fuelPrice
                };
            } else {
                // The plane CRASHES due to taking off without enough fuel.
                const waiverCost = this.state.settings?.insuranceWaiver || 1000000;
                const actualPassengers = acModel.capacity; // Assuming it was full for maximum tragic impact
                const crashCost = waiverCost * actualPassengers;
                
                airline.money -= crashCost;
                airline.reputation -= 50; 
                if (airline.reputation < 0) airline.reputation = 0;
                airline.fuelInventory = 0; 
                
                // Destroy aircraft & un-assign
                airline.fleet = airline.fleet.filter((a:any) => a.id !== aircraftId);
                airline.routes.forEach((r:any) => {
                    r.assignedAircraftIds = r.assignedAircraftIds.filter((id:any) => id !== aircraftId);
                });
                
                this.log(`CRASH! Due to fuel starvation, ${aircraft.name} crashed. Paid $${crashCost.toLocaleString()} in life insurance waivers.`);
                this.notify();
                return { success: false, reason: 'crashed' };
            }
        }

        airline.fuelInventory -= requiredFuel;

        if (airline.co2Quota < flightData.co2) {
            // Un-paid CO2 results in massive reputation hit to simulate taxes/fines
            airline.reputation -= (flightData.co2 / 50);
            this.log(`Flight departed without CO2 Quota. Severe reputation penalty!`);
        } else {
            airline.co2Quota -= flightData.co2;
        }

        const competitors = this.state.aiAirlines
            .filter((a:any) => a.routes.find((r:any) => r.routeId === routeDef.id))
            .map((a:any) => {
                const r = a.routes.find((rt:any) => rt.routeId === routeDef.id);
                return { id: a.id, price: r.price, reputation: a.reputation };
            });
            
        const potentialPassengers = calculateTicketsSold(routeDef, routeConfig.price, competitors, airline.reputation);
        
        let campaignMultiplier = 1;
        if (airline.campaigns && airline.campaigns.find((c:any) => c.routeId === routeId)) {
             campaignMultiplier = 1.5; // 50% boost from campaign
        }
        
        let actualPassengers = Math.floor(potentialPassengers * campaignMultiplier + (randomInt(-10, 10)));
        if (actualPassengers < 0) actualPassengers = 0;
        if (actualPassengers > acModel.capacity) actualPassengers = acModel.capacity;
        
        const revenue = actualPassengers * routeConfig.price;
        // Total cost here is maintenance
        const costToDeduct = flightData.fuelCost * 0.1; 
        
        airline.totalCO2 = (airline.totalCO2 || 0) + flightData.co2;
        
        airline.money -= costToDeduct;
        
        aircraft.state = 'flying';
        this.state.activeFlights.push({
            id: `FL_${Date.now()}_${Math.random()}`,
            airlineId: airline.id,
            routeId: routeDef.id,
            aircraftId: aircraft.id,
            targetDest: destination,
            progress: 0,
            duration: flightData.timeHours * 60,
            passengers: actualPassengers,
            revenue,
            cost: costToDeduct,
            co2: flightData.co2,
            status: 'inflight'
        });

        this.log(`Flight dispatched to ${destination}. Fuel used: ${requiredFuel.toFixed(0)}, Pass: ${actualPassengers}`);
        this.notify();
        return { success: true };
    }

    processFlights() {
        for (let i = this.state.activeFlights.length - 1; i >= 0; i--) {
            const flight = this.state.activeFlights[i];
            flight.progress += GAME_SPEED; 

            const airline = flight.airlineId === 'player' ? this.state.player : this.state.aiAirlines.find((a:any) => a.id === flight.airlineId);
            const aircraft = airline?.fleet.find((a:any) => a.id === flight.aircraftId);

            // Crash probability
            if (airline && aircraft && Math.random() < 0.00005) {
                 const waiverCost = this.state.settings?.crashWaiverCost || 1000000;
                 const totalPayout = waiverCost * flight.passengers;
                 airline.money -= totalPayout;
                 airline.reputation -= 20; 
                 if (airline.reputation < 0) airline.reputation = 0;
                 
                 if (flight.airlineId === 'player') {
                     this.log(`TRAGEDY: ${aircraft.name} crashed! Company paid $${totalPayout.toLocaleString()} in waivers.`);
                 }
                 
                 airline.fleet = airline.fleet.filter((a:any) => a.id !== flight.aircraftId);
                 airline.routes.forEach((r:any) => {
                      r.assignedAircraftIds = r.assignedAircraftIds.filter((id:any) => id !== flight.aircraftId);
                 });
                 this.state.activeFlights.splice(i, 1);
                 this.notify();
                 continue;
            }
            
            if (flight.progress >= flight.duration) {
                if (airline) {
                    airline.money += flight.revenue;
                    if (aircraft) {
                        aircraft.state = 'idle';
                        if (flight.targetDest) aircraft.location = flight.targetDest;
                    }
                }
                
                this.state.activeFlights.splice(i, 1);
            }
        }
    }

    processDepartures() {
        const allAirlines = [...this.state.aiAirlines]; // Only AI airlines auto-depart
        
        for (const airline of allAirlines) {
            for (const routeConfig of airline.routes) {
                 const routeDef = this.allRoutes.find((r:any) => r.id === routeConfig.routeId);
                 if (!routeDef) continue;
                 
                 for (const acId of routeConfig.assignedAircraftIds) {
                      const aircraft = airline.fleet.find((acc:any) => acc.id === acId);
                      if (aircraft && aircraft.state === 'idle') {
                           let destination = routeDef.destination;
                           if (aircraft.location === routeDef.destination) {
                               destination = routeDef.origin;
                           }

                           const acModel = AIRCRAFT_MODELS.find(m => m.id === aircraft.modelId);
                           if (!acModel || acModel.range < routeDef.distance) continue;
                           
                           const competitors = allAirlines
                               .filter(a => a.id !== airline.id && a.routes.find((r:any) => r.routeId === routeDef.id))
                               .map(a => {
                                   const r = a.routes.find((rt:any) => rt.routeId === routeDef.id);
                                   return { id: a.id, price: r.price, reputation: a.reputation };
                               });
                               
                           const potentialPassengers = calculateTicketsSold(routeDef, routeConfig.price, competitors, airline.reputation);
                           
                           let actualPassengers = Math.floor(potentialPassengers + (randomInt(-10, 10)));
                           if (actualPassengers < 0) actualPassengers = 0;
                           if (actualPassengers > acModel.capacity) actualPassengers = acModel.capacity;
                           
                           const flightData = simulateFlight({ distance: routeDef.distance, speed: acModel.speed, fuelPerKm: acModel.fuelCostPerKm });
                           
                           const revenue = actualPassengers * routeConfig.price;
                           const cost = flightData.totalCost;
                           const durationMinutes = flightData.timeHours * 60;
                           
                           airline.totalCO2 = (airline.totalCO2 || 0) + flightData.co2;
                           
                           airline.money -= cost; // Deduct totalCost from money immediately upon dispatch
                           
                           aircraft.state = 'flying';
                           this.state.activeFlights.push({
                               id: `FL_${Date.now()}_${Math.random()}`,
                               airlineId: airline.id,
                               routeId: routeDef.id,
                               aircraftId: aircraft.id,
                               targetDest: destination,
                               progress: 0,
                               duration: durationMinutes,
                               passengers: actualPassengers,
                               revenue,
                               cost,
                               co2: flightData.co2,
                               status: 'inflight'
                           });
                      }
                 }
            }
        }
    }

    processAI() {
        if (this.tickCount % 10 !== 0) return;
        
        for (const ai of this.state.aiAirlines) {
             const affordableModels = AIRCRAFT_MODELS.filter(m => m.price * 1.5 < ai.money);
             if (affordableModels.length > 0 && ai.fleet.length < 25) { 
                  const modelToBuy = randomChoice(affordableModels);
                  this.buyAircraft(ai.id, modelToBuy.id);
                  this.log(`${ai.name} added a ${modelToBuy.name} to their fleet.`);
             }
             
             const unassignedAircraft = ai.fleet.filter((a:any) => !ai.routes.some((r:any) => r.assignedAircraftIds.includes(a.id)));
             for (const aircraft of unassignedAircraft) {
                  const model = AIRCRAFT_MODELS.find(m => m.id === aircraft.modelId);
                  if(!model) continue;
                  
                  const availableRoutes = this.allRoutes.filter(rt => rt.distance <= model.range && !ai.routes.some((airt:any) => airt.routeId === rt.id));
                  
                  if (availableRoutes.length > 0) {
                      const selectedRoute = randomChoice(availableRoutes);
                      const price = Math.floor(selectedRoute.distance * 0.20 * randomChoice([0.9, 1.0, 1.1]));
                      this.openRoute(ai.id, selectedRoute.id, price);
                      this.assignAircraftToRoute(ai.id, aircraft.id, selectedRoute.id);
                      aircraft.location = selectedRoute.origin;
                      this.log(`${ai.name} started a new route: ${selectedRoute.originName} to ${selectedRoute.destinationName}.`);
                  }
             }
             
             if (ai.routes.length > 0 && Math.random() > 0.5) {
                  const targetRoute = randomChoice(ai.routes);
                  const rtDef = this.allRoutes.find(rt => rt.id === targetRoute.routeId);
                  if (rtDef) {
                      const baseStandardPrice = rtDef.distance * 0.20;
                      targetRoute.price = Math.floor(baseStandardPrice * randomChoice([0.8, 0.9, 1.0, 1.1, 1.2]));
                  }
             }
        }
    }
}

export const gameManager = new GameManager();
