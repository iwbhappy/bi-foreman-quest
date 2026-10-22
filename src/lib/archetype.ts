import { archetypes, universal } from '../data/archetypes';
import { ranked } from './analysis';
import type { Percents } from './types';
export function getArchetype(percents: Percents) {
  if (Math.max(...Object.values(percents)) - Math.min(...Object.values(percents)) <= 10) return { ...universal };
  const [top1, top2] = ranked(percents);
  const a = archetypes[top1], b = archetypes[top2];
  return { key: `${top1}-${top2}`, name: `${a.animal}-${b.role}`, emoji: a.emoji, description: `${a.animalDescription} ${b.roleDescription}` };
}
