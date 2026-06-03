import { useState } from 'react';
import { useGame } from '../GameContext';
import { formatMoney } from '../utils/math';
import { Plane, DollarSign, Star, TrendingUp, CloudRain, Droplets } from 'lucide-react';

export default function Dashboard() {
    const { state, gameManager } = useGame();
    const { player, fuelPrice } = state;
    
    const [fuelAmount, setFuelAmount] = useState<number>(10000);
    const [co2Amount, setCo2Amount] = useState<number>(500);

    const handleBuyFuel = () => {
        gameManager.buyFuel(fuelAmount);
    };

    const handleBuyCO2 = () => {
        gameManager.buyCO2Quota(co2Amount);
    };

    return (
        <div className="mb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Bank Balance</p>
                        <p className="text-xl font-bold text-slate-800">{formatMoney(player.money)}</p>
                    </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl shadow-sm border border-amber-200 flex items-center space-x-4">
                    <div className="p-3 bg-amber-200 text-amber-700 rounded-lg">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-amber-700 font-medium">Fuel Inventory</p>
                        <p className="text-xl font-bold text-amber-900">{(player.fuelInventory || 0).toLocaleString()} <span className="text-sm font-normal">gal</span></p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="p-3 bg-slate-200 text-slate-700 rounded-lg">
                        <CloudRain className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-700 font-medium">CO₂ Quota Inventory</p>
                        <p className="text-xl font-bold text-slate-900">{(player.co2Quota || 0).toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm font-normal text-slate-500">units</span></p>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Plane className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Fleet</p>
                        <p className="text-xl font-bold text-slate-800">{player.fleet.filter((a:any) => a.state === 'flying').length} <span className="text-sm font-normal text-slate-500">en route</span></p>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Routes</p>
                        <p className="text-xl font-bold text-slate-800">{player.routes.length}</p>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Reputation</p>
                        <div className="flex items-center gap-1">
                            <p className="text-xl font-bold text-slate-800">{player.reputation.toFixed(1)}/100</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* RESOURCE MARKETS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-start gap-4 shadow-xl">
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                Fuel Depot
                                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/50">Live Market</span>
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Stock up on fuel before sending out flights.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Current Market Price</span>
                            <p className="text-amber-400 font-bold text-2xl">{formatMoney(fuelPrice || 0)} <span className="text-sm font-normal text-slate-500">/ gal</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <input 
                            type="number" 
                            className="bg-slate-900 border border-slate-700 text-white rounded p-2.5 flex-1 focus:outline-none focus:border-amber-500 transition-colors"
                            value={fuelAmount}
                            onChange={(e) => setFuelAmount(Number(e.target.value))}
                            step={100}
                        />
                        <span className="text-slate-400 text-sm w-10">gal</span>
                        <button 
                            onClick={handleBuyFuel}
                            disabled={player.money < fuelAmount * fuelPrice}
                            className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 font-bold rounded shadow-sm whitespace-nowrap transition-colors"
                        >
                            Buy ({formatMoney(fuelAmount * fuelPrice)})
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-xl border border-emerald-900/50 flex flex-col items-start gap-4 shadow-xl">
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                CO₂ Carbon Quota
                                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/50">Compliance</span>
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Pre-purchase offset quotas to avoid massive tax penalties.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Current Market Price</span>
                            <p className="text-emerald-400 font-bold text-2xl">{formatMoney(10)} <span className="text-sm font-normal text-slate-500">/ unit</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <input 
                            type="number" 
                            className="bg-slate-900 border border-slate-700 text-white rounded p-2.5 flex-1 focus:outline-none focus:border-emerald-500 transition-colors"
                            value={co2Amount}
                            onChange={(e) => setCo2Amount(Number(e.target.value))}
                            step={100}
                        />
                        <span className="text-slate-400 text-sm w-10">units</span>
                        <button 
                            onClick={handleBuyCO2}
                            disabled={player.money < co2Amount * 10}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 font-bold rounded shadow-sm whitespace-nowrap transition-colors"
                        >
                            Buy ({formatMoney(co2Amount * 10)})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
