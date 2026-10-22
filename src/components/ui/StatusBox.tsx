import type { ReactNode } from 'react';
export function StatusBox({ kind, title, children }: { kind: 'strength' | 'growth'; title: string; children: ReactNode }) {
  return <section className={'status-box analysis-card ' + kind + '-card'}><h2>{title}</h2>{children}</section>;
}
export function NavyPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <aside className={'navy-panel ' + className}>{children}</aside>;
}

