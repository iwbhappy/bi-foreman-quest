import type { ComponentType } from 'react';
import type { StageEventId, StageStep } from '../../../../data/stageEvents';
import { CrewIdle, CrewWork, CrewMove, StopWork, Meeting, TeamCheer, NpcLeave, NpcMood } from './CrewEvents';
import { MixerArrive, MixerLeave, TruckDelivery, PourConcrete, SlumpTest, Samples } from './VehicleEvents';
import { Document, Blueprint, Analysis, Calendar, PhoneCall, InspectorCheck, Idea } from './DocumentEvents';
import { SafetyFix, AnchorAdd, Tablet, TabletGlitch, NightWork } from './SafetyTechEvents';

const renderers: Record<StageEventId, ComponentType> = {
  crew_idle: CrewIdle,
  crew_work: CrewWork,
  crew_move: CrewMove,
  stop_work: StopWork,
  mixer_arrive: MixerArrive,
  mixer_leave: MixerLeave,
  pour_concrete: PourConcrete,
  slump_test: SlumpTest,
  samples: Samples,
  inspector_check: InspectorCheck,
  document: Document,
  phone_call: PhoneCall,
  meeting: Meeting,
  blueprint: Blueprint,
  analysis: Analysis,
  safety_fix: SafetyFix,
  anchor_add: AnchorAdd,
  truck_delivery: TruckDelivery,
  calendar: Calendar,
  night_work: NightWork,
  tablet: Tablet,
  tablet_glitch: TabletGlitch,
  idea: Idea,
  team_cheer: TeamCheer,
  npc_leave: NpcLeave,
  npc_mood: NpcMood,
};
// Иллюстрация события. Подпись рисует врезка события в QuestStage.
export function StageEvent({ step, final = false }: { step: StageStep; final?: boolean }) {
  const Event = renderers[step.id];
  return (
    <g
      className={`stage-event ${final ? 'event-final' : ''} ${step.alert ? 'event-alert' : ''}`}
      data-stage-event={step.id}
    >
      <g className="stage-event-body">
        <Event />
      </g>
    </g>
  );
}
