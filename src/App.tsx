import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationStatus, BlockType } from './types';
import type { SimulationConfig, Block } from './types';
import { DEFAULT_CONFIG, TICK_RATE_MS, BLOCK_TIME_SCALE } from './constants';
import { Controls } from './components/Controls';
import { SimulationVisualizer } from './components/SimulationVisualizer';
import { StatsPanel } from './components/StatsPanel';
import { Header } from './components/Header';

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  
  // Chains state for UI Rendering
  const [honestChain, setHonestChain] = useState<Block[]>([]);
  const [attackerChain, setAttackerChain] = useState<Block[]>([]);
  const [commonChain, setCommonChain] = useState<Block[]>([]); 
  
// Ref holds the authoritative state for the simulation loop
const simState = useRef<{
  honestChain: Block[];
  attackerChain: Block[];
  commonChain: Block[];
  status: SimulationStatus;
  config: SimulationConfig;
}>({
  honestChain: [],
  attackerChain: [],
  commonChain: [],
  status: SimulationStatus.IDLE,
  config: DEFAULT_CONFIG
});


  // Update ref config when config state changes
  useEffect(() => {
    simState.current.config = config;
    simState.current.status = status;
  }, [config, status]);

  const resetSimulation = useCallback(() => {
    const genesis: Block = {
      id: 'genesis',
      height: 0,
      type: BlockType.GENESIS,
      timestamp: Date.now(),
      parentId: null,
    };

    // Pre-mine common blocks
    const common: Block[] = [genesis];
    for (let i = 1; i <= 3; i++) {
      common.push({
        id: `common-${i}`,
        height: i,
        type: BlockType.GENESIS,
        timestamp: Date.now(),
        parentId: common[i-1].id
      });
    }

    // Initial Honest blocks based on lag
    const initialHonest: Block[] = [];
    let lastId = common[common.length - 1].id;
    let lastHeight = common[common.length - 1].height;

    for(let i=1; i <= config.lag; i++) {
        const b: Block = {
            id: `honest-init-${i}`,
            height: lastHeight + 1,
            type: BlockType.HONEST,
            timestamp: Date.now(),
            parentId: lastId
        };
        initialHonest.push(b);
        lastId = b.id;
        lastHeight = b.height;
    }

    const initialAttacker: Block[] = [];

    // Update Ref
    simState.current.commonChain = common;
    simState.current.honestChain = initialHonest;
    simState.current.attackerChain = initialAttacker;

    // Update State
    setCommonChain(common);
    setHonestChain(initialHonest);
    setAttackerChain(initialAttacker);
    setStatus(SimulationStatus.IDLE);
  }, [config.lag]);

  // Reset when lag config changes or on mount
  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  // Simulation Loop
  useEffect(() => {
    let intervalId: number;

    const tick = () => {
      // Read from Ref
      const { status, config, honestChain, attackerChain, commonChain } = simState.current;
      
      if (status !== SimulationStatus.RUNNING) return;

      const p_honest = 1 - Math.exp(-config.honestHashrate * BLOCK_TIME_SCALE);
      const p_attacker = 1 - Math.exp(-config.attackerHashrate * BLOCK_TIME_SCALE);

      // Working copies
      const nextHonestChain = [...honestChain];
      const nextAttackerChain = [...attackerChain];
      let chainChanged = false;

      const honestTipHeight = nextHonestChain.length > 0 
          ? nextHonestChain[nextHonestChain.length - 1].height 
          : commonChain[commonChain.length - 1].height;
      
      const attackerTipHeight = nextAttackerChain.length > 0
          ? nextAttackerChain[nextAttackerChain.length - 1].height
          : commonChain[commonChain.length - 1].height;

      // Reorg Condition: If attacker chain is >= honest chain, honest miners switch.
      // We check if we have actually forked (attacker chain > common chain or we are at the fork point)
      // If lag=0, both start at common tip. attackerTip == honestTip. 
      // Rule: "If attacker's chain becomes equally long... switch". 
      const isReorged = attackerTipHeight >= honestTipHeight;

      // Honest Miner Turn
      if (Math.random() < p_honest) {
        if (isReorged) {
             // Honest miners extend the Attacker Chain
             const parent = nextAttackerChain.length > 0 
                ? nextAttackerChain[nextAttackerChain.length - 1] 
                : commonChain[commonChain.length - 1];

             nextAttackerChain.push({
               id: `honest-on-attack-${Date.now()}-${Math.random()}`,
               height: parent.height + 1,
               type: BlockType.HONEST,
               timestamp: Date.now(),
               parentId: parent.id
             });
        } else {
             // Honest miners extend the Honest Chain
             const parent = nextHonestChain.length > 0 
                ? nextHonestChain[nextHonestChain.length - 1] 
                : commonChain[commonChain.length - 1];

             nextHonestChain.push({
                id: `honest-${Date.now()}-${Math.random()}`,
                height: parent.height + 1,
                type: BlockType.HONEST,
                timestamp: Date.now(),
                parentId: parent.id
             });
        }
        chainChanged = true;
      }

      // Attacker Miner Turn
      // Attacker ALWAYS extends their own chain
      if (Math.random() < p_attacker) {
         const parent = nextAttackerChain.length > 0
            ? nextAttackerChain[nextAttackerChain.length - 1]
            : commonChain[commonChain.length - 1];

         nextAttackerChain.push({
           id: `attacker-${Date.now()}-${Math.random()}`,
           height: parent.height + 1,
           type: BlockType.ATTACKER,
           timestamp: Date.now(),
           parentId: parent.id
         });
         chainChanged = true;
      }

      if (chainChanged) {
        // Update Ref
        simState.current.honestChain = nextHonestChain;
        simState.current.attackerChain = nextAttackerChain;
        
        // Update State (triggers render)
        setHonestChain(nextHonestChain);
        setAttackerChain(nextAttackerChain);
      }
    };

    if (status === SimulationStatus.RUNNING) {
      intervalId = window.setInterval(tick, TICK_RATE_MS);
    }

    return () => clearInterval(intervalId);
  }, [status]); 

  const handleStart = () => {
     // If user hits start after a win, we just continue, or if they want reset they hit reset
     setStatus(SimulationStatus.RUNNING);
  };

  const handlePause = () => setStatus(SimulationStatus.IDLE);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 gap-6">
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          <Controls 
            config={config} 
            setConfig={setConfig} 
            status={status}
            honestChain={honestChain}
            attackerChain={attackerChain}
            commonChain={commonChain}
            onStart={handleStart}
            onPause={handlePause}
            onReset={resetSimulation}
          />
          <StatsPanel 
            honestChain={honestChain} 
            attackerChain={attackerChain}
            commonChain={commonChain}
            status={status}
            config={config}
          />
        </div>

        <div className="lg:col-span-9 bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col min-h-0 shadow-2xl">
           <SimulationVisualizer 
             honestChain={honestChain}
             attackerChain={attackerChain}
             commonChain={commonChain}
             status={status}
           />
        </div>
      </div>
    </div>
  );
}