// Постобработка сгенерированных персонажей: шум, тень, замкнутые дырки значка, оторванные куски, обрезка.
export function alphaBounds(data, width, height) {
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
    }
  }
  if (x1 <= x0 || y1 <= y0) throw new Error('Empty character image');
  return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
}

export function removeShadow(data, width, height) {
  const box = alphaBounds(data, width, height);
  const bottom = box.top + box.height;
  let removed = 0;
  for (let y = Math.floor(bottom - box.height * 0.09); y < bottom; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const index = (y * width + x) * 4;
      const [r, g, b, alpha] = data.subarray(index, index + 4);
      if (alpha === 0) continue;
      const max = Math.max(r, g, b);
      const saturation = max ? (max - Math.min(r, g, b)) / max : 0;
      if (alpha < 240 || saturation < 0.18) { data[index + 3] = 0; removed++; }
    }
  }
  return removed;
}

export function fillBadgeHoles(data, width, height, topShare = 0.35) {
  const box = alphaBounds(data, width, height);
  const top = Math.floor(box.top + box.height * topShare);
  const size = width * top;
  const outside = new Uint8Array(size);
  const done = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0, tail = 0;
  function pushOutside(index) {
    if (!outside[index] && data[index * 4 + 3] < 250) {
      outside[index] = 1; queue[tail++] = index;
    }
  }
  for (let x = 0; x < width; x++) pushOutside(x);
  for (let y = 0; y < top; y++) { pushOutside(y * width); pushOutside(y * width + width - 1); }
  function neighbors(index, visit) {
    const x = index % width;
    if (x + 1 < width) visit(index + 1);
    if (x > 0) visit(index - 1);
    if (index + width < size) visit(index + width);
    if (index >= width) visit(index - width);
  }
  while (head < tail) neighbors(queue[head++], pushOutside);
  const limit = box.width * box.height * 0.03;
  let filled = 0;
  for (let y = box.top; y < top; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const start = y * width + x;
      if (data[start * 4 + 3] >= 250 || outside[start] || done[start]) continue;
      head = 0; tail = 1; queue[0] = start; done[start] = 1;
      let touchesCut = false;
      const visit = (index) => {
        if (!done[index] && !outside[index] && data[index * 4 + 3] < 250) {
          done[index] = 1; queue[tail++] = index;
        }
      };
      while (head < tail) {
        const current = queue[head++];
        if (Math.floor(current / width) === top - 1) touchesCut = true;
        neighbors(current, visit);
      }
      if (tail >= limit || touchesCut) continue;
      for (let i = 0; i < tail; i++) {
        const offset = queue[i] * 4;
        const k = data[offset + 3] / 255;
        for (let channel = 0; channel < 3; channel++) {
          data[offset + channel] = Math.floor(data[offset + channel] * k + 255 * (1 - k));
        }
        data[offset + 3] = 255;
      }
      filled += tail;
    }
  }
  return filled;
}

export function helmetSemiShare(data, width, height) {
  const box = alphaBounds(data, width, height);
  const bottom = Math.floor(box.top + box.height * 0.2);
  let visible = 0, semi = 0;
  for (let y = box.top; y < bottom; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) visible++;
      if (alpha > 10 && alpha < 235) semi++;
    }
  }
  return semi / Math.max(visible, 1);
}

export function groundSuspected(data, width, height) {
  const box = alphaBounds(data, width, height);
  for (let y = Math.floor(box.top + box.height * 0.96); y < box.top + box.height; y++) {
    let opaque = 0;
    for (let x = box.left; x < box.left + box.width; x++) {
      if (data[(y * width + x) * 4 + 3] >= 240) opaque++;
    }
    if (opaque / box.width > 0.7) return true;
  }
  return false;
}

export function clearNoise(data) {
  let removed = 0;
  for (let offset = 3; offset < data.length; offset += 4) {
    if (data[offset] > 0 && data[offset] < 16) { data[offset] = 0; removed++; }
  }
  return removed;
}

export function dropDetached(data, width, height) {
  const size = width * height;
  const seen = new Uint8Array(size);
  const queue = new Int32Array(size);
  const components = [];
  for (let start = 0; start < size; start++) {
    if (seen[start] || data[start * 4 + 3] === 0) continue;
    let head = 0, tail = 1;
    let x0 = width, y0 = height, x1 = 0, y1 = 0;
    queue[0] = start; seen[start] = 1;
    const visit = (index) => {
      if (!seen[index] && data[index * 4 + 3] > 0) { seen[index] = 1; queue[tail++] = index; }
    };
    while (head < tail) {
      const index = queue[head++];
      const x = index % width, y = Math.floor(index / width);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      if (x + 1 < width) visit(index + 1);
      if (x > 0) visit(index - 1);
      if (y + 1 < height) visit(index + width);
      if (y > 0) visit(index - width);
    }
    components.push({ points: queue.slice(0, tail), size: tail, x0, x1, y0, y1 });
  }
  components.sort((a, b) => b.size - a.size);
  const main = components[0];
  if (!main) throw new Error('Empty character image');
  const bandTop = main.y1 - (main.y1 - main.y0) * 0.12;
  let removed = 0;
  for (const part of components.slice(1)) {
    const small = part.size < main.size * 0.005;
    const distance = Math.max(main.x0 - part.x1, part.x0 - main.x1,
      main.y0 - part.y1, part.y0 - main.y1, 0);
    const thin = (part.x1 - part.x0 <= 3 || part.y1 - part.y0 <= 3)
      && Math.max(part.x1 - part.x0, part.y1 - part.y0) > 50;
    if ((distance > 8 && small) || thin || (part.y0 >= bandTop && small)) {
      for (const index of part.points) data[index * 4 + 3] = 0;
      removed += part.size;
    }
  }
  return removed;
}

export function postprocess(data, width, height, face = false) {
  const noisePixelsRemoved = clearNoise(data);
  const helmetBefore = helmetSemiShare(data, width, height);
  const shadowPixelsRemoved = removeShadow(data, width, height);
  const badgePixelsFilled = fillBadgeHoles(data, width, height, face ? 0.55 : 0.35);
  const detachedPixelsRemoved = dropDetached(data, width, height);
  const helmetAfter = helmetSemiShare(data, width, height);
  return { noisePixelsRemoved, shadowPixelsRemoved, badgePixelsFilled, detachedPixelsRemoved, helmetBefore, helmetAfter,
    helmetPass: helmetAfter < 0.05, groundSuspected: groundSuspected(data, width, height) };
}
