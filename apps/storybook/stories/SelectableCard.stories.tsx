import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSText} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

const meta: Meta<typeof XDSSelectableCard> = {
  title: 'SelectableCard/XDSSelectableCard',
  component: XDSSelectableCard,
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
      <XDSHStack gap={3}>
        {plans.map((plan) => (
          <XDSSelectableCard
            key={plan.id}
            label={plan.name}
            isSelected={selected === plan.id}
            onChange={() => setSelected(plan.id)}
            width={200}
          >
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">{plan.name}</XDSText>
              <XDSText type="supporting" color="secondary">{plan.price}</XDSText>
            </XDSVStack>
          </XDSSelectableCard>
        ))}
      </XDSHStack>
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
      <XDSHStack gap={3}>
        {filters.map((f) => (
          <XDSSelectableCard
            key={f.id}
            label={f.name}
            isSelected={selected.has(f.id)}
            onChange={(isNow) => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (isNow) {
                  next.add(f.id);
                } else {
                  next.delete(f.id);
                }
                return next;
              });
            }}
            width={150}
          >
            <XDSText type="body" weight="bold">{f.name}</XDSText>
          </XDSSelectableCard>
        ))}
      </XDSHStack>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <XDSHStack gap={3}>
      <XDSSelectableCard label="Enabled" isSelected={true} onChange={() => {}} width={200}>
        <XDSText type="body" weight="bold">Selected & Enabled</XDSText>
      </XDSSelectableCard>
      <XDSSelectableCard label="Disabled" isSelected={true} onChange={() => {}} isDisabled width={200}>
        <XDSText type="body" weight="bold">Selected & Disabled</XDSText>
      </XDSSelectableCard>
      <XDSSelectableCard label="Disabled unselected" isSelected={false} onChange={() => {}} isDisabled width={200}>
        <XDSText type="body" weight="bold">Unselected & Disabled</XDSText>
      </XDSSelectableCard>
    </XDSHStack>
  ),
};
