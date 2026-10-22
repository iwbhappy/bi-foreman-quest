export const PROFILES = {
  orange: { core: [15, 48, .45, .80], edge: [10, 52, .20, .45], regrow: [18, 42, .88, .62] },
  blue: { core: [195, 232, .40, .45], edge: [185, 240, .20, .30], regrow: [195, 232, .60, .35] },
};
export const TARGETS = {
  orange: [242, 140, 40], white: [236, 239, 243], blue: [22, 104, 184],
  yellow: [242, 194, 48], red: [217, 74, 58], green: [46, 158, 91],
};
function hsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), range = max - min;
  if (min === max) return [0, 0, max];
  const rc = (max - r) / range, gc = (max - g) / range, bc = (max - b) / range;
  let h = (r === max ? bc - gc : g === max ? 2 + rc - bc : 4 + gc - rc) / 6;
  h %= 1; if (h < 0) h += 1;
  return [h, range / max, max];
}
function rgb(h, s, v) {
  if (s === 0) return [v, v, v];
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
}
function round(value) {
  const floor = Math.floor(value), fraction = value - floor;
  return fraction === .5 ? floor + (floor % 2) : Math.round(value);
}
export function helmetMask(data, width, height, profile = 'orange') {
  const rules = PROFILES[profile], limit = Math.floor(height * .45);
  const mask = new Uint8Array(width * limit), queue = new Int32Array(mask.length);
  const hsvs = new Float64Array(width * limit * 3);
  for (let i = 0; i < mask.length; i++) hsvs.set(hsv(data[i * 4] / 255,
    data[i * 4 + 1] / 255, data[i * 4 + 2] / 255), i * 3);
  const match = (i, rule, alpha) => data[i * 4 + 3] >= alpha
    && hsvs[i * 3] * 360 >= rule[0] && hsvs[i * 3] * 360 <= rule[1]
    && hsvs[i * 3 + 1] >= rule[2] && hsvs[i * 3 + 2] >= rule[3];
  let seed = -1;
  outer: for (let y = 0; y < limit; y++) {
    for (let dx = 0; dx < Math.floor(width / 4); dx++) {
      for (const x of [Math.floor(width / 2) - dx, Math.floor(width / 2) + dx]) {
        if (x >= 0 && x < width && match(y * width + x, rules.core, 200)) {
          seed = y * width + x; break outer;
        }
      }
    }
  }
  if (seed < 0) throw new Error('Helmet seed not found');
  let head = 0, tail = 1; queue[0] = seed; mask[seed] = 1;
  const visit = (i) => { if (!mask[i] && match(i, rules.core, 200)) { mask[i] = 1; queue[tail++] = i; } };
  while (head < tail) {
    const i = queue[head++], x = i % width, y = Math.floor(i / width);
    if (x + 1 < width) visit(i + 1); if (x > 0) visit(i - 1);
    if (y + 1 < limit) visit(i + width); if (y > 0) visit(i - width);
  }
  const widths = Array.from({ length: limit }, (_, y) =>
    mask.subarray(y * width, (y + 1) * width).reduce((a, b) => a + b, 0));
  const max = Math.max(...widths), brimRows = widths.flatMap((count, y) => count >= .85 * max ? [y] : []);
  const brimBottom = brimRows.at(-1);
  mask.fill(0, (brimBottom + 3) * width);
  for (let y = brimBottom + 3; y < Math.min(limit, brimBottom + 17); y++) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (!mask[i] && match(i, rules.regrow, 200)
          && (mask[i - width] || (x > 0 && mask[i - 1]) || (x < width - 1 && mask[i + 1]))) {
          mask[i] = 1; changed = true;
        }
      }
    }
  }
  let bottom = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i]) bottom = Math.floor(i / width);
  for (let pass = 0; pass < 2; pass++) {
    const grow = [];
    for (let y = 1; y < Math.min(limit - 1, bottom + 2); y++) for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!mask[i] && match(i, rules.edge, 40)
        && (mask[i - width] || mask[i + width] || mask[i - 1] || mask[i + 1])) grow.push(i);
    }
    for (const i of grow) mask[i] = 1;
  }
  return { mask, limit, hsvs, match, profile };
}
export function recolor(data, target, selection) {
  const { mask, hsvs, match, profile } = selection;
  if (target === profile) return Buffer.from(data);
  const out = Buffer.from(data), saturations = [], values = [];
  for (let i = 0; i < mask.length; i++) if (mask[i] && match(i, PROFILES[profile].core, 200)) {
    saturations.push(hsvs[i * 3 + 1]); values.push(hsvs[i * 3 + 2]);
  }
  saturations.sort((a, b) => a - b); values.sort((a, b) => a - b);
  const sRef = saturations[Math.floor(saturations.length / 2)], vRef = values[Math.floor(values.length / 2)];
  const [th, ts, tv] = hsv(...TARGETS[target].map((c) => c / 255));
  for (let i = 0; i < mask.length; i++) if (mask[i]) {
    const s = hsvs[i * 3 + 1], v = hsvs[i * 3 + 2], k = Math.min(1, s / sRef);
    const ns = ts * Math.min(1.25, s / sRef), nv = Math.max(0, Math.min(1, tv * (v / vRef)));
    const color = rgb(th, Math.min(1, ns), nv);
    for (let c = 0; c < 3; c++) out[i * 4 + c] = round(data[i * 4 + c] * (1 - k) + color[c] * 255 * k);
  }
  return out;
}
export function validateColor(base, colored, width, height, { mask, limit }) {
  let alphaDifferences = 0, outsideDifferences = 0, area = 0, bottom = 0, visible = 0;
  for (let i = 0; i < width * height; i++) {
    if (base[i * 4 + 3] > 0) visible++;
    if (base[i * 4 + 3] !== colored[i * 4 + 3]) alphaDifferences++;
    if (mask[i]) { area++; bottom = Math.floor(i / width); }
    else if ([0, 1, 2].some((c) => base[i * 4 + c] !== colored[i * 4 + c])) outsideDifferences++;
  }
  const maskShare = area / visible;
  return { alphaDifferences, outsideDifferences, maskShare, maskBoxShare: area / (width * height),
    maskBottomShare: (bottom + 1) / height,
    pass: !alphaDifferences && !outsideDifferences && maskShare >= .1 && maskShare <= .35 && bottom < limit };
}
