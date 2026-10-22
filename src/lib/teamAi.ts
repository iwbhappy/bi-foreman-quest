import type { ResultRecord } from './types';
export function teamAnalysisInput(records: ResultRecord[]) {
  return { members: records.map((record) => ({ position: record.participant.position,
    experience: record.participant.experience, percents: record.percents, archetype: record.archetype.name })) };
}
