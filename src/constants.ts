export const DEFAULT_CONFIG = {
  honestHashrate: 90,
  attackerHashrate: 10,
  lag: 1,
};

export const TICK_RATE_MS = 50; // Simulation tick speed
export const BLOCK_TIME_SCALE = 0.002; // Scaling factor for probability per tick based on hashrate
export const MAX_BLOCKS_DISPLAY = 20; // Keep UI clean by sliding window if needed, or just scroll
