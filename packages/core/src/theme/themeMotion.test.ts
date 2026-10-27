// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeMotion.test.ts
 * @input vitest, the theme motion knobs, defineTheme and expandMotionScale
 * @output Checks `spec:AST-108` FR1, FR2, FR5 and FR6's resolver: today's
 *   tokens at the defaults, each tempo bound and the clamp, each character's
 *   curves with exits unchanged, `reducedMotion`, a `MotionScaleConfig` that
 *   renders exactly as before and wins over `tempo`, explicit tokens winning
 *   over both, adaptation rules setting the knobs, and `resolveThemeMotion`
 * @position Testing; validates themeMotion.ts and its use in defineTheme
 */

import {describe, expect, it} from 'vitest';
import {defineTheme} from './defineTheme';
import {expandMotionScale} from './expandMotionScale';
import {
  CHARACTER_EASE,
  expandThemeMotion,
  resolveMotionKnobs,
  resolveThemeMotion,
} from './themeMotion';
import {durationDefaults, easeDefaults} from './tokens.stylex';

const TODAY_MS = [130, 175, 230, 310, 410, 550, 730, 975, 1300];
const STANDARD = 'cubic-bezier(0.24, 1, 0.4, 1)';

function durationsMs(tokens: Readonly<Record<string, string>>): number[] {
  return Object.keys(durationDefaults).map(name =>
    Number.parseFloat(tokens[name]),
  );
}

describe('the motion knobs (spec:AST-108 FR1)', () => {
  it('default to tempo 1, standard and system', () => {
    expect(resolveMotionKnobs(undefined)).toEqual({
      tempo: 1,
      character: 'standard',
      reducedMotion: 'system',
      tempoIsSet: false,
    });
  });

  it('clamp tempo to 0.75–1.5 and ignore a value that is no number', () => {
    expect(resolveMotionKnobs({tempo: 0.5}).tempo).toBe(0.75);
    expect(resolveMotionKnobs({tempo: 2}).tempo).toBe(1.5);
    expect(resolveMotionKnobs({tempo: 1.2}).tempo).toBe(1.2);
    expect(resolveMotionKnobs({tempo: Number.NaN})).toMatchObject({
      tempo: 1,
      tempoIsSet: false,
    });
  });

  it('take reducedMotion always, and system otherwise', () => {
    expect(resolveMotionKnobs({reducedMotion: 'always'}).reducedMotion).toBe(
      'always',
    );
    expect(resolveMotionKnobs({reducedMotion: 'system'}).reducedMotion).toBe(
      'system',
    );
  });
});

describe('the CSS motion tokens (spec:AST-108 FR2)', () => {
  it('are today\u2019s at the defaults', () => {
    expect(expandThemeMotion({})).toEqual({});
    const explicit = expandThemeMotion({
      tempo: 1,
      character: 'standard',
      reducedMotion: 'system',
    });
    expect(durationsMs(explicit)).toEqual(TODAY_MS);
    expect(explicit['--ease-entrance']).toBe(STANDARD);
    expect(explicit['--ease-move']).toBe(STANDARD);
    const motion = resolveThemeMotion({});
    expect(durationsMs(motion.durations)).toEqual(TODAY_MS);
    expect(motion.easings).toEqual({
      '--ease-standard': STANDARD,
      '--ease-entrance': STANDARD,
      '--ease-move': STANDARD,
    });
    expect(easeDefaults['--ease-entrance']).toBe(STANDARD);
    expect(easeDefaults['--ease-move']).toBe(STANDARD);
  });

  it.each([0.75, 1.2, 1.5])(
    'scale every duration by tempo %s, to the ms',
    tempo => {
      const tokens = expandThemeMotion({tempo});
      expect(durationsMs(tokens)).toEqual(
        TODAY_MS.map(ms => Math.round(ms * tempo)),
      );
    },
  );

  it('clamp the scale: a tempo of 3 is 1.5', () => {
    expect(durationsMs(expandThemeMotion({tempo: 3}))).toEqual(
      TODAY_MS.map(ms => Math.round(ms * 1.5)),
    );
  });

  it.each(['crisp', 'expressive'] as const)(
    'set the entrance and move curves at %s, and leave the standard and exit curves alone',
    character => {
      const tokens = expandThemeMotion({character});
      expect(tokens['--ease-entrance']).toBe(CHARACTER_EASE[character]);
      expect(tokens['--ease-move']).toBe(CHARACTER_EASE[character]);
      expect(tokens).not.toHaveProperty('--ease-standard');
      expect(tokens).not.toHaveProperty('--ease-exit');
      expect(
        Object.keys(tokens).some(name => name.startsWith('--duration')),
      ).toBe(false);
    },
  );

  it('keep entrances and moves on a theme\u2019s own standard curve at standard', () => {
    const easing = 'cubic-bezier(0.2, 0, 0, 1)';
    const tokens = expandThemeMotion({
      fast: 175,
      medium: 410,
      ratio: 0.75,
      easing,
    });
    expect(tokens['--ease-standard']).toBe(easing);
    expect(tokens['--ease-entrance']).toBe(easing);
    expect(tokens['--ease-move']).toBe(easing);
  });
});

describe('existing motion configuration (spec:AST-108 FR5)', () => {
  const scale = {fast: 100, medium: 250, ratio: 0.75};

  it('a MotionScaleConfig generates exactly what it did', () => {
    expect(expandThemeMotion(scale)).toEqual(expandMotionScale(scale));
  });

  it('implies no tempo for the animator', () => {
    expect(resolveMotionKnobs(scale).tempoIsSet).toBe(false);
  });

  it('its durations win over tempo; tempo scales the durations it leaves out', () => {
    const tokens = expandThemeMotion({...scale, tempo: 1.5});
    expect(tokens).toMatchObject(expandMotionScale(scale));
    // No slow band in the scale: tempo scales today\u2019s.
    expect(tokens['--duration-slow']).toBe(`${Math.round(975 * 1.5)}ms`);
  });

  it('explicit tokens win over the knobs', () => {
    const theme = defineTheme({
      name: 'Knobbed',
      motion: {tempo: 1.5, character: 'crisp'},
      tokens: {'--duration-medium': '300ms', '--ease-entrance': 'linear'},
    });
    expect(theme.tokens['--duration-medium']).toBe('300ms');
    expect(theme.tokens['--ease-entrance']).toBe('linear');
    expect(theme.tokens['--duration-fast']).toBe(`${Math.round(175 * 1.5)}ms`);
    expect(theme.tokens['--ease-move']).toBe(CHARACTER_EASE.crisp);
  });

  it('a child theme keeps each knob it leaves out and can set one back to its default', () => {
    const base = defineTheme({
      name: 'SlowCrisp',
      motion: {tempo: 0.8, character: 'crisp'},
    });
    const quicker = defineTheme({
      name: 'SlowCrispChild',
      extends: base,
      motion: {tempo: 1.2},
    });
    expect(quicker.tokens['--duration-medium']).toBe(
      `${Math.round(410 * 1.2)}ms`,
    );
    expect(quicker.tokens['--ease-entrance']).toBe(CHARACTER_EASE.crisp);
    const reset = defineTheme({
      name: 'SlowCrispReset',
      extends: base,
      motion: {tempo: 1, character: 'standard'},
    });
    expect(reset.tokens['--duration-medium']).toBe('410ms');
    expect(reset.tokens['--ease-entrance']).toBe(STANDARD);
  });

  it('a theme with no motion writes no motion token, so it renders as before', () => {
    const plain = defineTheme({name: 'Plain'});
    expect(
      Object.keys(plain.tokens).filter(
        name => name.startsWith('--duration') || name.startsWith('--ease'),
      ),
    ).toEqual([]);
  });

  it('an adaptation rule sets tempo and character like any motion value', () => {
    const theme = defineTheme({
      name: 'Adaptive',
      adaptations: {
        rules: [{when: {pointer: 'coarse'}, value: {motion: {tempo: 0.8}}}],
      },
    });
    const css = JSON.stringify(theme);
    expect(css).toContain(`${Math.round(410 * 0.8)}ms`);
  });

  it('an adaptation rule cannot set reducedMotion, a theme-wide setting', () => {
    expect(() =>
      defineTheme({
        name: 'Bad',
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {
                motion: {reducedMotion: 'always'} as never,
              },
            },
          ],
        },
      }),
    ).toThrow(/reducedMotion is a theme-wide setting/);
  });
});

describe('resolveThemeMotion (spec:AST-108 FR6)', () => {
  it('returns the knobs, durations and easings with explicit tokens applied', () => {
    const motion = resolveThemeMotion({
      motion: {tempo: 1.2, character: 'expressive', reducedMotion: 'always'},
      tokens: {'--duration-fast': '200ms'},
    });
    expect(motion.knobs).toEqual({
      tempo: 1.2,
      character: 'expressive',
      reducedMotion: 'always',
      tempoIsSet: true,
    });
    expect(motion.durations['--duration-fast']).toBe('200ms');
    expect(motion.durations['--duration-medium']).toBe(
      `${Math.round(410 * 1.2)}ms`,
    );
    expect(motion.easings['--ease-entrance']).toBe(CHARACTER_EASE.expressive);
    expect(motion.easings['--ease-standard']).toBe(STANDARD);
  });
});
