import { useEffect } from 'react';
import { Router } from './lib/router';
import { initSmoothScroll } from './lib/smooth';
import { Cursor } from './components/Chrome';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { QueryGate } from './pages/cases/QueryGate';
import { SqlClassifier } from './pages/cases/SqlClassifier';
import { Exploration } from './pages/cases/Exploration';
import { OfflineDeploy } from './pages/cases/OfflineDeploy';

const ROUTES: Record<string, () => React.JSX.Element> = {
  '/': Home,
  '/work/query-gate': QueryGate,
  '/work/sql-classifier': SqlClassifier,
  '/work/exploration': Exploration,
  '/work/offline-deploy': OfflineDeploy,
};

export default function App() {
  useEffect(() => { initSmoothScroll(); }, []);
  return (
    <>
      <Router>{(path) => { const Page = ROUTES[path] ?? NotFound; return <Page key={path} />; }}</Router>
      <Cursor />
    </>
  );
}
