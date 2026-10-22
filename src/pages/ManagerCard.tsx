import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ru } from '../i18n/ru';
import { loadResults } from '../lib/storage';
import { allProfiles, firstPrevious, isDemoRecord } from '../lib/team';
import { ManagerSidebar } from '../components/manager/ManagerSidebar';
import { AcademyRoute } from '../components/manager/AcademyRoute';
import { DynamicsSection } from '../components/manager/DynamicsSection';
import { ManagerAnalysis } from '../components/manager/ManagerAnalysis';
import { PageTitle } from '../components/ui/Titles';
import { MissingResult } from '../components/MissingResult';
import { AnalysisBlock } from '../components/ai/AnalysisBlock';

export default function ManagerCard() {
  const { id } = useParams();
  const [records] = useState(() => allProfiles(loadResults()));
  const record = records.find((item) => item.id === id);
  if (!record) return <MissingResult />;
  const previous = firstPrevious(records, record);
  return (
    <main className="wrap dashboard-page">
      <div className="manager-page-links">
        <Link to="/team">← {ru.dashboard.backTeam}</Link>
        {isDemoRecord(record) && <span className="demo-badge">{ru.dashboard.demo}</span>}
      </div>
      <PageTitle>{ru.dashboard.managerTitle}</PageTitle>
      <div className="manager-card card">
        <ManagerSidebar record={record} previous={previous} />
        <div className="manager-detail">
          <AcademyRoute />
          <DynamicsSection current={record} previous={previous} />
          <ManagerAnalysis record={record} previous={previous} />
          <AnalysisBlock key={record.id} record={record} manager />
          <div className="manager-audience">
            <p>{ru.dashboard.employeeView}</p>
            <p>{ru.dashboard.managerView}</p>
          </div>
        </div>
      </div>
      <p className="manager-disclaimer">{ru.dashboard.managerDisclaimer}</p>
    </main>
  );
}
