// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Indicator',
  displayName: 'Indicator',
  group: 'Indicator',
  category: 'Data Input',
  isHiddenFromOverview: true,
  keywords: [
    'indicator',
    'checkbox',
    'radio',
    'control',
    'selection',
    'mark',
    'tick',
    'themeable',
    'swap',
  ],
  description:
    'Decorative control visuals — the mark on a chosen option, the box a checkbox draws, the circle a radio draws. Rendered by Selector, CheckboxInput, RadioList, and menu selection rows. Replace one by name through defineTheme({indicators}) and every component drawing it follows.',
  components: [
    {
      name: 'CheckboxIndicator',
      displayName: 'Checkbox Indicator',
      description:
        'The checkbox visual: a square box with a checkmark or an indeterminate bar. Decorative (aria-hidden) — the owning control keeps the input, role, accessible name, focus, and keyboard behavior.',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked' | 'indeterminate'",
          description:
            'Which state to draw. An indicator draws in EVERY state — the unchecked box is an empty box, not nothing.',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Control size: 20px or 24px.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the owning control is disabled. Purely visual — the owner keeps the real disabled semantics.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Rendered inside the chrome INSTEAD of the state mark. CheckboxInput passes its loading Spinner through this while a change action is pending, so a replacement indicator must render children when present or the busy visual is lost.',
        },
      ],
    },
    {
      name: 'CheckIndicator',
      displayName: 'Check Indicator',
      description:
        'The mark on a chosen option — a checkmark by default, and nothing at all when unchosen, so a listbox shows no empty box beside every row. This is the indicator to replace to change what "chosen" looks like: mapping it to RadioIndicator gives every single-selection mark radio visuals, including an empty circle on unchosen rows. Unlike the checkbox and radio visuals it renders no chrome of its own — it IS the glyph — so a host\'s theme target lands on the same element as astryx-icon.',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked'",
          description:
            'Which state to draw. The default renders nothing when unchecked; a replacement may draw in both states.',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Control size, matching the other indicators.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the owning row is disabled. Purely visual — the owner keeps the real disabled semantics.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Rendered INSTEAD of the mark.',
        },
      ],
    },
    {
      name: 'RadioIndicator',
      displayName: 'Radio Indicator',
      description:
        'The radio visual: a circle with a filled inner dot when selected. Draws in both states — an unselected radio is an empty circle, which is what lets it stand in for a checkmark in a selection slot.',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked'",
          description:
            'Which state to draw. Radio belongs to the singleSelection family, which has no partial state.',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Control size: 20px or 24px.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the owning control is disabled. Purely visual — the owner keeps the real disabled semantics.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Rendered inside the chrome INSTEAD of the state mark.',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-checkbox-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {
        className: 'astryx-radio-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-indicator-dot', visualProps: ['size']},
      // Still emitted beside the names above, so themes written against them
      // keep working. Drop in the next major.
      {
        className: 'astryx-checkbox',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
        deprecatedFor: 'checkbox-indicator',
      },
      {
        className: 'astryx-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
        deprecatedFor: 'radio-indicator',
      },
      {
        className: 'astryx-radio-dot',
        visualProps: ['size'],
        deprecatedFor: 'radio-indicator-dot',
      },
    ],
  },
  examples: [
    {
      label: 'Restyle an indicator (the common path)',
      code: `// Indicators render the same stable class targets wherever they appear, so
// one component override reaches the form control, the menu row, and any
// selection slot themed to use it. No indicator-specific API needed.
defineTheme({
  name: 'brand',
  components: {
    'checkbox-indicator': {
      base: {borderRadius: 'var(--radius-full)', borderWidth: '2px'},
      checked: {
        backgroundColor: 'var(--color-accent)',
        borderColor: 'var(--color-accent)',
      },
      'checked+disabled': {backgroundColor: 'var(--color-background-muted)'},
    },
    'radio-indicator': {base: {borderWidth: '2px'}},
    'radio-indicator-dot': {base: {borderRadius: '2px'}},
  },
});`,
    },
    {
      label: 'Replace an indicator with your own component',
      code: `// When the shape itself is wrong, hand the theme a component. It receives
// {state, size, isDisabled, children} and nothing else.
//
// Use theme tokens, never raw values — run \`npx astryx docs tokens\` for the
// full set. Color: --color-accent, --color-on-accent, --color-border,
// --color-border-emphasized, --color-background-surface,
// --color-background-muted. Radius: --radius-inner, --radius-full.
// Border width: --border-width.
function BrandCheckbox({state, size = 'md', isDisabled, children}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size === 'sm' ? 20 : 24,
        height: size === 'sm' ? 20 : 24,
        borderRadius: 'var(--radius-inner)',
        border: 'var(--border-width) solid var(--color-border-emphasized)',
        color: 'var(--color-accent)',
        opacity: isDisabled ? 0.5 : 1,
      }}>
      {/* children first: the owner passes a loading Spinner through it */}
      {children ?? (state === 'checked' ? <StarGlyph /> : null)}
    </span>
  );
}

defineTheme({name: 'brand', indicators: {checkbox: BrandCheckbox}});`,
    },
    {
      label: 'Use radio visuals for single selection',
      code: `// Replacement is by NAME, so one entry reaches every component that draws
// that indicator. Here every option in a Selector listbox draws a radio —
// including the unselected ones, which a check mark cannot do.
import {RadioIndicator} from '@astryxdesign/core/Indicator';

defineTheme({name: 'brand', indicators: {check: RadioIndicator}});`,
    },
  ],
  usage: {
    description:
      'Indicators are the componentized selection visuals shared by CheckboxInput, RadioList, and menu selection rows. They are decorative: the owning component keeps the input, role, accessible name, focus, and keyboard behavior, while the indicator turns state into a picture. That split is what makes them themeable — restyle one through its class targets, or replace the component outright.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for component overrides first (components: {checkbox}). Replacing the component is the heavier path, for when the shape itself is wrong.',
      },
      {
        guidance: true,
        description:
          'A replacement must render `children` when present — the owning control passes its loading Spinner through it, and dropping it loses the busy visual while aria-busy still fires.',
      },
      {
        guidance: true,
        description:
          'A replacement must set aria-hidden. The owning control provides the role and accessible name; a visible indicator would be announced twice.',
      },
      {
        guidance: true,
        description:
          'Use theme tokens for every color, radius, and border width in a replacement. Run `npx astryx docs tokens` for the set.',
      },
      {
        guidance: true,
        description:
          'Spread `indicatorFocusRingProps()` on a replacement\'s root if its shape differs from the control\'s default. It carries the ring AND the marker that tells the owning control to stand down, as one spread, so you cannot suppress the owner\'s ring without drawing your own. Skip it and the owner draws a correctly-visible ring in the default shape — the failure mode is a slightly-wrong outline, never a missing one (WCAG 2.4.7). It keys off the owner scope marker because the native input is a visually hidden SIBLING that a plain :focus-visible could never see.',
      },
      {
        guidance: false,
        description:
          'Thread hover or pressed state in as props. Interaction state reaches an indicator through the owner\u2019s CSS ancestor marker, so hovering the row tints the control with no props involved.',
      },
      {
        guidance: false,
        description:
          'Render only in the selected state. An indicator draws in every state — an unselected radio is an empty circle, and a mark that disappears leaves blank rows.',
      },
    ],
    anatomy: [
      {
        name: 'Chrome',
        required: true,
        description:
          'The persistent box or circle, present in every state. Carries the astryx-checkbox / astryx-radio theme target.',
      },
      {
        name: 'State mark',
        required: false,
        description:
          'The checkmark, indeterminate bar, or radio dot shown inside the chrome for the current state.',
      },
    ],
  },
};
