import { demoEmployees } from '../data/demoTeam';
import { questions } from '../data/questions';
import { recommendations } from '../data/recommendations';
import { deriveProfile } from './profiles';
import { recommend } from './recommend';
import { TRAIT_ORDER, type Answers, type AnswerValue, type Percents, type ResultRecord } from './types';

export function buildDemoTeam(): ResultRecord[] {
  return demoEmployees.flatMap((employee, person) =>
    employee.attempts.map((attempt, index) => {
      let situation = 0;
      let likert = 0;
      const answers = Object.fromEntries(
        questions.map((question) => [
          question.id,
          question.type === 'situation'
            ? (attempt.pattern[situation++] as AnswerValue)
            : (attempt.likert[likert++] as AnswerValue),
        ]),
      ) as Answers;
      const perQuestionSec = Object.fromEntries(questions.map((question) => [question.id, 14]));
      return deriveProfile({
        id: `10000000-0000-4000-8000-${String((person + 1) * 10 + index + 1).padStart(12, '0')}`,
        createdAt: attempt.createdAt,
        participant: employee.participant,
        answers,
        durationSec: 210,
        perQuestionSec,
        mode: 'quest',
        helmetColor: employee.helmetColor,
        skin: employee.skin,
      });
    }),
  );
}
export function allProfiles(local: ResultRecord[]) {
  return [...new Map([...buildDemoTeam(), ...local].map((record) => [record.id, deriveProfile(record)])).values()];
}
export function isDemoRecord(record: ResultRecord) {
  return buildDemoTeam().some((item) => item.id === record.id);
}
export function participantKey(record: ResultRecord) {
  return JSON.stringify([record.participant.name, record.participant.position]);
}
export function latestProfiles(records: ResultRecord[]) {
  const people = new Map<string, ResultRecord>();
  for (const record of records) {
    const key = participantKey(record);
    const previous = people.get(key);
    if (!previous || Date.parse(record.createdAt) >= Date.parse(previous.createdAt)) people.set(key, record);
  }
  return [...people.values()];
}
export function firstPrevious(records: ResultRecord[], current: ResultRecord) {
  return records
    .filter(
      (record) =>
        participantKey(record) === participantKey(current) &&
        record.id !== current.id &&
        Date.parse(record.createdAt) <= Date.parse(current.createdAt),
    )
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];
}
export function averageProfile(records: ResultRecord[]): Percents {
  return Object.fromEntries(
    TRAIT_ORDER.map((trait) => [
      trait,
      records.length
        ? Math.round(records.reduce((sum, record) => sum + record.percents[trait], 0) / records.length)
        : 0,
    ]),
  ) as Percents;
}
export function weakestTrait(percents: Percents) {
  return [...TRAIT_ORDER].sort(
    (a, b) => percents[a] - percents[b] || TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b),
  )[0];
}
export function developmentGroups(records: ResultRecord[]) {
  return TRAIT_ORDER.flatMap((trait) => {
    const members = records.filter((record) => weakestTrait(record.percents) === trait);
    const course = recommendations[trait].mid.find((item) => item.type === 'course')!;
    return members.length ? [{ trait, members, course }] : [];
  });
}
export function academyNextStep(percents: Percents) {
  const course = recommend(percents)[0].items.find((item) => item.type === 'course')!;
  const title = course.text.match(/^«(.*?)»/)?.[1] ?? course.text;
  const academy = course.text.match(/\((.*?)\)/)?.[1] ?? 'BI Academy';
  return { title, academy };
}
