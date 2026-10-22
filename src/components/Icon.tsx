import {
  Search, ShieldCheck, ClipboardCheck, Users, ArrowRight, LockKeyhole, Check, Wrench,
  GraduationCap, UserRoundCheck, FileDown, HardHat, Clock, Ruler, Shuffle, AlertTriangle,
} from 'lucide-react';
const icons = {
  critical: Search, confidence: ShieldCheck, discipline: ClipboardCheck, engagement: Users,
  arrow: ArrowRight, lock: LockKeyhole, check: Check, practice: Wrench, course: GraduationCap,
  mentor: UserRoundCheck, pdf: FileDown, helmet: HardHat, clock: Clock, schedule: Clock,
  quality: Ruler, safety: HardHat, team: Users, random: Shuffle, alert: AlertTriangle,
};
export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const Component = icons[name as keyof typeof icons] ?? Check;
  return <Component aria-hidden="true" strokeWidth={2} className={'icon ' + className} />;
}

