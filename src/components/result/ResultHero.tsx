import { ru } from '../../i18n/ru';
import { developmentPlan } from '../../lib/recommend';
import { traits } from '../../data/traits';
import type { ResultRecord } from '../../lib/types';
import { ArchetypeAvatar } from '../ArchetypeAvatar';
import { NavyPanel } from '../ui/StatusBox';
export function ResultHero(record: ResultRecord) {
  return <NavyPanel className="result-hero">
    <ArchetypeAvatar archetype={record.archetype} helmetColor={record.helmetColor} skin={record.skin} size={120} />
    <h2>{record.participant.name || ru.participant}</h2>
    <p>{record.participant.position} · {record.participant.experience}</p>
    <p>{new Date(record.createdAt).toLocaleDateString('ru-RU')}</p>
    <h3>{ru.redesign.index}</h3><p className="overall">{record.overall}%</p>
    <h3>{ru.redesign.archetype}</h3><p>{record.archetype.name}</p>
    <div className="navy-chips"><p>{ru.scene.strength}: {traits[record.strengths[0]].name}</p>
      <p>{ru.scene.growth}: {traits[record.growthZones[0]].name}</p></div>
    <h3>{ru.redesign.first}</h3><p>{developmentPlan(record.percents)[0].text}</p>
  </NavyPanel>;
}

