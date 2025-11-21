export const BlockType = {
  GENESIS: 'GENESIS',
  HONEST: 'HONEST',
  ATTACKER: 'ATTACKER',
  ORPHAN: 'ORPHAN',
} as const;
export type BlockType = typeof BlockType[keyof typeof BlockType];

export const SimulationStatus = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  ATTACKER_WON: 'ATTACKER_WON',
  HONEST_WON: 'HONEST_WON',
} as const;
export type SimulationStatus =
  typeof SimulationStatus[keyof typeof SimulationStatus];


export interface Block {
  id: string;
  height: number;
  type: BlockType;
  timestamp: number;
  parentId: string | null;
}

export interface SimulationConfig {
  honestHashrate: number; // e.g., blocks per minute or relative power
  attackerHashrate: number;
  lag: number; // Number of blocks the attacker is behind when they start
}
