import { useGame } from '../GameContext';
import { AIRCRAFT_MODELS } from '../game/aircraft';
import { AIRPORTS } from '../game/airports';
import { formatMoney } from '../utils/math';
import { Info, MapPin } from 'lucide-react';

export default function Market() {
    const { state, gameManager } = useGame();
    const { player } = state;

    const handleBuyHub = (airportId: string) => {
        if (player.money >= 5000000) {
            player.money -= 5000000;
            player.hubs.push(airportId);
            gameManager.log(`Purchased a new hub at ${airportId}.`);
            gameManager.notify();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Aircraft Market</h3>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Available Funds</p>
                        <p className="font-bold text-lg text-emerald-600">{formatMoney(player.money)}</p>
                    </div>
                </div>
                
                <div className="grid gap-4">
                    {AIRCRAFT_MODELS.map(model => {
                        const canAfford = player.money >= model.price;
                        return (
                            <div key={model.id} className="flex flex-col md:flex-row items-center justify-between p-5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                <div className="w-full md:w-auto mb-4 md:mb-0">
                                    <h4 className="font-bold text-lg text-slate-800">{model.name}</h4>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                                        <span className="flex items-center gap-1"><Info className="w-4 h-4 text-slate-400"/> Speed: {model.speed} km/h</span>
                                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">Range: {model.range.toLocaleString()} km</span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">Capacity: {model.capacity} pax</span>
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-medium">Efficiency: {((model as any).efficiency || 0) * 100}%</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                    <span className="font-bold text-xl text-slate-800">{formatMoney(model.price)}</span>
                                    <button 
                                        disabled={!canAfford}
                                        onClick={() => gameManager.buyAircraft('player', model.id)}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                                            canAfford 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Purchase
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Hub Market</h3>
                    <p className="text-sm text-slate-500 max-w-sm text-right">Expand your route network by opening hubs in new cities. (Hubs cost $5,000,000)</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {AIRPORTS.map(airport => {
                        const ownsHub = player.hubs.includes(airport.id);
                        const canAfford = player.money >= 5000000;
                        
                        return (
                            <div key={airport.id} className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between bg-slate-50">
                                <div className="mb-4">
                                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600"/> {airport.name}</h4>
                                     <p className="text-xs text-slate-500 mt-1">Base Demand: {airport.baseDemand}</p>
                                </div>
                                {ownsHub ? (
                                    <span className="text-center bg-slate-200 text-slate-600 font-bold py-2 rounded">Owned Hub</span>
                                ) : (
                                    <button 
                                        disabled={!canAfford}
                                        onClick={() => handleBuyHub(airport.id)}
                                        className={`py-2 rounded font-bold transition-colors ${canAfford ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400'}`}
                                    >
                                        Buy ($5M)
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
