// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Indicator',
  displayName: 'Indicator',
  group: 'Checkbox',
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
    'Decorative selection visuals — the box a checkbox draws and the circle a radio draws. Rendered by CheckboxInput, RadioList, and menu selection rows; themeable and replaceable.',
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
      name: 'RadioIndicator',
      displayName: 'Radio Indicator',
      description:
        'The radio visual: a circle with a filled inner dot when selected. Draws in both states — an unselected radio is an empty circle, which is what lets it stand in for a checkmark in a selection slot.',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked' | 'indeterminate'",
          description:
            'Which state to draw. A radio has no partial state; anything other than unchecked reads as selected.',
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
        className: 'astryx-checkbox',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {
        className: 'astryx-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-dot', visualProps: ['size']},
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
    checkbox: {
      base: {borderRadius: 'var(--radius-full)', borderWidth: '2px'},
      checked: {
        backgroundColor: 'var(--color-positive)',
        borderColor: 'var(--color-positive)',
      },
      'checked+disabled': {backgroundColor: 'var(--color-muted)'},
    },
    radio: {base: {borderWidth: '2px'}},
    'radio-dot': {base: {borderRadius: '2px'}},
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
          'Spread the exported `indicatorFocusRing` style onto a replacement\'s root. It is the same style every built-in indicator uses and carries no shape of its own — `outline` follows your border-radius — so you never write focus rules by hand. It has to live on the indicator (not the owning control) because only the indicator knows its shape, and it keys off the owner scope marker because the native input is a visually hidden SIBLING that a plain :focus-visible could never see. Omit it and the control has no visible focus (WCAG 2.4.7).',
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
