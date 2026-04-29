import type {Meta, StoryObj} from '@storybook/react';
import IDEPage from '../../../packages/cli/templates/pages/ide/page';

const meta: Meta<typeof IDEPage> = {
  title: 'Templates/IDE',
  component: IDEPage,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof IDEPage>;

export const Default: Story = {};
