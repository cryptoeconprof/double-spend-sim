import React from 'react';
import type { Block, SimulationConfig} from '../types';
import { SimulationStatus } from '../types';     

interface StatsProps {
  honestChain: Block[];
  attackerChain: Block[];
  commonChain: Block[];
  status: SimulationStatus;
  config: SimulationConfig;
}

export const StatsPanel: React.FC<StatsProps> = ({
  honestChain,
  attackerChain,
  commonChain,
  config
}) => {
  const commonHeight = commonChain.length > 0 ? commonChain[commonChain.length-1].height : 0;
  const honestTip = honestChain.length > 0 ? honestChain[honestChain.length-1].height : commonHeight;
  const attackerTip = attackerChain.length > 0 ? attackerChain[attackerChain.length-1].height : commonHeight;

  const lead = honestTip - attackerTip;
  const attackSuccessProb = Math.pow(Math.min(1, config.attackerHashrate / config.honestHashrate), Math.max(0, lead + 1));
  
  const totalHash = config.honestHashrate + config.attackerHashrate;
  const honestPct = ((config.honestHashrate / totalHash) * 100).toFixed(1);
  const attackerPct = ((config.attackerHashrate / totalHash) * 100).toFixed(1);
  
  const isReorged = attackerTip >= honestTip && attackerTip > commonHeight;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg flex flex-col gap-4 flex-1">
       <h3 className="text-gray-300 font-semibold border-b border-gray-700 pb-2">Live Stats</h3>
       
       <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border transition-colors ${isReorged ? 'bg-gray-900/30 border-gray-700 opacity-50' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
             <div className="text-xs text-gray-500 uppercase">Honest Chain</div>
             <div className={`text-2xl font-mono ${isReorged ? 'text-gray-500' : 'text-emerald-400'}`}>{honestTip}</div>
             {isReorged && <div className="text-[10px] text-rose-400 font-bold mt-1">ORPHANED</div>}
          </div>
          <div className={`p-3 rounded-lg border transition-colors ${isReorged ? 'bg-rose-900/20 border-rose-500/30' : 'bg-gray-900/30 border-gray-700'}`}>
             <div className="text-xs text-gray-500 uppercase">Attacker Chain</div>
             <div className="text-2xl font-mono text-rose-400">{attackerTip}</div>
             {isReorged && <div className="text-[10px] text-emerald-400 font-bold mt-1">MAIN CHAIN</div>}
          </div>
       </div>

       <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Hashrate Allocation</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden flex">
                <div style={{ width: `${honestPct}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${attackerPct}%` }} className="bg-rose-500 h-full"></div>
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-gray-500 font-mono">
                <span>Honest: {honestPct}%</span>
                <span>Attacker: {attackerPct}%</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${isReorged ? 'bg-rose-900/10 border-rose-500/20' : 'bg-indigo-900/20 border-indigo-500/20'}`}>
              <div className={`text-xs mb-1 ${isReorged ? 'text-rose-300' : 'text-indigo-300'}`}>
                  {isReorged ? 'Attack Status' : 'Theoretical Success Chance'}
              </div>
              <div className={`text-xl font-bold ${isReorged ? 'text-rose-200' : 'text-indigo-100'}`}>
                 {isReorged ? 'SUCCESSFUL' : `${(attackSuccessProb * 100).toFixed(2)}%`}
              </div>
              <div className={`text-[10px] mt-1 leading-tight ${isReorged ? 'text-rose-400/60' : 'text-indigo-400/60'}`}>
                 {isReorged 
                    ? 'Honest miners have reorganized to the attacker chain.' 
                    : `Based on current gap of ${Math.max(0, lead)} blocks.`
                 }
              </div>
          </div>
       </div>
    </div>
  );
};