/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Token',
  description:
    'A chip/tag component for displaying entities inline. Renders as a <span> by default, <a> when href is provided, or a <span> with an invisible <button> inside when onClick is provided.',
  features: [
    'Polymorphic — renders as <span>, <a>, or interactive <span>+<button> based on props',
    'Invisible button pattern for onClick preserves real button semantics while allowing focus-within outline on the full token',
    'Remove button with expanded 14px hit-area tap target via ::after pseudo-element',
    'Eleven color variants including a neutral default',
    'Leading icon and trailing endContent slots',
    'Label can be visually hidden while remaining accessible to screen readers',
    'Disabled state reduces opacity and blocks pointer events',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Text label displayed inside the token.',
      required: true,
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: 'Color variant of the token.',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon rendered before the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Whether the token is disabled; reduces opacity and blocks interactions.',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        'Callback fired when the remove button is clicked. When provided, an X button is rendered inside the token.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        'Click handler. When provided, the token renders as a <span> container with an invisible <button> inside for accessibility.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Link URL. When provided, the token renders as an <a> element.',
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Accessible description applied via aria-description on the root element.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label and before the remove button.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label using a screen-reader-only clip technique; the label remains accessible.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Basic',
      code: '<XDSToken label="Tag" />',
    },
    {
      label: 'Colored',
      code: '<XDSToken label="Status" color="green" />',
    },
    {
      label: 'Removable',
      code: '<XDSToken label="Filter" onRemove={(e) => handleRemove(e)} />',
    },
    {
      label: 'Clickable',
      code: '<XDSToken label="Category" onClick={() => navigate(\'/category\')} />',
    },
    {
      label: 'As link',
      code: '<XDSToken label="Profile" href="/user/123" />',
    },
    {
      label: 'With icon and hidden label',
      code: '<XDSToken label="User" icon={<UserIcon />} isLabelHidden />',
    },
  ],
  accessibility: [
    'When isLabelHidden is true, the label is clipped visually but exposed via aria-label on the root element so screen readers still announce it.',
    'The description prop maps to aria-description on the root element for supplementary context.',
    'When onClick is provided, the clickable content is wrapped in a real <button> so keyboard users can activate it with Enter or Space.',
    'The remove button has an automatic aria-label of "Remove <label>" and an expanded touch target via a ::after pseudo-element.',
    'When href is provided, aria-disabled is set on the <a> element when isDisabled is true.',
  ],
  keyboard:
    'Tab focuses the token (or its inner button when onClick is used). Enter/Space activate a clickable token or the remove button. Remove button is reachable as a separate Tab stop.',
};
