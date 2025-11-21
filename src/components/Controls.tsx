import React from 'react';
import { SimulationStatus } from "../types";
import type { SimulationConfig, Block } from "../types";
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlsProps {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  status: SimulationStatus;
  honestChain: Block[];
  attackerChain: Block[];
  commonChain: Block[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  config, 
  setConfig, 
  status,
  honestChain,
  attackerChain,
  commonChain,
  onStart, 
  onPause, 
  onReset 
}) => {
  
  const isRunning = status === SimulationStatus.RUNNING;

  // Calculate Reorg state for UI
  const honestTip = honestChain.length > 0 ? honestChain[honestChain.length-1].height : commonChain[commonChain.length-1]?.height || 0;
  const attackerTip = attackerChain.length > 0 ? attackerChain[attackerChain.length-1].height : commonChain[commonChain.length-1]?.height || 0;
  
  const isReorged = attackerTip >= honestTip && attackerTip > (commonChain[commonChain.length-1]?.height || 0);

  const handleChange = (key: keyof SimulationConfig, value: number) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <h2 className="text-lg font-semibold text-white">Configuration</h2>
        <div className="flex gap-2">
            {!isRunning && (
                <button 
                    onClick={onStart}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-900/50"
                    title="Start Simulation"
                >
                    <Play size={20} fill="currentColor" />
                </button>
            )}
            {isRunning && (
                <button 
                    onClick={onPause}
                    className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors shadow-lg shadow-amber-900/50"
                    title="Pause Simulation"
                >
                    <Pause size={20} fill="currentColor" />
                </button>
            )}
            <button 
                onClick={onReset}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                title="Reset"
            >
                <RotateCcw size={20} />
            </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-gray-400">Honest Hashrate</label>
            <span className="text-emerald-400 font-mono">{config.honestHashrate} H/s</span>
          </div>
          <input
            type="range"
            min="1"
            max="200"
            value={config.honestHashrate}
            onChange={(e) => handleChange('honestHashrate', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-gray-400">Attacker Hashrate</label>
            <span className="text-rose-400 font-mono">{config.attackerHashrate} H/s</span>
          </div>
          <input
            type="range"
            min="1"
            max="200"
            value={config.attackerHashrate}
            onChange={(e) => handleChange('attackerHashrate', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-gray-400">Attack Lag (Blocks)</label>
            <span className="text-indigo-400 font-mono">{config.lag} Blocks</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={config.lag}
            onChange={(e) => handleChange('lag', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            disabled={isRunning} 
          />
          <p className="text-xs text-gray-500 mt-1">
            The attacker starts mining privately from {config.lag} blocks ago.
          </p>
        </div>
      </div>

      {isReorged && (
         <div className="mt-2 p-3 bg-rose-900/30 border border-rose-500/50 rounded-lg text-rose-200 text-sm text-center font-semibold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            Attacker chain is longest! <br/>
            <span className="text-xs font-normal opacity-80">Honest miners have switched to attacker chain.</span>
         </div>
      )}
    </div>
  );
};