import {describe, it, expect} from 'vitest';
import {expandSpacingScale} from './expandSpacingScale';

describe('expandSpacingScale', () => {
  it('generates default scale (base=4)', () => {
    const tokens = expandSpacingScale({base: 4});
    expect(tokens['--spacing-0']).toBe('0px');
    expect(tokens['--spacing-0-5']).toBe('2px');
    expect(tokens['--spacing-1']).toBe('4px');
    expect(tokens['--spacing-1-5']).toBe('6px');
    expect(tokens['--spacing-2']).toBe('8px');
    expect(tokens['--spacing-3']).toBe('12px');
    expect(tokens['--spacing-4']).toBe('16px');
    expect(tokens['--spacing-5']).toBe('20px');
    expect(tokens['--spacing-6']).toBe('24px');
    expect(tokens['--spacing-8']).toBe('32px');
    expect(tokens['--spacing-12']).toBe('48px');
  });

  it('generates comfortable scale (base=6)', () => {
    const tokens = expandSpacingScale({base: 6});
    expect(tokens['--spacing-0']).toBe('0px');
    expect(tokens['--spacing-0-5']).toBe('3px');
    expect(tokens['--spacing-1']).toBe('6px');
    expect(tokens['--spacing-1-5']).toBe('9px');
    expect(tokens['--spacing-2']).toBe('12px');
    expect(tokens['--spacing-3']).toBe('18px');
    expect(tokens['--spacing-4']).toBe('24px');
  });

  it('generates compact scale (base=3)', () => {
    const tokens = expandSpacingScale({base: 3});
    expect(tokens['--spacing-1']).toBe('3px');
    expect(tokens['--spacing-2']).toBe('6px');
    expect(tokens['--spacing-4']).toBe('12px');
  });

  it('--spacing-0 is always 0px', () => {
    expect(expandSpacingScale({base: 4})['--spacing-0']).toBe('0px');
    expect(expandSpacingScale({base: 8})['--spacing-0']).toBe('0px');
    expect(expandSpacingScale({base: 1})['--spacing-0']).toBe('0px');
  });

  it('rounds fractional results', () => {
    const tokens = expandSpacingScale({base: 5});
    // 5 * 0.5 = 2.5 → 3px (rounded)
    expect(tokens['--spacing-0-5']).toBe('3px');
    // 5 * 1.5 = 7.5 → 8px (rounded)
    expect(tokens['--spacing-1-5']).toBe('8px');
  });

  it('produces all 15 tokens', () => {
    const tokens = expandSpacingScale({base: 4});
    const keys = Object.keys(tokens);
    expect(keys).toHaveLength(15);
    expect(keys).toContain('--spacing-0');
    expect(keys).toContain('--spacing-12');
  });
});
