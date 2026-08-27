// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generateThemeRules.test.ts
 * Tests that generateThemeRules produces correct, consistent CSS rules
 * for both runtime and build paths.
 */

import {describe, it, expect} from 'vitest';
import {
  dataTokenDefaults,
  defineTheme,
  generateThemeCSS,
  generateThemeRules,
} from './index';
import {generateDataTokenDefaultsCSS} from './generateThemeRules';

const defaultInput = {
  name: 'default',
  typography: {scale: {base: 14, ratio: 1.2}},
  tokens: {},
  components: {
    button: {
      'variant:secondary': {
        backgroundColor:
          'light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))',
      },
    },
  },
};

describe('focus outline tokens', () => {
  it('emits a focus ring override into the theme scope', () => {
    const theme = defineTheme({
      name: 'brand',
      tokens: {
        '--focus-outline-color': '#FF00FF',
        '--focus-outline-width': '4px',
      },
    });

    const {component} = generateThemeCSS(theme);

    expect(component).toContain('--focus-outline-color: #FF00FF;');
    expect(component).toContain('--focus-outline-width: 4px;');
  });
});

describe('generateThemeRules', () => {
  const theme = defineTheme(defaultInput);
  const rules = generateThemeRules(theme);

  it('produces an array of CSS rule strings', () => {
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach(r => expect(typeof r).toBe('string'));
  });

  // --- Token block ---

  it('includes :scope token block with type scale tokens', () => {
    const scopeRule = rules.find(r => r.includes(':scope'));
    expect(scopeRule).toBeDefined();
    // Raw size tokens are rem values
    expect(scopeRule).toContain('--font-size-base: 0.875rem');
    expect(scopeRule).toContain('--font-size-2xl: 1.5rem');
    // Semantic tokens are var() refs
    expect(scopeRule).toContain('--text-heading-1-size: var(--font-size-2xl)');
    expect(scopeRule).toContain('--text-heading-4-size: var(--font-size-base)');
    expect(scopeRule).toContain('--text-body-size: var(--font-size-base)');
    expect(scopeRule).toContain('--text-supporting-size: var(--font-size-sm)');
  });

  it('emits raw size tokens in rem', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    // Raw tokens (--font-size-4xs through --font-size-4xl) should be in rem
    const rawSizeTokens = [
      '--font-size-4xs',
      '--font-size-3xs',
      '--font-size-2xs',
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-2xl',
      '--font-size-3xl',
      '--font-size-4xl',
    ];
    for (const token of rawSizeTokens) {
      const match = scopeRule.match(new RegExp(`${token}: ([^;]+)`));
      expect(match).not.toBeNull();
      expect(match![1]).toMatch(/rem$/);
    }
  });

  it('emits semantic size tokens as var() refs', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    const semanticSizeTokens = scopeRule.match(
      /--(?:text-heading-\d|text-(?:body|large|label|code|supporting))-size: [^;]+/g,
    );
    expect(semanticSizeTokens).not.toBeNull();
    semanticSizeTokens!.forEach(m => {
      expect(m).toContain('var(--font-size-');
    });
  });

  it('emits line heights as unitless ratios', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    const leadingMatches = scopeRule.match(
      /--(?:heading|text)-\w+-leading: [^;]+/g,
    );
    expect(leadingMatches).not.toBeNull();
    leadingMatches!.forEach(m => {
      expect(m).not.toContain('px');
      expect(m).not.toContain('rem');
      const val = parseFloat(m.split(': ')[1]);
      expect(val).toBeGreaterThan(1);
      expect(val).toBeLessThan(2);
    });
  });

  // --- Component overrides ---

  it('includes .astryx-heading.level-* rules for all 6 levels', () => {
    for (let level = 1; level <= 6; level++) {
      const rule = rules.find(r =>
        r.includes(`.astryx-heading.level-${level}`),
      );
      expect(rule).toBeDefined();
      expect(rule).toContain('font-family');
      expect(rule).toContain(`var(--text-heading-${level}-size)`);
      expect(rule).toContain(`var(--text-heading-${level}-weight)`);
      expect(rule).toContain(`var(--text-heading-${level}-leading)`);
    }
  });

  it('includes .astryx-text.* rules for all 5 types', () => {
    for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
      const rule = rules.find(r => r.includes(`.astryx-text.${type}`));
      expect(rule).toBeDefined();
      expect(rule).toContain(`var(--text-${type}-size)`);
    }
  });

  it('includes explicit component overrides', () => {
    const buttonRule = rules.find(r => r.includes('.astryx-button.secondary'));
    expect(buttonRule).toBeDefined();
    expect(buttonRule).toContain('light-dark(rgba(5, 54, 89, 0.1)');
  });

  it('applies pseudo-class suffixes to both compat selector prefixes', () => {
    const pseudoTheme = defineTheme({
      name: 'pseudo-compat',
      components: {
        button: {
          base: {
            ':hover': {color: 'red'},
          },
        },
      },
    });
    const pseudoRules = generateThemeRules(pseudoTheme);
    expect(
      pseudoRules.some(rule => rule.includes('.astryx-button:hover')),
    ).toBe(true);
  });

  // A theme authoring `:hover` is describing the ENABLED control. Without a
  // guard the rule paints a disabled one too, because browsers suppress a
  // disabled control's events, not its hover styling — and a theme override
  // would then reintroduce, on every component at once, the defect the
  // components' own styles were fixed for.
  it('keeps a themed :hover off disabled elements', () => {
    const hoverTheme = defineTheme({
      name: 'hover-guard',
      components: {
        button: {
          base: {
            ':hover': {color: 'red'},
            ':focus-visible': {outline: '2px solid blue'},
          },
        },
      },
    });
    const hoverRules = generateThemeRules(hoverTheme);
    const hoverRule = hoverRules.find(rule => rule.includes(':hover'));
    expect(hoverRule).toBeDefined();
    expect(hoverRule).toContain(
      '.astryx-button:hover:where(:not(:disabled,[aria-disabled="true"]))',
    );
    // Every selector in a comma-separated list carries its own guard —
    // a trailing pseudo does not distribute over a selector list. (Counted,
    // not split: the guard contains a comma of its own.)
    const selectorText = String(hoverRule).split('{')[0];
    const hovers = selectorText.match(/:hover/g) || [];
    const guards = selectorText.match(/:where\(:not\(:disabled/g) || [];
    expect(hovers.length).toBeGreaterThan(0);
    expect(guards.length).toBe(hovers.length);
    // Other pseudo-classes are untouched: a disabled control can still be
    // focused (that is the point of aria-disabled), and :focus-visible on it
    // is correct.
    const focusRule = hoverRules.find(rule => rule.includes(':focus-visible'));
    expect(focusRule).toContain('.astryx-button:focus-visible {');
    expect(focusRule).not.toContain('aria-disabled');
  });

  // --- Prose rules ---

  it('includes prose heading rules with computed values', () => {
    const h1Rule = rules.find(
      r => r.trimStart().startsWith(':where(h1)') || r.includes(':where(h1)'),
    );
    expect(h1Rule).toBeDefined();
    // Prose rules use val() helper which resolves to the token value (now a var ref)
    expect(h1Rule).toContain('var(--font-size-2xl)');
    expect(h1Rule).toContain('var(--font-weight-semibold)');
    // Prose defaults intentionally carry NO block margins: reset.css zeroes
    // raw element margins and the Markdown/Heading components own their spacing
    // via StyleX (@layer astryx-base). Emitting margins here would re-introduce
    // the regression where prose defaults fought component spacing.
    expect(h1Rule).not.toContain('margin-block-start');
    expect(h1Rule).not.toContain('margin-block-end');
  });

  it('includes prose p rule with computed values', () => {
    const pRule = rules.find(
      r => r.trimStart().startsWith(':where(p)') || r.includes(':where(p)'),
    );
    expect(pRule).toBeDefined();
    expect(pRule).toContain('var(--font-size-base)');
    expect(pRule).toContain('font-family: var(--font-family-body)');
    expect(pRule).toContain('var(--color-text-primary)');
    // No margins on the prose paragraph default (see heading rule note).
    expect(pRule).not.toContain('margin-block-start');
  });

  it('includes prose small, code, hr rules', () => {
    expect(rules.some(r => r.includes(':where(small)'))).toBe(true);
    expect(rules.some(r => r.includes(':where(code, pre)'))).toBe(true);
    expect(rules.some(r => r.includes(':where(hr)'))).toBe(true);
  });

  // --- Prop-level color overrides ---

  it('includes color prop overrides for text and heading', () => {
    expect(rules.some(r => r.includes('.astryx-text.primary'))).toBe(true);
    expect(rules.some(r => r.includes('.astryx-text.secondary'))).toBe(true);
    expect(rules.some(r => r.includes('.astryx-heading.primary'))).toBe(true);
    expect(rules.some(r => r.includes('.astryx-heading.disabled'))).toBe(true);
    expect(rules.some(r => r.includes('.astryx-text.active'))).toBe(false);
    expect(rules.some(r => r.includes('.astryx-text.accent'))).toBe(true);
  });

  // --- Size-prop overrides (so `size` beats a themed `type`) ---

  it('emits Text size-prop font-size overrides in the same layer as type rules', () => {
    // Digit-leading sizes are prefixed (size-2xs); word sizes stay bare.
    const sizeRule = rules.find(
      r => r.includes('.astryx-text.size-2xs') && r.includes('font-size'),
    );
    expect(sizeRule).toBeDefined();
    expect(sizeRule).toContain('var(--font-size-2xs)');

    // `xsm` maps to the --font-size-xs token (matches sizeStyles).
    const xsmRule = rules.find(r => r.includes('.astryx-text.xsm'));
    expect(xsmRule).toBeDefined();
    expect(xsmRule).toContain('var(--font-size-xs)');

    // Overrides set only font-size — line-height/family come from `type`.
    expect(xsmRule).not.toContain('line-height');
  });

  it('emits a size override for every TextSize value', () => {
    const sizes = [
      'size-4xs',
      'size-3xs',
      'size-2xs',
      'xsm',
      'sm',
      'base',
      'lg',
      'xl',
      'size-2xl',
      'size-3xl',
      'size-4xl',
    ];
    for (const cls of sizes) {
      expect(
        rules.some(
          r => r.includes(`.astryx-text.${cls}`) && r.includes('font-size'),
        ),
      ).toBe(true);
    }
  });

  it('orders size overrides after the themed type font-size rules', () => {
    // Source order breaks specificity ties within a layer, so the size
    // override must come after the `.astryx-text.<type>` type rule.
    const typeIdx = rules.findIndex(
      r => r.includes('.astryx-text.supporting') && r.includes('font-size'),
    );
    const sizeIdx = rules.findIndex(
      r => r.includes('.astryx-text.size-2xs') && r.includes('font-size'),
    );
    expect(typeIdx).toBeGreaterThanOrEqual(0);
    expect(sizeIdx).toBeGreaterThan(typeIdx);
  });

  // --- Consistency ---

  it('generateThemeCSS returns prose and component blocks with @scope', () => {
    const {prose, component} = generateThemeCSS(theme);
    const combined = prose + component;
    expect(combined).toContain('@scope ([data-astryx-theme="default"])');
    expect(combined).toContain('to ([data-astryx-theme])');
    // Every rule from generateThemeRules should appear in one of the blocks
    for (const rule of rules) {
      expect(combined).toContain(rule);
    }
  });

  it('routes Text size overrides into the component (astryx-theme) block', () => {
    // The size override only beats a themed type if it lands in the same
    // layer as the type rules (astryx-theme / component block), not the
    // reset-tier prose block.
    const {prose, component} = generateThemeCSS(theme);
    expect(component).toContain('.astryx-text.size-2xs');
    expect(component).toContain('.astryx-text.xsm');
    expect(prose).not.toContain('.astryx-text.size-2xs');
  });
});

describe('generateThemeRules with weight overrides', () => {
  const theme = defineTheme({
    name: 'custom-weights',
    typography: {
      scale: {base: 14, ratio: 1.2},
      heading: {weights: {3: 'bold'}},
    },
    tokens: {},
    components: {},
  });
  const rules = generateThemeRules(theme);

  it('reflects weight override in tokens', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    expect(scopeRule).toContain(
      '--text-heading-3-weight: var(--font-weight-bold)',
    );
    // Other levels keep default
    expect(scopeRule).toContain(
      '--text-heading-1-weight: var(--font-weight-semibold)',
    );
  });

  it('reflects weight override in prose h3', () => {
    const h3Rule = rules.find(
      r => r.trimStart().startsWith(':where(h3)') || r.includes(':where(h3)'),
    );
    expect(h3Rule).toBeDefined();
    expect(h3Rule).toContain('var(--font-weight-bold)');
  });
});

// =============================================================================
// Derived var expansion
// =============================================================================

describe('derived var expansion', () => {
  it('emits borderRadius AND internal var for card', () => {
    const theme = defineTheme({
      name: 'test-derived',
      components: {
        card: {
          base: {borderRadius: '32px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const cardRule = rules.find(r => r.includes('.astryx-card'));
    expect(cardRule).toBeDefined();
    expect(cardRule).toContain('border-radius: 32px');
    expect(cardRule).toContain('--_card-radius: 32px');
  });

  it('emits borderRadius AND internal var for dropdown-menu', () => {
    const theme = defineTheme({
      name: 'test-derived-dropdown',
      components: {
        'dropdown-menu': {
          base: {borderRadius: '16px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 16px');
    expect(rule).toContain('--_dropdown-menu-radius: 16px');
  });

  it('emits padding AND internal var for dropdown-menu', () => {
    const theme = defineTheme({
      name: 'test-derived-dropdown-pad',
      components: {
        'dropdown-menu': {
          base: {padding: '8px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--_dropdown-menu-padding: 8px');
  });

  it('emits internal vars for chat composer', () => {
    const theme = defineTheme({
      name: 'test-derived-chat',
      components: {
        chat: {
          base: {borderRadius: '24px', padding: '12px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-chat'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--_chat-composer-radius: 24px');
    expect(rule).toContain('--_chat-composer-padding: 12px');
  });

  it('emits internal var for button borderRadius', () => {
    const theme = defineTheme({
      name: 'test-derived-button',
      components: {
        button: {
          base: {borderRadius: '8px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-button'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 8px');
    expect(rule).toContain('--_button-radius: 8px');
  });

  it('emits direct rules for avatar fallback background, color, and weight', () => {
    const theme = defineTheme({
      name: 'test-avatar-fallback',
      components: {
        'avatar-fallback': {
          base: {
            backgroundColor: 'var(--color-accent-muted)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-weight-normal)',
          },
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-avatar-fallback'));
    expect(rule).toBeDefined();
    expect(rule).toContain('background-color: var(--color-accent-muted)');
    expect(rule).toContain('color: var(--color-text-secondary)');
    expect(rule).toContain('font-weight: var(--font-weight-normal)');
    // These are direct class targets now, not internal derived vars.
    expect(rule).not.toContain('--_avatar-fallback-background');
    expect(rule).not.toContain('--_avatar-fallback-color');
    expect(rule).not.toContain('--_avatar-fallback-font-weight');
  });

  it('emits a direct per-size font-size rule for the avatar fallback target', () => {
    const theme = defineTheme({
      name: 'test-avatar-fallback-size',
      components: {
        'avatar-fallback': {
          'size:sm': {fontSize: '9px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-avatar-fallback.sm'));
    expect(rule).toBeDefined();
    expect(rule).toContain('font-size: 9px');
    // Direct class target now — no internal derived var.
    expect(rule).not.toContain('--_avatar-fallback-font-size');
  });

  it('does not emit derived vars for components without registry entries', () => {
    const theme = defineTheme({
      name: 'test-no-derived',
      components: {
        badge: {
          base: {borderRadius: '99px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-badge'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 99px');
    // No internal var — badge has no derived registry entry
    expect(rule).not.toContain('--');
  });

  it('container expansion still works for card padding', () => {
    const theme = defineTheme({
      name: 'test-container',
      components: {
        card: {
          base: {padding: '20px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-card'));
    expect(rule).toBeDefined();
    // Container expansion emits --astryx-card-padding token
    expect(rule).toContain('--astryx-card-padding: 20px');
  });

  it('handles variant-specific derived vars', () => {
    const theme = defineTheme({
      name: 'test-variant-derived',
      components: {
        card: {
          'variant:muted': {borderRadius: '16px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-card.muted'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 16px');
    expect(rule).toContain('--_card-radius: 16px');
  });

  it('replaces paddingInline with the var for textarea (no raw property)', () => {
    const theme = defineTheme({
      name: 'test-derived-textarea',
      components: {
        textarea: {
          base: {paddingInline: 'var(--eps-input-padding-x)'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-textarea'));
    expect(rule).toBeDefined();
    // Value flows to the inner <textarea> via the var…
    expect(rule).toContain(
      '--_textarea-inline-padding: var(--eps-input-padding-x)',
    );
    // …and must NOT land on the flush wrapper, which would re-inset the
    // full-bleed textarea and push the native resize grip off the corner.
    expect(rule).not.toContain('padding-inline: var(--eps-input-padding-x)');
  });

  it('replaces progressbar-mark width/height with vars (no raw properties)', () => {
    const theme = defineTheme({
      name: 'test-derived-progressbar-mark',
      components: {
        'progressbar-mark': {
          base: {width: '2px', height: '12px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-progressbar-mark'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--_progressbar-mark-width: 2px');
    expect(rule).toContain('--_progressbar-mark-height: 12px');
    // Raw dimensions would be a same-element fight with the mark's StyleX,
    // which an unlayered consumer build wins — the vars have no competitor.
    expect(rule).not.toMatch(/[{;]\s*width: 2px/);
    expect(rule).not.toMatch(/[{;]\s*height: 12px/);
  });
});

describe('brutalist-style derived expansion', () => {
  it('button borderRadius emits --_button-radius for pill shape', () => {
    const theme = defineTheme({
      name: 'test-brutalist',
      radius: {base: 4, multiplier: 0},
      components: {
        button: {
          base: {borderRadius: '9999px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-button'));
    expect(rule).toContain('border-radius: 9999px');
    expect(rule).toContain('--_button-radius: 9999px');
  });

  it('card padding emits container tokens via derived expansion', () => {
    const theme = defineTheme({
      name: 'test-brutalist-card',
      components: {
        card: {
          base: {padding: '24px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-card'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--astryx-card-padding: 24px');
  });

  it('dropdown-menu borderRadius + padding emit both derived vars', () => {
    const theme = defineTheme({
      name: 'test-brutalist-dropdown',
      components: {
        'dropdown-menu': {
          base: {borderRadius: '0px', padding: '4px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.astryx-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 0px');
    expect(rule).toContain('--_dropdown-menu-radius: 0px');
    expect(rule).toContain('--_dropdown-menu-padding: 4px');
  });
});

describe('physical padding longhands', () => {
  const ruleFor = (
    component: string,
    base: Record<string, string>,
    name = 'test-physical-padding',
  ) =>
    generateThemeRules(
      defineTheme({name, components: {[component]: {base}}}),
    ).find(r => r.includes(`.astryx-${component}`));

  // `padding-top`/`padding-bottom` ARE the block edges in every horizontal
  // writing mode, so the expansion can normalize them with no direction
  // assumption. Without that, the padding lands raw on the element and the
  // component's internals — the NumberInput stepper column, container bleed —
  // read the default instead of what the theme set.
  it.each([
    ['paddingTop', {paddingTop: '14px'}, 'block-start'],
    ['paddingBottom', {paddingBottom: '14px'}, 'block-end'],
  ])('routes %s through the container expansion', (_label, base, edge) => {
    const rule = ruleFor('card', base);
    expect(rule).toContain(`--astryx-card-padding-${edge}: 14px`);
    expect(rule).not.toMatch(/[{;]\s*padding-(top|bottom):/);
  });

  it('normalizes both block edges together, asymmetrically', () => {
    const rule = ruleFor('number-input', {
      paddingTop: '14px',
      paddingBottom: '6px',
    });
    expect(rule).toContain('--astryx-number-input-padding-block-start: 14px');
    expect(rule).toContain('--astryx-number-input-padding-block-end: 6px');
  });

  it.each(['card', 'dialog', 'section', 'number-input'])(
    'reaches %s, which expands its padding',
    component => {
      expect(ruleFor(component, {paddingTop: '14px'})).toContain(
        `--astryx-${component}-padding-block-start: 14px`,
      );
    },
  );

  // THE RTL GUARD. `paddingLeft` is inline-start in LTR and inline-end in RTL,
  // and the tokens are consumed by logical properties, so mapping it would
  // silently move the padding to the other edge in RTL. It stays physical —
  // which is what the author wrote — and does not reach the tokens.
  it('leaves the direction-relative inline pair physical', () => {
    const rule = ruleFor('card', {paddingLeft: '20px', paddingRight: '8px'});
    expect(rule).toContain('padding-left: 20px');
    expect(rule).toContain('padding-right: 8px');
    expect(rule).not.toContain('--astryx-card-padding-inline');
  });

  it('expands the block edges while leaving left physical', () => {
    const rule = ruleFor('card', {paddingTop: '14px', paddingLeft: '20px'});
    expect(rule).toContain('--astryx-card-padding-block-start: 14px');
    expect(rule).toContain('padding-left: 20px');
  });

  // The shorthand-plus-override case was the worst one: the tokens carried
  // 10px while the element painted 14px on top, so every internal compensated
  // by the wrong amount.
  it('lets a physical longhand override the shorthand per edge', () => {
    const rule = ruleFor('card', {padding: '10px', paddingTop: '14px'});
    expect(rule).toContain('--astryx-card-padding-block-start: 14px');
    expect(rule).toContain('--astryx-card-padding-block-end: 10px');
    expect(rule).toContain('--astryx-card-padding-inline: 10px');
    expect(rule).not.toMatch(/[{;]\s*padding(-top)?:/);
  });

  // A `vars` entry carries one value for the whole box, so a single physical
  // edge must not feed it — only the container expansion takes these.
  it('does not feed a single edge to a whole-box derived var', () => {
    const rule = ruleFor('dropdown-menu', {paddingTop: '14px'});
    expect(rule).toContain('padding-top: 14px');
    expect(rule).not.toContain('--_dropdown-menu-padding');
  });
});

describe('renamed theme targets', () => {
  // The renamed targets emit both classes, so a rule written against either
  // key selects the element. What is easy to miss is the derived-var half: a
  // key the registry does not know still emits a rule, minus every var the
  // component actually reads — the same silent nothing a misspelled key gives.
  it('expands derived vars for a renamed key and its deprecated spelling', () => {
    const rules = (component: string, styles: Record<string, string>) =>
      generateThemeRules(
        defineTheme({
          name: `test-renamed-${component}`,
          components: {[component]: {base: styles}},
        }),
      ).join('\n');

    const hoverCard = rules('hover-card', {borderRadius: '9px'});
    expect(hoverCard).toContain('.astryx-hover-card');
    expect(hoverCard).toContain('--_hovercard-radius: 9px');
    expect(rules('hovercard', {borderRadius: '9px'})).toContain(
      '--_hovercard-radius: 9px',
    );

    const textArea = rules('text-area', {paddingInline: '11px'});
    expect(textArea).toContain('.astryx-text-area');
    expect(textArea).toContain('--_textarea-inline-padding: 11px');
    expect(rules('textarea', {paddingInline: '11px'})).toContain(
      '--_textarea-inline-padding: 11px',
    );

    const mark = rules('progress-bar-mark', {width: '3px'});
    expect(mark).toContain('.astryx-progress-bar-mark');
    expect(mark).toContain('--_progressbar-mark-width: 3px');
    expect(rules('progressbar-mark', {width: '3px'})).toContain(
      '--_progressbar-mark-width: 3px',
    );
  });
});

describe('data visualization tokens', () => {
  const scopeBlock = (theme: Parameters<typeof generateThemeRules>[0]) =>
    generateThemeRules(theme).find(r => r.includes(':scope'));

  it('seeds the whole palette once, at :root', () => {
    const css = generateDataTokenDefaultsCSS();

    expect(css.startsWith(':root {')).toBe(true);
    for (const [name, value] of Object.entries(dataTokenDefaults)) {
      expect(css).toContain(`${name}: ${value};`);
    }
  });

  it('leaves the defaults out of a theme scope block', () => {
    // A scope block that re-declared them would shadow a parent theme's
    // override in every nested <Theme>, which no other token family does.
    expect(scopeBlock(defineTheme({name: 'data-bare'}))).toBeUndefined();
  });

  it("puts only the theme's own data token in its scope block", () => {
    const block = scopeBlock(
      defineTheme({
        name: 'data-override',
        tokens: {'--color-data-categorical-blue': ['#123456', '#654321']},
      }),
    )!;

    expect(block).toContain(
      '--color-data-categorical-blue: light-dark(#123456, #654321);',
    );
    expect(block.match(/--color-data-/g)).toHaveLength(1);
    expect(block).not.toContain('--color-data-categorical-orange');
  });

  it('keeps the palette out of the scoped stylesheet', () => {
    // The palette's own contents are asserted once, against
    // `dataTokenDefaults`, in `seeds the whole palette once, at :root` above.
    const {component, prose} = generateThemeCSS(
      defineTheme({name: 'data-css'}),
    );

    expect(component).not.toContain('--color-data-');
    expect(prose).not.toContain('--color-data-');
  });

  it('keeps generateThemeCSS to its two scoped blocks', () => {
    // The defaults are theme-independent, so they are not part of the theme
    // CSS contract: `astryx theme build` formats them from the public
    // `dataTokenDefaults` export instead.
    expect(
      Object.keys(generateThemeCSS(defineTheme({name: 'data-shape'}))).sort(),
    ).toEqual(['component', 'prose']);
  });
});
