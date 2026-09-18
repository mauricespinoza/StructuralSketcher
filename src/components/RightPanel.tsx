import { useState } from 'react';
import { LayersPanel } from './LayersPanel';
import { KinematicsPanel } from './KinematicsPanel';
import { AnalysisPanel } from './AnalysisPanel';

type Tab = 'layers' | 'analysis' | 'kinematics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'layers', label: 'Capas' },
  { id: 'analysis', label: 'Análisis' },
  { id: 'kinematics', label: 'Cinemática' },
];

export function RightPanel({ open }: { open: boolean }) {
  const [tab, setTab] = useState<Tab>('layers');

  return (
    <aside className={`right-panel ${open ? 'open' : ''}`}>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="panel-body">
        {tab === 'layers' && <LayersPanel />}
        {tab === 'analysis' && <AnalysisPanel />}
        {tab === 'kinematics' && <KinematicsPanel />}
      </div>
    </aside>
  );
}
