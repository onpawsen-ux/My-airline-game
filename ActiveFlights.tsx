import { useGame } from '../GameContext';
import { formatMoney } from '../utils/math';
import { Map, Plane } from 'lucide-react';

export default function ActiveFlights() {
    const { state, allRoutes } = useGame();
    const { activeFlights, player, aiAirlines } = state;
    
    const sortedFlights = [...activeFlights].sort((a, b) => {
        if (a.airlineId === 'player' && b.airlineId !== 'player') return -1;
        if (b.airlineId === 'player' && a.airlineId !== 'player') return 1;
        return b.progress - a.progress; 
    });

    if (sortedFlights.length === 0) {
        return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm flex items-center justify-center flex-col h-[500px]">
                <Map className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Clear Skies</h3>
                <p className="text-slate-500 font-medium">No aircraft currently in flight throughout the world.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                    <Map className="w-5 h-5 text-indigo-500" />
                    Global Radar
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                    {sortedFlights.length} Airborne
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 tracking-wide text-xs">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase">Airline</th>
                            <th className="px-6 py-4 font-bold uppercase">Route</th>
                            <th className="px-6 py-4 font-bold uppercase">Status / Profit</th>
                            <th className="px-6 py-4 font-bold uppercase w-1/3">Flight Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedFlights.map((flight: any) => {
                            const isPlayer = flight.airlineId === 'player';
                            const rt = allRoutes.find((r:any) => r.id === flight.routeId);
                            const progressPercentage = Math.min(100, Math.max(0, (flight.progress / flight.duration) * 100));
                            
                            return (
                                <tr key={flight.id} className={`${isPlayer ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${isPlayer ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                            {isPlayer ? 'My Airline' : aiAirlines.find((a:any) => a.id === flight.airlineId)?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span>{rt?.origin}</span>
                                            <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                                            <span>{rt?.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-600 font-medium">{flight.passengers} Passengers</span>
                                            <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide">Rev {formatMoney(flight.revenue)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-[1000ms] ease-linear ${isPlayer ? 'bg-indigo-500' : 'bg-slate-400'}`} 
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 w-10 text-right">{progressPercentage.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
