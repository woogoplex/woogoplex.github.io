import { describe, expect, it } from 'vitest';
import { joinBase } from './url';

describe('joinBase', () => {
  it('joins a subpath base', () => {
    expect(joinBase('/woojin-demo', '/notes/')).toBe('/woojin-demo/notes/');
  });
  it('handles base with trailing slash', () => {
    expect(joinBase('/woojin-demo/', '/notes/')).toBe('/woojin-demo/notes/');
  });
  it('handles root base', () => {
    expect(joinBase('/', '/notes/')).toBe('/notes/');
  });
});
