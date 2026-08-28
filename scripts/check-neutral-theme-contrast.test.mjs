// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Neutral theme component-pair contrast guard.
 * @input The maintained neutral theme's control-boundary, Switch, and
 *   ProgressBar theme overrides.
 * @output Fails when a meaningful non-text pair falls below WCAG 2.2 AA 3:1
 *   in either color scheme, or when the theme returns to deprecated targets.
 * @position Repo-level theme guard, sibling of the other scripts/check-*.
 */

import {describe, expect, it} from 'vitest';
import {neutralTheme} from '../packages/themes/neutral/src/neutralTheme.ts';
import {contrastRatio} from '../packages/core/src/theme/contrast.ts';

const MODES = [
  {name: 'light', index: 0},
  {name: 'dark', index: 1},
];
const AA_NON_TEXT = 3;
const AA_TEXT = 4.5;

/** Split `a, b` at the top level, ignoring commas nested in parentheses. */
function splitArgs(input) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (const char of input) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
}

/** Resolve `light-dark()` and component-local/global `var()` references. */
function resolve(value, modeIndex, local = {}, seen = new Set()) {
  if (typeof value !== 'string') {
    throw new Error(`expected a color string, got ${String(value)}`);
  }
  const expression = value.trim();
  if (expression.startsWith('light-dark(')) {
    const choices = splitArgs(expression.slice('light-dark('.length, -1));
    return resolve(choices[modeIndex], modeIndex, local, seen);
  }
  if (expression.startsWith('var(')) {
    const [name, fallback] = splitArgs(expression.slice('var('.length, -1));
    if (seen.has(name)) throw new Error(`token cycle at ${name}`);
    const next = local[name] ?? neutralTheme.tokens?.[name] ?? fallback;
    if (next == null) throw new Error(`could not resolve ${name}`);
    return resolve(next, modeIndex, local, new Set([...seen, name]));
  }
  return expression;
}

function expectPairToPass(foreground, background, modeIndex, local = {}) {
  const fg = resolve(foreground, modeIndex, local);
  const bg = resolve(background, modeIndex, local);
  expect(
    contrastRatio(fg, bg),
    `${fg} on ${bg} should meet ${AA_NON_TEXT}:1`,
  ).toBeGreaterThanOrEqual(AA_NON_TEXT);
}

function parseHex(color) {
  if (color === 'black') return {rgb: [0, 0, 0], alpha: 1};
  if (color === 'white') return {rgb: [255, 255, 255], alpha: 1};
  const hex = color.replace('#', '');
  return {
    rgb: [0, 2, 4].map(index =>
      Number.parseInt(hex.slice(index, index + 2), 16),
    ),
    alpha: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function composite(foreground, background) {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  return `#${fg.rgb
    .map((channel, index) =>
      Math.round(channel * fg.alpha + bg.rgb[index] * (1 - fg.alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function mix(base, tint, tintWeight) {
  const baseColor = parseHex(base);
  const tintColor = parseHex(tint);
  return `#${baseColor.rgb
    .map((channel, index) =>
      Math.round(channel * (1 - tintWeight) + tintColor.rgb[index] * tintWeight)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

describe('neutral theme component-pair contrast', () => {
  it('uses canonical component target names', () => {
    expect(neutralTheme.components['status-dot']).toBeDefined();
    expect(neutralTheme.components['progress-bar']).toBeDefined();
    expect(neutralTheme.components.statusdot).toBeUndefined();
    expect(neutralTheme.components.progressbar).toBeUndefined();
  });

  it.each(MODES)(
    'keeps Card content readable across every background in $name mode',
    ({index}) => {
      const body = resolve('var(--color-background-body)', index);
      const foreground = resolve('var(--color-text-primary)', index);
      const backgrounds = {
        default: 'var(--color-background-card)',
        transparent: null,
        muted: 'var(--color-background-muted)',
        blue: 'var(--color-background-blue)',
        cyan: 'var(--color-background-cyan)',
        gray: 'var(--color-background-gray)',
        green: 'var(--color-background-green)',
        orange: 'var(--color-background-orange)',
        pink: 'var(--color-background-pink)',
        purple: 'var(--color-background-purple)',
        red: 'var(--color-background-red)',
        teal: 'var(--color-background-teal)',
        yellow: 'var(--color-background-yellow)',
      };

      for (const [variant, token] of Object.entries(backgrounds)) {
        const background = token
          ? composite(resolve(token, index), body)
          : body;
        expect(
          contrastRatio(foreground, background),
          `${variant} Card text should contrast with ${background}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }
    },
  );

  it.each(MODES)(
    'keeps every SelectableCard ring distinct from its background in $name mode',
    ({index}) => {
      const body = resolve('var(--color-background-body)', index);
      const selectableCard = neutralTheme.components['selectable-card'];
      const variants = {
        default: {
          background: 'var(--color-background-card)',
          fallback: 'var(--color-accent)',
        },
        transparent: {background: null, fallback: 'var(--color-accent)'},
        muted: {
          background: 'var(--color-background-muted)',
          fallback: 'var(--color-accent)',
        },
        blue: {
          background: 'var(--color-background-blue)',
          fallback: 'var(--color-border-blue)',
        },
        cyan: {
          background: 'var(--color-background-cyan)',
          fallback: 'var(--color-border-cyan)',
        },
        gray: {
          background: 'var(--color-background-gray)',
          fallback: 'var(--color-border-gray)',
        },
        green: {
          background: 'var(--color-background-green)',
          fallback: 'var(--color-border-green)',
        },
        orange: {
          background: 'var(--color-background-orange)',
          fallback: 'var(--color-border-orange)',
        },
        pink: {
          background: 'var(--color-background-pink)',
          fallback: 'var(--color-border-pink)',
        },
        purple: {
          background: 'var(--color-background-purple)',
          fallback: 'var(--color-border-purple)',
        },
        red: {
          background: 'var(--color-background-red)',
          fallback: 'var(--color-border-red)',
        },
        teal: {
          background: 'var(--color-background-teal)',
          fallback: 'var(--color-border-teal)',
        },
        yellow: {
          background: 'var(--color-background-yellow)',
          fallback: 'var(--color-border-yellow)',
        },
      };

      for (const [variant, pair] of Object.entries(variants)) {
        const background = pair.background
          ? composite(resolve(pair.background, index), body)
          : body;
        const override =
          selectableCard?.[`variant:${variant}`]?.[
            '--selectable-card-ring-color'
          ];
        const ring = resolve(override ?? pair.fallback, index);
        expect(
          contrastRatio(ring, background),
          `${variant} SelectableCard ring should contrast with ${background}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    },
  );

  it.each(MODES)(
    'keeps backgroundless status icons aligned and perceivable in $name mode',
    ({index}) => {
      const step = neutralTheme.components['step-indicator'];
      const table = neutralTheme.components['table-row-status'];
      const statusTokens = {
        accent: '--color-accent',
        success: '--color-success',
        warning: '--color-warning',
        error: '--color-error',
      };
      const surfaces = [
        'var(--color-background-body)',
        'var(--color-background-surface)',
        'var(--color-background-card)',
      ];

      for (const [status, token] of Object.entries(statusTokens)) {
        const stepLocal = {
          ...(step?.base ?? {}),
          ...(step?.[`status:${status}`] ?? {}),
        };
        const tableLocal = {
          ...(table?.base ?? {}),
          ...(table?.[`color:${status}+presentation:icon`] ?? {}),
        };
        const stepColor = resolve(`var(${token})`, index, stepLocal);
        const tableColor = resolve(`var(${token})`, index, tableLocal);

        expect(tableColor, `${status} icon roles should match`).toBe(stepColor);
        for (const surface of surfaces) {
          const background = resolve(surface, index);
          expect(
            contrastRatio(stepColor, background),
            `${status} icon ${stepColor} should contrast with ${background}`,
          ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        }
      }
    },
  );

  it.each(MODES)(
    'keeps every ProgressBar fill distinct from its track in $name mode',
    ({index}) => {
      const progress = neutralTheme.components['progress-bar'];
      const progressFill = neutralTheme.components['progress-bar-fill'];
      const fillTokens = {
        accent: '--color-accent',
        success: '--color-success',
        warning: '--color-warning',
        error: '--color-error',
        neutral: '--color-text-disabled',
      };

      for (const [variant, fillToken] of Object.entries(fillTokens)) {
        const local = {
          ...progress.base,
          ...progress[`variant:${variant}`],
          ...progressFill?.[`variant:${variant}`],
        };
        expectPairToPass(
          progressFill?.[`variant:${variant}`]?.backgroundColor ??
            `var(${fillToken})`,
          'var(--color-background-muted)',
          index,
          local,
        );
      }
    },
  );

  it('maps live neutral ProgressBar fill and labels to the primary Button pair', () => {
    expect(
      neutralTheme.components['progress-bar-fill']['variant:neutral'][
        '--color-text-disabled'
      ],
    ).toBe('var(--color-accent)');
    expect(
      neutralTheme.components['progress-bar-mark'][
        'variant:neutral+placement:fill'
      ]['--color-text-primary'],
    ).toBe('var(--color-on-accent)');
  });

  it('uses one ProgressBar track and a contrast-specific warning fill', () => {
    const progress = neutralTheme.components['progress-bar'];
    expect(progress.base['--color-background-muted']).toBe(
      'light-dark(#d4d4d4, #3b3b3b)',
    );
    expect(
      progress['variant:warning']['--color-background-muted'],
    ).toBeUndefined();
    expect(progress['variant:warning']['--color-warning']).toBe(
      'light-dark(#927300, #f4d170)',
    );
  });

  it.each(MODES)(
    'keeps every Button variant readable through rest, hover, and pressed states in $name mode',
    ({index}) => {
      const backgrounds = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
      ];
      const hover = resolve('var(--color-overlay-hover)', index);
      const pressed = resolve('var(--color-overlay-pressed)', index);
      const destructive = neutralTheme.components.button['variant:destructive'];
      const variants = [
        {
          name: 'primary',
          foreground: resolve('var(--color-on-accent)', index),
          background: () => resolve('var(--color-accent)', index),
        },
        {
          name: 'secondary',
          foreground: resolve('var(--color-text-primary)', index),
          background: parent =>
            composite(resolve('var(--color-neutral)', index), parent),
        },
        {
          name: 'ghost',
          foreground: resolve('var(--color-text-primary)', index),
          background: parent => parent,
        },
        {
          name: 'destructive',
          foreground: resolve(destructive.color, index),
          background: parent =>
            composite(resolve(destructive.backgroundColor, index), parent),
        },
      ];

      for (const variant of variants) {
        for (const parent of backgrounds) {
          const rest = variant.background(parent);
          for (const [state, background] of [
            ['rest', rest],
            ['hover', composite(hover, rest)],
            ['pressed', composite(pressed, rest)],
          ]) {
            expect(
              contrastRatio(variant.foreground, background),
              `${variant.name} ${state}: ${variant.foreground} on ${background}`,
            ).toBeGreaterThanOrEqual(AA_TEXT);
          }
        }
      }
    },
  );

  it('maps the default Token to the same pair as the neutral Badge', () => {
    expect(neutralTheme.components.token['color:default']).toEqual(
      neutralTheme.components.badge['variant:neutral'],
    );
  });

  it.each(MODES)(
    'keeps every Token color readable through rest, hover, and pressed states in $name mode',
    ({index}) => {
      const backgrounds = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const hover = resolve('var(--color-overlay-hover)', index);
      const pressed = resolve('var(--color-overlay-pressed)', index);
      const tokenPairs = {
        default: neutralTheme.components.token['color:default'],
        red: {
          backgroundColor: 'var(--color-background-red)',
          color: 'var(--color-text-red)',
        },
        orange: {
          backgroundColor: 'var(--color-background-orange)',
          color: 'var(--color-text-orange)',
        },
        yellow: {
          backgroundColor: 'var(--color-background-yellow)',
          color: 'var(--color-text-yellow)',
        },
        green: {
          backgroundColor: 'var(--color-background-green)',
          color: 'var(--color-text-green)',
        },
        teal: {
          backgroundColor: 'var(--color-background-teal)',
          color: 'var(--color-text-teal)',
        },
        cyan: {
          backgroundColor: 'var(--color-background-cyan)',
          color: 'var(--color-text-cyan)',
        },
        blue: {
          backgroundColor: 'var(--color-background-blue)',
          color: 'var(--color-text-blue)',
        },
        purple: {
          backgroundColor: 'var(--color-background-purple)',
          color: 'var(--color-text-purple)',
        },
        pink: {
          backgroundColor: 'var(--color-background-pink)',
          color: 'var(--color-text-pink)',
        },
        gray: {
          backgroundColor: 'var(--color-background-gray)',
          color: 'var(--color-text-gray)',
        },
      };

      for (const [name, pair] of Object.entries(tokenPairs)) {
        const foreground = resolve(pair.color, index);
        const tokenBackground = resolve(pair.backgroundColor, index);
        for (const parent of backgrounds) {
          const rest = composite(tokenBackground, parent);
          for (const [state, background] of [
            ['rest', rest],
            ['hover', composite(hover, rest)],
            ['pressed', composite(pressed, rest)],
          ]) {
            expect(
              contrastRatio(foreground, background),
              `${name} Token ${state}: ${foreground} on ${background}`,
            ).toBeGreaterThanOrEqual(AA_TEXT);
          }
        }
      }
    },
  );

  it.each(MODES)(
    'keeps Banner text, icons, controls, and actions readable in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const statuses = {
        info: {
          background: 'var(--color-accent-muted)',
          icon: 'var(--color-accent)',
        },
        success: {
          background: 'var(--color-success-muted)',
          icon: 'var(--color-success)',
        },
        warning: {
          background: 'var(--color-warning-muted)',
          icon: 'var(--color-warning)',
        },
        error: {
          background: 'var(--color-error-muted)',
          icon: 'var(--color-error)',
        },
      };

      for (const [status, defaults] of Object.entries(statuses)) {
        const local = {
          ...neutralTheme.components.banner.base,
          ...neutralTheme.components.banner[`status:${status}`],
        };
        const bannerFill = resolve(defaults.background, index, local);
        const title = resolve('var(--color-text-primary)', index, local);
        const description = resolve(
          'var(--color-text-secondary)',
          index,
          local,
        );
        const statusIcon = resolve(defaults.icon, index, local);
        const focus = resolve('var(--color-accent)', index, local);
        const actionFill = resolve('var(--color-neutral)', index, local);
        const hover = resolve('var(--color-overlay-hover)', index, local);
        const pressed = resolve('var(--color-overlay-pressed)', index, local);

        for (const parent of parents) {
          const header = composite(bannerFill, parent);
          for (const [name, foreground, minimum] of [
            ['title', title, AA_TEXT],
            ['description', description, AA_TEXT],
            ['status icon', statusIcon, AA_NON_TEXT],
          ]) {
            expect(
              contrastRatio(foreground, header),
              `${status} Banner ${name}: ${foreground} on ${header}`,
            ).toBeGreaterThanOrEqual(minimum);
          }

          for (const [state, background] of [
            ['rest', header],
            ['hover', composite(hover, header)],
            ['pressed', composite(pressed, header)],
          ]) {
            expect(
              contrastRatio(title, background),
              `${status} Banner ghost action ${state}: ${title} on ${background}`,
            ).toBeGreaterThanOrEqual(AA_TEXT);
          }

          expect(
            contrastRatio(focus, header),
            `${status} Banner action focus: ${focus} on ${header}`,
          ).toBeGreaterThanOrEqual(AA_NON_TEXT);

          const actionRest = composite(actionFill, header);
          for (const [state, background] of [
            ['rest', actionRest],
            ['hover', composite(hover, actionRest)],
            ['pressed', composite(pressed, actionRest)],
          ]) {
            expect(
              contrastRatio(title, background),
              `${status} Banner action ${state}: ${title} on ${background}`,
            ).toBeGreaterThanOrEqual(AA_TEXT);
          }
        }
      }
    },
  );

  it.each(MODES)(
    'keeps FieldStatus aligned with Banner semantic pairs in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const pairs = {
        success: {
          background: 'var(--color-success-muted)',
          foreground: 'var(--color-text-green)',
        },
        warning: {
          background: 'var(--color-warning-muted)',
          foreground: 'var(--color-text-yellow)',
        },
        error: {
          background: 'var(--color-error-muted)',
          foreground: 'var(--color-text-red)',
        },
      };

      for (const [status, pair] of Object.entries(pairs)) {
        const bannerLocal = {
          ...neutralTheme.components.banner.base,
          ...neutralTheme.components.banner[`status:${status}`],
        };
        const fieldForeground = resolve(pair.foreground, index);
        const fieldBackground = resolve(pair.background, index);
        const bannerForeground = resolve(
          'var(--color-text-primary)',
          index,
          bannerLocal,
        );
        const bannerBackground = resolve(pair.background, index, bannerLocal);

        expect(fieldForeground).toBe(bannerForeground);
        expect(fieldBackground).toBe(bannerBackground);

        for (const parent of parents) {
          const background = composite(fieldBackground, parent);
          expect(
            contrastRatio(fieldForeground, background),
            `${status} FieldStatus: ${fieldForeground} on ${background}`,
          ).toBeGreaterThanOrEqual(AA_TEXT);
        }
      }
    },
  );

  it.each(MODES)(
    'keeps active TextInput content, icons, and status affordances readable in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const inputBackground = resolve('var(--color-background-surface)', index);

      for (const [name, token] of [
        ['value', 'var(--color-text-primary)'],
        ['placeholder', 'var(--color-text-secondary)'],
      ]) {
        const foreground = resolve(token, index);
        expect(
          contrastRatio(foreground, inputBackground),
          `TextInput ${name}: ${foreground} on ${inputBackground}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }

      const label = resolve('var(--color-text-secondary)', index);
      for (const parent of parents) {
        expect(
          contrastRatio(label, parent),
          `TextInput label: ${label} on ${parent}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }

      for (const [name, token] of [
        ['focus border', 'var(--color-accent)'],
        ['start / clear icon', 'var(--color-icon-secondary)'],
        ['loading spinner arc', 'var(--color-accent)'],
        ['success border / icon', 'var(--color-success)'],
        ['warning border / icon', 'var(--color-warning)'],
        ['error border / icon', 'var(--color-error)'],
      ]) {
        const foreground = resolve(token, index);
        expect(
          contrastRatio(foreground, inputBackground),
          `TextInput ${name}: ${foreground} on ${inputBackground}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    },
  );

  it.each(MODES)(
    'keeps Checkbox, Radio, and Switch selected states perceivable in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const surface = resolve('var(--color-background-surface)', index);
      const primary = resolve('var(--color-text-primary)', index);
      const secondary = resolve('var(--color-text-secondary)', index);
      const accent = resolve('var(--color-accent)', index);
      const onAccent = resolve('var(--color-on-accent)', index);
      const tint = resolve('var(--color-tint-hover)', index);
      const focus = accent;
      const checkedHoverFill = mix(accent, tint, 0.15);
      const againstParents = foreground =>
        Math.min(...parents.map(parent => contrastRatio(foreground, parent)));
      const expectNonText = (name, foreground, background) => {
        expect(
          contrastRatio(foreground, background),
          `${name}: ${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      };

      for (const [name, foreground] of [
        ['checkbox / switch label', secondary],
        ['radio label', primary],
        ['radio description', secondary],
      ]) {
        for (const parent of parents) {
          expect(
            contrastRatio(foreground, parent),
            `${name}: ${foreground} on ${parent}`,
          ).toBeGreaterThanOrEqual(AA_TEXT);
        }
      }

      for (const parent of parents) {
        expectNonText('selected control fill', accent, parent);
        expectNonText('selected hover fill', checkedHoverFill, parent);
        expectNonText('focus indicator', focus, parent);
      }

      expectNonText('selected check / dot', onAccent, accent);
      expectNonText('selected hover check / dot', onAccent, checkedHoverFill);
      expectNonText('Switch on thumb', surface, accent);
      expectNonText('Switch on hover thumb', surface, checkedHoverFill);
      expectNonText('unchecked Checkbox spinner', accent, surface);
      expectNonText('checked Checkbox spinner', onAccent, accent);
      expectNonText('Switch spinner', accent, surface);
      expect(againstParents(focus)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    },
  );

  it.each(MODES)(
    'keeps standalone Spinner arcs and labels readable in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const accent = resolve('var(--color-accent)', index);
      const secondary = resolve('var(--color-text-secondary)', index);
      const primary = resolve('var(--color-text-primary)', index);
      const onDark = resolve('var(--color-on-dark)', index);
      const media = resolve('var(--color-on-light)', index);
      const onAccent = resolve('var(--color-on-accent)', index);

      for (const parent of parents) {
        expect(
          contrastRatio(accent, parent),
          `default Spinner arc: ${accent} on ${parent}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        expect(
          contrastRatio(secondary, parent),
          `subtle Spinner arc: ${secondary} on ${parent}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        expect(
          contrastRatio(primary, parent),
          `Spinner label: ${primary} on ${parent}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }

      expect(contrastRatio(onDark, media)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      expect(contrastRatio(onAccent, accent)).toBeGreaterThanOrEqual(
        AA_NON_TEXT,
      );
    },
  );

  it.each(MODES)(
    'keeps ProgressBar labels and target marks readable in $name mode',
    ({index}) => {
      const parents = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
        resolve('var(--color-background-card)', index),
      ];
      const primary = resolve('var(--color-text-primary)', index);
      const secondary = resolve('var(--color-text-secondary)', index);
      const progress = neutralTheme.components['progress-bar'];
      const progressFill = neutralTheme.components['progress-bar-fill'];
      const progressMark = neutralTheme.components['progress-bar-mark'];
      const variants = {
        accent: ['var(--color-accent)', 'var(--color-on-accent)'],
        success: ['var(--color-success)', 'var(--color-on-success)'],
        warning: ['var(--color-warning)', 'var(--color-on-warning)'],
        error: ['var(--color-error)', 'var(--color-on-error)'],
        neutral: ['var(--color-text-disabled)', 'var(--color-text-primary)'],
      };

      for (const parent of parents) {
        expect(contrastRatio(primary, parent)).toBeGreaterThanOrEqual(AA_TEXT);
        expect(contrastRatio(secondary, parent)).toBeGreaterThanOrEqual(
          AA_TEXT,
        );
      }

      for (const [variant, [fillToken, markToken]] of Object.entries(
        variants,
      )) {
        const local = {
          ...progress.base,
          ...progress[`variant:${variant}`],
        };
        const fillLocal = {
          ...local,
          ...progressFill?.[`variant:${variant}`],
        };
        const markLocal = {
          ...fillLocal,
          ...progressMark?.[`variant:${variant}`],
          ...progressMark?.[`variant:${variant}+placement:fill`],
        };
        const fill = resolve(
          progressFill?.[`variant:${variant}`]?.backgroundColor ?? fillToken,
          index,
          fillLocal,
        );
        const track = resolve('var(--color-background-muted)', index, local);
        const markOnFill = resolve(
          progressMark?.[`variant:${variant}+placement:fill`]
            ?.backgroundColor ??
            progressMark?.[`variant:${variant}`]?.backgroundColor ??
            markToken,
          index,
          markLocal,
        );
        const markOnTrack = resolve('var(--color-text-primary)', index, local);
        expect(
          contrastRatio(markOnFill, fill),
          `${variant} ProgressBar mark on fill`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        expect(
          contrastRatio(markOnTrack, track),
          `${variant} ProgressBar mark on track`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    },
  );

  it.todo('makes the ProgressBar track visible against every parent surface');
  it.todo('keeps ProgressBar mark focus visible on both fill and track');

  it.each(MODES)(
    'keeps every Button loading spinner distinct from its background in $name mode',
    ({index}) => {
      const backgrounds = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
      ];
      const destructive = neutralTheme.components.button['variant:destructive'];
      const variants = [
        {
          name: 'primary',
          foreground: resolve('var(--color-on-accent)', index),
          background: () => resolve('var(--color-accent)', index),
        },
        {
          name: 'secondary',
          foreground: resolve('var(--color-text-primary)', index),
          background: parent =>
            composite(resolve('var(--color-neutral)', index), parent),
        },
        {
          name: 'ghost',
          foreground: resolve('var(--color-text-primary)', index),
          background: parent => parent,
        },
        {
          name: 'destructive',
          foreground: resolve(destructive.color, index),
          background: parent =>
            composite(resolve(destructive.backgroundColor, index), parent),
        },
      ];

      for (const variant of variants) {
        for (const parent of backgrounds) {
          const background = variant.background(parent);
          expect(
            contrastRatio(variant.foreground, background),
            `${variant.name} spinner arc should contrast with ${background}`,
          ).toBeGreaterThanOrEqual(AA_NON_TEXT);
        }
      }
    },
  );

  it.each(MODES)(
    'keeps common Button end-content badges readable in $name mode',
    ({index}) => {
      const backgrounds = [
        resolve('var(--color-background-body)', index),
        resolve('var(--color-background-surface)', index),
      ];
      const destructive = neutralTheme.components.button['variant:destructive'];
      const combinations = [
        {
          name: 'primary + info',
          buttonBackground: () => resolve('var(--color-accent)', index),
          badge: neutralTheme.components.badge['variant:info'],
        },
        {
          name: 'secondary + neutral',
          buttonBackground: parent =>
            composite(resolve('var(--color-neutral)', index), parent),
          badge: neutralTheme.components.badge['variant:neutral'],
        },
        {
          name: 'ghost + info',
          buttonBackground: parent => parent,
          badge: neutralTheme.components.badge['variant:info'],
        },
        {
          name: 'destructive + error',
          buttonBackground: parent =>
            composite(resolve(destructive.backgroundColor, index), parent),
          badge: neutralTheme.components.badge['variant:error'],
        },
      ];

      for (const combination of combinations) {
        const foreground = resolve(combination.badge.color, index);
        const background = resolve(combination.badge.backgroundColor, index);
        for (const parent of backgrounds) {
          const buttonBackground = combination.buttonBackground(parent);
          const badgeBackground = composite(background, buttonBackground);
          expect(
            contrastRatio(foreground, badgeBackground),
            `${combination.name}: ${foreground} on ${badgeBackground}`,
          ).toBeGreaterThanOrEqual(AA_TEXT);
        }
      }
    },
  );

  it.each(MODES)(
    'keeps Button focus indicators distinct from adjacent surfaces in $name mode',
    ({index}) => {
      const backgrounds = [
        'var(--color-background-body)',
        'var(--color-background-surface)',
      ];
      for (const background of backgrounds) {
        expectPairToPass('var(--color-accent)', background, index);
        expectPairToPass('var(--color-error)', background, index);
      }
    },
  );
});
