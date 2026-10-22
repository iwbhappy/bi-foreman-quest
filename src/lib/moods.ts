export type Mood = 'happy' | 'neutral' | 'doubt' | 'angry' | 'thumbs';
const groups: Record<Mood, string[]> = {
  happy: ['😊', '🙂'], neutral: ['😐'], doubt: ['😒', '😟', '😮'],
  angry: ['😠'], thumbs: ['👍', '🙏'],
};
export function moodFor(emoji: string): Mood {
  return (Object.keys(groups) as Mood[]).find((key) => groups[key].includes(emoji)) ?? 'neutral';
}
export const plainText = (text: string) => text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim();

