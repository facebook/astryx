import {describe, it, expect} from 'vitest';
import {parseStyleKey} from './parseStyleKey';

describe('parseStyleKey', () => {
  it('returns empty string for base', () => {
    expect(parseStyleKey('base')).toBe('');
  });

  it('converts variant:value to .value', () => {
    expect(parseStyleKey('variant:secondary')).toBe('.secondary');
  });

  it('prefixes numeric values with prop name', () => {
    expect(parseStyleKey('level:1')).toBe('.level-1');
  });

  it('handles compound keys', () => {
    expect(parseStyleKey('variant:destructive+size:sm')).toBe(
      '.destructive.sm',
    );
  });

  it('handles compound with numeric value', () => {
    expect(parseStyleKey('variant:primary+level:2')).toBe('.primary.level-2');
  });
});
