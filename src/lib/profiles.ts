import { calculate } from './scoring';
import { analyze } from './analysis';
import { getArchetype } from './archetype';
import { qualityFlags } from './flags';
import type { ResultRecord } from './types';
import { resolveSkin } from './skin';

export type ProfileInput = Pick<
  ResultRecord,
  'id' | 'createdAt' | 'participant' | 'answers' | 'durationSec' | 'perQuestionSec' | 'mode' | 'helmetColor' | 'skin'
>;

export function deriveProfile(base: ProfileInput): ResultRecord {
  const { percents, levels, overall } = calculate(base.answers);
  return {
    id: base.id,
    methodologyVersion: '1.0',
    createdAt: base.createdAt,
    participant: { ...base.participant },
    answers: { ...base.answers },
    durationSec: base.durationSec,
    perQuestionSec: { ...base.perQuestionSec },
    ...(base.mode ? { mode: base.mode } : {}),
    ...(base.helmetColor ? { helmetColor: base.helmetColor } : {}),
    ...(base.skin || base.helmetColor ? { skin: resolveSkin(base.skin, base.helmetColor) } : {}),
    percents,
    overall,
    levels,
    archetype: getArchetype(percents),
    ...analyze(percents),
    flags: qualityFlags(base.answers, base.durationSec, base.perQuestionSec),
  };
}
