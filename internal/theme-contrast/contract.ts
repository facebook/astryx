// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contract.ts
 * @input None (declarative data)
 * @output The list of foreground/background token pairings every Astryx theme must satisfy
 * @position Contrast contract for the cross-theme WCAG audit in contrast.test.ts
 *
 * Each pair records a foreground token, the background stack it is rendered
 * on in real components (bottom layer first; translucent layers are
 * alpha-composited in order), the WCAG 2.1 minimum ratio, and evidence of
 * where the pairing occurs. Thresholds: 4.5:1 for text (SC 1.4.3), 3:1 for
 * non-text UI parts such as icons (SC 1.4.11).
 *
 * Deliberately NOT covered (WCAG exemptions and design-rubric decisions):
 * - --color-text-disabled / --color-icon-disabled: disabled controls are
 *   exempt from SC 1.4.3/1.4.11, and the theming rubric (issue #2150)
 *   intentionally keeps disabled at ~2:1 ("visibly off"). Components must
 *   not paint enabled content with these tokens — that is enforced by
 *   component code, not this contract.
 * - --color-skeleton / --color-track: decorative placeholders.
 * - Borders (--color-border*): tracked as a follow-up; most design systems
 *   fail 1.4.11 on hairline borders and fixing them is a separate design
 *   decision.
 */

export type ContrastPair = {
  /** Foreground: token name (--color-*) or CSS literal. */
  fg: string;
  /** Background stack, bottom-most layer first. Token names or literals. */
  bg: readonly string[];
  /** Minimum WCAG 2.1 contrast ratio. */
  min: number;
  /** WCAG success criterion the threshold comes from. */
  criterion: '1.4.3' | '1.4.11';
  /** Where this pairing occurs in components. */
  context: string;
  /** Restrict the check to one mode (default: both). */
  modes?: readonly ['light'] | readonly ['dark'];
  /**
   * Token re-bindings a component override applies in this pair's scope
   * (`--token: value` entries from a theme's components map). Applied on
   * top of the resolved token map before measuring.
   */
  rebind?: Record<string, string>;
};

const TEXT = 4.5;
const NON_TEXT = 3;

export const HUES = [
  'blue',
  'cyan',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

/** Opaque base surfaces content is laid out on. */
const BODY = '--color-background-body';
const SURFACE = '--color-background-surface';
const CARD = '--color-background-card';
const POPOVER = '--color-background-popover';

/**
 * Background stacks that body-copy text tokens are rendered on.
 * Evidence per stack (representative, from packages/core/src):
 * body: AppShell content; surface: Dialog, Field/TextInput; card: Card,
 * Banner content; popover: ContextMenu/DropdownMenu/Item, Calendar days;
 * muted: Code, Card variant="muted", TableRow zebra; neutral wash: Button
 * secondary, Badge neutral, Avatar initials, SegmentedControl track, Kbd;
 * accent-muted: selected Item/CheckboxList rows, Banner info, Calendar
 * range; overlay-hover: hovered rows/buttons.
 */
const TEXT_SURFACES: readonly (readonly string[])[] = [
  [BODY],
  [SURFACE],
  [CARD],
  [POPOVER],
  [SURFACE, '--color-background-muted'],
  [CARD, '--color-background-muted'],
  [SURFACE, '--color-neutral'],
  [BODY, '--color-neutral'],
  [SURFACE, '--color-accent-muted'],
  [POPOVER, '--color-accent-muted'],
  [SURFACE, '--color-overlay-hover'],
];

const SYNTAX_TOKENS = [
  'keyword',
  'string',
  'comment',
  'number',
  'function',
  'type',
  'variable',
  'operator',
  'constant',
  'tag',
  'attribute',
  'property',
  'punctuation',
] as const;

function textOnSurfaces(fg: string, context: string): ContrastPair[] {
  return TEXT_SURFACES.map(bg => ({
    fg,
    bg,
    min: TEXT,
    criterion: '1.4.3' as const,
    context,
  }));
}

export const CONTRAST_CONTRACT: readonly ContrastPair[] = [
  // ---------------------------------------------------------------------
  // Body-copy text on every neutral surface it is laid out on.
  // ---------------------------------------------------------------------
  ...textOnSurfaces('--color-text-primary', 'Text default / headings / labels'),
  ...textOnSurfaces(
    '--color-text-secondary',
    'Text color="secondary", descriptions, placeholders (SC 1.4.3 — placeholders are not exempt), field labels, blockquote body, avatar initials, unselected segmented items',
  ),
  // Link / text-accent pairs live in effective.ts (themes may restyle Link).

  // ---------------------------------------------------------------------
  // "on-accent" content over the filled accent surface. Unlike the other
  // on-X pairs (Badge/Button-only, themable — see effective.ts), on-accent
  // is also consumed by non-themable slots: Calendar's selected day,
  // NavIcon, checkbox checkmarks, radio dots.
  // ---------------------------------------------------------------------
  {
    fg: '--color-on-accent',
    bg: [SURFACE, '--color-accent'],
    min: TEXT,
    criterion: '1.4.3',
    context: 'Calendar selected day, NavIcon label, checkbox/radio glyphs',
  },

  // ---------------------------------------------------------------------
  // Inverted surfaces (Tooltip, Toast, Lightbox over media scrim).
  // ---------------------------------------------------------------------
  {
    fg: '--color-background-surface',
    bg: [SURFACE, '--color-text-primary'],
    min: TEXT,
    criterion: '1.4.3',
    context: 'Tooltip label (surface-as-text on text-primary bubble)',
  },
  {
    fg: '--color-on-dark',
    bg: [SURFACE, '--color-background-inverted'],
    min: TEXT,
    criterion: '1.4.3',
    context: 'Toast text via MediaTheme remap',
    modes: ['light'],
  },
  {
    fg: '--color-on-dark',
    bg: [SURFACE, '--color-background-error-inverted'],
    min: TEXT,
    criterion: '1.4.3',
    context: 'Error toast text',
  },
  {
    // SYNC: chip alpha must match Lightbox styles (caption/controls chip).
    fg: '--color-on-dark',
    bg: ['#ffffff', '--color-overlay', 'rgba(0, 0, 0, 0.6)'],
    min: TEXT,
    criterion: '1.4.3',
    context:
      'Lightbox caption/controls on their dark chip over the scrim — worst case: white media behind',
  },

  // ---------------------------------------------------------------------
  // Status colors used as real text (12px stats, counters, messages).
  // ---------------------------------------------------------------------
  {
    fg: '--color-error',
    bg: [SURFACE],
    min: TEXT,
    criterion: '1.4.3',
    context: 'TextArea over-limit counter, ChatMessage error text',
  },
  {
    fg: '--color-success',
    bg: [SURFACE],
    min: TEXT,
    criterion: '1.4.3',
    context: 'ChatToolCalls success stats text',
  },

  // ---------------------------------------------------------------------
  // Categorical hue text on its own tinted surface (Badge/Token/Card).
  // ---------------------------------------------------------------------
  ...HUES.flatMap((hue): ContrastPair[] => [
    {
      fg: `--color-text-${hue}`,
      bg: [CARD, `--color-background-${hue}`],
      min: TEXT,
      criterion: '1.4.3',
      context: `Badge/Token/Card variant="${hue}" label on its tinted bg (over card)`,
    },
    {
      fg: `--color-text-${hue}`,
      bg: [SURFACE, `--color-background-${hue}`],
      min: TEXT,
      criterion: '1.4.3',
      context: `Badge/Token variant="${hue}" label on its tinted bg (over surface)`,
    },
  ]),

  // FieldStatus message pairs live in effective.ts — butter and stone
  // restyle them via 'field-status' component overrides.

  // ---------------------------------------------------------------------
  // Icons and other non-text UI (SC 1.4.11, 3:1).
  // ---------------------------------------------------------------------
  ...[BODY, SURFACE, POPOVER].map((bg): ContrastPair => ({
    fg: '--color-icon-primary',
    bg: [bg],
    min: NON_TEXT,
    criterion: '1.4.11',
    context: 'Icon default, Selector chevron, TabMenu indicator',
  })),
  ...[
    [BODY],
    [SURFACE],
    [POPOVER],
    [SURFACE, '--color-background-muted'],
    [SURFACE, '--color-neutral'],
    [BODY, '--color-neutral'],
  ].map((bg): ContrastPair => ({
    fg: '--color-icon-secondary',
    bg,
    min: NON_TEXT,
    criterion: '1.4.11',
    context:
      'Icon color="secondary", collapsible/table chevrons, thumbnail placeholder',
  })),
  {
    fg: '--color-accent',
    bg: [SURFACE],
    min: NON_TEXT,
    criterion: '1.4.11',
    context: 'Icon color="accent", focus rings, tab indicator, progress fill',
  },
  {
    fg: '--color-accent',
    bg: [SURFACE, '--color-background-muted'],
    min: NON_TEXT,
    criterion: '1.4.11',
    context: 'Progress/Slider accent fill vs muted track',
  },
  // Banner status icon/title/description pairs live in effective.ts —
  // several themes redirect them via component token re-bindings.
  ...HUES.flatMap((hue): ContrastPair[] => [
    {
      fg: `--color-icon-${hue}`,
      bg: [SURFACE],
      min: NON_TEXT,
      criterion: '1.4.11',
      context: `Icon color="${hue}" on surface`,
    },
    {
      fg: `--color-icon-${hue}`,
      bg: [BODY],
      min: NON_TEXT,
      criterion: '1.4.11',
      context: `Icon color="${hue}" on body`,
    },
  ]),

  // ---------------------------------------------------------------------
  // Syntax highlighting: code is text (CodeBlock on --color-syntax-background).
  // ---------------------------------------------------------------------
  // The syntax background may be translucent (core defaults point it at
  // --color-background-muted), so composite it over the surface CodeBlock
  // sits on before measuring.
  ...SYNTAX_TOKENS.map((token): ContrastPair => ({
    fg: `--color-syntax-${token}`,
    bg: [SURFACE, '--color-syntax-background'],
    min: TEXT,
    criterion: '1.4.3',
    context: `CodeBlock syntax "${token}"`,
  })),
];
