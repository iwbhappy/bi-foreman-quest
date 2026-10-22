import { it, expect } from 'vitest';
import { resolveSkin } from '../lib/skin';
it('ignores all legacy skin fields and migrates the previous pure-white helmet', () => {
  expect(resolveSkin({ helmet: 'green', theme: 'tech', vest: 'blue', outfit: 'hoodie',
    sticker: 'bi', accessory: 'radio', glasses: true })).toEqual({ helmet: 'green', theme: 'tech' });
  expect(resolveSkin(undefined, '#FFFFFF')).toEqual({ helmet: 'white', theme: 'bright' });
});
