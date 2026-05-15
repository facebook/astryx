import {describe, it, expect} from 'vitest';
import {expandColorScale} from './expandColorScale';
import {defineTheme} from './defineTheme';

describe('expandColorScale', () => {
  it('produces all expected token keys', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    const expectedKeys = [
      '--color-accent',
      '--color-accent-muted',
      '--color-on-accent',
      '--color-neutral',
      '--color-background-surface',
      '--color-background-body',
      '--color-overlay',
      '--color-overlay-hover',
      '--color-overlay-pressed',
      '--color-background-muted',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-text-disabled',
      '--color-text-accent',
      '--color-icon-accent',
      '--color-icon-primary',
      '--color-icon-secondary',
      '--color-icon-disabled',
      '--color-background-card',
      '--color-background-popover',
      '--color-background-inverted',
      '--color-border',
      '--color-border-emphasized',
      '--color-skeleton',
      '--color-track',
      '--color-shadow',
      '--color-tint-hover',
    ];
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key);
    }
  });

  it('all values are strings', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    for (const value of Object.values(tokens)) {
      expect(typeof value).toBe('string');
    }
  });

  it('neutralStyle variants produce different --color-neutral values', () => {
    const warm = expandColorScale({accent: '#0064E0', neutralStyle: 'warm'});
    const cool = expandColorScale({accent: '#0064E0', neutralStyle: 'cool'});
    const neutral = expandColorScale({
      accent: '#0064E0',
      neutralStyle: 'neutral',
    });
    expect(warm['--color-neutral']).not.toBe(cool['--color-neutral']);
    expect(cool['--color-neutral']).not.toBe(neutral['--color-neutral']);
    expect(warm['--color-neutral']).not.toBe(neutral['--color-neutral']);
  });

  it('contrast high produces different --color-text-primary than standard', () => {
    const standard = expandColorScale({
      accent: '#0064E0',
      contrast: 'standard',
    });
    const high = expandColorScale({accent: '#0064E0', contrast: 'high'});
    expect(high['--color-text-primary']).not.toBe(
      standard['--color-text-primary'],
    );
  });
});

describe('expandColorScale + defineTheme integration', () => {
  it('explicit token overrides win over generated values', () => {
    const theme = defineTheme({
      name: 'test-override',
      color: {accent: '#0064E0'},
      tokens: {'--color-accent': 'red'},
    });
    expect(theme.tokens['--color-accent']).toBe('red');
  });
});
