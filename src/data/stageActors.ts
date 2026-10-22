import { NPCS } from './quest';
import type { Npc } from '../lib/types';
export const STAGE_NPCS: Record<string, Npc> = {
  ...NPCS,
  installer: { id: 'installer', name: 'Монтажник', emoji: '🧑‍🔧', helmet: '#F2C230', role: '' },
};
