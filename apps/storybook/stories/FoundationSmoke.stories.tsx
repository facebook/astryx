// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runnable foundation smoke screen using the preview's real CSS and theme.
 * @input The shared Sandbox smoke composition and its published VStack root.
 * @output Core/FoundationSmoke/Default.
 * @position Browser entry for the foundation-smoke guard; no CSS overrides.
 */

import type {Meta, StoryObj} from '@storybook/react';
import {VStack} from '@astryxdesign/core/Layout';
import FoundationSmoke from '../../../packages/cli/assets/templates/blocks/patterns/FoundationSmoke';

const meta = {
  title: 'Core/FoundationSmoke',
  component: VStack,
  render: () => <FoundationSmoke />,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof VStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
