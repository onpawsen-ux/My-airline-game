import { useState } from 'react';
import { useGame } from '../GameContext';
import { formatMoney } from '../utils/math';
import { AIRCRAFT_MODELS } from '../game/aircraft';
import { PlaneTakeoff, Settings, AlertTriangle } from 'lucide-react';

export default function Routes() {
    const { state, allRoutes, gameManager } = useGame();
    const { player } = state;
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [ticketPrice, setTicketPrice] = useState(200);

    const [dispatchWarning, setDispatchWarning] = useState<{
        routeId: string;
        aircraftId: string;
        requiredFuel: number;
        availableFuel: number;
        fuelPrice: number;
    } | null>(null);

    const availableRoutes = allRoutes.filter(r => 
        !player.routes.some((pr: any) => pr.routeId === r.id) && 
        (player.hubs.includes(r.origin) || player.hubs.includes(r.destination))
    );

    const handleOpenRoute = () => {
        if (selectedRouteId) {
            gameManager.openRoute('player', selectedRouteId, ticketPrice);
            setSelectedRouteId('');
        }
    };

    const handleDispatch = (routeId: string, aircraftId: string, force: boolean = false) => {
        const result = gameManager.dispatchFlight(routeId, aircraftId, force);
        if (result && !result.success && result.reason === 'insufficient_fuel') {
            setDispatchWarning({ routeId, aircraftId, requiredFuel: result.requiredFuel, availableFuel: result.availableFuel, fuelPrice: result.fuelPrice });
        } else {
            setDispatchWarning(null);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
            {/* Modal for Fuel Warning */}
            {dispatchWarning && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/50 rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <div className="flex items-start gap-4">
                            <div className="bg-red-500/20 p-3 rounded-full text-red-500 shrink-0">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Insufficient Fuel Warning!</h3>
                                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                    You need <strong>{dispatchWarning.requiredFuel.toLocaleString(undefined, {maximumFractionDigits: 0})} gal</strong> of fuel, but you only have <strong>{dispatchWarning.availableFuel.toLocaleString(undefined, {maximumFractionDigits: 0})} gal</strong> in inventory.
                                </p>
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 mb-6">
                                    <strong>CRITICAL RISK:</strong> Taking off without enough fuel WILL cause the aircraft to crash mid-flight. Your company will be liable for a massive insurance payout (default $1M per passenger).
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        onClick={() => setDispatchWarning(null)}
                                    >
                                        Cancel Takeoff
                                    </button>
                                    <button 
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                        onClick={() => handleDispatch(dispatchWarning.routeId, dispatchWarning.aircraftId, true)}
                                    >
                                        Depart Anyway (CRASH)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* My Active Routes */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                        <PlaneTakeoff className="w-5 h-5 text-indigo-500" />
                        Active Routes Management
                    </h3>
                    
                    {player.routes.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">You haven't opened any routes yet.</p>
                            <p className="text-sm text-slate-400 mt-1">Select a destination pair on the right to start.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {player.routes.map((routeConfig: any) => {
                                const rt = allRoutes.find((r: any) => r.id === routeConfig.routeId);
                                const assignedCount = routeConfig.assignedAircraftIds.length;
                                return (
                                    <div key={routeConfig.routeId} className="p-0 border border-slate-200 rounded-xl overflow-hidden bg-white">
                                        <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-200">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{rt?.origin} ✈️ {rt?.destination}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{rt?.distance.toFixed(0)} km path</p>
                                            </div>
                                            <div className="text-right bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Ticket Price</p>
                                                <p className="font-bold text-emerald-600">{formatMoney(routeConfig.price)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Settings className="w-4 h-4 text-slate-400"/>
                                                    <p className="text-sm text-slate-700 font-medium">Assigned Fleet: {assignedCount}</p>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <button 
                                                        onClick={() => gameManager.startCampaign(routeConfig.routeId, 60)} // 60 mins
                                                        disabled={player.money < 100000 || player.campaigns?.some((c:any) => c.routeId === routeConfig.routeId)}
                                                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-1 sm:flex-none whitespace-nowrap"
                                                    >
                                                        {player.campaigns?.some((c:any) => c.routeId === routeConfig.routeId) ? 'Campaign Active' : 'Ad Campaign ($100k)'}
                                                    </button>
                                                    <button 
                                                        onClick={() => gameManager.closeRoute('player', routeConfig.routeId)}
                                                        className="text-rose-500 text-sm hover:text-rose-700 font-medium hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                <select 
                                                    className="border border-slate-300 rounded-lg p-2 text-sm w-full sm:w-64 bg-slate-50"
                                                    onChange={(e) => {
                                                        if(e.target.value) {
                                                            gameManager.assignAircraftToRoute('player', e.target.value, routeConfig.routeId);
                                                            e.target.value = ''; 
                                                        }
                                                    }}
                                                    value=""
                                                >
                                                    <option value="" disabled>+ Assign an aircraft</option>
                                                    {player.fleet
                                                        .filter((ac: any) => !routeConfig.assignedAircraftIds.includes(ac.id))
                                                        .map((ac: any) => {
                                                            const model = AIRCRAFT_MODELS.find(m => m.id === ac.modelId);
                                                            const hasRange = model && model.range >= (rt?.distance || 0);
                                                            return (
                                                                <option key={ac.id} value={ac.id} disabled={!hasRange || ac.state === 'flying'}>
                                                                    {ac.name} {hasRange ? '' : '(No range)'} • {ac.state}
                                                                </option>
                                                            )
                                                    })}
                                                </select>
                                            </div>
                                            
                                            {routeConfig.assignedAircraftIds.length > 0 && (
                                                <div className="mt-4 flex flex-col gap-2">
                                                    {routeConfig.assignedAircraftIds.map((id:string) => {
                                                        const ac = player.fleet.find((a:any) => a.id === id);
                                                        if (!ac) return null;
                                                        return (
                                                            <div key={id} className={`border ${ac.state === 'flying' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-200'} px-3 py-2 rounded-lg flex items-center justify-between gap-4 font-medium`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${ac.state === 'flying' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                                    <span className={ac.state === 'flying' ? 'text-indigo-800' : 'text-slate-700'}>{ac?.name}</span>
                                                                    <span className="text-xs text-slate-400 capitalize bg-white px-2 py-0.5 rounded border border-slate-200">{ac.state}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {ac.state !== 'flying' && (
                                                                        <button 
                                                                            onClick={() => handleDispatch(routeConfig.routeId, id)}
                                                                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 transition-colors shadow-sm"
                                                                        >
                                                                            Dispatch
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => gameManager.assignAircraftToRoute('player', id, null)} 
                                                                        disabled={ac.state === 'flying'}
                                                                        className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 hover:text-rose-600 text-slate-500 text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                                                                    >
                                                                        Unassign
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Open New Route Sidebar */}
            <div className="sticky top-6">
                <div className="bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 p-6">
                    <h3 className="font-bold text-xl mb-6">Open New Route</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Destination Pair</label>
                            <select 
                                value={selectedRouteId}
                                onChange={(e) => {
                                    setSelectedRouteId(e.target.value);
                                    const rt = allRoutes.find((r: any) => r.id === e.target.value);
                                    if (rt) {
                                        setTicketPrice(Math.floor(rt.distance * 0.20));
                                    }
                                }}
                                className="w-full border border-slate-600 rounded-lg p-2.5 bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select a route...</option>
                                {availableRoutes.map((r: any) => (
                                    <option key={r.id} value={r.id}>
                                        {r.origin} ↔ {r.destination} ({r.distance.toFixed(0)}km)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedRouteId && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={ticketPrice}
                                        onChange={(e) => setTicketPrice(Number(e.target.value))}
                                        className="w-full border border-slate-600 rounded-lg py-2.5 pl-8 pr-3 bg-slate-900 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 bg-slate-900 p-2 rounded border border-slate-700">
                                    Recommended: ~${Math.floor(allRoutes.find((r:any) => r.id === selectedRouteId)?.distance * 0.20 || 0)}
                                </p>
                            </div>
                        )}

                        <button 
                            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-3 font-bold disabled:bg-slate-700 disabled:text-slate-500 transition-colors shadow-sm mt-4"
                            disabled={!selectedRouteId || ticketPrice <= 0}
                            onClick={handleOpenRoute}
                        >
                            Establish Route
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
