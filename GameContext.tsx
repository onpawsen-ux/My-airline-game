import React, { createContext, useContext, useEffect, useState } from 'react';
import { gameManager } from './game/simulator';

const GameContext = createContext<any>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [gameState, setGameState] = useState(gameManager.state);
    const [logs, setLogs] = useState(gameManager.logs);
    const [allRoutes, setAllRoutes] = useState(gameManager.allRoutes);
    const [tickCount, setTickCount] = useState(gameManager.tickCount);

    useEffect(() => {
        const unsubscribe = gameManager.subscribe((state: any, logs: any, routes: any, tick: any) => {
            setGameState(state);
            setLogs(logs);
            setAllRoutes(routes);
            setTickCount(tick);
        });
        
        gameManager.start();
        return () => {
            gameManager.stop();
            unsubscribe();
        };
    }, []);

    return (
        <GameContext.Provider value={{
            state: gameState,
            logs,
            allRoutes,
            tickCount,
            gameManager
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
