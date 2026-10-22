import type { ReactNode } from 'react';
import { Icon } from '../Icon';
export function NumberedRow({ number, selected, locked, name, value, text, onSelect, children, className = '' }:
  { number: number; selected: boolean; locked?: boolean; name: string; value: string; text: string;
    onSelect: () => void; children?: ReactNode; className?: string }) {
  return <label className={['numbered-row', 'option-card', className, selected ? 'selected' : '',
    locked ? 'locked' : ''].join(' ')}>
    <input type="radio" name={name} value={value} checked={selected} disabled={locked}
      aria-label={text} onChange={onSelect} />
    <span className="option-number" aria-hidden="true">{selected ? <Icon name="check" /> : number}</span>
    <span>{text}</span>{children}
  </label>;
}

