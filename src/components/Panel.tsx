import type { ReactNode } from 'react';
import { HEADING_CLASS, PANEL_CLASS } from './styles';

interface PanelProps {
  title: ReactNode;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <div className={PANEL_CLASS}>
      <h2 className={`mb-3 ${HEADING_CLASS}`}>{title}</h2>
      {children}
    </div>
  );
}
