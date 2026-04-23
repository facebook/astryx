import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const meta: Meta<typeof XDSSelectableCard> = {
  title: 'SelectableCard/XDSSelectableCard',
  component: XDSSelectableCard,
  parameters: {
    docs: {
      description: {
        component:
          'A card that toggles between selected and unselected states. ' +
          'Shows an accent border when selected.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSelectableCard>;

export const SingleSelect: Story = {
  name: 'Single Select (Radio)',
  render: () => {
    const [selected, setSelected] = useState<string | null>('basic');
    const plans = [
      {id: 'basic', name: 'Basic', price: '$9/mo'},
      {id: 'pro', name: 'Pro', price: '$29/mo'},
      {id: 'enterprise', name: 'Enterprise', price: '$99/mo'},
    ];

    return (
      <XDSStack gap={3} direction="row">
        {plans.map((plan) => (
          <XDSSelectableCard
            key={plan.id}
            label={plan.name}
            isSelected={selected === plan.id}
            onChange={() => setSelected(plan.id)}
            width={200}
          >
            <XDSStack gap={1}>
              <XDSText weight="bold">{plan.name}</XDSText>
              <XDSText color="secondary">{plan.price}</XDSText>
            </XDSStack>
          </XDSSelectableCard>
        ))}
      </XDSStack>
    );
  },
};

export const MultiSelect: Story = {
  name: 'Multi-Select (Checkbox)',
  render: () => {
    const [selected, setSelected] = useState(new Set(['react']));
    const filters = [
      {id: 'react', name: 'React'},
      {id: 'vue', name: 'Vue'},
      {id: 'angular', name: 'Angular'},
      {id: 'svelte', name: 'Svelte'},
    ];

    return (
      <XDSStack gap={3} direction="row">
        {filters.map((f) => (
          <XDSSelectableCard
            key={f.id}
            label={f.name}
            isSelected={selected.has(f.id)}
            onChange={(isNow) => {
              setSelected((prev) => {
                const next = new Set(prev);
                isNow ? next.add(f.id) : next.delete(f.id);
                return next;
              });
            }}
            width={150}
          >
            <XDSText weight="bold">{f.name}</XDSText>
          </XDSSelectableCard>
        ))}
      </XDSStack>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <XDSStack gap={3} direction="row">
        <XDSSelectableCard
          label="Enabled"
          isSelected={true}
          onChange={() => {}}
          width={200}
        >
          <XDSText weight="bold">Selected & Enabled</XDSText>
        </XDSSelectableCard>
        <XDSSelectableCard
          label="Disabled"
          isSelected={true}
          onChange={() => {}}
          isDisabled
          width={200}
        >
          <XDSText weight="bold">Selected & Disabled</XDSText>
        </XDSSelectableCard>
        <XDSSelectableCard
          label="Disabled unselected"
          isSelected={false}
          onChange={() => {}}
          isDisabled
          width={200}
        >
          <XDSText weight="bold">Unselected & Disabled</XDSText>
        </XDSSelectableCard>
      </XDSStack>
    );
  },
};
