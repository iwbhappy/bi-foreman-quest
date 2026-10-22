import { ru } from '../../i18n/ru';
export function TestProgress({ index, total }: { index: number; total: number }) {
  return (
    <>
      <div className="mb-3 flex justify-between text-sm">
        <span className="font-semibold text-navy" aria-live="polite">
          {ru.question(index + 1, total)}
        </span>
        <span className="text-slate-500">{Math.round((index / total) * 100)}%</span>
      </div>
      <div
        className="mb-7 h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={ru.question(index + 1, total)}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index}
      >
        <div
          className="h-full rounded-full bg-blue transition-[width]"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>
    </>
  );
}
