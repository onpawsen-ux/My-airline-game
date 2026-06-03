import { useState } from 'react';
import { useGame } from '../GameContext';
import { AIRPORTS } from '../game/airports';
import { MapPin, PlaneTakeoff } from 'lucide-react';

export default function WelcomeScreen() {
    const { gameManager } = useGame();
    const [selectedHub, setSelectedHub] = useState<string | null>(null);

    const handleStart = () => {
        if (selectedHub) {
            gameManager.setInitialHub(selectedHub);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="bg-indigo-600 p-8 md:w-1/3 text-white flex flex-col justify-center">
                    <PlaneTakeoff className="w-16 h-16 mb-6 opacity-80" />
                    <h1 className="text-3xl font-bold mb-2">Welcome to AeroTycoon</h1>
                    <p className="text-indigo-100 mb-8">Start your global aviation empire. Choose your first headquarters hub to begin routing flights.</p>
                </div>
                <div className="p-8 md:w-2/3 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Select Starting Hub</h2>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto mb-6 p-1">
                        {AIRPORTS.map(airport => (
                            <button
                                key={airport.id}
                                onClick={() => setSelectedHub(airport.id)}
                                className={`p-4 text-left rounded-xl border flex flex-col items-start gap-1 transition-all ${
                                    selectedHub === airport.id 
                                    ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <span className="font-bold text-slate-800 flex items-center gap-2">
                                    <MapPin className={`w-4 h-4 ${selectedHub === airport.id ? 'text-indigo-600' : 'text-slate-400'}`}/> 
                                    {airport.id}
                                </span>
                                <span className="text-sm text-slate-500 line-clamp-1">{airport.name}</span>
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleStart}
                        disabled={!selectedHub}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
                    >
                        {selectedHub ? 'Found Airline' : 'Select a Hub to Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
