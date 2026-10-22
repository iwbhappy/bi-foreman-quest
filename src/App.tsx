import { useSyncExternalStore } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { ru } from './i18n/ru';
import { clearMyData, storageUnavailable, subscribeStorage } from './lib/storage';
import Landing from './pages/Landing';
import Test from './pages/Test';
import Result from './pages/Result';
import QuestStart from './pages/QuestStart';
import QuestPlay from './pages/QuestPlay';
import QuestReport from './pages/QuestReport';
import ClassicStart from './pages/ClassicStart';
import ManagerCard from './pages/ManagerCard';
import Team from './pages/Team';
import Method from './pages/Method';
export default function App() {
  const unavailable = useSyncExternalStore(subscribeStorage, storageUnavailable);
  return (
    <div className="app-shell">
      <header className="site-header no-print">
        <div className="wrap flex h-full items-center justify-between gap-5">
          <Link to="/" className="brand">
            {ru.brand.split(' ')[0]}
            <span>{ru.brand.split(' ')[1]}</span>
            <span className="brand-dot" />
          </Link>
          <nav className="site-nav" aria-label={ru.brand}>
            <Link to="/team">{ru.dashboard.team}</Link>
            <Link to="/method">{ru.dashboard.method}</Link>
          </nav>
        </div>
      </header>
      {unavailable && (
        <p className="storage-warning wrap" role="status">
          {ru.storageWarning}
        </p>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/start" element={<ClassicStart />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/quest" element={<Navigate to="/quest/start" replace />} />
        <Route path="/quest/start" element={<QuestStart />} />
        <Route path="/quest/play" element={<QuestPlay />} />
        <Route path="/quest/report" element={<QuestReport />} />
        <Route path="/manager/:id" element={<ManagerCard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/method" element={<Method />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="site-footer wrap">
        <span>{ru.brand}</span>
        <span className="no-print text-slate-400">{ru.privacy}</span>
        <nav className="footer-nav no-print">
          <button className="btn-link" onClick={() => {
            if (window.confirm(ru.confirmDelete)) { clearMyData(); window.location.assign('/'); }
          }}>{ru.deleteData}</button>
          <Link to="/method">{ru.dashboard.method}</Link>
          <Link to="/team">{ru.dashboard.team}</Link>
        </nav>
      </footer>
    </div>
  );
}
