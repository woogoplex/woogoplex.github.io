import { describe, expect, it } from 'vitest';
import { coverFromPosts } from './covers';

describe('coverFromPosts', () => {
  it('uses the folder name as the title and the earliest post as the start month', () => {
    const cover = coverFromPosts('AQT', [new Date('2026-10-02'), new Date('2026-09-19')]);
    expect(cover).toEqual({ title: 'AQT', description: '', started: '2026-09', status: 'active' });
  });

  it('pads the month', () => {
    expect(coverFromPosts('x', [new Date('2026-01-05')]).started).toBe('2026-01');
  });

  it('falls back to now when there are no posts', () => {
    expect(coverFromPosts('x', []).started).toMatch(/^\d{4}-\d{2}$/);
  });
});
