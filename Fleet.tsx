import { useGame } from '../GameContext';
import { AIRCRAFT_MODELS } from '../game/aircraft';
import { Plane } from 'lucide-react';
import { formatMoney } from '../utils/math';

export default function Fleet() {
    const { state } = useGame();
    const { player } = state;

    if (player.fleet.length === 0) {
        return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 border-dashed flex flex-col items-center justify-center h-full">
                <Plane className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Your fleet is empty</h3>
                <p className="text-slate-500 max-w-md">Head over to the Aircraft Market to purchase your first plane and start earning revenue.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-500" />
                My Fleet ({player.fleet.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {player.fleet.map((ac: any) => {
                    const model = AIRCRAFT_MODELS.find(m => m.id === ac.modelId);
                    const isFlying = ac.state === 'flying';
                    return (
                        <div key={ac.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-slate-50">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-slate-800 tracking-tight">{ac.name}</h4>
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                                    isFlying 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                    {ac.state}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-indigo-900 bg-indigo-50 px-2 py-1 rounded inline-block">{model?.name}</p>
                                <div className="flex flex-col gap-0.5 mt-2">
                                    <p className="text-xs text-slate-500 flex justify-between">
                                        <span>Max Range:</span> <span className="font-medium text-slate-700">{model?.range.toLocaleString()} km</span>
                                    </p>
                                    <p className="text-xs text-slate-500 flex justify-between">
                                        <span>Capacity:</span> <span className="font-medium text-slate-700">{model?.capacity} pax</span>
                                    </p>
                                    <p className="text-xs text-slate-500 flex justify-between">
                                        <span>Location:</span> <span className="font-medium text-slate-700">{ac.location || 'Unknown'}</span>
                                    </p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                                     <button 
                                          onClick={() => {
                                               const sellPrice = Math.floor((model?.price || 0) * 0.75); // 75% returned
                                               gameManager.sellAircraft('player', ac.id, sellPrice);
                                          }}
                                          disabled={isFlying}
                                          className="text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-600 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-rose-500"
                                     >
                                          Sell ({model?.price ? formatMoney(model.price * 0.75) : '$0'})
                                     </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
