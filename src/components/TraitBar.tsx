import { traits } from '../data/traits';
import { level } from '../lib/scoring';
import { ru } from '../i18n/ru';
import type { TraitId } from '../lib/types';
import { MetricBar } from './ui/MetricBar';
export function TraitBar({ trait, value }: { trait: TraitId; value: number }) {
  return <div className={'trait-bar level-' + level(value)}>
    <MetricBar name={traits[trait].name} value={value} level={ru.levels[level(value)]} /></div>;
}

