import { recommendations } from '../data/recommendations';
import { retestText } from '../data/routes';
import { analyze } from './analysis';
import type { Percents, RecommendationBand } from './types';
export function recommend(percents: Percents) {
  return analyze(percents).growthZones.map(trait => {
    const band: RecommendationBand = percents[trait] < 40 ? 'low' : 'mid';
    return { trait, band, items: recommendations[trait][band] };
  });
}
export function developmentPlan(percents: Percents) {
  const [first] = recommend(percents);
  return [...first.items.map((r, i) => ({ week: i + 1, type: r.type as string, text: r.text })),
    { week: 4, type: 'retest', text: retestText }];
}
