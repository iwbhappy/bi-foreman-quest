import { NPCS } from '../../data/quest';
import { npcAvatarUrl } from '../../data/art';
import { Avatar } from '../ui/Art';
export function NpcBubble({ npcId, text }: { npcId: string; text: string }) {
  const npc = NPCS[npcId];
  return <div className="npc-line"><Avatar src={npcAvatarUrl(npcId)} alt="" size={40} />
    <div className="npc-copy"><p className="npc-name">{npc.name}<span> · {npc.role}</span></p>
      <blockquote className="npc-bubble">«{text}»</blockquote></div></div>;
}

