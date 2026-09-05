import { describe, expect, it } from 'vitest';
import { postSlug, projectSlug, stripDatePrefix } from './slugs';

describe('stripDatePrefix', () => {
  it('removes YYYY-MM-DD- prefix', () => {
    expect(stripDatePrefix('2026-03-15-why-i-started')).toBe('why-i-started');
  });
  it('keeps names without a date prefix', () => {
    expect(stripDatePrefix('why-i-started')).toBe('why-i-started');
  });
});

describe('postSlug', () => {
  it('uses the last path segment without the date', () => {
    expect(postSlug('minimum-wage/2026-03-15-why-i-started')).toBe('why-i-started');
  });
  it('works for flat note ids', () => {
    expect(postSlug('2026-06-15-on-interest')).toBe('on-interest');
  });
});

describe('projectSlug', () => {
  it('uses the first path segment', () => {
    expect(projectSlug('minimum-wage/index')).toBe('minimum-wage');
    expect(projectSlug('minimum-wage/2026-03-15-why-i-started')).toBe('minimum-wage');
  });
});
