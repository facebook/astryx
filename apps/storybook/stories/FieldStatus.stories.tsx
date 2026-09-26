// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FieldStatus.stories.tsx
 * @input FieldStatus from @astryxdesign/core
 * @output Stable visual coverage for status tones and variants
 * @position Core component stories and visual regression coverage
 */

import type {Meta, StoryObj} from '@storybook/react';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Stack} from '@astryxdesign/core/Stack';

const meta: Meta<typeof FieldStatus> = {
  title: 'Core/FieldStatus',
  component: FieldStatus,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FieldStatus>;

export const Variants: Story = {
  tags: ['visual-baseline'],
  render: () => (
    <Stack gap={3}>
      <FieldStatus type="error" message="This field is required" />
      <FieldStatus
        type="warning"
        message="This value may be visible to others"
        variant="detached"
      />
      <FieldStatus
        type="success"
        message="Your changes were saved"
        variant="detached"
      />
    </Stack>
  ),
};
