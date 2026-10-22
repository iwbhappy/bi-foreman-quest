import { MENTOR_INTROS, MENTOR_NARRATIONS } from '../../data/quest';
import type { AnswerValue, LikertQuestion as Question } from '../../lib/types';
import { LikertQuestion } from '../test/LikertQuestion';
import { NpcBubble } from './NpcBubble';

interface Props {
  question: Question;
  selected: AnswerValue | undefined;
  onSelect: (value: AnswerValue) => void;
}
export function MentorPause({ question, selected, onSelect }: Props) {
  return (
    <div className="mentor-pause">
      {MENTOR_NARRATIONS[question.id] && <p className="mentor-narration">{MENTOR_NARRATIONS[question.id]}</p>}
      <NpcBubble npcId="mentor" text={MENTOR_INTROS[question.id]} />
      <h1 className="question-heading likert-heading mentor-statement">«{question.statement}»</h1>
      <LikertQuestion question={question} selected={selected} onAnswer={onSelect} />
    </div>
  );
}
