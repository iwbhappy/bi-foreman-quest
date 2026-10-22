import { ru } from '../../i18n/ru';
import type { AnswerValue, LikertQuestion as Question } from '../../lib/types';
import { Icon } from '../Icon';
interface Props {
  question: Question;
  selected: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
}
export function LikertQuestion({ question, selected, onAnswer }: Props) {
  return (
    <div className="likert-block">
      <div className="likert-scale" role="radiogroup" aria-label={question.statement}>
        {ru.likertLabels.map((label, index) => (
          <label
            key={label}
            title={label}
            className={`likert-choice choice-${index} ${selected === index ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={question.id}
              checked={selected === index}
              onChange={() => onAnswer(index as AnswerValue)}
              aria-label={label}
            />
            <span aria-hidden="true">{selected === index && <Icon name="check" />}</span>
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-between gap-6 text-xs font-medium">
        <span className="max-w-24 text-left text-[#A65310]">{ru.likertLabels[0]}</span>
        <span className="max-w-24 text-right text-blue">{ru.likertLabels[6]}</span>
      </div>
      <p aria-live="polite" className="mt-5 min-h-5 text-center text-sm font-medium text-navy">
        {typeof selected === 'number' ? ru.likertLabels[selected] : ru.chooseAnswer}
      </p>
    </div>
  );
}
