/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GameProvider, useGame } from './GameContext';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Market from './components/Market';
import Routes from './components/Routes';
import ActiveFlights from './components/ActiveFlights';
import AIActivity from './components/AIActivity';
import Settings from './components/Settings';
import WelcomeScreen from './components/WelcomeScreen';
import { PlaneTakeoff, Globe, Compass, ShoppingCart, Activity, Settings as SettingsIcon } from 'lucide-react';
import { gameManager } from './game/simulator';

function GameInterface() {
    const { state } = useGame();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [resetStep, setResetStep] = useState(0);

    const RESET_STEPS = ["FACTORY RESET", "Are you sure?", "Are you sure?", "Last chance"];

    const handleReset = () => {
        if (resetStep === Object.keys(RESET_STEPS).length - 1) {
            gameManager.reset();
            setResetStep(0);
            setActiveTab('dashboard');
        } else {
            setResetStep(resetStep + 1);
        }
    };

    if (!state.player.hubs || state.player.hubs.length === 0) {
        return <WelcomeScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-100">
            {/* Topbar */}
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 p-2 rounded-lg">
                            <PlaneTakeoff className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">AeroTycoon<span className="text-indigo-400 text-sm ml-1 bg-slate-800 px-2 py-0.5 rounded">BETA</span></h1>
                    </div>
                    <div>
                        <button 
                            onClick={handleReset}
                            onMouseLeave={() => setResetStep(0)}
                            className={`${resetStep > 0 ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white'} px-3 py-1.5 rounded text-xs font-bold transition-all uppercase`}
                        >
                            {RESET_STEPS[resetStep]}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-2">
                        <NavButton 
                            active={activeTab === 'dashboard'} 
                            onClick={() => setActiveTab('dashboard')} 
                            icon={<Activity className="w-5 h-5" />} 
                            label="Dashboard Center" 
                        />
                        <NavButton 
                            active={activeTab === 'routes'} 
                            onClick={() => setActiveTab('routes')} 
                            icon={<Globe className="w-5 h-5" />} 
                            label="Routes & Logistics" 
                        />
                        <NavButton 
                            active={activeTab === 'fleet'} 
                            onClick={() => setActiveTab('fleet')} 
                            icon={<PlaneTakeoff className="w-5 h-5" />} 
                            label="Fleet Management" 
                        />
                        <NavButton 
                            active={activeTab === 'market'} 
                            onClick={() => setActiveTab('market')} 
                            icon={<ShoppingCart className="w-5 h-5" />} 
                            label="Aircraft Market" 
                        />
                        <NavButton 
                            active={activeTab === 'flights'} 
                            onClick={() => setActiveTab('flights')} 
                            icon={<Compass className="w-5 h-5" />} 
                            label="Global Radar" 
                        />
                        <NavButton 
                            active={activeTab === 'settings'} 
                            onClick={() => setActiveTab('settings')} 
                            icon={<SettingsIcon className="w-5 h-5" />} 
                            label="Company Settings" 
                        />
                        
                        <div className="mt-8 pt-6">
                             <AIActivity />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'dashboard' && <Dashboard />}
                        {activeTab === 'routes' && <Routes />}
                        {activeTab === 'fleet' && <Fleet />}
                        {activeTab === 'market' && <Market />}
                        {activeTab === 'flights' && <ActiveFlights />}
                        {activeTab === 'settings' && <Settings />}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all font-bold tracking-tight
                ${active ? 'bg-white text-indigo-700 shadow-sm border-b-2 border-indigo-500' : 'text-slate-600 hover:bg-slate-200/50 border-b-2 border-transparent'}
            `}
        >
            <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
            {label}
        </button>
    )
}

export default function App() {
  return (
    <GameProvider>
        <GameInterface />
    </GameProvider>
  );
}
