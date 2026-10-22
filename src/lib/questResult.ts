import { createResult } from './result';
import type { HeroSkin, Progress, ResultRecord } from './types';
import { resolveSkin } from './skin';

export function createQuestResult(
  progress: Progress & { helmetColor: string; skin?: HeroSkin; resultId?: string },
): ResultRecord {
  const result = createResult(progress);
  return {
    ...result,
    id: progress.resultId ?? result.id,
    mode: 'quest',
    helmetColor: progress.helmetColor,
    skin: resolveSkin(progress.skin, progress.helmetColor),
  };
}
