import { useGame } from '../GameContext';
import { Megaphone } from 'lucide-react';
import { formatMoney } from '../utils/math';

export default function Settings() {
    const { state, gameManager } = useGame();

    const handleWaiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (!isNaN(val)) {
            gameManager.setSettings({ crashWaiverCost: val });
        }
    };

    const isPRActive = state.player.campaigns?.some((c:any) => c.type === 'pr');

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <h3 className="font-bold text-xl text-slate-800">Company Settings</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h4 className="font-bold text-slate-800 mb-2">Insurance Crash Waiver Liability</h4>
                    <p className="text-sm text-slate-500 mb-4">Set the per-passenger payout in the event of an airline tragedy. Higher payouts may reduce reputation damage upon crashing.</p>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-slate-600 font-bold">$</span>
                        <input 
                            type="number" 
                            value={state.settings?.crashWaiverCost || 1000000}
                            onChange={handleWaiverChange}
                            className="border border-slate-300 rounded p-2 text-slate-800 font-medium w-48 focus:outline-indigo-500"
                            step={100000}
                        />
                        <span className="text-slate-500 text-sm">per passenger</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                 <h3 className="font-bold text-xl text-slate-800">Global Marketing</h3>
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div>
                         <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Megaphone className="w-5 h-5"/> Global PR Campaign</h4>
                         <p className="text-sm text-indigo-700/80">Launch a global public relations campaign to boost your company's reputation over time. Costs {formatMoney(1500000)} and lasts for 1 real-world hour.</p>
                     </div>
                     <button
                         onClick={() => gameManager.startPRCampaign(1)} // 1 hour
                         disabled={state.player.money < 1500000}
                         className={`whitespace-nowrap px-6 py-3 rounded-lg font-bold shadow transition-colors ${
                              isPRActive ? 'bg-indigo-200 text-indigo-600 cursor-default' :
                              state.player.money >= 1500000 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                         }`}
                     >
                         {isPRActive ? 'Campaign Active' : `Launch Campaign`}
                     </button>
                 </div>
            </div>
        </div>
    );
}
