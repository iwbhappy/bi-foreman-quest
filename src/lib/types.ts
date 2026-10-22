export type TraitId = 'critical' | 'confidence' | 'discipline' | 'engagement';
export const TRAIT_ORDER: TraitId[] = ['critical', 'confidence', 'discipline', 'engagement']; // также порядок разрешения ничьих

export type Weight = 0 | 1 | 2 | 3;
export type Weights = Record<TraitId, Weight>;

export interface SituationOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  weights: Weights;
}

export interface SituationQuestion {
  id: string; // 'q01'...'q15'
  type: 'situation';
  time: string; // '07:00'
  title: string; // короткий заголовок сцены
  scene: string; // описание ситуации
  prompt: string; // вопрос, по умолчанию «Что вы сделаете?»
  options: SituationOption[]; // ровно 4
}

export interface LikertQuestion {
  id: string;
  type: 'likert';
  statement: string;
  trait: TraitId;
  reverse: boolean;
}

export type Question = SituationQuestion | LikertQuestion;

// Ответы: для situation — id варианта, для likert — число 0..6
// (0 = «Полностью не согласен», 3 = «Нейтрально», 6 = «Полностью согласен»)
export type AnswerValue = SituationOption['id'] | 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Answers = Record<string, AnswerValue>;

export type Level = 'growth' | 'developing' | 'strong';

export interface Participant {
  name: string; // может быть пустым → «Участник»
  position: string; // из списка в разделе 9.1
  experience: string; // из списка в разделе 9.1
}

export interface ResultRecord {
  skin?: HeroSkin;
  mode?: 'quest' | 'classic';
  helmetColor?: string;
  id: string; // crypto.randomUUID()
  methodologyVersion: '1.0';
  createdAt: string; // ISO
  participant: Participant;
  answers: Answers;
  durationSec: number;
  perQuestionSec: Record<string, number>;
  percents: Record<TraitId, number>; // целые 0..100
  overall: number; // целое 0..100
  levels: Record<TraitId, Level>;
  archetype: { key: string; name: string; emoji: string; description: string };
  strengths: TraitId[];
  growthZones: TraitId[];
  flags: QualityFlag[];
}

export type QualityFlag = 'too_fast' | 'likert_contradiction' | 'likert_straightline';

export type Percents = Record<TraitId, number>;
export type RecommendationBand = 'low' | 'mid';
export interface Recommendation {
  type: 'practice' | 'course' | 'mentor';
  text: string;
}
export interface Progress {
  methodologyVersion: '1.0';
  participant: Participant;
  answers: Answers;
  sessionSeed: string;
  currentIndex: number;
  startedAt: string;
  perQuestionSec: Record<string, number>;
}

export type IndicatorId = 'schedule' | 'quality' | 'safety' | 'team';
export type Delta = -10 | -5 | 5 | 10;
export type Indicators = Record<IndicatorId, number>;
export type LocationId =
  | 'office'
  | 'slab'
  | 'mixer'
  | 'height'
  | 'floor'
  | 'warehouse'
  | 'meeting'
  | 'ptoOffice'
  | 'cabin';
export interface Npc {
  id: string;
  emoji: string;
  name: string;
  role: string;
  helmet: string;
}
export interface SceneMeta {
  questionId: string;
  location: LocationId;
  npcLines: { npcId: string; text: string }[];
  alert?: string;
}
export interface Consequence {
  questionId: string;
  optionId: SituationOption['id'];
  text: string;
  deltas: Partial<Record<IndicatorId, Delta>>;
}
export interface Callback {
  atQuestionId: string;
  dependsOn: string;
  textByOption: Record<SituationOption['id'], string>;
}
export interface QuestProgress extends Progress {
  skin?: HeroSkin;
  helmetColor: string;
  consequenceShown: boolean;
  stage: 'play' | 'report' | 'reveal';
  resultId?: string;
}

export interface HeroSkin {
  helmet: 'orange' | 'white' | 'blue' | 'yellow' | 'red' | 'green';
  theme: 'bright' | 'strict' | 'calm' | 'tech';
}
