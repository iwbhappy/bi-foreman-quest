import { StatusBox } from '../ui/StatusBox';
import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { evidence } from '../../lib/analysis';
import type { Answers, Percents, TraitId } from '../../lib/types';
interface Props {
  answers: Answers;
  percents: Percents;
  strengths: TraitId[];
  growthZones: TraitId[];
}
function StrengthEvidence({ answers, trait }: { answers: Answers; trait: TraitId }) {
  return evidence(answers, trait).strengths.map((item) => (
    <p className="evidence" key={item.question.id}>
      {ru.chosen(item.question.time, item.question.title, item.option.text)}
    </p>
  ));
}
function GrowthEvidence({ answers, trait }: { answers: Answers; trait: TraitId }) {
  const { alternative } = evidence(answers, trait);
  if (!alternative) return null;
  return (
    <>
      <h4 className="evidence-label">{ru.why}</h4>
      <p className="evidence">
        {ru.alternative(
          alternative.question.time,
          alternative.question.title,
          traits[trait].name,
          alternative.better.text,
        )}
      </p>
    </>
  );
}
export function AnalysisCards({ answers, percents, strengths, growthZones }: Props) {
  return (
    <div className="analysis-grid">
      <StatusBox kind="strength" title={ru.strengths}>
        {strengths.map((trait) => (
          <article key={trait} className="analysis-item">
            <h3>
              {traits[trait].name}
              <span>{percents[trait]}%</span>
            </h3>
            {percents[trait] < 70 && <p className="mt-1 text-xs font-medium text-green">{ru.relativeStrength}</p>}
            <p className="mt-2 text-sm leading-relaxed">{traits[trait].useStrength}</p>
            <h4 className="evidence-label">{ru.why}</h4>
            <StrengthEvidence answers={answers} trait={trait} />
          </article>
        ))}
      </StatusBox>
      <StatusBox kind="growth" title={ru.growthZones}>
        {growthZones.map((trait) => (
          <article key={trait} className="analysis-item">
            <h3>
              {traits[trait].name}
              <span>{percents[trait]}%</span>
            </h3>
            {percents[trait] >= 55 && <p className="mt-1 text-xs font-medium text-[#A65310]">{ru.priority}</p>}
            <GrowthEvidence answers={answers} trait={trait} />
          </article>
        ))}
      </StatusBox>
    </div>
  );
}
