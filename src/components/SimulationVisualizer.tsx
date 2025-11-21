import React, { useEffect, useRef } from 'react';
import { SimulationStatus, BlockType } from "../types";
import type { Block } from '../types';
import { Box, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface VisualizerProps {
  honestChain: Block[];
  attackerChain: Block[];
  commonChain: Block[];
  status: SimulationStatus;
}

const BlockNode = ({ block, isTip, isSuccess }: { block: Block; isTip: boolean; isSuccess: boolean }) => {
  let bgColor = 'bg-gray-600';
  let borderColor = 'border-gray-500';
  let icon = <Box size={16} className="text-gray-300" />;
  let textColor = 'text-gray-300';
  let glow = '';

  if (block.type === BlockType.HONEST) {
    bgColor = isSuccess ? 'bg-gray-700 opacity-50' : 'bg-emerald-900/80';
    borderColor = isSuccess ? 'border-gray-600' : 'border-emerald-500/50';
    textColor = isSuccess ? 'text-gray-500' : 'text-emerald-200';
    icon = <Lock size={16} className={isSuccess ? 'text-gray-500' : 'text-emerald-400'} />;
    if (isTip && !isSuccess) glow = 'shadow-[0_0_15px_rgba(16,185,129,0.4)]';
  } else if (block.type === BlockType.ATTACKER) {
    bgColor = isSuccess ? 'bg-emerald-900' : 'bg-rose-900/80';
    borderColor = isSuccess ? 'border-emerald-500' : 'border-rose-500/50';
    textColor = isSuccess ? 'text-emerald-100' : 'text-rose-200';
    icon = isSuccess ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-rose-400" />;
    if (isTip) glow = isSuccess ? 'shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'shadow-[0_0_15px_rgba(244,63,94,0.4)]';
  } else {
    // Genesis/Common
    bgColor = 'bg-slate-700';
    borderColor = 'border-slate-500';
  }

  return (
    <div className={`
      relative group flex-shrink-0 w-24 h-24 rounded-xl border-2 ${borderColor} ${bgColor} ${glow}
      flex flex-col items-center justify-center gap-1 transition-all duration-500 transform
      ${isTip ? 'scale-105' : 'scale-100'}
    `}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 px-2 text-[10px] text-gray-500 font-mono rounded-full border border-gray-700">
        #{block.height}
      </div>
      {icon}
      <span className={`text-xs font-bold font-mono ${textColor}`}>
        {block.id.slice(0, 6)}
      </span>
      {isTip && (
        <div className="absolute -bottom-6 text-[10px] text-gray-400 uppercase tracking-wider font-semibold animate-bounce">
          TIP
        </div>
      )}
      
      {/* Connector Line to left (simulated by pseudo element on container usually, but we use flex gap) */}
    </div>
  );
};

export const SimulationVisualizer: React.FC<VisualizerProps> = ({
  honestChain,
  attackerChain,
  commonChain,
  status
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when chains grow
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [honestChain.length, attackerChain.length]);

  const success = status === SimulationStatus.ATTACKER_WON;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-4">
             <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-700">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div> Common
             </div>
             <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-700">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Honest
             </div>
             <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-700">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div> Attacker
             </div>
        </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-10 pb-4 scroll-smooth"
      >
        <div className="flex flex-col gap-12 relative min-w-max pl-4">
          
          {/* Honest Chain Row */}
          <div className="flex gap-8 items-center h-32 relative">
             {/* Render Common Blocks First */}
             {commonChain.map((block) => (
                <div key={block.id} className="relative">
                   <BlockNode block={block} isTip={false} isSuccess={false} />
                   <div className="absolute top-1/2 left-full w-8 h-1 bg-gray-700 -translate-y-1/2" />
                </div>
             ))}

             {/* Honest Blocks */}
             {honestChain.map((block, idx) => (
                <div key={block.id} className="relative">
                   <BlockNode 
                      block={block} 
                      isTip={idx === honestChain.length - 1} 
                      isSuccess={success} 
                   />
                   {idx < honestChain.length - 1 && (
                     <div className="absolute top-1/2 left-full w-8 h-1 bg-emerald-900/50 -translate-y-1/2" />
                   )}
                   {/* Connection to previous (handled by gap + pseudo in full impl, but here simplistic div lines) */}
                   {idx === 0 && (
                      <div className="absolute top-1/2 right-full w-8 h-1 bg-gray-700 -translate-y-1/2" />
                   )}
                </div>
             ))}
             
             {/* Dashed placeholder for future blocks */}
             {!success && (
                 <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-800 flex items-center justify-center opacity-50">
                    <span className="text-gray-700 text-xs animate-pulse">Mining...</span>
                 </div>
             )}
          </div>

          {/* Attacker Chain Row */}
          <div className="flex gap-8 items-center h-32 relative pl-[calc(var(--common-width))]">
             {/* To align attacker start, we need to offset by common chain length. 
                 Using a spacer block is easiest in flexbox. 
                 Length of common chain * (96px width + 32px gap)
             */}
             <div style={{ width: `${commonChain.length * (96 + 32) - 32}px` }} className="flex-shrink-0 relative">
                {/* Visual Fork Line */}
                <svg className="absolute top-0 right-0 w-16 h-48 -translate-y-24 translate-x-8 pointer-events-none overflow-visible">
                    {/* Curve from Common Tip (top right of spacer) to Attacker Start */}
                    <path 
                        d="M -15 -80 C 40 -80, 0 80, 40 80" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="2" 
                        strokeDasharray="4 4"
                        className="opacity-50"
                    />
                </svg>
             </div>

             {attackerChain.map((block, idx) => (
                <div key={block.id} className="relative">
                   <BlockNode 
                      block={block} 
                      isTip={idx === attackerChain.length - 1} 
                      isSuccess={success} 
                   />
                   {idx < attackerChain.length - 1 && (
                     <div className={`absolute top-1/2 left-full w-8 h-1 ${success ? 'bg-emerald-500' : 'bg-rose-900/50'} -translate-y-1/2`} />
                   )}
                </div>
             ))}
             
             {/* If attacker hasn't won yet, show mining placeholder */}
              {!success && (
                 <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-800 flex items-center justify-center opacity-50">
                    <span className="text-gray-700 text-xs animate-pulse">Secret Mine</span>
                 </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ backgroundImage: 'radial-gradient(circle, #4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>
    </div>
  );
};