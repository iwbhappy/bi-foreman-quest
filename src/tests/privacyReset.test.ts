import { expect, it, vi } from 'vitest';
import { clearMyData } from '../lib/storage';
it('clears every profile version including AI caches while preserving unrelated local storage', () => {
  const values = new Map([['bi-profile:v1:results', '[]'], ['bi-profile:v1:analysis:1', '{}'],
    ['bi-profile:v2:progress', '{}'], ['another-app', 'keep']]);
  vi.stubGlobal('localStorage', { get length() { return values.size; },
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => values.delete(key) });
  clearMyData();
  expect([...values]).toEqual([['another-app', 'keep']]);
  vi.unstubAllGlobals();
});
