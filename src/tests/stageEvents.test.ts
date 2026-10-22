import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVENT_CATALOG, STAGE_SEQUENCES } from '../data/stageEvents';
import { CONSEQUENCES } from '../data/quest';
import { stageSequence } from '../lib/stage';

describe('События живой сцены', () => {
  it('У всех 44 вариантов последовательности по 1–3 события, все id существуют', () => {
    expect(STAGE_SEQUENCES).toHaveLength(44);
    expect(Object.keys(EVENT_CATALOG)).toHaveLength(26);
    for (const consequence of CONSEQUENCES) {
      const sequence = stageSequence(consequence.questionId, consequence.optionId)!;
      expect(sequence).toBeDefined();
      expect(sequence.steps.length).toBeGreaterThanOrEqual(1);
      expect(sequence.steps.length).toBeLessThanOrEqual(3);
      for (const step of sequence.steps) expect(EVENT_CATALOG).toHaveProperty(step.id);
    }
  });
  it('Зафиксированы все прежние тексты сцен, последствий, отсылок и стартовые показатели', () => {
    const content = readFileSync(new URL('../data/quest.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
    expect(createHash('sha256').update(content).digest('hex')).toBe(
      '02abdc12ad0f214089e14db9843ac4f21ad3a2792f0963ff0e6ffc717d7b4361',
    );
  });
});
