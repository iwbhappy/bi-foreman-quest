import type { ReactNode } from 'react';
export function PageTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return <div className="page-title">{eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{children}</h1><div className="title-rule" /></div>;
}
export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="section-title-wrap"><h2 className="section-title">{children}</h2>
    <div className="title-rule" /></div>;
}

