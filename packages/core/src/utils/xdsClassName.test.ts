import {describe, it, expect} from 'vitest';
import {xdsClassName} from './xdsClassName';

describe('xdsClassName', () => {
  it('returns base class for component', () => {
    expect(xdsClassName('card')).toBe('xds-card');
  });

  it('adds variant classes', () => {
    expect(xdsClassName('button', {variant: 'secondary', size: 'sm'})).toBe(
      'xds-button secondary sm',
    );
  });

  it('prefixes numeric values with prop name', () => {
    expect(xdsClassName('heading', {level: 1})).toBe('xds-heading level-1');
  });

  it('skips null and undefined props', () => {
    expect(xdsClassName('button', {variant: 'primary', size: undefined})).toBe(
      'xds-button primary',
    );
  });

  it('works with no props', () => {
    expect(xdsClassName('divider')).toBe('xds-divider');
  });

  it('handles string numeric values', () => {
    expect(xdsClassName('heading', {level: '3'})).toBe('xds-heading level-3');
  });
});
