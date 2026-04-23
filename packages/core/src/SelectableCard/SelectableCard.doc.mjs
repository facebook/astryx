/** @type {import('../docs-types').ComponentDoc} */
export default {
  name: 'XDSSelectableCard',
  description:
    'A card that toggles between selected and unselected states. ' +
    'Shows an accent border when selected.',
  container: true,
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Accessibility label for the card.',
    },
    isSelected: {
      type: 'boolean',
      required: true,
      description: 'Controlled selection state. Accent border when true.',
    },
    onChange: {
      type: '(isSelected: boolean) => void',
      required: true,
      description: 'Called with the new selection state when toggled.',
    },
    isDisabled: {
      type: 'boolean',
      default: false,
      description: 'Disables the card.',
    },
    children: {
      type: 'ReactNode',
      description: 'Card content.',
    },
    padding: {
      type: 'SpacingStep',
      default: 4,
      description: 'Inner padding using the spacing scale.',
    },
    width: {type: 'SizeValue', description: 'Card width.'},
    height: {type: 'SizeValue', description: 'Card height.'},
    maxWidth: {type: 'SizeValue', description: 'Maximum card width.'},
  },
  examples: [
    {
      title: 'Single select (radio behavior)',
      code: `const [selected, setSelected] = useState(null);

{plans.map(plan => (
  <XDSSelectableCard
    key={plan.id}
    label={plan.name}
    isSelected={selected === plan.id}
    onChange={() => setSelected(plan.id)}
  >
    <XDSText weight="bold">{plan.name}</XDSText>
    <XDSText color="secondary">{plan.price}</XDSText>
  </XDSSelectableCard>
))}`,
    },
    {
      title: 'Multi-select (checkbox behavior)',
      code: `const [selected, setSelected] = useState(new Set());

{filters.map(f => (
  <XDSSelectableCard
    key={f.id}
    label={f.name}
    isSelected={selected.has(f.id)}
    onChange={(isNow) => {
      setSelected(prev => {
        const next = new Set(prev);
        isNow ? next.add(f.id) : next.delete(f.id);
        return next;
      });
    }}
  >
    <XDSText>{f.name}</XDSText>
  </XDSSelectableCard>
))}`,
    },
  ],
  seeAlso: ['XDSCard', 'XDSClickableCard'],
};
