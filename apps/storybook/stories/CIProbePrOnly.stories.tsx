// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@astryxdesign/core/Button';

const meta: Meta = {
  title: 'Core/CI Probe',
};

export default meta;
type Story = StoryObj;

export const PackageOwnership: Story = {
  render: () => <Button label="PR-only Story" />,
};
