import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';

// Воспроизводимый подбор готовых ответов. Банк и алгоритм оценки только читаются.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { questions } = await server.ssrLoadModule('/src/data/questions.ts');
  const { calculate } = await server.ssrLoadModule('/src/lib/scoring.ts');
  const { getArchetype } = await server.ssrLoadModule('/src/lib/archetype.ts');
  const { weakestTrait } = await server.ssrLoadModule('/src/lib/team.ts');
  const traits = ['critical', 'confidence', 'discipline', 'engagement'];
  let seed = 20261019;
  const random = (n) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor((seed / 4294967296) * n);
  };
  function profile(pattern, likert) {
    let s = 0,
      l = 0;
    const answers = Object.fromEntries(
      questions.map((q) => [q.id, q.type === 'situation' ? pattern[s++] : likert[l++]]),
    );
    const result = calculate(answers);
    return {
      pattern,
      likert,
      ...result,
      archetype: getArchetype(result.percents),
      weak: weakestTrait(result.percents),
    };
  }
  function candidate() {
    const pattern = Array.from({ length: 11 }, () => 'ABCD'[random(4)]).join('');
    const likert = Array.from({ length: 4 }, () => 1 + random(5));
    return profile(pattern, likert);
  }
  const valid = (p) =>
    new Set(p.pattern).size >= 3 &&
    new Set(p.likert).size >= 2 &&
    p.overall >= 38 &&
    p.overall <= 75 &&
    Object.values(p.percents).every((value) => value >= 30 && value <= 85);
  function mutate(first) {
    const pattern = [...first.pattern];
    const indices = new Set();
    const count = 2 + random(3);
    while (indices.size < count) indices.add(random(11));
    for (const i of indices) {
      const letters = [...'ABCD'].filter((letter) => letter !== pattern[i]);
      pattern[i] = letters[random(3)];
    }
    const likert = [...first.likert];
    if (random(2)) {
      const i = random(4);
      const values = [1, 2, 3, 4, 5].filter((value) => value !== likert[i]);
      likert[i] = values[random(4)];
    }
    return profile(pattern.join(''), likert);
  }
  function pair(accept) {
    for (let i = 0; i < 300000; i++) {
      const first = candidate();
      if (!valid(first)) continue;
      const last = mutate(first);
      if (!valid(last)) continue;
      const deltas = traits.map((trait) => last.percents[trait] - first.percents[trait]);
      const delta = last.overall - first.overall;
      if (deltas.every((value) => Math.abs(value) <= 15) && accept(last, delta, deltas)) return [first, last];
    }
    throw new Error('Не найден подходящий набор');
  }
  const pairs = [
    pair(
      (p, d, ds) =>
        d >= 5 &&
        d <= 12 &&
        p.overall >= 55 &&
        p.overall <= 72 &&
        ds.filter((v) => v < 0).length === 1 &&
        ds.some((v) => v >= -6 && v <= -3) &&
        ds.filter((v) => v > 0).length >= 2,
    ),
    pair((p, d) => d >= 2 && d <= 8),
    pair((p, d) => d >= -6 && d <= -2),
  ];
  const pool = [];
  for (let i = 0; i < 12000; i++) {
    const p = candidate();
    if (valid(p)) pool.push(p);
  }
  const emojis = ['🦉', '🐻', '🦫', '🐺', '🦊'];
  function fill(selected) {
    const counts = Object.fromEntries(traits.map((trait) => [trait, selected.filter((p) => p.weak === trait).length]));
    if (Math.max(...Object.values(counts)) > 3) return;
    if (selected.length === 8) {
      if (Object.values(counts).every((n) => n >= 1) && new Set(selected.map((p) => p.archetype.emoji)).size === 5)
        return selected;
      return;
    }
    const missing = emojis.filter((emoji) => !selected.some((p) => p.archetype.emoji === emoji));
    const options = pool.filter(
      (p) => counts[p.weak] < 2 && selected.filter((q) => q.overall === p.overall).length < 2,
    );
    options.sort(
      (a, b) =>
        Number(missing.includes(b.archetype.emoji)) - Number(missing.includes(a.archetype.emoji)) ||
        counts[a.weak] - counts[b.weak],
    );
    const visited = new Set();
    for (const p of options) {
      const key = [p.weak, p.archetype.emoji, p.overall].join(':');
      if (visited.has(key)) continue;
      visited.add(key);
      const result = fill([...selected, p]);
      if (result) return result;
    }
  }
  const selected = fill(pairs.map((p) => p[1]));
  if (!selected) throw new Error('Не удалось распределить команду');
  const attempts = [...pairs, ...selected.slice(3).map((p) => [p])];
  mkdirSync('artifacts/polish', { recursive: true });
  writeFileSync('artifacts/polish/selected-demo.json', JSON.stringify(attempts, null, 2));
  process.stdout.write(
    JSON.stringify(
      attempts.map((person) =>
        person.map((p) => ({
          pattern: p.pattern,
          likert: p.likert,
          percents: p.percents,
          overall: p.overall,
          archetype: p.archetype.name,
          emoji: p.archetype.emoji,
          weak: p.weak,
        })),
      ),
      null,
      2,
    ) + '\n',
  );
} finally {
  await server.close();
}
