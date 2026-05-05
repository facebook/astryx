import type {Meta, StoryObj} from '@storybook/react';
import {XDSCitation} from '@xds/core/Citation';

const meta: Meta<typeof XDSCitation> = {
  title: 'Core/Citation',
  component: XDSCitation,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['label', 'number'],
      description: 'Display style — label chip or numbered badge',
    },
    number: {
      control: 'number',
      description: 'Citation display number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCitation>;

export const Label: Story = {
  args: {
    source: {title: 'React Documentation', url: 'https://react.dev'},
    number: 1,
    variant: 'label',
  },
};

export const Number: Story = {
  args: {
    source: {title: 'TypeScript Handbook', url: 'https://typescriptlang.org'},
    number: 2,
    variant: 'number',
  },
};

export const WithIcon: Story = {
  args: {
    source: {
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://github.githubassets.com/favicons/favicon.svg',
    },
    number: 3,
    variant: 'label',
  },
};

export const NoLink: Story = {
  args: {
    source: {title: 'Internal reference'},
    number: 4,
    variant: 'label',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
      <XDSCitation
        source={{title: 'React Docs', url: 'https://react.dev'}}
        number={1}
        variant="label"
      />
      <XDSCitation
        source={{title: 'TypeScript', url: 'https://typescriptlang.org'}}
        number={2}
        variant="number"
      />
      <XDSCitation
        source={{
          title: 'GitHub',
          url: 'https://github.com',
          icon: 'https://github.githubassets.com/favicons/favicon.svg',
        }}
        number={3}
        variant="label"
      />
      <XDSCitation
        source={{title: 'A very long source title that should be truncated with ellipsis'}}
        number={4}
        variant="label"
      />
    </div>
  ),
};
