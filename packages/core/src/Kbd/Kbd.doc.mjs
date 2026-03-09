/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Kbd',
  description:
    'Displays a keyboard shortcut as styled <kbd> elements. Use in tooltips, menus, and documentation to show key combinations.',
  features: [
    'Key parsing — splits "mod+k" into individual styled <kbd> elements',
    'Modifier symbols — maps mod/ctrl/alt/shift/enter/backspace/escape/arrows to platform symbols',
    'Inline display — renders as inline-flex for use inside text, tooltips, and menus',
    'Accessible — aria-hidden="true" since shortcuts are supplementary to visible labels',
  ],
  examples: [
    {
      label: 'Single shortcut',
      code: '<XDSKbd keys="mod+k" />',
    },
    {
      label: 'Multi-key shortcut',
      code: '<XDSKbd keys="mod+shift+p" />',
    },
    {
      label: 'In a tooltip or label',
      code: `<span>
  Search <XDSKbd keys="mod+k" />
</span>`,
    },
  ],
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        'Keyboard shortcut string. Use "+" to separate keys. Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling — className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling — inline styles bypass StyleX optimization.',
    },
  ],
  theming: {
    targets: [{className: 'xds-kbd'}],
  },
  accessibility: [
    'Renders with aria-hidden="true" — keyboard shortcuts are visual hints, not primary content',
    'Uses semantic <kbd> elements for each key',
  ],
  keyboard: 'Not interactive — purely presentational',
  notes: [
    'Fixed 20px height with min-width 20px per key badge',
    'Uses --color-wash background and --color-text-secondary text color',
    'Key display symbols follow macOS conventions (⌘, ⌥, ⇧, ⌃)',
  ],
};
