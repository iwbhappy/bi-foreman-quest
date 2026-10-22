import type { AnswerValue, SituationQuestion as Question, SituationOption } from '../../lib/types';
import { NumberedRow } from '../ui/NumberedRow';
export function SituationQuestion({ question, options, selected, onAnswer, locked = false }:
  { question: Question; options: SituationOption[]; selected: AnswerValue | undefined;
    onAnswer: (value: SituationOption['id']) => void; locked?: boolean }) {
  return <><p className="answer-prompt" id="answer-prompt">{question.prompt}</p>
    <div className="answer-list" role="radiogroup" aria-labelledby="answer-prompt">
      {options.map((option, index) => <NumberedRow key={option.id} number={index + 1}
        name={question.id} value={option.id} text={option.text} selected={selected === option.id} locked={locked}
        onSelect={() => onAnswer(option.id)} />)}
    </div></>;
}

