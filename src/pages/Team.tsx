import { useMemo, useState } from 'react';
import { ru } from '../i18n/ru';
import { loadResults } from '../lib/storage';
import { allProfiles, averageProfile, latestProfiles } from '../lib/team';
import { TeamTable } from '../components/team/TeamTable';
import { ImportResult } from '../components/team/ImportResult';
import { DevelopmentGroups } from '../components/team/DevelopmentGroups';
import { PageTitle } from '../components/ui/Titles';
import { ProfileRadar } from '../components/ProfileRadar';
import { TeamAnalysisBlock } from '../components/ai/TeamAnalysisBlock';

export default function Team() {
  const [local, setLocal] = useState(loadResults);
  const all = useMemo(() => allProfiles(local), [local]);
  const records = useMemo(() => latestProfiles(all), [all]);
  return (
    <main className="wrap dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="demo-badge">{ru.dashboard.demo}</span>
          <PageTitle>{ru.dashboard.teamTitle}</PageTitle>
          <p>
            {ru.dashboard.people(records.length)}
            <span>·</span>
            {ru.dashboard.attempts(all.length)}
          </p>
        </div>
        <ImportResult onImported={() => setLocal(loadResults())} />
      </div>
      <TeamTable records={records} />
      <div className="team-summary-grid">
        <section className="team-radar card">
          <h2 className="section-title">{ru.dashboard.average}</h2>
          <ProfileRadar percents={averageProfile(records)} />
        </section>
        <DevelopmentGroups records={records} />
      </div>
      <TeamAnalysisBlock records={records} hasLocal={local.length > 0} />
    </main>
  );
}
