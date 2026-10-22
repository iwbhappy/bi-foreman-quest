import type { SituationOption } from '../../lib/types';
import { NumberedRow } from '../ui/NumberedRow';
import { ru } from '../../i18n/ru';
export function ChoiceCard({ questionId, option, index, selected, locked, onSelect }:
  { questionId: string; option: SituationOption; index: number; selected: boolean; locked: boolean;
    onSelect: (id: SituationOption['id']) => void }) {
  return <NumberedRow name={questionId} value={option.id} text={option.text} number={index + 1}
    selected={selected} locked={locked} className="quest-choice" onSelect={() => onSelect(option.id)}>
    {locked && selected && <span className="decision-stamp">{ru.scene.accepted}</span>}
  </NumberedRow>;
}

